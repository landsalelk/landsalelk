import logging
from .validate_queries import validate

# Configure root logger for the application
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

def main():
    """
    Entry point for the AI worker.
    This script configures logging and starts the validation process.
    """
    logger.info("Starting manager_ai module...")
    if validate():
        logger.info("Module finished successfully.")
    else:
        logger.error("Module finished with errors.")

if __name__ == "__main__":
    main()
