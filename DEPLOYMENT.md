# Deployment Guide 🚀

This project uses a fully automated **CI/CD Pipeline** powered by **GitHub Actions** and the **Appwrite CLI**.

## 🔄 Automated Deployment (Recommended)

You don't need to deploy manually. The process is completely automated:

1.  **Develop**: Make your changes locally.
2.  **Commit**: Commit your code.
3.  **Push**: Push your changes to the `main` branch.
    ```bash
    git push origin main
    ```
4.  **Relax**: The GitHub Action will automatically:
    *   Install dependencies.
    *   Install the Appwrite CLI.
    *   **Push & Build** all your Appwrite Functions (only the ones defined in `appwrite.json`).
    *   **Deploy** the Next.js Frontend Site.
    *   **Activate** the new deployments automatically.

### Monitoring Deployments
You can monitor the progress of your deployment in the **[Actions](https://github.com/landsalelk/landsalelk/actions)** tab of this repository.

## ⚙️ Setup for Contributors

If you are a new developer setting up this repo or forking it, you need to configure the following **Secrets** in your GitHub Repository settings (`Settings` -> `Secrets and variables` -> `Actions`):

| Secret Name | Description |
| :--- | :--- |
| `APPWRITE_API_KEY` | An Appwrite API Key with enough scopes (functions.write, files.write, etc.) |
| `APPWRITE_PROJECT_ID` | Your Appwrite Project ID (e.g., `landsalelkproject`) |
| `APPWRITE_ENDPOINT` | The Appwrite Endpoint (default: `https://sgp.cloud.appwrite.io/v1`) |
| `APPWRITE_SITE_ID` | **Required**. The ID of the Appwrite Site (e.g. `6941d928...`) |
| `APPWRITE_PROJECT_ID_STAGING` | (Optional) Staging Project ID for staging deployment |
| `APPWRITE_API_KEY_STAGING` | (Optional) Staging API Key |

> **Note**: The `appwrite.json` file is the source of truth. Any function not listed there will be ignored during deployment.

## 🛠 Manual Deployment (Fallback)

If the CI/CD pipeline fails or you need to deploy manually from your local machine, you can use the Appwrite CLI directly.

### Prerequisites
1.  Install Appwrite CLI: `npm install -g appwrite-cli`
2.  Login: `appwrite login`

### Commands

**Deploy Everything (Site & Functions):**
```bash
# Push all functions defined in appwrite.json
appwrite push function --all --force

# Push the website
appwrite push site --site-id 6941d9280032a28b0536 --force
```

**Deploy Specific Function:**
```bash
appwrite push function --function-id <function-id> --force
```
