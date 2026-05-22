#!/bin/bash

echo "🚀 Starting Git Automation..."

# Show current status
git status

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "Yenna da panni vachu erukka:"
read message

# Commit changes
git commit -m "$message"

echo ""
echo "⬆️ Pushing to GitHub..."
git push

echo ""
echo "🌐 Push panniyachu da"
