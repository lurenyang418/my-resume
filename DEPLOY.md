# Deploy

## Prerequisites

- [Cloudflare](https://dash.cloudflare.com/) account
- A domain managed by Cloudflare (optional, for custom domain)

## Option 1: GitHub Actions (Recommended)

One-click deploy for any fork. Every push to `main` automatically builds and deploys.

### Setup

1. Fork/clone this repo and push to your GitHub
2. In Cloudflare Dashboard → **Workers & Pages** → **Create** → **Workers** → **Create Worker** (name it `cv`)
3. Get your **Cloudflare API Token** and **Account ID**:

   ### CLOUDFLARE_API_TOKEN

   Cloudflare Dashboard → **My Profile** (top right) → **API Tokens** → **Create Token** → Use the **Edit Cloudflare Workers** template → Select **All zones** or your specific zone → **Continue to summary** → **Create Token**. Copy the token (shown only once).

   ### CLOUDFLARE_ACCOUNT_ID

   Cloudflare Dashboard → **Workers & Pages** → right sidebar shows **Account ID**. Or visit `https://dash.cloudflare.com/?to=/:account/workers` and look at the URL.

4. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → Add these secrets:

   | Name | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | The token from step 3 |
   | `CLOUDFLARE_ACCOUNT_ID` | Your Account ID |

5. Push to `main` — deployment starts automatically

### Custom Domain

In Cloudflare Dashboard → Workers → `cv` → **Triggers** → **Custom Domain** → add `cv.lurenyang.com`

## Option 2: CLI Deploy

```bash
pnpm install
npx wrangler login
pnpm deploy
```
