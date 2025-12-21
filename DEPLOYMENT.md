# Deployment Guide 🚀

This project uses **Appwrite Git Integration** for frontend deployment and `appwrite-cli` for function deployment.

## Frontend Deployment

The Next.js frontend is deployed automatically via Appwrite's App Runner.

1.  **Push to GitHub**: Changes pushed to the `main` branch trigger a new deployment.
2.  **Configuration**:
    *   **Root Directory**: `.`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `.next`
    *   **Install Command**: `npm install`
3.  **Environment Variables**: Ensure all variables in `.env.example` are set in the Appwrite Console under the project's settings.

**Important**: The project includes `lightningcss-linux-x64-musl` as a dependency to ensure successful builds on Appwrite's Alpine-based build environments.

## Appwrite Functions Deployment

Functions are managed via the `appwrite.json` configuration file.

### Deploying All Functions
To deploy all functions (e.g., after a fresh clone or major update):

```bash
npm run deploy:functions
# OR
appwrite deploy function --all
```

### Deploying Specific Functions
To deploy a single function:

```bash
appwrite deploy function --functionId <function-id-or-name>
```

### Function Configuration
*   **Runtime**: Node.js 20.0 (or 18.0 for legacy functions).
*   **Permissions**: Ensure functions have the correct Execute permissions (e.g., `users`, `any`) as defined in `appwrite.json`.
*   **Environment Variables**: Functions inherit project variables, but specific secrets (like `PAYHERE_MERCHANT_SECRET`) must be added manually in the Console if not managed via code.

## Database Migrations

Database structure is defined in `appwrite.json`. To apply changes:

```bash
appwrite deploy collection
```

**Note**: This project relies on specific Collection IDs (e.g., `listings`, `users_extended`). Do not change these IDs manually in the Console, as the codebase references them directly.
