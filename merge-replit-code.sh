#!/bin/bash

# Merge Replit Code to Git Repository
# Usage: ./merge-replit-code.sh <source-folder> [commit-message]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_DIR="/Users/mhess/octagon-predict/octagon-predict"
PARENT_DIR="/Users/mhess/octagon-predict"

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Error: Missing source folder argument${NC}"
    echo "Usage: $0 <source-folder> [commit-message]"
    echo "Example: $0 Fight-Predictor-2 'Update with latest Replit changes'"
    exit 1
fi

SOURCE_FOLDER="$1"
SOURCE_PATH="$PARENT_DIR/$SOURCE_FOLDER"
COMMIT_MSG="${2:-Update: Sync latest code from Replit ($SOURCE_FOLDER)}"

# Validate source folder exists
if [ ! -d "$SOURCE_PATH" ]; then
    echo -e "${RED}Error: Source folder '$SOURCE_PATH' does not exist${NC}"
    exit 1
fi

# Validate git repo
if [ ! -d "$REPO_DIR/.git" ]; then
    echo -e "${RED}Error: '$REPO_DIR' is not a git repository${NC}"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Replit Code Merge Automation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Source:      ${GREEN}$SOURCE_PATH${NC}"
echo -e "Destination: ${GREEN}$REPO_DIR${NC}"
echo -e "Commit msg:  ${GREEN}$COMMIT_MSG${NC}"
echo ""

# Step 1: Sync files
echo -e "${BLUE}[1/5] Syncing files...${NC}"
rsync -av \
    --exclude='.git' \
    --exclude='.local' \
    --exclude='node_modules' \
    --exclude='dist' \
    "$SOURCE_PATH/" \
    "$REPO_DIR/"

echo -e "${GREEN}✓ Files synced${NC}"
echo ""

# Step 2: Check for changes
echo -e "${BLUE}[2/5] Checking for changes...${NC}"
cd "$REPO_DIR"
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo -e "${GREEN}✓ No changes detected${NC}"
    echo ""
    echo -e "${BLUE}Repository is already up to date!${NC}"
    exit 0
fi

# Show what changed
echo -e "${GREEN}✓ Changes detected:${NC}"
git status --short
echo ""

# Step 3: Stage changes
echo -e "${BLUE}[3/5] Staging changes...${NC}"
git add -A
echo -e "${GREEN}✓ Changes staged${NC}"
echo ""

# Step 4: Commit
echo -e "${BLUE}[4/5] Creating commit...${NC}"
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓ Commit created${NC}"
echo ""

# Step 5: Push to remote
echo -e "${BLUE}[5/5] Pushing to GitHub...${NC}"
git push
echo -e "${GREEN}✓ Pushed to remote${NC}"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Merge completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Repository: https://github.com/somarc/octagon-predict"
echo ""

# Show latest commits
echo -e "${BLUE}Latest commits:${NC}"
git log --oneline -3
echo ""

