import os
from .validate_queries import validate

def main():
    """
    Entry point for the AI worker.
    This script starts the validation process.
    """
    print(f"[{os.path.basename(__file__)}] Starting manager_ai module...")
    if validate():
        print(f"[{os.path.basename(__file__)}] Module finished successfully.")
    else:
        print(f"[{os.path.basename(__file__)}] Module finished with errors.")

if __name__ == "__main__":
    main()
