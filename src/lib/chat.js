import { client, databases, account, ID, Query } from "@/appwrite";
import { DB_ID, COLLECTION_MESSAGES } from "@/appwrite/config";

/**
 * Send a message
 */
export async function sendMessage(receiverId, content) {
    const user = await account.get();
    const conversationId = [user.$id, receiverId].sort().join('_'); // Simple unique ID for 1-on-1

    return await databases.createDocument(
        DB_ID,
        COLLECTION_MESSAGES,
        ID.unique(),
        {
            sender_id: user.$id,
            receiver_id: receiverId,
            content,
            conversation_id: conversationId,
            is_read: false,
            timestamp: new Date().toISOString()
        }
    );
}

/**
 * Subscribe to messages for the current user.
 * @param {string} userId 
 * @param {function} callback 
 */
export function subscribeToMessages(userId, callback) {
    const channel = `databases.${DB_ID}.collections.${COLLECTION_MESSAGES}.documents`;

    return client.subscribe(channel, response => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            const msg = response.payload;
            // Only notify if I am the receiver OR sender (to update UI)
            if (msg.receiver_id === userId || msg.sender_id === userId) {
                callback(msg);
            }
        }
    });
}

/**
 * Get conversation history
 */
export async function getConversation(otherUserId) {
    const user = await account.get();
    const conversationId = [user.$id, otherUserId].sort().join('_');

    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_MESSAGES,
            [
                Query.equal('conversation_id', conversationId),
                Query.orderAsc('$createdAt'), // Oldest first for chat log
                Query.limit(100)
            ]
        );

        return result.documents;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        // Handle missing index error
        if (error.message && error.message.includes('index')) {
            console.log('Please create an index on "conversation_id" attribute in the "messages" collection in Appwrite Console');
        }
        return [];
    }
}