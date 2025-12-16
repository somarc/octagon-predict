#!/bin/bash
# Quick wrapper for merge-replit-code.sh
# Usage: ./merge.sh Fight-Predictor-X

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/merge-replit-code.sh" "$@"

