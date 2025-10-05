#!/usr/bin/env bash
set -euo pipefail

# deploy-gh-pages.sh
# Builds the project, copies CNAME (if present) into dist, and publishes dist/ to the gh-pages branch
# Usage: bash scripts/deploy-gh-pages.sh

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORKTREE_DIR="/tmp/gh-pages-$$"
BRANCH="gh-pages"

echo "Repo root: $REPO_ROOT"
cd "$REPO_ROOT"

# 1. install and build
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build

# 2. copy CNAME if present
if [ -f public/CNAME ]; then
  echo "Copying public/CNAME -> dist/CNAME"
  cp public/CNAME dist/CNAME
fi

# 3. prepare worktree
# fetch latest remote branches first
git fetch origin

# remove existing worktree dir if present
if [ -d "$WORKTREE_DIR" ]; then
  echo "Removing existing worktree at $WORKTREE_DIR"
  git worktree remove --force "$WORKTREE_DIR" || true
  rm -rf "$WORKTREE_DIR"
fi

# create or checkout the gh-pages branch into a worktree
if git show-ref --verify --quiet refs/heads/$BRANCH; then
  git worktree add "$WORKTREE_DIR" $BRANCH
else
  # branch doesn't exist locally; try to check out from origin or create orphan
  if git ls-remote --exit-code --heads origin $BRANCH >/dev/null 2>&1; then
    git worktree add "$WORKTREE_DIR" origin/$BRANCH
  else
    git worktree add -b $BRANCH "$WORKTREE_DIR"
  fi
fi

# 4. copy built files into worktree
rm -rf "$WORKTREE_DIR"/*
cp -r dist/. "$WORKTREE_DIR"/

# 5. commit & push
cd "$WORKTREE_DIR"

git add --all
if git diff --staged --quiet; then
  echo "No changes to deploy. Exiting."
else
  git commit -m "Deploy site: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  git push origin HEAD:$BRANCH --force
fi

# 6. cleanup
cd "$REPO_ROOT"
git worktree remove --force "$WORKTREE_DIR" || true
rm -rf "$WORKTREE_DIR"

echo "Deployment finished."
