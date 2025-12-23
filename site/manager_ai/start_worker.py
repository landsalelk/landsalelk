import os
import sys

# Add the parent directory to the Python path to allow for relative imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from validate_queries import validate

def main():
    """
    Entry point for the AI worker.
    This script starts the validation process.
    """
    print(f"[{os.path.basename(__file__)}] Starting worker...")
    validate()
    print(f"[{os.path.basename(__file__)}] Worker finished.")

if __name__ == "__main__":
    main()
