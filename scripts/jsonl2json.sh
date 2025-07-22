#!/usr/bin/env sh

# Script to convert JSONL format to JSON array
# Usage: ./jsonl2json.sh [-f|--force] <input.jsonl> [output.json]

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
        echo "Usage: $0 [-f|--force] <input.jsonl> [output.json]"
        echo ""
        echo "Options:"
        echo "  -f, --force    Force overwrite without prompting"
        echo "  -h, --help     Show this help message"
        echo ""
        echo "Arguments:"
        echo "  input.jsonl    Input JSONL file (one JSON object per line)"
        echo "  output.json    Output JSON file (optional, defaults to stdout)"
        echo ""
        echo "Examples:"
        echo "  $0 data.jsonl                    # Output to stdout"
        echo "  $0 data.jsonl output.json        # Output to file"
        echo "  $0 -f data.jsonl output.json     # Force overwrite"
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
    echo "Usage: $0 [-f|--force] <input.jsonl> [output.json]" >&2
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

# Convert JSONL to JSON array
if [ -n "$OUTPUT_FILE" ]; then
    echo "Converting '$INPUT_FILE' to '$OUTPUT_FILE'..."
    jq -s '.' "$INPUT_FILE" >"$OUTPUT_FILE"
else
    # Output to stdout if no output file specified
    jq -s '.' "$INPUT_FILE"
fi

# Check if conversion was successful
if [ $? -eq 0 ]; then
    if [ -n "$OUTPUT_FILE" ]; then
        echo "Success: Converted to '$OUTPUT_FILE'"
        # Show object count
        OBJECT_COUNT=$(jq '. | length' "$OUTPUT_FILE")
        echo "Array contains $OBJECT_COUNT objects"
    fi
else
    echo "Error: Conversion failed" >&2
    exit 1
fi
