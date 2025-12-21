import { databases } from "@/appwrite";

/**
 * Creates all required collections and indexes for the Landsale property platform.
 * Run this script once after initial Appwrite project setup.
 */
async function setupCollections() {
  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  if (!DB_ID) {
    throw new Error("NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set in .env");
  }

  // -------------------------------------------------------------------------
  // 1. Properties Collection
  // -------------------------------------------------------------------------
  const propertyCollection = await databases.createCollection(
    DB_ID,
    "properties",
    [
      "\$id",
      "title",
      "description",
      "price",
      "location",
      "amenities",
      "status", // enum: "draft", "published", "archived"
      "ownerId",
      "createdAt",
      "updatedAt",
    ],
    ["\$id"],
    {
      // Permissions: users can create/listings if they have role "agent" or "admin"
      // Read: public for published properties, agents/admin for all
      permissions: (permission) => [
        permission.read(
          // Public read for published properties
          (resource) => resource.data.status === "published",
          // Agents and admins can read all
          (resource) => ["agent", "admin"].includes(resource.ownerId.split(":")[0]) // simplified check
        ),
        permission.create((resource) => ["agent", "admin"].includes(resource.ownerId.split(":")[0])),
        permission.update((resource) => ["agent", "admin"].includes(resource.ownerId.split(":")[0])),
        permission.delete((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
      ],
    }
  );

  // Indexes for property search
  await databases.createIndex(DB_ID, "properties", "idx_location", "properties", ["location"], "ascending");
  await databases.createIndex(DB_ID, "properties", "idx_price", "properties", ["price"], "ascending");
  await databases.createIndex(DB_ID, "properties", "idx_status", "properties", ["status"], "ascending");

  // -------------------------------------------------------------------------
  // 2. Users Collection (if not already present)
  // -------------------------------------------------------------------------
  try {
    await databases.getCollection(DB_ID, "users");
  } catch {
    const userCollection = await databases.createCollection(
      DB_ID,
      "users",
      ["\$id", "name", "email", "role", "createdAt"],
      ["\$id"],
      {
        permissions: (permission) => [
          permission.read((resource) => true), // public read for profile info
          permission.create((resource) => true), // only Appwrite can create via SDK
          permission.update((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
          permission.delete((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
        ],
      }
    );
  }

  // -------------------------------------------------------------------------
  // 3. Bookings Collection
  // -------------------------------------------------------------------------
  const bookingCollection = await databases.createCollection(
    DB_ID,
    "bookings",
    ["\$id", "propertyId", "userId", "status", "totalAmount", "startDate", "endDate", "createdAt"],
    ["\$id"],
    {
      permissions: (permission) => [
        permission.read((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
        permission.create((resource) => ["agent", "admin"].includes(resource.ownerId.split(":")[0])),
        permission.update((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
        permission.delete((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
      ],
    }
  );

  await databases.createIndex(DB_ID, "bookings", "idx_booking_property", "bookings", ["propertyId"], "ascending");
  await databases.createIndex(DB_ID, "bookings", "idx_user", "bookings", ["userId"], "ascending");

  // -------------------------------------------------------------------------
  // 4. Media Collection (optional, if using a separate collection for file metadata)
  // -------------------------------------------------------------------------
  const mediaCollection = await databases.createCollection(
    DB_ID,
    "media",
    ["\$id", "fileId", "type", "url", "metadata", "uploadedBy"],
    ["\$id"],
    {
      permissions: (permission) => [
        permission.read((resource) => true),
        permission.create((resource) => ["agent", "admin"].includes(resource.ownerId.split(":")[0])),
        permission.update((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
        permission.delete((resource) => ["admin"].includes(resource.ownerId.split(":")[0])),
      ],
    }
  );

  await databases.createIndex(DB_ID, "media", "idx_media_type", "media", ["type"], "ascending");

  console.log("✅ All collections and indexes have been created successfully.");
}

// Run the setup function
setupCollections().catch((error) => {
  console.error("❌ Error setting up collections:", error);
  process.exit(1);
});