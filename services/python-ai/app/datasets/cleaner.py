"""
Dataset Cleaner, PII Anonymizer, and Quality Filter.
Ensures no customer private data or unscrubbed tokens are stored in training sets.
"""

import re
import hashlib
from typing import Dict, Any, Tuple


class DatasetCleaner:
    # Standard PII regex patterns
    EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
    PHONE_REGEX = re.compile(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")
    CREDIT_CARD_REGEX = re.compile(r"\b(?:\d{4}[ -]?){3}\d{4}\b")
    SSN_REGEX = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")

    @classmethod
    def anonymize_text(cls, text: str) -> str:
        """Scrub PII from text, replacing with deterministic surrogate tokens."""
        if not text:
            return ""

        scrubbed = cls.EMAIL_REGEX.sub("client.contact@company.example", text)
        scrubbed = cls.PHONE_REGEX.sub("+1-555-0199", scrubbed)
        scrubbed = cls.CREDIT_CARD_REGEX.sub("[FILTERED_PAYMENT_CARD]", scrubbed)
        scrubbed = cls.SSN_REGEX.sub("[FILTERED_SSN]", scrubbed)

        return scrubbed

    @classmethod
    def clean_record(cls, record: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        Cleans a single execution record. Returns (is_valid, cleaned_record).
        Discards low-quality or corrupt records.
        """
        if not record.get("input") or len(record.get("input", "").strip()) < 5:
            return False, {}

        cleaned = dict(record)

        # Anonymize input and output
        cleaned["input"] = cls.anonymize_text(str(record.get("input", "")))
        if "final_response" in cleaned:
            cleaned["final_response"] = cls.anonymize_text(str(record.get("final_response", "")))

        # Sanitize context dictionary
        if "context" in cleaned and isinstance(cleaned["context"], dict):
            clean_ctx = {}
            for k, v in cleaned["context"].items():
                if isinstance(v, str):
                    clean_ctx[k] = cls.anonymize_text(v)
                else:
                    clean_ctx[k] = v
            cleaned["context"] = clean_ctx

        return True, cleaned
