#!/usr/bin/env -S uv run
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "jsonschema[format-nongpl]",
#   "requests",
#   "types-requests",
#   "types-jsonschema",
#   "pydantic",
#   "pydantic3"
# ]
# ///
#
# [tool.ruff.lint]
# ignore = ["B311"]
#
# [tool.bandit]
# skips = ["B311"]

"""
Synthetic session generator
---------------------------
Generate N synthetic support/chat sessions and dump them to a JSON file.
Validates against a JSON Schema by default.

Usage examples:
    ./scripts/sample_json_generator.py --help
    ./scripts/sample_json_generator.py -n 100 -o output.json
    ./scripts/sample_json_generator.py -n 10 -o data.json --seed 42 --no-rating
    ./scripts/sample_json_generator.py -n 50 -o data.json --schema ./public/data-schema.json
    ./scripts/sample_json_generator.py -n 100 -o output.jsonl --jsonl --pretty
    ./scripts/sample_json_generator.py -n 1000 -o large_dataset.json --compressed  # Compact + uncompressed by default
    ./scripts/sample_json_generator.py -n 100 -o pretty_output.json --pretty
"""

from __future__ import annotations

import argparse
import gzip
import json
import logging
import random
import sys
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Optional

import requests
from jsonschema import Draft7Validator, FormatChecker
from pydantic import BaseModel, HttpUrl

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ------------------------- Configuration ------------------------- #

DEFAULT_SCHEMA_URL = "https://raw.githubusercontent.com/kjanat/livegraphs-static/refs/heads/develop/public/data-schema.json"


class Category(str, Enum):
    """Supported session categories."""

    TECHNICAL_SUPPORT = "Technical Support"
    BILLING = "Billing"
    ACCOUNT_MANAGEMENT = "Account Management"
    PRODUCT_INFORMATION = "Product Information"
    GENERAL_INQUIRY = "General Inquiry"
    FEATURE_REQUEST = "Feature Request"
    BUG_REPORT = "Bug Report"
    ONBOARDING = "Onboarding"
    OTHER = "Unrecognized / Other"


class Sentiment(str, Enum):
    """Session sentiment options."""

    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class Role(str, Enum):
    """Chat participant roles."""

    USER = "User"
    ASSISTANT = "Assistant"


@dataclass
class DataConfig:
    """Configuration for data generation."""

    questions: list[str] = field(
        default_factory=lambda: [
            "How do I reset my password?",
            "What are your pricing plans?",
            "How can I upgrade my account?",
            "I'm having trouble logging in",
            "Can you explain this feature?",
            "How do I export my data?",
            "Is there a mobile app available?",
            "How secure is my data?",
            "Can I integrate with other tools?",
            "What's included in the free plan?",
            "How do I cancel my subscription?",
            "Can I get a demo?",
            "What payment methods do you accept?",
            "How do I add team members?",
            "Is there an API available?",
        ]
    )

    countries: list[str] = field(
        default_factory=lambda: [
            "NL",
            "DE",
            "FR",
            "GB",
            "US",
            "ES",
            "IT",
            "BE",
            "PL",
            "SE",
        ]
    )

    languages: list[str] = field(
        default_factory=lambda: ["en", "nl", "de", "fr", "es", "it", "pl", "sv"]
    )

    vocab: list[str] = field(
        default_factory=lambda: [
            "user",
            "clicked",
            "button",
            "saw",
            "error",
            "page",
            "loaded",
            "slowly",
            "feedback",
            "suggested",
            "feature",
            "broken",
            "flow",
            "needs",
            "work",
            "improved",
            "filter",
            "sort",
            "option",
            "lag",
            "issue",
            "fixed",
            "release",
            "beta",
            "test",
            "variant",
            "copy",
            "cta",
            "layout",
            "confusing",
            "clearer",
            "steps",
            "cart",
            "added",
            "removed",
            "quantity",
        ]
    )


# ------------------------- Data Models ------------------------- #


class TranscriptEntry(BaseModel):
    """Single transcript entry."""

    timestamp: str
    role: Role
    content: str


class MessageStats(BaseModel):
    """Message statistics."""

    response_time: dict[str, float]
    amount: dict[str, int]
    tokens: int
    cost: dict[str, dict[str, float]]
    source_url: HttpUrl


class User(BaseModel):
    """User information."""

    ip: str
    country: str
    language: str


class Session(BaseModel):
    """Complete session data."""

    session_id: str
    start_time: str
    end_time: str
    transcript: list[TranscriptEntry]
    messages: MessageStats
    user: User
    sentiment: Sentiment
    escalated: bool
    forwarded_hr: bool
    category: Category
    questions: list[str]
    summary: str
    user_rating: Optional[float] = None


# ------------------------- Data Generation ------------------------- #


class SessionGenerator:
    """Generates synthetic session data."""

    def __init__(self, config: DataConfig, seed: Optional[int] = None):
        """
        Initialize the SessionGenerator with a data configuration and optional random seed.
        
        Parameters:
            config (DataConfig): Configuration containing vocabularies and options for data generation.
            seed (int, optional): Seed for random number generation to ensure reproducibility.
        """
        self.config = config
        if seed is not None:
            random.seed(seed)

    def generate_ipv4(self) -> str:
        """
        Generate a random IPv4 address in dotted-decimal notation.
        
        Returns:
            str: A synthetically generated IPv4 address (e.g., '192.168.1.1').
        """
        octets = [
            random.randint(1, 254),
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(1, 254),
        ]
        return ".".join(map(str, octets))

    def generate_timestamp(self, base: datetime, days_span: int) -> str:
        """
        Generate a random ISO8601 UTC timestamp within a specified number of days from a base datetime.
        
        Parameters:
            base (datetime): The starting datetime.
            days_span (int): The maximum number of days to offset from the base.
        
        Returns:
            str: An ISO8601-formatted UTC timestamp string.
        """
        offset = timedelta(
            days=random.randint(0, days_span), seconds=random.randint(0, 86_400)
        )
        return (
            (base + offset).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        )

    def generate_sentence(self, min_words: int = 8, max_words: int = 16) -> str:
        """
        Generate a random sentence using words from the configured vocabulary.
        
        Parameters:
            min_words (int): Minimum number of words in the sentence.
            max_words (int): Maximum number of words in the sentence.
        
        Returns:
            str: A randomly generated sentence with a capitalized first letter and ending period.
        """
        num_words = random.randint(min_words, max_words)
        words = random.choices(self.config.vocab, k=num_words)
        return " ".join(words).capitalize() + "."

    def generate_transcript(
        self, base_date: datetime, days_span: int
    ) -> list[TranscriptEntry]:
        """
        Generate a list of transcript entries representing a synthetic chat conversation.
        
        Parameters:
            base_date (datetime): The base datetime from which transcript entry timestamps are generated.
            days_span (int): The range in days from the base date within which timestamps are randomized.
        
        Returns:
            list[TranscriptEntry]: A list of 3 to 8 transcript entries with randomized timestamps, roles, and message content.
        """
        entries = []
        num_entries = random.randint(3, 8)

        for _ in range(num_entries):
            entry = TranscriptEntry(
                timestamp=self.generate_timestamp(base_date, days_span),
                role=random.choice(list(Role)),
                content=self.generate_sentence(),
            )
            entries.append(entry)

        return entries

    def generate_session(
        self, base_date: datetime, days_span: int, include_rating: bool = True
    ) -> Session:
        """
        Generate a synthetic support/chat session with randomized metadata, transcript, statistics, and optional user rating.
        
        Parameters:
            base_date (datetime): The base datetime for generating session timestamps.
            days_span (int): The range of days from the base date within which timestamps are generated.
            include_rating (bool, optional): If True, includes a user rating in the session with an 80% probability.
        
        Returns:
            Session: A fully populated synthetic session object with randomized fields.
        """
        session_id = str(uuid.uuid4())

        # Generate timestamps ensuring end > start
        start_time = self.generate_timestamp(base_date, days_span)
        end_time = self.generate_timestamp(base_date, days_span)
        if end_time < start_time:
            start_time, end_time = end_time, start_time

        # Generate message stats
        messages = MessageStats(
            response_time={"avg": round(random.uniform(0, 120), 2)},
            amount={
                "user": random.randint(1, 10),
                "total": random.randint(3, 20),
            },
            tokens=random.randint(50, 5000),
            cost={
                "eur": {
                    "cent": round(random.uniform(0, 500), 2),
                    "full": round(random.uniform(0, 5), 4),
                }
            },
            source_url=HttpUrl(f"https://redacted.local/chat/{session_id}"),
        )

        # Generate user
        user = User(
            ip=self.generate_ipv4(),
            country=random.choice(self.config.countries),
            language=random.choice(self.config.languages),
        )

        # Generate questions (2-5 random questions)
        num_questions = random.randint(2, min(5, len(self.config.questions)))
        questions = random.sample(self.config.questions, k=num_questions)

        # Generate summary
        summary = " ".join(self.generate_sentence(10, 10) for _ in range(2))

        # Optionally generate rating
        user_rating = None
        if include_rating and random.random() < 0.8:
            user_rating = random.choice([1, 2, 3, 4, 4.5, 5])

        # Create session directly
        return Session(
            session_id=session_id,
            start_time=start_time,
            end_time=end_time,
            transcript=self.generate_transcript(base_date, days_span),
            messages=messages,
            user=user,
            sentiment=random.choice(list(Sentiment)),
            escalated=random.choice([True, False]),
            forwarded_hr=random.choice([True, False]),
            category=random.choice(list(Category)),
            questions=questions,
            summary=summary,
            user_rating=user_rating,
        )


# ------------------------- Schema Validation ------------------------- #


class SchemaValidator:
    """Handles JSON schema validation."""

    @staticmethod
    def fetch_schema(path_or_url: str) -> dict[str, Any]:
        """
        Loads a JSON Schema from a local file or HTTP(S) URL.
        
        Parameters:
            path_or_url (str): Path to a local schema file or a URL to fetch the schema from.
        
        Returns:
            dict[str, Any]: The loaded JSON Schema as a dictionary.
        
        Raises:
            ValueError: If fetching the schema from a URL fails.
            FileNotFoundError: If the specified local schema file does not exist.
        """
        if path_or_url.startswith(("http://", "https://")):
            try:
                response = requests.get(path_or_url, timeout=15)
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                raise ValueError(f"Failed to fetch schema: {e}")

        path = Path(path_or_url)
        if not path.exists():
            raise FileNotFoundError(f"Schema file not found: {path}")

        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def validate(data: list[dict[str, Any]], schema: dict[str, Any]) -> list[str]:
        """
        Validate a list of data objects against a JSON Schema and return error messages for any validation failures.
        
        Parameters:
            data (list[dict[str, Any]]): The data objects to validate.
            schema (dict[str, Any]): The JSON Schema to validate against.
        
        Returns:
            list[str]: A list of error messages, each indicating the path and reason for a validation failure.
        """
        validator = Draft7Validator(schema, format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))

        messages = []
        for error in errors:
            path = ".".join(map(str, error.path)) or "$"
            messages.append(f"{path}: {error.message}")

        return messages


# ------------------------- CLI ------------------------- #


def parse_args() -> argparse.Namespace:
    """
    Parse and return command-line arguments for synthetic session data generation.
    
    Returns:
        argparse.Namespace: Parsed arguments including session count, output file path, random seed, date range, schema options, output formatting, compression, and validation flags.
    """
    parser = argparse.ArgumentParser(
        description="Generate synthetic session dataset JSON.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    parser.add_argument(
        "-n", "--num", type=int, required=True, help="Number of sessions to generate"
    )
    parser.add_argument(
        "-o", "--out", type=Path, required=True, help="Output JSON file path"
    )
    parser.add_argument("--seed", type=int, help="Random seed for reproducibility")
    parser.add_argument(
        "--start-date",
        type=str,
        default="2024-01-01",
        help="Earliest date (YYYY-MM-DD)",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=365,
        help="Number of days from start-date to sample timestamps",
    )
    parser.add_argument(
        "--no-rating", action="store_true", help="Never include user_rating field"
    )
    parser.add_argument(
        "--schema",
        type=str,
        default=DEFAULT_SCHEMA_URL,
        help="Path or URL to JSON Schema",
    )
    parser.add_argument(
        "--skip-validate", action="store_true", help="Skip schema validation step"
    )
    parser.add_argument(
        "--indent", type=int, default=2, help="JSON indentation (0 for compact)"
    )
    parser.add_argument(
        "--compressed",
        action="store_true",
        help="Output gzip compressed file (default is uncompressed)",
    )
    parser.add_argument(
        "--jsonl", action="store_true", help="Output JSONL format instead of JSON"
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON with indentation (default is compact)",
    )

    return parser.parse_args()


def main() -> None:
    """
    Generates synthetic support/chat session data based on CLI arguments, writes the output to a file in JSON or JSONL format (optionally compressed), and validates the data against a JSON Schema if requested.
    
    Parses command-line options for session count, output file, random seed, date range, formatting, compression, and schema validation. Handles progress logging for large datasets and exits with an error if validation fails.
    """
    args = parse_args()

    # Parse start date
    try:
        start_date = datetime.strptime(args.start_date, "%Y-%m-%d").replace(
            tzinfo=timezone.utc
        )
    except ValueError as e:
        logger.error(f"Invalid --start-date: {e}")
        sys.exit(1)

    # Initialize generator
    config = DataConfig()
    generator = SessionGenerator(config, seed=args.seed)

    # Generate sessions
    logger.info(f"Generating {args.num} sessions...")
    sessions = []

    for i in range(args.num):
        session = generator.generate_session(
            start_date, args.days, include_rating=not args.no_rating
        )
        sessions.append(session.model_dump(exclude_none=True, mode="json"))

        # Progress indicator for large datasets
        if args.num >= 1000 and (i + 1) % 100 == 0:
            logger.info(f"Generated {i + 1}/{args.num} sessions...")

    # Write output
    logger.info(f"Writing {len(sessions)} sessions to {args.out}")
    args.out.parent.mkdir(parents=True, exist_ok=True)

    # Determine output format and compression
    output_file = args.out
    use_compression = args.compressed

    # Adjust file extension for compression
    if use_compression and not str(output_file).endswith(".gz"):
        output_file = output_file.with_suffix(output_file.suffix + ".gz")

    # Prepare the output content
    if args.jsonl:
        # JSONL format (one JSON object per line) - always compact
        content = "\n".join(
            json.dumps(session, ensure_ascii=False, separators=(",", ":"))
            for session in sessions
        )
        content += "\n"  # Add final newline
    else:
        # JSON format (array of objects)
        if args.pretty:
            content = json.dumps(sessions, ensure_ascii=False, indent=args.indent)
        else:
            content = json.dumps(sessions, ensure_ascii=False, separators=(",", ":"))

    # Write the file
    if use_compression:
        with gzip.open(output_file, "wt", encoding="utf-8") as f:
            f.write(content)
    else:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)

    # Validate if requested
    if not args.skip_validate:
        logger.info("Validating against schema...")
        try:
            schema = SchemaValidator.fetch_schema(args.schema)
            errors = SchemaValidator.validate(sessions, schema)

            if errors:
                logger.error("Schema validation failed:")
                for error in errors:
                    logger.error(f"  - {error}")
                sys.exit(1)
            else:
                logger.info("✅ Schema validation passed")
        except Exception as e:
            logger.warning(f"Could not validate: {e}")

    logger.info("✨ Done!")


if __name__ == "__main__":
    main()
