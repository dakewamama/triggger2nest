#!/bin/bash
echo "🧹 Cleaning up backup files..."
find . -name "*.backup" -type f -delete 2>/dev/null
find . -name "*.bak" -type f -delete 2>/dev/null
find . -name "*~" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null
echo "✅ Cleanup complete"
