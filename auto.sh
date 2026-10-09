#!/bin/bash
while true; do
  git add .
  if ! git diff --cached --quiet; then
    git commit -m "auto update $(date '+%d-%m %H:%M')"
    git push origin main
    echo "Pushed"
  else
    echo "No changes $(date '+%H:%M:%S')"
  fi
  sleep 120
done
