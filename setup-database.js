#!/usr/bin/env node

/**
 * Database Setup Script for ArbanTv Platform
 * Creates attributes and indexes for video streaming, comments, and creator management
 */

require("dotenv").config();
const { Client, Databases, ID, Permission, Role } = require("node-appwrite");

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupDatabase() {
  console.log("[START] Starting ArbanTv database attributes setup...");

  try {
    // ArbanTv Collections with their IDs
    const collections = [
      // --- CORE: CREATORS ---
      {
        id: process.env.CREATORS_COLLECTION_ID,
        name: ID.unique(),
        attributes: [
          { key: "user_id", type: "string", size: 255, required: true },
          { key: "channel_name", type: "string", size: 256, required: true },
          { key: "handle", type: "string", size: 50, required: true },
          { key: "avatar_url", type: "string", size: 2048, required: false },
          { key: "banner_url", type: "string", size: 2048, required: false },
          { key: "bio", type: "string", size: 2000, required: false },
          { key: "subscribers", type: "integer", required: true, default: 0 },
          { key: "total_views", type: "integer", required: true, default: 0 },
          { key: "is_verified", type: "boolean", required: true, default: false },
        ],
        indexes: [
          { key: "user_id_index", type: "key", attributes: ["user_id"] },
          { key: "handle_index", type: "key", attributes: ["handle"], unique: true },
        ],
      },

      // --- CORE: VIDEOS ---
      {
        id: process.env.VIDEOS_COLLECTION_ID,
        name: ID.unique(),
        attributes: [
          { key: "title", type: "string", size: 256, required: true },
          { key: "description", type: "string", size: 5000, required: false },
          { key: "creator_id", type: "string", size: 255, required: true },
          { key: "video_file_id", type: "string", size: 255, required: true },
          { key: "thumbnail_url", type: "string", size: 2048, required: true },
          { key: "duration", type: "integer", required: true },
          { key: "genre", type: "string", size: 50, required: true },
          { key: "tags", type: "string", size: 5000, required: false, array: true },
          { 
            key: "status", 
            type: "string", 
            size: 20, 
            required: true, 
            default: "draft" 
          },
          { key: "view_count", type: "integer", required: true, default: 0 },
          { key: "like_count", type: "integer", required: true, default: 0 },
          { key: "is_premium", type: "boolean", required: true, default: false },
          { key: "release_date", type: "datetime", required: true },
        ],
        indexes: [
          { key: "creator_index", type: "key", attributes: ["creator_id"] },
          { key: "status_genre_index", type: "key", attributes: ["status", "genre"] },
        ],
      },

      // --- CORE: COMMENTS ---
      {
        id: process.env.COMMENTS_COLLECTION_ID,
        name: ID.unique(),
        attributes: [
          { key: "video_id", type: "string", size: 255, required: true },
          { key: "user_id", type: "string", size: 255, required: true },
          { key: "content", type: "string", size: 2000, required: true },
          { key: "parent_id", type: "string", size: 255, required: false }, // For replies
          { key: "likes", type: "integer", required: true, default: 0 },
          { key: "is_deleted", type: "boolean", required: true, default: false },
        ],
        indexes: [
          { key: "video_index", type: "key", attributes: ["video_id"] },
          { key: "parent_index", type: "key", attributes: ["parent_id"] },
        ],
      },

      // --- CORE: TAGS ---
      {
        id: process.env.TAGS_COLLECTION_ID,
        name: ID.unique(),
        attributes: [
          { key: "name", type: "string", size: 50, required: true },
          { key: "count", type: "integer", required: true, default: 0 },
        ],
        indexes: [
          { key: "name_index", type: "key", attributes: ["name"], unique: true },
        ],
      },
    ];

    // Create attributes and indexes for existing collections
    for (const collection of collections) {
      console.log(
        `\n[COLLECTION] Setting up collection: ${collection.name} (ID: ${collection.id})`,
      );

      if (!collection.id) {
        console.log(
          `   [ERROR] Collection ID not found for ${collection.name}. Please check your .env file.`,
        );
        continue;
      }

      try {
        // Verify collection exists
        await databases.getCollection(
          process.env.APPWRITE_DATABASE_ID,
          collection.id,
        );
        console.log(`   [OK] Collection '${collection.name}' found`);

        // Create attributes
        console.log(`   [PROCESS] Creating attributes for ${collection.name}...`);

        for (const attr of collection.attributes) {
          try {
            let attributeResponse;

            switch (attr.type) {
              case "string":
                attributeResponse = await databases.createStringAttribute(
                  process.env.APPWRITE_DATABASE_ID,
                  collection.id,
                  attr.key,
                  attr.size,
                  attr.required,
                  attr.default || null,
                  attr.array || false,
                );
                break;
              case "integer":
                attributeResponse = await databases.createIntegerAttribute(
                  process.env.APPWRITE_DATABASE_ID,
                  collection.id,
                  attr.key,
                  attr.required,
                  attr.min || null,
                  attr.max || null,
                  attr.default || null,
                  attr.array || false,
                );
                break;
              case "double":
                attributeResponse = await databases.createFloatAttribute(
                  process.env.APPWRITE_DATABASE_ID,
                  collection.id,
                  attr.key,
                  attr.required,
                  attr.min || null,
                  attr.max || null,
                  attr.default || null,
                  attr.array || false,
                );
                break;
              case "boolean":
                attributeResponse = await databases.createBooleanAttribute(
                  process.env.APPWRITE_DATABASE_ID,
                  collection.id,
                  attr.key,
                  attr.required,
                  attr.default || null,
                  attr.array || false,
                );
                break;
              case "datetime":
                attributeResponse = await databases.createDatetimeAttribute(
                  process.env.APPWRITE_DATABASE_ID,
                  collection.id,
                  attr.key,
                  attr.required,
                  attr.default || null,
                  attr.array || false,
                );
                break;
              default:
                console.log(
                  `     [WARN] Unknown attribute type: ${attr.type} for ${attr.key}`,
                );
                continue;
            }

            console.log(
              `     [OK] Created attribute: ${attr.key} (${attr.type}${attr.array ? '[]' : ''})`,
            );

            // Wait a bit to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (attrError) {
            if (
              attrError.message.includes("already exists") ||
              attrError.message.includes("Attribute already exists")
            ) {
              console.log(
                `     [SKIP] Attribute ${attr.key} already exists, skipping...`,
              );
            } else {
              console.log(
                `     [ERROR] Failed to create attribute ${attr.key}:`,
                attrError.message,
              );
            }
          }
        }

        // Wait for attributes to be ready before creating indexes
        console.log(`   [WAIT] Waiting for attributes to be ready...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Create indexes
        if (collection.indexes && collection.indexes.length > 0) {
          console.log(`   [INDEX] Creating indexes for ${collection.name}...`);

          for (const index of collection.indexes) {
            try {
              await databases.createIndex(
                process.env.APPWRITE_DATABASE_ID,
                collection.id,
                index.key,
                index.type,
                index.attributes,
                index.orders || [],
              );
              console.log(`     [OK] Created index: ${index.key}`);

              // Wait a bit to avoid rate limiting
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (indexError) {
              if (
                indexError.message.includes("already exists") ||
                indexError.message.includes("Index already exists")
              ) {
                console.log(
                  `     [SKIP] Index ${index.key} already exists, skipping...`,
                );
              } else {
                console.log(
                  `     [ERROR] Failed to create index ${index.key}:`,
                  indexError.message,
                );
              }
            }
          }
        }
      } catch (collectionError) {
        if (collectionError.message.includes("not found")) {
          console.log(
            `   [ERROR] Collection ${collection.name} not found. Please verify collection ID: ${collection.id}`,
          );
        } else {
          console.log(
            `   [ERROR] Error setting up collection ${collection.name}:`,
            collectionError.message,
          );
        }
      }
    }

    console.log("\n[SUCCESS] Database attributes setup completed!");
    console.log("\n[INFO] Summary of ArbanTv collections configured:");
    console.log("  - Creators: Channel profiles, stats, and verification");
    console.log("  - Videos: Video metadata, storage links, and engagement");
    console.log("  - Comments: Threaded comments for videos");
    console.log("  - Tags: Normalized tags for trending discovery");

    console.log("\n[SUCCESS] Your ArbanTv database schema is ready!");
  } catch (error) {
    console.error("[CRITICAL] Database setup failed:", error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("Setup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };