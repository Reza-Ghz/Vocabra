#!/usr/bin/env bash
#
# ----------------------------------------------------------------------
# Script Name: extract_json.sh
#
# Description:
#   This script extracts all JSON code blocks from a Markdown file and
#   combines them into one valid JSON array using `jq`.
#
#   It searches for fenced code blocks that start with ```json and end
#   with ```, then extracts the content between them.
#
#   The output file will contain one merged JSON array of all entries
#   found inside the Markdown file.
#
# Requirements:
#   - bash (version 4+)
#   - awk (any POSIX-compatible version)
#   - jq  (for combining multiple JSON arrays into one)
#
# Usage:
#   ./extract_json.sh input.md output.json
#
# Example:
#   ./extract_json.sh chatlog.md words.json
#
#   This reads all JSON code blocks from 'chatlog.md' and writes
#   a combined JSON array to 'words.json'.
#
# Example Input (Markdown):
#   Some text
#
#   ```json
#   [ { "word": "torch" } ]
#   ```
#
#   ```json
#   [ { "word": "platoon" } ]
#   ```
#
# Example Output (JSON):
#   [
#     { "word": "torch" },
#     { "word": "platoon" }
#   ]
#
# ----------------------------------------------------------------------

# --- Input arguments ---
input="$1"
output="$2"

# --- Validate arguments ---
if [[ -z "$input" || -z "$output" ]]; then
  echo "Usage: $0 input.md output.json"
  exit 1
fi

# --- Extract JSON code blocks and merge them into one JSON array ---
awk '
BEGIN { inblock=0 }
# Detect start of JSON code block (e.g., ```json or ``` json)
# The [[:space:]]* pattern allows spaces/tabs before or after.
#/start fence
 /^[[:space:]]*```[[:space:]]*json[[:space:]]*$/ { inblock=1; next }

# Detect end of code block (e.g., ```)
#/end fence
 /^[[:space:]]*```[[:space:]]*$/ && inblock { inblock=0; next }

# Print lines only when inside a JSON block
inblock
' "$input" | jq -s 'flatten' > "$output"

# --- Done ---
echo "✅ Extracted JSON blocks written to: $output"
