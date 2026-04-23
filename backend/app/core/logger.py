"""
core/logger.py
──────────────
Centralised logging setup.
Every service imports `logger` from here instead of using print().
All logs have timestamps, levels, and consistent formatting.
"""

import logging
import sys
from app.core.config import get_settings

settings = get_settings()


def setup_logger(name: str = "mediscan") -> logging.Logger:
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


# Single shared logger instance — import this everywhere
logger = setup_logger()