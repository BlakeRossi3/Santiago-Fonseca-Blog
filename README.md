# Creative Portfolio

A portfolio site for film reviews, short stories and projects. It has a dark theme with purple highlights.
Visitors read and can leave comments. The owner clicks **Edit** in the footer, enters the edit code, and can then write, edit,
upload images and change site settings right on the page.

No framework, no database and no npm dependencies. It's plain HTML/CSS/JS plus five small Vercel functions.

## How it works

- `public/` is the website (`index.html`, `styles.css`, `app.js`).
- `api/` holds the Vercel serverless functions:
  - `content`: read content; save content (needs the code)
  - `auth`: check the edit code
  - `upload`: save an image (needs the code)
  - `media`: serve an uploaded image
  - `comments`: list and post comments (deleting one needs the code)
- `content/site.json` holds all text, `content/uploads/` holds the images, and `content/comments/<post id>.json`
  holds each post's comments.
- **On Vercel, every save is a commit to this GitHub repo** (made through the GitHub API). That gives you
  free storage with full history, and any old version can be restored from GitHub.
  `vercel.json` skips redeploys for commits that only touch `content/`, because the site reads content live.

The edit code is checked on the server for every save and upload. Edit mode remembers it in that browser
until you click **Lock**. Drafts are hidden from visitors.

## English / Español

The **EN / ES** switch in the header changes the language of the whole site. The choice is remembered per
browser, and visitors whose browser is set to Spanish start in Spanish.
- Menus, buttons, dates and comment messages are translated automatically.
- The owner's writing has an optional Spanish version: the editor has **English / Español** tabs for each post's
  title, summary and text, and **Site settings → En español** covers the headline, intro, About page and section names.
- In Spanish mode, anything without a Spanish version shows the English text, so nothing is ever missing.
- The editor and settings screens themselves are in English.

## Comments

Anyone can comment with just a name and no account. Comments show up right away.
- In edit mode, every comment has a **Delete** button. Comments posted while unlocked show up as **Author** (no name).
- **Site settings → Let visitors comment on posts** turns commenting off everywhere.
  Existing comments stay visible, but no new ones can be posted.
- Spam guards: a hidden trap field that bots fill in, a check that the form was open for at least a few seconds
  before posting, and a limit of 5 comments per visitor every 10 minutes.
- Each comment is a commit in the repo, just like edits. Comment commits only touch `content/`, so they don't
  trigger redeploys.

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
