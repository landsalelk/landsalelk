'use server'

interface CreateIssueParams {
    title: string
    body: string
    labels?: string[]
}

export async function createGitHubIssue({ title, body, labels = ['bug', 'automated-report'] }: CreateIssueParams) {
    const token = process.env.GITHUB_ACCESS_TOKEN
    const repoOwner = 'landsalelk'
    const repoName = 'landsalelk'

    if (!token) {
        console.warn('[GitHubLogging] GITHUB_ACCESS_TOKEN is not set. Skipping issue creation.')
        return { success: false, error: 'Token missing' }
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                body,
                labels
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('[GitHubLogging] Failed to create issue:', errorData)
            return { success: false, error: errorData }
        }

        const issue = await response.json()
        return { success: true, issueUrl: issue.html_url, issueNumber: issue.number }

    } catch (error) {
        console.error('[GitHubLogging] Exception during issue creation:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
