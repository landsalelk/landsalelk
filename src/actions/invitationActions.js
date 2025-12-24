"use server";

import { createAdminClient } from "@/lib/appwrite.server";
import { DB_ID, COLLECTION_AGENCY_INVITATIONS, COLLECTION_AGENTS, COLLECTION_AGENCIES } from "@/appwrite/config";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

/**
 * Generate a secure random token for invitations
 */
function generateInviteToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Send an invitation to an agent to join the agency.
 * RESTRICTED: Agency Owner Only.
 */
export async function sendAgentInvitation(agencyId, inviterUserId, inviteeEmail) {
    try {
        const { databases } = await createAdminClient();

        // 1. Verify the inviter owns this agency
        const agency = await databases.getDocument(DB_ID, COLLECTION_AGENCIES, agencyId);
        if (agency.owner_id !== inviterUserId) {
            return { success: false, message: "You are not authorized to send invitations for this agency." };
        }

        if (agency.status !== 'approved') {
            return { success: false, message: "Agency must be approved before inviting agents." };
        }

        // 2. Check if invitation already exists and is pending
        const existingInvites = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCY_INVITATIONS,
            [
                Query.equal('agency_id', agencyId),
                Query.equal('invitee_email', inviteeEmail),
                Query.equal('status', 'pending')
            ]
        );

        if (existingInvites.documents.length > 0) {
            return { success: false, message: "An invitation has already been sent to this email." };
        }

        // 3. Check if this email is already an agent in this agency
        const existingAgents = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [
                Query.equal('email', inviteeEmail),
                Query.equal('agency_id', agencyId)
            ]
        );

        if (existingAgents.documents.length > 0) {
            return { success: false, message: "This agent is already part of your agency." };
        }

        // 4. Create invitation
        const token = generateInviteToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        await databases.createDocument(
            DB_ID,
            COLLECTION_AGENCY_INVITATIONS,
            ID.unique(),
            {
                agency_id: agencyId,
                inviter_id: inviterUserId,
                invitee_email: inviteeEmail,
                status: 'pending',
                invite_token: token,
                expires_at: expiresAt.toISOString()
            }
        );

        // TODO: Send email with invitation link
        // const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/agency/join?token=${token}`;
        // await sendInvitationEmail(inviteeEmail, agency.name, inviteUrl);

        revalidatePath('/agency/dashboard');
        return {
            success: true,
            message: "Invitation sent successfully!",
            token // Return token for display/testing purposes
        };
    } catch (error) {
        console.error("Send Invitation Error:", error);
        return { success: false, message: error.message || "Failed to send invitation." };
    }
}

/**
 * Accept an agency invitation.
 * Called by the invited agent.
 */
export async function acceptAgentInvitation(token, userId) {
    try {
        const { databases } = await createAdminClient();

        // 1. Find invitation by token
        const invites = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCY_INVITATIONS,
            [
                Query.equal('invite_token', token),
                Query.equal('status', 'pending')
            ]
        );

        if (invites.documents.length === 0) {
            return { success: false, message: "Invalid or expired invitation." };
        }

        const invitation = invites.documents[0];

        // 2. Check expiry
        if (new Date(invitation.expires_at) < new Date()) {
            // Mark as expired
            await databases.updateDocument(DB_ID, COLLECTION_AGENCY_INVITATIONS, invitation.$id, {
                status: 'expired'
            });
            return { success: false, message: "This invitation has expired." };
        }

        // 3. Check if user has an agent profile
        const agentDocs = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [Query.equal('user_id', userId)]
        );

        if (agentDocs.documents.length === 0) {
            return { success: false, message: "You must register as an agent first." };
        }

        const agent = agentDocs.documents[0];

        // 4. Check if agent already belongs to an agency
        if (agent.agency_id) {
            return { success: false, message: "You are already part of an agency." };
        }

        // 5. Update agent with agency_id
        await databases.updateDocument(DB_ID, COLLECTION_AGENTS, agent.$id, {
            agency_id: invitation.agency_id
        });

        // 6. Mark invitation as accepted
        await databases.updateDocument(DB_ID, COLLECTION_AGENCY_INVITATIONS, invitation.$id, {
            status: 'accepted',
            invitee_id: userId,
            accepted_at: new Date().toISOString()
        });

        // 7. Increment agency agent count
        try {
            const agency = await databases.getDocument(DB_ID, COLLECTION_AGENCIES, invitation.agency_id);
            await databases.updateDocument(DB_ID, COLLECTION_AGENCIES, invitation.agency_id, {
                total_agents: (agency.total_agents || 0) + 1
            });
        } catch (e) {
            console.warn("Failed to update agent count:", e);
        }

        revalidatePath('/agency/dashboard');
        revalidatePath('/dashboard');
        return { success: true, message: "You have successfully joined the agency!" };
    } catch (error) {
        console.error("Accept Invitation Error:", error);
        return { success: false, message: error.message || "Failed to accept invitation." };
    }
}

/**
 * Reject an agency invitation.
 */
export async function rejectAgentInvitation(token) {
    try {
        const { databases } = await createAdminClient();

        const invites = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCY_INVITATIONS,
            [
                Query.equal('invite_token', token),
                Query.equal('status', 'pending')
            ]
        );

        if (invites.documents.length === 0) {
            return { success: false, message: "Invalid invitation." };
        }

        await databases.updateDocument(DB_ID, COLLECTION_AGENCY_INVITATIONS, invites.documents[0].$id, {
            status: 'rejected'
        });

        return { success: true, message: "Invitation declined." };
    } catch (error) {
        console.error("Reject Invitation Error:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get all pending invitations for an agency.
 */
export async function getAgencyInvitations(agencyId) {
    try {
        const { databases } = await createAdminClient();

        const invites = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCY_INVITATIONS,
            [
                Query.equal('agency_id', agencyId),
                Query.orderDesc('$createdAt'),
                Query.limit(50)
            ]
        );

        return { success: true, invitations: invites.documents };
    } catch (error) {
        console.error("Get Invitations Error:", error);
        return { success: false, invitations: [] };
    }
}

/**
 * Cancel a pending invitation.
 */
export async function cancelInvitation(invitationId, userId) {
    try {
        const { databases } = await createAdminClient();

        const invite = await databases.getDocument(DB_ID, COLLECTION_AGENCY_INVITATIONS, invitationId);

        // Verify ownership
        const agency = await databases.getDocument(DB_ID, COLLECTION_AGENCIES, invite.agency_id);
        if (agency.owner_id !== userId) {
            return { success: false, message: "Not authorized" };
        }

        await databases.deleteDocument(DB_ID, COLLECTION_AGENCY_INVITATIONS, invitationId);

        revalidatePath('/agency/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Cancel Invitation Error:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Get invitation details by token (for join page).
 */
export async function getInvitationByToken(token) {
    try {
        const { databases } = await createAdminClient();

        const invites = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCY_INVITATIONS,
            [Query.equal('invite_token', token)]
        );

        if (invites.documents.length === 0) {
            return { success: false, invitation: null };
        }

        const invitation = invites.documents[0];

        // Get agency details
        const agency = await databases.getDocument(DB_ID, COLLECTION_AGENCIES, invitation.agency_id);

        return {
            success: true,
            invitation: {
                ...invitation,
                agency_name: agency.name,
                agency_logo: agency.logo_url
            }
        };
    } catch (error) {
        console.error("Get Invitation Error:", error);
        return { success: false, invitation: null };
    }
}
