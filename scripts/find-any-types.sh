#!/bin/bash

# Script to find all 'any' type usage in TypeScript files
# Excludes test files and node_modules

echo "Finding all 'any' type usage in the codebase..."
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Count total files with 'any'
total_files=$(grep -r "any" src/ server/src/ --include="*.ts" --include="*.tsx" --exclude-dir="__tests__" --exclude-dir="node_modules" -l | grep -v ".test." | grep -v ".spec." | wc -l)

echo -e "${YELLOW}Total files with 'any' type: $total_files${NC}"
echo ""

# Show detailed results
echo "Detailed occurrences:"
echo "-------------------"

# Find all occurrences with line numbers and context
# Use word boundaries to avoid matching 'any' inside other words
grep -r "\bany\b" src/ server/src/ \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="__tests__" \
  --exclude-dir="node_modules" \
  -n \
  --color=always | \
  grep -v ".test." | \
  grep -v ".spec." | \
  while IFS=: read -r file line content; do
    # Skip type definition files and comments
    if [[ "$file" =~ \.d\.ts$ ]] || [[ "$content" =~ ^[[:space:]]*// ]] || [[ "$content" =~ ^[[:space:]]*\* ]]; then
      continue
    fi
    
    # Highlight different types of 'any' usage
    if [[ "$content" =~ :\ any ]]; then
      echo -e "${RED}Type annotation:${NC} $file:$line"
      echo "  $content"
    elif [[ "$content" =~ \<any\> ]]; then
      echo -e "${RED}Generic type:${NC} $file:$line"
      echo "  $content"
    elif [[ "$content" =~ as\ any ]]; then
      echo -e "${RED}Type assertion:${NC} $file:$line"
      echo "  $content"
    elif [[ "$content" =~ Record\<[^,]*,\ *any\> ]]; then
      echo -e "${RED}Record with any:${NC} $file:$line"
      echo "  $content"
    else
      echo -e "${YELLOW}Other usage:${NC} $file:$line"
      echo "  $content"
    fi
    echo ""
  done

# Summary
echo "============================================="
echo -e "${GREEN}Summary:${NC}"
echo "- Run 'npm run typecheck' to ensure no TypeScript errors"
echo "- Consider using 'unknown' instead of 'any' for truly unknown types"
echo "- Use specific interfaces or union types where possible"
echo "- For third-party libraries, create proper type definitions"