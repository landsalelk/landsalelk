from bot import create_github_issue, call_openrouter_sync, SYSTEM_PROMPT_TASK
from dotenv import load_dotenv
import sys

load_dotenv()

def task_jules(idea):
    print(f"Tasking Jules with: {idea}...")
    
    # 1. Generate Plan
    ai_plan = call_openrouter_sync(SYSTEM_PROMPT_TASK, idea)
    
    # 2. Inject Jules
    if "@jules" not in ai_plan:
        ai_plan = f"@jules\n\n{ai_plan}"
    
    # 3. Create Issue
    title = f"Task: {idea[:50]}..."
    url = create_github_issue(title, ai_plan)
    print(f"Title: {title}")
    print(f"URL: {url}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        task_jules(sys.argv[1])
    else:
        print("Usage: python task_jules.py <idea>")
