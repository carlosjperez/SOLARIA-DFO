#!/bin/bash
# Install DFO Git Hooks
# SOL-4: Git Hooks Auto-Reference Installation

set -e

echo "🔧 Installing DFO Git Hooks..."

# Make hooks executable
chmod +x .githooks/prepare-commit-msg

# Configure git to use custom hooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hook enabled:"
echo "  - prepare-commit-msg: Auto-adds [DFO-XXX] to commits from DFO branches"
echo ""
echo "Usage:"
echo "  git checkout -b feature/DFO-123-my-feature"
echo "  git commit -m 'Add new feature'"
echo "  → Commit message becomes: '[DFO-123] Add new feature'"
