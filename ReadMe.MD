# ArbanTv — Database Setup

A Node.js script to scaffold and configure the Appwrite backend database for the **ArbanTv** platform, including collections, attributes, and indexes for Creators, Videos, Comments, and Tags.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Step 1 — Get Appwrite Credentials](#step-1--get-appwrite-credentials)
- [Step 2 — Configure the .env File](#step-2--configure-the-env-file)
- [Step 3 — Install Dependencies](#step-3--install-dependencies)
- [Step 4 — Appwrite Client Configuration](#step-4--appwrite-client-configuration)
- [Step 5 — Run the Setup Script](#step-5--run-the-setup-script)
- [Expected Output](#expected-output)
- [Security](#security)

---

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16 or higher
- [npm](https://www.npmjs.com/)
- An [Appwrite Cloud](https://cloud.appwrite.io/) account (or a self-hosted Appwrite instance)

---

## Project Structure

```
Backend/
├── src/
│   └── config/
│       └── appwrite.js       # Appwrite client initialization
├── setup-database.js         # Main database setup script
├── .env                      # Environment variables (do not commit)
├── .gitignore
└── package.json
```

---

## Step 1 — Get Appwrite Credentials

Log in to your [Appwrite Dashboard](https://cloud.appwrite.io/) and collect the following.

### A. Project ID
1. Open your project (create one named **ArbanTv** if you haven't already).
2. Go to **Settings → General**.
3. Copy the **Project ID**.

### B. API Key
1. Go to **Settings → API Keys**.
2. Click **Create API Key** and name it `ArbanTv Backend Setup`.
3. Enable the following scopes:
   - `databases.read`, `databases.write`, `databases.create`
   - *(Optional)* `storage.read`, `storage.write`
4. Click **Create** and **copy the key immediately** — it will not be shown again.

### C. Database & Collection IDs

> The setup script configures existing collections, so you must create them manually first.

1. Go to **Databases → Create Database**. Name it `arban_tv_db`. Copy the **Database ID**.
2. Inside the database, create the following four collections and copy each **Collection ID**:

| Collection | Purpose |
|---|---|
| `Creators` | Channel profiles, stats, and verification |
| `Videos` | Video metadata, storage links, and engagement |
| `Comments` | Threaded comments for videos |
| `Tags` | Normalized tags for trending discovery |

---

## Step 2 — Configure the .env File

In the root of your `Backend/` folder, create a file named `.env` and populate it with your credentials:

```env
# Appwrite Connection
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=paste_your_project_id_here
APPWRITE_API_KEY=paste_your_api_key_here

# Database Configuration
APPWRITE_DATABASE_ID=paste_your_database_id_here

# ArbanTv Collection IDs
CREATORS_COLLECTION_ID=paste_creators_id_here
VIDEOS_COLLECTION_ID=paste_videos_id_here
COMMENTS_COLLECTION_ID=paste_comments_id_here
TAGS_COLLECTION_ID=paste_tags_id_here
```

---

## Step 3 — Install Dependencies

Open a terminal inside your `Backend/` folder and run:

```bash
npm install node-appwrite dotenv
```

| Package | Purpose |
|---|---|
| `node-appwrite` | Official Appwrite SDK for Node.js |
| `dotenv` | Loads environment variables from `.env` |

---

## Step 4 — Appwrite Client Configuration

Create the file `src/config/appwrite.js`. This initializes the Appwrite client using your environment variables and exports the service instances used across the app.

```js
/**
 * Appwrite Configuration
 * Reads environment variables and initializes the client.
 */
require("dotenv").config();
const { Client, Databases, Users, Storage } = require("node-appwrite");

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

module.exports = {
  databases: new Databases(client),
  users: new Users(client),
  storage: new Storage(client),
};
```

---

## Step 5 — Run the Setup Script

Open your terminal, navigate to the `Backend/` folder, and run:

```bash
cd path/to/your/Backend
node setup-database.js
```

---

## Expected Output

A successful run will produce output similar to the following:

```
[START] Starting ArbanTv database attributes setup...

[COLLECTION] Setting up collection: Creators (ID: 64a7b8c9...)
   [OK] Collection 'Creators' found
   [PROCESS] Creating attributes for Creators...
     [OK] Created attribute: user_id (string)
     [OK] Created attribute: channel_name (string)
     [OK] Created attribute: handle (string)
   [WAIT] Waiting for attributes to be ready...
   [INDEX] Creating indexes for Creators...
     [OK] Created index: user_id_index

... (repeats for Videos, Comments, Tags) ...

[SUCCESS] Database attributes setup completed!

[INFO] Summary of ArbanTv collections configured:
  - Creators: Channel profiles, stats, and verification
  - Videos: Video metadata, storage links, and engagement
  - Comments: Threaded comments for videos
  - Tags: Normalized tags for trending discovery

[SUCCESS] Your ArbanTv database schema is ready!
Setup completed successfully
```

If a collection is not found, you will see:

```
[ERROR] Collection Creators not found. Please verify collection ID: <your_id>
```

Double-check that the Collection ID in your `.env` matches the one shown in the Appwrite Console.

---

## Security

**Never commit your `.env` file to a public repository.** It contains secret API keys that grant full access to your Appwrite project.

Add the following to your `.gitignore` file to prevent accidental exposure:

```
.env
node_modules
```

---

> Built for the **ArbanTv** platform. Powered by [Appwrite](https://appwrite.io/).