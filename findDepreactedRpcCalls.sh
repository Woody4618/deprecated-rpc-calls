#!/bin/bash

#######################################################################
#
#  ██████ ██       ██████   █████  ██   ██ ██████      ██████  ███████ ██    ██
# ██      ██      ██    ██ ██   ██ ██  ██  ██   ██     ██   ██ ██      ██    ██
# ██      ██      ██    ██ ███████ █████   ██   ██     ██   ██ █████   ██    ██
# ██      ██      ██    ██ ██   ██ ██  ██  ██   ██     ██   ██ ██       ██  ██
#  ██████ ███████  ██████  ██   ██ ██   ██ ██████      ██████  ███████   ████
#
#
#   Author: Cloakd (https://twitter.com/CloakdDev)
#   Search for deprecated Solana RPC methods in files/folders.
#
#   Usage:
#       1.0. Make the script executable by running:
#            chmod +x check_words.sh
#       2.1. Run the script by specifying the directory:
#            ./check_words.sh /path/to/directory
#       2.2  OR run the script and output it to a file for inspection later:
#            ./check_words.sh /path/to/directory > output_file.txt
#
#   This script will search for deprecated Solana RPC methods in the
#   specified directory, ignoring vendor directories.
#######################################################################

# Check if correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

# Assign the directory argument to a variable
directory=$1

# Check if directory exists
if [ ! -d "$directory" ]; then
    echo "Directory '$directory' does not exist."
    exit 1
fi

# Define our deprecated methods
wordlist=(
    "confirmTransaction"
    "getSignatureStatus"
    "getSignatureConfirmation"
    "getTotalSupply"
    "getConfirmedSignaturesForAddress"
    "getConfirmedBlock"
    "getConfirmedBlocks"
    "getConfirmedBlocksWithLimit"
    "getConfirmedTransaction"
    "getConfirmedSignaturesForAddress2"
    "getRecentBlockhash"
    "getFees"
    "getFeeCalculatorForBlockhash"
    "getFeeRateGovernor"
    "getSnapshotSlot"
    "getStakeActivation"
)

# Exclude some dirs so this doesn't take forever
excluded_dirs=(
  "vendor"
  ".idea"
  ".git"
  "node_modules"
  "public"
  "dist"
  "logs"
  "xlogs"
  "assets"
  "db"
)

# Speed up search by only looking through source files
file_extensions=(
  "*.go"
  "*.ts"
  "*.tsx"
  "*.js"
  "*.jsx"
  "*.py"
  "*.r"
  "*.rs"
  "*.md"
  "*.vue"
  "*.svelte"
  "*.rb"
  "*.bat"
  "*.scala"
  "*.kt"
  "*.sh"
  "*.h"
  "*.cpp"
  "*.cs"
  "*.php"
  "*.kt"
  "*.swift"
  "*.java"
)

# Build the exclude directory arguments for grep
exclude_args=()
for dir in "${excluded_dirs[@]}"; do
    exclude_args+=("--exclude-dir=$dir")
done

# Build the include file extensions arguments for grep
include_args=()
for ext in "${file_extensions[@]}"; do
    include_args+=("--include=$ext")
done

# File to store all used calls
used_calls_file="used_calls.txt"
echo "Used calls:" > "$used_calls_file"

# Loop through each word and search in the specified directory
echo "Starting search, this may take a while..."
for word in "${wordlist[@]}"; do
    # Exclude lines that contain 'connection.confirmTransaction' but still search for 'confirmTransaction'
    grep -r -w -i -n "${include_args[@]}" "${exclude_args[@]}" "$word" "$directory" | grep -v "connection.confirmTransaction"
    
    # Log used call if found
    if grep -r -q -w -i "${include_args[@]}" "${exclude_args[@]}" "$word" "$directory"; then
        echo "$word" >> "$used_calls_file"
    fi
done

echo "Search finished!"
echo "Used calls have been logged in $used_calls_file"

exit 0