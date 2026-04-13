#!/bin/bash
# verify-build.sh — Verify that packages build correctly and templates work with local packages
#
# This script:
# 1. Verifies git working tree is clean (no staged or unstaged changes)
# 2. Runs all workspace tests
# 3. Builds all workspace packages
# 4. Temporarily updates template to use local package references
# 5. Verifies template builds successfully
# 6. Discards all changes introduced by the script
#
# Usage: ./scripts/verify-build.sh
#
# Exit codes:
#   0 — All verifications passed
#   1 — Git working tree not clean
#   2 — Tests failed
#   3 — Package build failed
#   4 — Template build failed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$ROOT_DIR/templates/react-javascript"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_step() {
    echo -e "${YELLOW}==>${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Cleanup function to discard all changes
cleanup() {
    log_step "Discarding changes introduced by script..."
    cd "$ROOT_DIR"
    git checkout -- .
    # Remove untracked files in template (node_modules, etc.)
    rm -rf "$TEMPLATE_DIR/node_modules" "$TEMPLATE_DIR/dist"
    log_success "Changes discarded"
}

# Always run cleanup on exit (success or failure)
trap cleanup EXIT

cd "$ROOT_DIR"

# Step 0: Verify git working tree is clean
log_step "Checking git working tree is clean..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    log_error "Git working tree has uncommitted changes. Please commit or stash them first."
    # Disable cleanup since we didn't make any changes
    trap - EXIT
    exit 1
fi
log_success "Git working tree is clean"

# Step 1: Run workspace tests
log_step "Running workspace tests..."
if npm test --workspaces -- --run; then
    log_success "All tests passed"
else
    log_error "Tests failed"
    exit 2
fi

# Step 2: Build workspace packages
log_step "Building workspace packages..."
if npm run build --workspaces --if-present; then
    log_success "Package builds succeeded"
else
    log_error "Package build failed"
    exit 3
fi

# Step 3: Update template to use local packages
log_step "Updating template to use local package references..."

# Use node to update the package.json (safer than sed for JSON)
node -e "
const fs = require('fs');
const pkgPath = '$TEMPLATE_DIR/package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.dependencies['@nmfs-ocio/radfish'] = 'file:../../packages/radfish';
pkg.dependencies['@nmfs-ocio/react-radfish'] = 'file:../../packages/react-radfish';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
"
log_success "Template updated with local package references"

# Step 4: Install and build template
log_step "Installing template dependencies..."
cd "$TEMPLATE_DIR"

if npm install; then
    log_success "Template dependencies installed"
else
    log_error "Template install failed"
    exit 4
fi

log_step "Building template..."
if npm run build; then
    log_success "Template build succeeded"
else
    log_error "Template build failed"
    exit 4
fi

# Step 5: Cleanup happens automatically via trap

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All verifications passed!${NC}"
echo -e "${GREEN}========================================${NC}"
