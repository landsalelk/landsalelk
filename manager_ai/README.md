# Manager AI Bot

This bot runs locally in your Project IDX environment and connects Discord, OpenRouter (Gemini), and GitHub.

## Setup

1.  **Create and Activate Virtual Environment** (Recommended):
    ```bash
    python -m venv .venv
    .venv\Scripts\activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Create a `.env` file in this directory (`site/manager_ai/.env`) with the following keys:
    ```env
    DISCORD_TOKEN=your_discord_bot_token
    OPENROUTER_API_KEY=your_openrouter_key
    GITHUB_TOKEN=your_github_personal_access_token
    REPO_NAME=your_username/your_repo_name
    ```

## Usage

1.  **Run the Bot**:
    ```bash
    python bot.py
    ```

2.  **Discord Commands**:
    - `!task <idea>`: Converts an idea into a technical GitHub Issue.
    - `!status`: Checks open PRs and provides an AI review of the diffs.
