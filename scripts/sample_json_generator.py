#!/usr/bin/env -S uv run
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "jsonschema[format-nongpl]",
#   "requests",
#   "types-requests",
#   "types-jsonschema"
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
Generate N synthetic support/chat "sessions" and dump them to a JSON file.
Validates against a JSON Schema (your schema) by default.

Usage examples:
    ./sample_json_generator.py -n 100 -o output.json
    ./sample_json_generator.py -n 10 -o data.json --seed 42 --no-rating
    ./sample_json_generator.py -n 50 -o data.json --schema ./public/data-schema.json

Default schema URL (can be overridden with --schema):
    https://raw.githubusercontent.com/kjanat/livegraphs-static/refs/heads/develop/public/data-schema.json

Allowed topics/categories hard-coded from your list:
    "Technical Support", "Billing", "Account Management", "Product Information",
    "General Inquiry", "Feature Request", "Bug Report", "Onboarding", "Unrecognized / Other"

Tip: Edit make_session() if your schema evolves.
"""

from __future__ import annotations
import argparse
import json
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

import requests
from jsonschema import Draft7Validator, FormatChecker

# ------------------------- Constants & vocab ------------------------- #
DEFAULT_SCHEMA_URL = "https://raw.githubusercontent.com/kjanat/livegraphs-static/refs/heads/develop/public/data-schema.json"

ALLOWED_CATEGORIES = [
    "Technical Support",
    "Billing",
    "Account Management",
    "Product Information",
    "General Inquiry",
    "Feature Request",
    "Bug Report",
    "Onboarding",
    "Unrecognized / Other",
]

QUESTIONS = [
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

COUNTRIES = ["NL", "DE", "FR", "GB", "US", "ES", "IT", "BE", "PL", "SE"]
LANGS = ["en", "nl", "de", "fr", "es", "it", "pl", "sv"]
SENTIMENTS = ["positive", "neutral", "negative"]
ROLES = ["User", "Assistant"]

VOCAB = (
    "user clicked button saw error page loaded slowly feedback suggested feature "
    "broken flow needs work improved filter sort option lag issue fixed release "
    "beta test variant copy cta layout confusing clearer steps cart added removed quantity"
).split()

# ------------------------- Helper functions ------------------------- #


def rand_iso(start: datetime, days_span: int) -> str:
    """Return an ISO8601 timestamp randomly offset from start within days_span days."""
    delta = timedelta(
        days=random.randint(0, days_span), seconds=random.randint(0, 86_400)
    )
    return (start + delta).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def rand_sentence(words: int = 12) -> str:
    return " ".join(random.choices(VOCAB, k=words)).capitalize() + "."


def fake_ipv4() -> str:
    return f"{random.randint(1, 254)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"


def make_transcript(start_anchor: datetime, span_days: int) -> List[Dict[str, Any]]:
    out = []
    for _ in range(random.randint(3, 8)):
        out.append(
            {
                "timestamp": rand_iso(start_anchor, span_days),
                "role": random.choice(ROLES),
                "content": rand_sentence(random.randint(8, 16)),
            }
        )
    return out


def make_messages(session_id: str) -> Dict[str, Any]:
    return {
        "response_time": {"avg": round(random.uniform(0, 120), 2)},
        "amount": {
            "user": random.randint(1, 10),
            "total": random.randint(3, 20),
        },
        "tokens": random.randint(50, 5000),
        "cost": {
            "eur": {
                "cent": round(random.uniform(0, 500), 2),
                "full": round(random.uniform(0, 5), 4),
            }
        },
        # Required by your schema complaint earlier
        "source_url": f"https://redacted.local/chat/{session_id}",
    }


def make_user() -> Dict[str, Any]:
    return {
        "ip": fake_ipv4(),  # schema requires ip
        "country": random.choice(COUNTRIES),
        "language": random.choice(LANGS),
    }


def make_questions() -> List[str]:
    n = random.randint(2, min(5, len(QUESTIONS)))
    return random.sample(QUESTIONS, k=n)


def make_summary() -> str:
    return " ".join(rand_sentence(10) for _ in range(2))


def make_session(
    start_anchor: datetime, span_days: int, include_rating: bool = True
) -> Dict[str, Any]:
    sid = str(uuid.uuid4())
    start_time = rand_iso(start_anchor, span_days)
    end_time = rand_iso(start_anchor, span_days)
    if end_time < start_time:
        start_time, end_time = end_time, start_time

    session: Dict[str, Any] = {
        "session_id": sid,
        "start_time": start_time,
        "end_time": end_time,
        "transcript": make_transcript(start_anchor, span_days),
        "messages": make_messages(sid),
        "user": make_user(),
        "sentiment": random.choice(SENTIMENTS),
        "escalated": random.choice([True, False]),
        "forwarded_hr": random.choice([True, False]),
        "category": random.choice(ALLOWED_CATEGORIES),
        "questions": make_questions(),
        "summary": make_summary(),
    }

    if include_rating and random.random() < 0.8:
        session["user_rating"] = random.choice([1, 2, 3, 4, 5, 4.5])

    return session


# ------------------------- Validation helpers ------------------------- #


def fetch_schema(path_or_url: str) -> Dict[str, Any]:
    if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
        resp = requests.get(path_or_url, timeout=15)
        resp.raise_for_status()
        return resp.json()
    with open(path_or_url, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_dataset(data: List[Dict[str, Any]], schema: Dict[str, Any]) -> List[str]:
    """Return list of human-readable error messages (empty if valid)."""
    validator = Draft7Validator(schema, format_checker=FormatChecker())
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    msgs = []
    for err in errors:
        path = ".".join(map(str, err.path)) or "$"
        msgs.append(f"{path}: {err.message}")
    return msgs


# ------------------------------- main() -------------------------------- #


def main() -> None:
    p = argparse.ArgumentParser(
        description="Generate synthetic session dataset JSON.")
    p.add_argument(
        "-n", "--num", type=int, required=True, help="Number of sessions to generate"
    )
    p.add_argument("-o", "--out", type=str, required=True,
                   help="Output JSON file path")
    p.add_argument(
        "--seed", type=int, default=None, help="Random seed for reproducibility"
    )
    p.add_argument(
        "--start-date",
        type=str,
        default="2024-01-01",
        help="Earliest date (YYYY-MM-DD)",
    )
    p.add_argument(
        "--days",
        type=int,
        default=365,
        help="Number of days from start-date to sample timestamps",
    )
    p.add_argument(
        "--no-rating", action="store_true", help="Never include user_rating field"
    )
    p.add_argument(
        "--schema",
        type=str,
        default=DEFAULT_SCHEMA_URL,
        help="Path or URL to JSON Schema",
    )
    p.add_argument(
        "--skip-validate", action="store_true", help="Skip schema validation step"
    )

    args = p.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    try:
        start_anchor = datetime.strptime(args.start_date, "%Y-%m-%d").replace(
            tzinfo=timezone.utc
        )
    except ValueError as exc:
        raise SystemExit(f"Invalid --start-date: {exc}")

    data = [
        make_session(start_anchor, args.days,
                     include_rating=not args.no_rating)
        for _ in range(args.num)
    ]

    # Write file
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(data)} sessions to {args.out}")

    # Validate
    if not args.skip_validate:
        try:
            schema = fetch_schema(args.schema)
        except Exception as exc:  # network / IO errors
            print(
                f"WARNING: Could not fetch schema ({exc}). Skipping validation.")
            return
        errors = validate_dataset(data, schema)
        if errors:
            print("\nSchema validation errors:")
            for e in errors:
                print(f"- {e}")
            raise SystemExit(1)
        else:
            print("Schema validation passed ✔")


if __name__ == "__main__":
    main()
