# Appwrite Automatic Deployment

This project relies on the **Appwrite Git Integration** for automatic deployments of the Site (Next.js) and Functions (Node.js).

## 1. Prerequisites

- An [Appwrite Cloud](https://cloud.appwrite.io/) account.
- This GitHub repository.

## 2. Setup Guide

### Step 1: Connect Repository to Appwrite

1.  Log in to your Appwrite Console.
2.  Navigate to your Project.
3.  Go to **Settings** > **Git Integration** (or **Deployments**).
4.  Click **Add Repository**.
5.  Select **GitHub** and authorize Appwrite.
6.  Select this repository (`landsalelk/landsale.lk` or equivalent).

### Step 2: Configure Deployment

Appwrite will automatically detect the `appwrite.json` configuration file in the root directory.

#### Configuration details (managed in `appwrite.json`):

-   **Site (Frontend)**:
    -   **Root Directory**: `.` (Root)
    -   **Output Directory**: `.next`
    -   **Install Command**: `npm install`
    -   **Build Command**: `npm run build`
    -   **Runtime**: Node.js 22 (or latest supported)
    -   **Framework**: Next.js (SSR)

-   **Functions**:
    -   **Runtime**: Node.js 20.0 (Updated from 18.0)
    -   **Path**: `functions/<function-name>`
    -   **Entrypoint**: `src/main.js`

### Step 3: Automatic Deployment

Once connected:
1.  **Push to Main**: Any push to the `main` branch will automatically trigger a new deployment on Appwrite.
2.  **Monitor**: You can view build logs and deployment status directly in the Appwrite Console under the "Deployments" tab for the Site and each Function.

## 3. Manual Deployment (Backup)

A GitHub Actions workflow (`.github/workflows/appwrite-deploy.yml`) exists as a backup for manual deployments using the Appwrite CLI.

-   **Trigger**: This workflow is set to `workflow_dispatch` (Manual only).
-   **Usage**: Go to the **Actions** tab in GitHub -> Select **Appwrite Deploy** -> Click **Run workflow**.
-   **Secrets Required**: If you use this, ensure the following secrets are set in GitHub:
    -   `APPWRITE_ENDPOINT`
    -   `APPWRITE_PROJECT_ID`
    -   `APPWRITE_API_KEY`

## 4. Repo Structure

-   `appwrite.json`: The source of truth for Appwrite configuration.
-   `functions/`: Contains all Appwrite Functions.
-   `src/`: Contains the Next.js application code.
-   `.github/`: Contains backup deployment workflows.

## 5. Troubleshooting

-   **Build Failures**: Check the logs in the Appwrite Console.
-   **"Root directory not found"**: Ensure the Site configuration in Appwrite points to `.` (Root).
-   **Function Errors**: Ensure `node-appwrite` version is compatible with the runtime (Node 20). This project uses `^14.0.0`.
