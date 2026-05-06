import logging

from app.config import get_settings


def configure_logging() -> None:
    settings = get_settings()
    root = logging.getLogger()
    root.setLevel(settings.log_level.upper())
    if not root.handlers:
        h = logging.StreamHandler()
        h.setFormatter(logging.Formatter("%(levelname)s %(name)s %(message)s"))
        root.addHandler(h)
