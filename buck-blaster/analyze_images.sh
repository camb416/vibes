#!/bin/bash

# Create directories if they don't exist
mkdir -p images/light images/dark

# Loop through all PNG files in the images directory
for img in images/unnamed*.png; do
  # Skip if the file is already in a subdirectory
  if [[ "$img" == *"/light/"* || "$img" == *"/dark/"* ]]; then
    continue
  fi
  
  # Get the filename without the path
  filename=$(basename "$img")
  
  # Analyze the image to determine if it's light or dark
  # We'll use ImageMagick to get the mean brightness
  brightness=$(convert "$img" -colorspace Gray -format "%[mean]" info:)
  
  # The brightness is a value between 0 and 65535
  # We'll consider images with brightness > 32767 (half of max) as light
  if (( $(echo "$brightness > 32767" | bc -l) )); then
    echo "$filename is light (brightness: $brightness)"
    cp "$img" "images/light/$filename"
  else
    echo "$filename is dark (brightness: $brightness)"
    cp "$img" "images/dark/$filename"
  fi
done

echo "Analysis complete. Images have been copied to light and dark directories." 