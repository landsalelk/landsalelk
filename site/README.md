# Appwrite Configuration

This directory contains the `appwrite.json` configuration file, which is required for the local development server to start.

## `appwrite.json`

This file provides the necessary Appwrite project configuration for the Next.js application. It contains the following essential properties:

-   `projectId`: The ID of the Appwrite project. This is replaced by an environment variable (`${APPWRITE_PROJECT_ID}`) for security and portability.
-   `endpoint`: The API endpoint for the Appwrite project. This is replaced by an environment variable (`${APPWRITE_ENDPOINT}`) for security and portability.
-   `projectName`: A human-readable name for the project.

This minimal configuration ensures that the local development environment can connect to the correct Appwrite instance without hardcoding sensitive information. The values for `APPWRITE_PROJECT_ID` and `APPWRITE_ENDPOINT` should be provided in a `.env.local` file for local development.
