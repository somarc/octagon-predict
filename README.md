# Octagon Predict - Development Workflow

This repository contains the Octagon Predict (VeChain UFC Market) project with automated workflows for syncing code from Replit to Git.

## Repository Structure

- **octagon-predict/** - Main git-controlled project directory
- **merge-replit-code.sh** - Automated merge script for Replit exports

## Workflow: Merging Replit Code to Git

### Quick Start

When you download a new ZIP export from Replit:

1. **Unzip** the file in `/Users/mhess/octagon-predict/`
   ```bash
   cd /Users/mhess/octagon-predict
   unzip Fight-Predictor-X.zip
   ```

2. **Run the merge script**
   ```bash
   ./merge-replit-code.sh Fight-Predictor-X "Optional custom commit message"
   ```

That's it! The script will:
- ✓ Sync all files (excluding .git, .local, node_modules, dist)
- ✓ Stage changes
- ✓ Create a commit
- ✓ Push to GitHub

### Manual Usage

If you prefer to do it manually:

```bash
# 1. Sync files
rsync -av --exclude='.git' --exclude='.local' --exclude='node_modules' --exclude='dist' \
  Fight-Predictor-X/ octagon-predict/

# 2. Commit and push
cd octagon-predict
git add -A
git commit -m "Update: Your commit message"
git push
```

## Script Options

```bash
./merge-replit-code.sh <source-folder> [commit-message]
```

**Parameters:**
- `source-folder` (required) - Name of the unzipped Replit folder
- `commit-message` (optional) - Custom commit message (default: "Update: Sync latest code from Replit")

**Examples:**
```bash
# Basic usage with default commit message
./merge-replit-code.sh Fight-Predictor-2

# With custom commit message
./merge-replit-code.sh Fight-Predictor-3 "Add VeChain wallet integration"
```

## Project Details

**GitHub Repository:** https://github.com/somarc/octagon-predict

**SSH Configuration:** Uses `github.com-somarc` host alias with `id_ed25519_somarc` key

## Troubleshooting

### "Permission denied" errors
Make sure the script is executable:
```bash
chmod +x merge-replit-code.sh
```

### "Source folder does not exist"
Check that you've unzipped the Replit export in the correct directory:
```bash
ls -la /Users/mhess/octagon-predict/
```

### Git authentication issues
Verify your SSH key configuration:
```bash
ssh -T git@github.com-somarc
```

Should respond with: "Hi somarc! You've successfully authenticated..."

