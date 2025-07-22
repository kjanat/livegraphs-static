#!/usr/bin/env sh

# Script to convert JSON array to JSONL format
# Usage: ./json2jsonl.sh [-f] <input.json> [output.jsonl]

# Initialize force flag
FORCE=0

# Parse command line options
while [ $# -gt 0 ]; do
    case $1 in
    -f | --force)
        FORCE=1
        shift
        ;;
    -h | --help)
        echo "Usage: $0 [-f|--force] <input.json> [output.jsonl]"
        echo ""
        echo "Options:"
        echo "  -f, --force    Force overwrite without prompting"
        echo "  -h, --help     Show this help message"
        echo ""
        echo "Arguments:"
        echo "  input.json     Input JSON file containing an array"
        echo "  output.jsonl   Output JSONL file (optional, defaults to stdout)"
        echo ""
        echo "Examples:"
        echo "  $0 data.json                    # Output to stdout"
        echo "  $0 data.json output.jsonl       # Output to file"
        echo "  $0 -f data.json output.jsonl    # Force overwrite"
        exit 0
        ;;
    -*)
        echo "Error: Unknown option: $1" >&2
        echo "Use --help for usage information" >&2
        exit 1
        ;;
    *)
        break
        ;;
    esac
done

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    echo "Error: Missing input file" >&2
    echo "Usage: $0 [-f|--force] <input.json> [output.jsonl]" >&2
    echo "       If output file is omitted, writes to stdout" >&2
    echo "       Use -f or --force to force overwrite without prompting" >&2
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="$2"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found" >&2
    exit 1
fi

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is not installed. Please install jq first." >&2
    exit 1
fi

# Check if output file already exists (only if output file is specified)
if [ -n "$OUTPUT_FILE" ] && [ -f "$OUTPUT_FILE" ] && [ "$FORCE" -eq 0 ]; then
    printf "Warning: Output file '%s' already exists. Overwrite? (y/N) " "$OUTPUT_FILE"
    read -r REPLY
    case "$REPLY" in
    [yY] | [yY][eE][sS])
        echo "Overwriting '$OUTPUT_FILE'..."
        ;;
    *)
        echo "Aborted."
        exit 0
        ;;
    esac
fi

# Convert JSON array to JSONL
if [ -n "$OUTPUT_FILE" ]; then
    echo "Converting '$INPUT_FILE' to '$OUTPUT_FILE'..."
    jq -c '.[]' "$INPUT_FILE" >"$OUTPUT_FILE"
else
    # Output to stdout if no output file specified
    jq -c '.[]' "$INPUT_FILE"
fi

# Check if conversion was successful
if [ $? -eq 0 ]; then
    if [ -n "$OUTPUT_FILE" ]; then
        echo "Success: Converted to '$OUTPUT_FILE'"
        # Show line count
        LINE_COUNT=$(wc -l <"$OUTPUT_FILE")
        echo "Output contains $LINE_COUNT lines"
    fi
else
    echo "Error: Conversion failed" >&2
    exit 1
fi
