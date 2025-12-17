// Write results to file - no waiting needed
import { Client, Databases, Query } from 'node-appwrite';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);
const out: string[] = [];

db.listDocuments(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!, 'listings', [Query.limit(10)])
    .then(result => {
        out.push("=== IMAGES CHECK REPORT ===");
        out.push("Total listings: " + result.total);
        out.push("");
        result.documents.forEach(doc => {
            out.push("ID: " + doc.$id);
            out.push("  Images count: " + (doc.images?.length || 0));
            out.push("  Images: " + JSON.stringify(doc.images || []));
            out.push("");
        });
        fs.writeFileSync('images_check_report.txt', out.join('\n'));
        console.log("Report written to images_check_report.txt");
    })
    .catch(e => {
        fs.writeFileSync('images_check_report.txt', "ERROR: " + e.message);
        console.log("Error written to report");
    });
