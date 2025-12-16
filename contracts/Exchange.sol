// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ConditionalTokens.sol";

/**
 * @title Exchange
 * @notice Order settlement for Octagon Predict with user escrow balances
 * @dev Off-chain matching + on-chain settlement with proper balance tracking
 * 
 * Flow:
 * 1. Users deposit collateral to their Exchange balance
 * 2. Users sign EIP-712 orders off-chain
 * 3. Matching engine pairs orders
 * 4. Operator settles matched trades (transfers outcome tokens, adjusts balances)
 */
contract Exchange is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    ConditionalTokens public conditionalTokens;
    
    // User balances per collateral token
    // user => collateralToken => balance
    mapping(address => mapping(address => uint256)) public balances;
    
    // Order structure
    struct Order {
        address maker;
        bytes32 conditionId;
        uint256 outcomeIndex;
        bool isBuy;             // true = buying outcome tokens, false = selling
        uint256 price;          // Price in 1e18 units (0.5e18 = 50%)
        uint256 amount;         // Amount of outcome tokens
        uint256 nonce;
        uint256 expiry;
    }
    
    struct Fill {
        Order makerOrder;
        bytes makerSignature;
        Order takerOrder;
        bytes takerSignature;
        uint256 fillAmount;
    }

    mapping(address => uint256) public userNonces;
    mapping(bytes32 => uint256) public orderFills;
    mapping(bytes32 => bool) public cancelledOrders;
    mapping(address => bool) public operators;
    
    uint256 public tradingFeeBps = 100; // 1%
    address public feeRecipient;
    
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant ORDER_TYPEHASH = keccak256(
        "Order(address maker,bytes32 conditionId,uint256 outcomeIndex,bool isBuy,uint256 price,uint256 amount,uint256 nonce,uint256 expiry)"
    );

    uint256 constant PRICE_PRECISION = 1e18;

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdrawal(address indexed user, address indexed token, uint256 amount);
    event OrderFilled(
        bytes32 indexed orderHash,
        address indexed maker,
        address indexed taker,
        bytes32 conditionId,
        uint256 fillAmount,
        uint256 price
    );
    event OrderCancelled(bytes32 indexed orderHash, address indexed maker);

    constructor(address _conditionalTokens, address _feeRecipient) Ownable(msg.sender) {
        conditionalTokens = ConditionalTokens(payable(_conditionalTokens));
        feeRecipient = _feeRecipient;
        operators[msg.sender] = true;

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256("OctagonPredict"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
    }

    modifier onlyOperator() {
        require(operators[msg.sender], "Not an operator");
        _;
    }

    /**
     * @notice Deposit collateral (VET or ERC20) into exchange balance
     */
    function deposit(address token, uint256 amount) external payable nonReentrant {
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect VET amount");
        } else {
            require(msg.value == 0, "Do not send VET");
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        
        balances[msg.sender][token] += amount;
        emit Deposit(msg.sender, token, amount);
    }

    /**
     * @notice Withdraw collateral from exchange balance
     */
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        balances[msg.sender][token] -= amount;

        if (token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "VET transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
        
        emit Withdrawal(msg.sender, token, amount);
    }

    /**
     * @notice Batch settle matched orders
     */
    function settleBatch(Fill[] calldata fills) external onlyOperator nonReentrant {
        for (uint256 i = 0; i < fills.length; i++) {
            _settleFill(fills[i]);
        }
    }

    function _settleFill(Fill calldata fill) internal {
        Order calldata maker = fill.makerOrder;
        Order calldata taker = fill.takerOrder;
        
        // Validate match
        require(maker.conditionId == taker.conditionId, "Condition mismatch");
        require(maker.outcomeIndex == taker.outcomeIndex, "Outcome mismatch");
        require(maker.isBuy != taker.isBuy, "Same side");
        require(block.timestamp <= maker.expiry && block.timestamp <= taker.expiry, "Order expired");
        require(maker.nonce >= userNonces[maker.maker], "Maker nonce invalid");
        require(taker.nonce >= userNonces[taker.maker], "Taker nonce invalid");
        
        // Verify signatures
        bytes32 makerHash = getOrderHash(maker);
        bytes32 takerHash = getOrderHash(taker);
        
        require(!cancelledOrders[makerHash] && !cancelledOrders[takerHash], "Order cancelled");
        require(_verifySignature(makerHash, fill.makerSignature, maker.maker), "Invalid maker sig");
        require(_verifySignature(takerHash, fill.takerSignature, taker.maker), "Invalid taker sig");
        
        // Check fill amounts
        uint256 makerRemaining = maker.amount - orderFills[makerHash];
        uint256 takerRemaining = taker.amount - orderFills[takerHash];
        uint256 fillAmount = fill.fillAmount;
        
        require(fillAmount > 0 && fillAmount <= makerRemaining && fillAmount <= takerRemaining, "Invalid fill");
        
        // Price validation: execution at maker's price
        // Buyer pays: fillAmount * price / PRICE_PRECISION
        // Seller receives: fillAmount * price / PRICE_PRECISION - fees
        
        uint256 executionPrice = maker.price;
        if (maker.isBuy) {
            require(taker.price <= maker.price, "Price mismatch");
        } else {
            require(taker.price >= maker.price, "Price mismatch");
            executionPrice = taker.price;
        }
        
        uint256 collateralAmount = (fillAmount * executionPrice) / PRICE_PRECISION;
        
        // Get collateral token from market
        ConditionalTokens.Market memory market = conditionalTokens.getMarket(maker.conditionId);
        address collateralToken = market.collateralToken;
        
        address buyer = maker.isBuy ? maker.maker : taker.maker;
        address seller = maker.isBuy ? taker.maker : maker.maker;
        
        // Verify balances
        require(balances[buyer][collateralToken] >= collateralAmount, "Buyer insufficient balance");
        
        uint256 tokenId = conditionalTokens.getTokenId(maker.conditionId, maker.outcomeIndex);
        require(conditionalTokens.balanceOf(seller, tokenId) >= fillAmount, "Seller insufficient tokens");
        
        // Execute transfers
        balances[buyer][collateralToken] -= collateralAmount;
        
        uint256 fee = (collateralAmount * tradingFeeBps) / 10000;
        balances[seller][collateralToken] += (collateralAmount - fee);
        if (fee > 0) {
            balances[feeRecipient][collateralToken] += fee;
        }
        
        // Transfer outcome tokens (requires approval)
        conditionalTokens.safeTransferFrom(seller, buyer, tokenId, fillAmount, "");
        
        // Update fills
        orderFills[makerHash] += fillAmount;
        orderFills[takerHash] += fillAmount;
        
        emit OrderFilled(makerHash, maker.maker, taker.maker, maker.conditionId, fillAmount, executionPrice);
    }

    function cancelOrder(Order calldata order) external {
        require(msg.sender == order.maker, "Not maker");
        bytes32 orderHash = getOrderHash(order);
        cancelledOrders[orderHash] = true;
        emit OrderCancelled(orderHash, msg.sender);
    }

    function incrementNonce() external {
        userNonces[msg.sender]++;
    }

    function getOrderHash(Order calldata order) public view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(
            ORDER_TYPEHASH,
            order.maker,
            order.conditionId,
            order.outcomeIndex,
            order.isBuy,
            order.price,
            order.amount,
            order.nonce,
            order.expiry
        ));
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    }

    function _verifySignature(bytes32 hash, bytes calldata signature, address signer) internal pure returns (bool) {
        return hash.recover(signature) == signer;
    }

    function setOperator(address operator, bool approved) external onlyOwner {
        operators[operator] = approved;
    }

    function setTradingFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 500, "Fee too high");
        tradingFeeBps = _feeBps;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    receive() external payable {}
}
