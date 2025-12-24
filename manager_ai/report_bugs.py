from bot import create_github_issue, call_openrouter, SYSTEM_PROMPT_TASK
from dotenv import load_dotenv
import os

load_dotenv()

# Simulated build error log (in reality we'd parse this, but for now I'm constructing the message based on what I saw)
build_errors = """
Next.js build worker exited with code: 1
Error occurred in src/app/page.js or nearby.
Issues seen:
- Syntax error or unexpected token near 'runId'
- Potential merge conflict markers or malformed JS.
"""

print(f"Submitting Build Errors to Manager AI...")

# 1. Generate Plan using the Bot's AI
idea = f"Fix the following Next.js build errors:\n{build_errors}"
ai_plan = call_openrouter(SYSTEM_PROMPT_TASK, idea)

# 2. Inject Jules
if "@jules" not in ai_plan:
    ai_plan = f"@jules\n\n{ai_plan}"

# 3. Create Issue
title = "Fix Build Errors: Next.js Syntax Issues"
url = create_github_issue(title, ai_plan)

print(f"Created Issue for Jules: {url}")
