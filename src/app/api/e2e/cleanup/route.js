import { Client, Databases, Users, Storage } from 'node-appwrite';
import { NextResponse } from 'next/server';

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

function getClientOrThrow() {
  const endpoint =
    process.env.APPWRITE_ENDPOINT ||
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
    'https://sgp.cloud.appwrite.io/v1';
  const projectId =
    process.env.APPWRITE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
    'landsalelkproject';
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!apiKey) {
    throw new Error('Server not configured: APPWRITE_API_KEY is missing');
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  return client;
}

function extractFileId(val) {
  if (!val || typeof val !== 'string') return null;
  // Can be a URL like: .../files/<fileId>/view?project=...
  const m = val.match(/\/files\/([^/]+)\/view/i);
  if (m && m[1]) return m[1];
  // Or maybe it's already a file id
  if (/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/.test(val)) return val;
  return null;
}

export async function POST(request) {
  // This route is intentionally dev-only to support local E2E cleanup without leaking secrets.
  if (process.env.NODE_ENV === 'production') return notFound();

  try {
    const body = await request.json().catch(() => ({}));
    const userId = body?.userId;
    const listingId = body?.listingId;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const DB_ID =
      process.env.APPWRITE_DATABASE_ID ||
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
      'landsalelkdb';
    const COLLECTION_LISTINGS = 'listings';
    const BUCKET_LISTING_IMAGES = 'listing_images';

    const client = getClientOrThrow();
    const databases = new Databases(client);
    const users = new Users(client);
    const storage = new Storage(client);

    const result = {
      deletedListing: false,
      deletedFiles: 0,
      deletedUser: false,
      warnings: [],
    };

    if (listingId && typeof listingId === 'string') {
      try {
        // Best-effort delete images first (if any)
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);
        let rawImages = [];
        if (Array.isArray(listing?.images)) rawImages = listing.images;
        else if (typeof listing?.images === 'string') {
          try {
            rawImages = JSON.parse(listing.images);
          } catch {
            rawImages = [];
          }
        }

        if (Array.isArray(rawImages)) {
          const fileIds = rawImages.map(extractFileId).filter(Boolean);
          for (const fid of fileIds) {
            try {
              await storage.deleteFile(BUCKET_LISTING_IMAGES, fid);
              result.deletedFiles += 1;
            } catch (e) {
              result.warnings.push(`Failed to delete file ${fid}`);
            }
          }
        }
      } catch (e) {
        // ignore (listing may not exist, or permissions)
      }

      try {
        await databases.deleteDocument(DB_ID, COLLECTION_LISTINGS, listingId);
        result.deletedListing = true;
      } catch (e) {
        result.warnings.push('Failed to delete listing document');
      }
    }

    try {
      await users.delete(userId);
      result.deletedUser = true;
    } catch (e) {
      result.warnings.push('Failed to delete user');
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Cleanup failed', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}


