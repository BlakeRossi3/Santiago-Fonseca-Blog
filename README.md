# Creative Portfolio

A portfolio site for film reviews, short stories and projects. It has a dark theme with purple highlights.
Visitors just read. The owner clicks **Edit** in the footer, enters the edit code, and can then write, edit,
upload images and change site settings right on the page.

No framework, no database and no npm dependencies. It's plain HTML/CSS/JS plus four small Vercel functions.

## How it works

- `public/` is the website (`index.html`, `styles.css`, `app.js`).
- `api/` holds the Vercel serverless functions:
  - `content`: read content; save content (needs the code)
  - `auth`: check the edit code
  - `upload`: save an image (needs the code)
  - `media`: serve an uploaded image
- `content/site.json` holds all text, and `content/uploads/` holds the images.
- **On Vercel, every save is a commit to this GitHub repo** (made through the GitHub API). That gives you
  free storage with full history, and any old version can be restored from GitHub.
  `vercel.json` skips redeploys for commits that only touch `content/`, because the site reads content live.

The edit code is checked on the server for every save and upload. Edit mode remembers it in that browser
until you click **Lock**. Drafts are hidden from visitors.

## Deploy on Vercel

1. Push this folder to a GitHub repo. **Make the repo private** if drafts should stay private,
   because the content file in the repo includes drafts.
2. In Vercel: **Add New → Project**, import the repo. Framework preset: **Other**. Leave the build settings empty.
3. Under **Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `EDIT_CODE` | The code your friend types to unlock editing. Pick something long. |
   | `GITHUB_TOKEN` | A GitHub fine-grained personal access token (see below). |

   Optional: `GITHUB_REPO` (`owner/name`, normally detected automatically) and `GITHUB_BRANCH` (default `main`).
4. Redeploy (Deployments → ⋯ → Redeploy) so the variables take effect.

**Making the token:** GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** →
Generate new token. For Repository access, choose **Only select repositories** and pick this repo.
For Permissions, set **Contents: Read and write**. Copy the token into `GITHUB_TOKEN`. Tokens expire, so set a
reminder for the expiry date. When it expires, saving shows an error until you paste in a new one.

To change the edit code, change `EDIT_CODE` in Vercel and redeploy. Anyone who was unlocked gets locked out.

## Run it locally

```
npm run dev
```

Open http://localhost:3000. The edit code is `letmein` locally unless you set `EDIT_CODE`.
Locally, saves write straight to `content/site.json` and `content/uploads/`.

## Writing

The editor uses a small Markdown-style format. Each line becomes a paragraph, which suits pasted prose.
`**bold**`, `*italic*`, `# Heading`, `> quote`, `- list`, `* * *` for a scene break, `[text](https://…)` for links.
The toolbar buttons insert all of these. **Preview** shows what the result will look like.
<kbd>Ctrl/⌘ S</kbd> saves.

Images are shrunk in the browser (max 2000px) before upload.
