from bot import create_github_issue
from dotenv import load_dotenv
import os

load_dotenv()

print("Testing GitHub Issue Creation with Jules Injection...")
url = create_github_issue("Test Injection Check", "This is a test to verify @jules injection.")
print(f"Result URL: {url}")
