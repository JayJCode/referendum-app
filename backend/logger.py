import sys
from loguru import logger


def configure_logger():
    logger.remove()
    logger.add(
        sys.stdout,
        level="DEBUG",
        format="<level>{level: <8}</level> <yellow>{name}</yellow>:<yellow>{function}</yellow>:<yellow>{line}</yellow> - <level>{message}</level>",
        )

    return logger