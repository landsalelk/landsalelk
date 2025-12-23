import logging
from .validate_queries import validate

def main():
    """
    Entry point for the AI worker.
    This script starts the validation process and is intended to be run as a module
    (e.g., python -m site.manager_ai).
    """
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logging.info("Starting worker...")
    validate()
    logging.info("Worker finished.")

if __name__ == "__main__":
    main()
