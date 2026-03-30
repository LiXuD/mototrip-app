#!/bin/bash

# Baseline Verification Script
# Records current codebase state for comparison

OUTPUT_FILE=".sisyphus/evidence/baseline.txt"
PROJECT_ROOT="/Users/lixd/IdeaProjects/Git/mototrip-app"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

echo "=== Baseline Verification ===" > "$OUTPUT_FILE"
echo "Date: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 1. TypeScript compilation errors
echo "--- TypeScript Compilation ---" >> "$OUTPUT_FILE"
if command -v npx &> /dev/null; then
    npx tsc --noEmit 2>&1 | tee -a "$OUTPUT_FILE"
    TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
else
    echo "npx not found, skipping TypeScript check" >> "$OUTPUT_FILE"
    TS_ERRORS="unknown"
fi
echo "Total TypeScript errors: $TS_ERRORS" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 2. Test results
echo "--- Test Results ---" >> "$OUTPUT_FILE"
if [ -f "package.json" ]; then
    if grep -q '"test"' package.json; then
        echo "Test script found in package.json" >> "$OUTPUT_FILE"
    else
        echo "No test script in package.json" >> "$OUTPUT_FILE"
    fi
fi
echo "" >> "$OUTPUT_FILE"

# 3. console.log count (include .vue files)
echo "--- Code Quality Metrics ---" >> "$OUTPUT_FILE"
CONSOLE_LOG_COUNT=$(grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.vue" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
echo "console.log count: $CONSOLE_LOG_COUNT" >> "$OUTPUT_FILE"

# 4. "as any" count (include .vue files)
AS_ANY_COUNT=$(grep -r "as any" --include="*.ts" --include="*.tsx" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v "\.spec\.ts" | wc -l | tr -d ' ')
echo "as any count: $AS_ANY_COUNT" >> "$OUTPUT_FILE"

# 5. unknown type count
UNKNOWN_COUNT=$(grep -r "request<unknown>" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
echo "unknown type count: $UNKNOWN_COUNT" >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"

# 6. Store files line count
echo "--- Store File Statistics ---" >> "$OUTPUT_FILE"
if [ -d "src/store" ] || [ -d "store" ]; then
    STORE_DIR=""
    [ -d "src/store" ] && STORE_DIR="src/store"
    [ -d "store" ] && STORE_DIR="store"
    
    if [ -n "$STORE_DIR" ]; then
        echo "Store files in $STORE_DIR:" >> "$OUTPUT_FILE"
        for f in "$STORE_DIR"/*.ts "$STORE_DIR"/*.tsx; do
            if [ -f "$f" ]; then
                LINES=$(wc -l < "$f" | tr -d ' ')
                echo "  $(basename $f): $LINES lines" >> "$OUTPUT_FILE"
            fi
        done
        
        TOTAL_LINES=$(find "$STORE_DIR" -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
        echo "Total store lines: $TOTAL_LINES" >> "$OUTPUT_FILE"
    fi
else
    echo "No store directory found" >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"
echo "=== Baseline Complete ===" >> "$OUTPUT_FILE"

# Print to console
cat "$OUTPUT_FILE"
