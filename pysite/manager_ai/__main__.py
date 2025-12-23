import logging
from .validate_queries import validate_ai_queries

logger = logging.getLogger(__name__)

def main():
    """
    Entry point for the AI worker.
    This script starts the validation process.
    It relies on the execution environment (e.g., Gunicorn) to configure logging.
    """
    logger.info("Starting manager_ai module...")
    if validate_ai_queries():
        logger.info("Module finished successfully.")
    else:
        logger.error("Module finished with errors.")

if __name__ == "__main__":
    # In a production environment, logging is typically configured by the
    # application server (e.g., Gunicorn) or a centralized logging service.
    # For local testing, we can add a basic configuration here.
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    main()
