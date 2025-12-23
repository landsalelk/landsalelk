/**
 * GitHub Logger Function
 *
 * Creates a GitHub Issue for errors or important logs.
 *
 * Environment Variables Required:
 * - GITHUB_TOKEN: Personal Access Token (PAT) with repo permissions.
 * - GITHUB_REPO: Repository name in format "owner/repo" (e.g., "landsalelk/landsalelk").
 *
 * Payload:
 * {
 *   "title": "Error Title",
 *   "body": "Error details, stack trace, etc.",
 *   "labels": ["bug", "production"],
 *   "assignees": ["username"]
 * }
 */

export default async ({ req, res, log, error }) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO || 'landsalelk/landsalelk';

  // Basic validation
  if (!GITHUB_TOKEN) {
    error('GITHUB_TOKEN is not defined in environment variables.');
    return res.json({
      success: false,
      message: 'Configuration error: GITHUB_TOKEN missing.'
    }, 500);
  }

  try {
    let payload = req.body;

    // Parse JSON if it's a string (Appwrite sometimes passes body as string)
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        error('Failed to parse request body');
        return res.json({ success: false, message: 'Invalid JSON body' }, 400);
      }
    }

    const { title, body, labels = ['log'], assignees = [] } = payload;

    if (!title || !body) {
      return res.json({ success: false, message: 'Title and Body are required.' }, 400);
    }

    log(`Creating GitHub Issue: ${title}`);

    // Create Issue via GitHub API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Appwrite-Logger-Function'
          },
          body: JSON.stringify({
            title,
            body,
            labels,
            assignees
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          error(`GitHub API Error: ${response.status} ${response.statusText}`);
          error(JSON.stringify(data));
          return res.json({
            success: false,
            message: 'Failed to create issue on GitHub',
            details: data
          }, 500);
        }

        log(`Issue created successfully: ${data.html_url}`);

        return res.json({
          success: true,
          message: 'Issue created successfully',
          issueUrl: data.html_url,
          issueId: data.number
        });
    } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
            return res.json({
                success: false,
                message: 'GitHub API request timed out'
            }, 504);
        }
        throw fetchError;
    }

  } catch (err) {
    error(`Function execution error: ${err.message}`);
    return res.json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    }, 500);
  }
};
