import { toast } from "sonner";
import { account, OAuthProvider } from "@/lib/appwrite";

/**
 * Handles OAuth login flow.
 * Note: checks for 'window' are omitted as this function is intended to be called
 * from client-side event handlers (onClick) where window is guaranteed to exist.
 *
 * @param {string} provider - The OAuth provider (e.g., OAuthProvider.Google, OAuthProvider.Facebook)
 * @param {string} redirectPath - The path to redirect to after successful login (default: '/dashboard')
 * @param {string} failurePath - The path to redirect to on failure (default: current path)
 */
export const handleOAuthLogin = (provider, redirectPath = '/dashboard', failurePath) => {
  try {
    // Ensure SDK is initialized
    if (!account || !OAuthProvider) {
      throw new Error("Appwrite SDK not initialized correctly");
    }

    // Determine URLs
    // We assume this is running in the client browser due to usage in onClick handlers
    const origin = window.location.origin;
    const successUrl = `${origin}${redirectPath}`;
    const failureUrl = failurePath ? `${origin}${failurePath}` : window.location.href;

    account.createOAuth2Session(
      provider,
      successUrl,
      failureUrl
    );
  } catch (error) {
    // console.error is prohibited in production code
    toast.error("Failed to initiate login: " + (error.message || "Unknown error"));
  }
};
