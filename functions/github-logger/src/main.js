import { Client } from 'node-appwrite';

// This function receives error details and creates a GitHub Issue
export default async ({ req, res, log, error }) => {
  // 1. Environment Variables (Set these in Appwrite Console)
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
  const REPO_NAME = process.env.GITHUB_REPO_NAME;

  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    error("Missing GitHub configuration variables.");
    return res.json({ success: false, message: "Configuration error" }, 500);
  }

  try {
    // 2. Parse the error data sent from the Server Action
    const { errorMessage, errorStack, path } = req.body ? JSON.parse(req.body) : {};

    if (!errorMessage) {
        return res.json({ success: false, message: "No error message provided" }, 400);
    }

    const issueTitle = `🚨 Runtime Error [Verified]: ${errorMessage.substring(0, 50)}...`;
    const issueBody = `
### Error Report
**Message:** ${errorMessage}
**Path:** \`${path}\`
**Time:** ${new Date().toISOString()}

### Stack Trace
\`\`\`
${errorStack}
\`\`\`
    `;

    // 3. Call GitHub API to create an issue
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Appwrite-Function'
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: ['bug', 'automated-report']
      })
    });

    if (!response.ok) {
      const ghError = await response.text();
      error(`GitHub API Error: ${ghError}`);
      return res.json({ success: false, error: ghError }, 500);
    }

    const issueData = await response.json();
    log(`Issue created: ${issueData.html_url}`);

    return res.json({ success: true, issueUrl: issueData.html_url });

  } catch (err) {
    error("Function failed: " + err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};
