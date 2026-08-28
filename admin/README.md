# SmartEase Properties — Admin CMS

Your team can edit key text, prices, and images without touching code, at
**yoursite.vercel.app/admin**. This uses Decap CMS (formerly Netlify CMS)
— a free, open-source admin panel. There's no database: every edit is
saved as a commit to your site's GitHub repository, and Vercel rebuilds
and republishes the site automatically within a minute or two of a save.

Login is handled by GitHub — each admin needs their own (free) GitHub
account and needs to be added as a collaborator on the repo. That's the
one meaningful trade-off of running this on Vercel instead of Netlify: no
separate "invite by email" system, just GitHub collaborator access.

## One-time setup (you, ~15 minutes)

### 1. Push this project to GitHub, and deploy it on Vercel
Same as any normal Vercel deploy — connect the GitHub repo to a new
Vercel project. The `/api/auth.js` and `/api/callback.js` files deploy
automatically as serverless functions; nothing extra to configure there.

### 2. Create a GitHub OAuth App
In GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App.**

- **Application name:** anything, e.g. "SmartEase Properties CMS"
- **Homepage URL:** `https://your-project.vercel.app`
- **Authorization callback URL:** `https://your-project.vercel.app/api/callback`

Click *Register application*, then *Generate a new client secret*. You'll
get a **Client ID** and a **Client Secret** — copy both.

### 3. Add those as environment variables in Vercel
In your Vercel project: **Settings → Environment Variables**, add:

| Name                   | Value                          |
|-------------------------|---------------------------------|
| `OAUTH_CLIENT_ID`       | the Client ID from step 2       |
| `OAUTH_CLIENT_SECRET`   | the Client Secret from step 2   |

Redeploy after adding these (Vercel does this automatically on the next
push, or you can trigger a redeploy manually from the dashboard).

### 4. Point the CMS config at your real repo and domain
Open `admin/config.yml` and change these two lines to your actual values:

```yaml
repo: your-github-username/your-repo-name
base_url: https://your-project.vercel.app
```

Commit and push — Vercel redeploys, and the admin panel is now live.

### 5. Add your admins as GitHub collaborators
In your GitHub repo: **Settings → Collaborators → Add people**, and add
each of your 2–5 team members' GitHub usernames or emails. They'll need a
free GitHub account if they don't already have one.

That's it. From then on, anyone with collaborator access can go to
**yoursite.vercel.app/admin**, click *Login with GitHub*, approve access
the first time, and start editing.

## What's editable right now

- **Home page** — hero heading, subtext, background photo, and the three
  stat pills (e.g. "Own outright from ₦46,000,000").
- **Metroluxe, Luma Apartments, The Meridian** — page title, intro
  paragraph, and every listed price.

Changes save as plain JSON files under `/content` — you can also open and
edit those files directly in a text editor or on GitHub if you ever prefer
that to the visual panel.

## Extending it to more pages

Every editable page follows the same three-part pattern. To add another
one (say, the Investment Opportunities page):

1. Add a JSON file under `/content/...json` with the fields you want
   editable (mirrors what you see in the existing files).
2. In the page's HTML, add a `data-cms="fieldname"` attribute to each
   element that should be filled from that JSON (matching the JSON key —
   use dot paths like `pricing.0.price` for list items), add
   `data-cms-page="path/to/file"` to `<body>`, and include
   `<script src="/js/cms-loader.js" defer></script>` before `</body>`.
3. Add a matching `collections` entry in `admin/config.yml` describing the
   fields, so they show up as a proper form in the admin panel.

The existing pages (`index.html`, `properties/metroluxe.html`,
`properties/luma-apartments.html`, `properties/the-meridian.html`) are
working, tested examples of this pattern — copy their structure for any
new page.

## Good to know

- If the CMS or JSON files are ever unreachable (offline, a bad deploy),
  every page still shows its last-known content baked into the HTML — the
  site never breaks or shows blank fields.
- Image uploads through the admin panel land in `/images` and are
  committed to the repo alongside your other site images.
- The OAuth Client Secret (step 3) is sensitive — it lives only in
  Vercel's environment variables, never in the repo or in any file you'd
  hand to someone else.
- This is a genuinely small, honest CMS: it covers the pages and fields
  listed above, not every string on every page. That's a deliberate
  trade-off to keep it simple to maintain — extend it page by page as you
  need to, using the pattern above.
