# Project 1 Grading Rubric (100 Points Total)

This rubric evaluates the 5 assignments that make up Project 1. The points are weighted based on the complexity and importance of the tasks, progressing from basic setup to advanced API integration.

## Summary of Points

| Assignment | Description | Points |
| :--- | :--- | :--- |
| **Assignment 1** | Deployment Setup (Hello World) | **5** |
| **Assignment 2** | Database Connection (Read) | **10** |
| **Assignment 3** | Authentication & Gated UI | **15** |
| **Assignment 4** | Data Mutation (Voting) | **30** |
| **Assignment 5** | REST API Pipeline (Image Captions) | **40** |
| **Total** | | **100** |

---

## Detailed Breakdown

### Assignment 1: Deployment Setup (5 Points)
*Goal: Successfully deploy a Next.js application to Vercel connected to a GitHub repository.*

| Criteria | Points | Requirements |
| :--- | :--- | :--- |
| **Repository Setup** | 1 | GitHub repository created correctly; cloned and initialized with Next.js. |
| **Vercel Connection** | 2 | Vercel project created and linked to the GitHub repository. |
| **Successful Deployment** | 1 | App is live and accessible via the provided Vercel URL. |
| **Configuration** | 1 | "Deployment Protection" is disabled (verifiable via Incognito mode). |

---

### Assignment 2: Connecting the Database (10 Points)
*Goal: Connect the application to Supabase, fetch data, and display it dynamically.*

| Criteria | Points | Requirements |
| :--- | :--- | :--- |
| **Supabase Connection** | 3 | App connects to Supabase using Environment Variables (URL & Anon Key). **Keys must NOT be hardcoded.** |
| **Data Fetching** | 3 | Successfully fetches rows from the specified existing Supabase table. |
| **UI Implementation** | 2 | Renders the fetched data in a clear list, table, or card format. |
| **Deployment** | 2 | The updated version with data fetching is successfully deployed to Vercel. |

---

### Assignment 3: Protect Route & Gated UI (15 Points)
*Goal: Implement authentication protecting specific routes and redirecting users correctly.*

| Criteria | Points | Requirements |
| :--- | :--- | :--- |
| **Route Protection** | 5 | The specific route is inaccessible to unauthenticated users; redirects to login. |
| **Gated UI** | 5 | Authenticated users see the protected interface/content. |
| **Auth Configuration** | 2 | Redirect URI is set strictly to `/auth/callback`. No Google Client Secret is used. |
| **RLS Integrity** | 3 | **Critical:** No RLS policies in Supabase were modified/disabled. |

---

### Assignment 4: Mutating Data (30 Points)
*Goal: Implement interactivity where authenticated users can write data (vote) to the database.*

| Criteria | Points | Requirements |
| :--- | :--- | :--- |
| **Voting UI** | 8 | User interface allows for interaction (e.g., upvote/downvote buttons). |
| **Data Mutation** | 8 | Submitting a vote successfully inserts a new row into the `caption_votes` table. |
| **Auth Enforcement** | 8 | Only logged-in users can submit votes. Unauthenticated requests are rejected or prevented. |
| **Data Integrity** | 3 | The vote is associated with the correct `caption_id` and `user_id`. |
| **Deployment** | 3 | Feature is fully functional on the deployed Vercel URL. |

---

### Assignment 5: REST API Calls (40 Points)
*Goal: Implement a multi-step image processing pipeline using the `api.almostcrackd.ai` REST API.*

| Criteria | Points | Requirements |
| :--- | :--- | :--- |
| **Step 1: Presigned URL** | 10 | Successfully calls `POST /pipeline/generate-presigned-url` with correct Auth header and body. |
| **Step 2: Upload Image** | 10 | Successfully uploads file bytes to the returned presigned URL via PUT (Matching Content-Type). |
| **Step 3: Register Image** | 10 | Successfully registering the uploaded image via `POST /pipeline/upload-image-from-url`. |
| **Step 4: Captions** | 10 | Successfully calls `POST /pipeline/generate-captions` with the registered `imageId` and displays the resulting captions in the UI. |

---

## Penalties & Deductions
*   **-5 Points**: Hardcoded API keys or secrets in the codebase.
*   **-10 Points**: Enabling RLS policies or altering database schema outside of instructions.
*   **-5 Points**: Submitting a non-functioning URL or incorrect commit hash.
*   **-5 Points**: Incorrect API usage (e.g., wrong headers, mismatching Content-Types in Step 2).
