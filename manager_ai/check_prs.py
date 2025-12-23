# Standalone PR checker
from dotenv import load_dotenv
import os

load_dotenv()

# We need to minimally mock or import the necessary parts if bot.py is monolithic
# Actually bot.py has get_open_prs_and_review. Let's just run a modified version that prints.

from github import Github
# AI Review
from bot import call_openrouter, SYSTEM_PROMPT_REVIEW # Assuming these are in bot.py
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = os.getenv("REPO_NAME")

print(f"Checking PRs for {REPO_NAME}...")
g = Github(GITHUB_TOKEN)
repo = g.get_repo(REPO_NAME)
# pulls = repo.get_pulls(state='open', sort='created')
# for pr in pulls:

# DEBUG: Check only PR #68
try:
    pr = repo.get_pull(68)
    pulls = [pr]
except Exception:
    print("PR #68 not found, falling back to all")
    pulls = repo.get_pulls(state='open', sort='created', direction='desc')[:5] # Check top 5 new ones

for pr in pulls:
    print(f"PR #{pr.number}: {pr.title} by {pr.user.login}")
    print(f"URL: {pr.html_url}")

    # Fetch diff content for AI review
    print(f"   - Fetching diff from {pr.diff_url}...")
    import requests # Ensure requests is imported
    try:
        diff_resp = requests.get(pr.diff_url)
        diff_content = diff_resp.text[:6000]
    except Exception as e:
        diff_content = f"Error fetching diff: {e}"
        print(diff_content)

    print(f"   - Requesting AI Review for PR #{pr.number}...")
    ai_review = call_openrouter(SYSTEM_PROMPT_REVIEW, f"PR Title: {pr.title}\n\nDiff:\n{diff_content}")
    print(f"   - AI Response:\n{ai_review}\n")

    if "Safe to Merge: YES" in ai_review:
        print(f"   - ✅ WOULD MERGE PR #{pr.number}")
    else:
        print(f"   - ⚠️ WOULD NOT MERGE PR #{pr.number} (Condition failed)")
    print("-" * 20)

if pulls.totalCount == 0:
    print("No open PRs found.")
