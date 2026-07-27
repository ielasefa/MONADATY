#!/bin/bash

set -e

echo "=== Production Verification ==="
echo ""

echo "Running lint..."
npm run lint
echo "✓ Lint passed"
echo ""

echo "Running TypeScript check..."
npx tsc --noEmit
echo "✓ TypeScript check passed"
echo ""

echo "Running production build..."
npm run build
echo "✓ Build passed"
echo ""

echo "Running Playwright tests..."
npx playwright test
echo "✓ All tests passed"
echo ""

echo "=== Production verification completed successfully ==="
