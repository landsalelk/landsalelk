import os
from .validate_queries import validate

def main():
    """
    Entry point for the AI worker.
    This script starts the validation process.
    """
    print(f"[manager_ai] Starting worker...")
    validate()
    print(f"[manager_ai] Worker finished.")

if __name__ == "__main__":
    main()
