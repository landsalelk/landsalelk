import { databases } from "./appwrite";
import { ID, Permission, Role } from "appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_TRANSACTIONS = 'transactions';

export async function saveTransaction(data) {
    try {
        const result = await databases.createDocument(
            DB_ID,
            COLLECTION_TRANSACTIONS,
            ID.unique(),
            {
                user_id: data.userId,
                amount: parseFloat(data.amount),
                status: data.status,
                reference_id: data.referenceId || 'N/A',
                type: data.type,
                timestamp: new Date().toISOString()
            },
            [
                Permission.read(Role.user(data.userId)),
                Permission.read(Role.team('admins'))
            ]
        );
        return result;
    } catch (error) {
        console.error("Transaction Error:", error);
        throw error;
    }
}
