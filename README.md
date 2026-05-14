# Random Hololive Cosplay Suggestion

A tiny Express web app that picks a random Hololive talent for you to cosplay. Each talent is marked as "done" after being suggested, so you won't get the same person twice until the list is exhausted — then it resets.

Talent data is pulled from the [Holodex](https://holodex.net) API on first run and cached locally as JSON.

## Requirements

- Node.js **v22** or newer (the CI pins Node 22)
- npm
- A free Holodex API key (see [Getting an API key](#getting-an-api-key))

## Step-by-step setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShikiHTM/random-hololive-cosplay-suggestion.git
   cd random-hololive-cosplay-suggestion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your `.env` file** at `src/.env` using the template in the next section. The `.env` is gitignored so your key won't be committed.

4. **Run the app**
   - Development (auto-reloads on file changes):
     ```bash
     npm run dev
     ```
   - Local production-style run:
     ```bash
     npm run deploy_local
     ```
   - Production (expects env vars from the host, e.g. Railway):
     ```bash
     npm run deploy
     ```

5. **Open the app** in a browser:
   - `http://localhost:8443/` (redirects to `/random`)
   - `http://localhost:8443/random` — refresh for a new suggestion

   On first launch the app calls Holodex and writes `hololive_cosplay_list.json` and `hololive_picture.json` to the project root. Subsequent launches read from those files.

## Environment variables

Create `src/.env` with the following keys:

```dotenv
# Holodex API base URL (do not change unless Holodex moves their API)
API_URL="https://holodex.net/api/v2"

# Your personal Holodex API key — see "Getting an API key" below
API_KEY_X="YOUR_HOLODEX_API_KEY_HERE"

# Port the Express server listens on
PORT=8443
```

| Variable    | Required | Default                          | Description                                     |
|-------------|----------|----------------------------------|-------------------------------------------------|
| `API_URL`   | Yes      | `https://holodex.net/api/v2`     | Holodex API base URL.                           |
| `API_KEY_X` | Yes      | —                                | Holodex API key. Sent as the `X-APIKEY` header. |
| `PORT`      | No       | `3000` (fallback in `index.js`)  | HTTP port for the Express server.               |

## Getting an API key

The app uses Holodex, which gives out free API keys to anyone with an account:

1. Go to [holodex.net](https://holodex.net) and sign up / log in (Google, Twitter, Discord, or email all work).
2. Click your avatar → **Account Settings** → **API Key** tab.
3. Click **Generate** and copy the key.
4. Paste it into `src/.env` as the value of `API_KEY_X`.

A free key is more than enough for this app — it only hits Holodex once per cold start (3 calls total to page through Hololive talents) and then runs from the cached JSON.

## Testing the endpoints

With the server running on the default port:

```bash
# Should 302 → /random
curl -i http://localhost:8443/

# Returns the HTML page with a random talent + image
curl http://localhost:8443/random
```

To verify the "all cosplayed" reset path without burning through the real list, you can temporarily set every entry in `hololive_cosplay_list.json` to `true` and hit `/random` once — the page should show "All talent has been cosplayed!" and the list will reset to all `false` on the next request.

## Dev mode

`src/devMode.js` exports a `devMode.dev` flag. When set to `true`, the app keeps the cosplayed-state changes in memory only and does **not** write back to `hololive_cosplay_list.json` — useful for poking around without dirtying the file.

```js
// src/devMode.js
export default class devMode {
    static dev = true; // flip to true for in-memory-only runs
}
```

## Project layout

```
.
├── src/
│   ├── index.js        # Express server + HTML responses
│   ├── List.js         # HololiveCosplayList — Holodex fetch, state, randomizer
│   ├── devMode.js      # In-memory-only toggle
│   └── .env            # Your local secrets (gitignored)
├── hololive_cosplay_list.json   # Generated on first run — { "TalentName": cosplayed }
├── hololive_picture.json        # Generated on first run — { "TalentName": photoUrl }
├── package.json
└── .github/workflows/ci.yml     # Node 22 syntax check + Railway deploy on main
```

## Deployment

The included GitHub Actions workflow (`.github/workflows/ci.yml`) runs a syntax check on every push/PR and deploys to [Railway](https://railway.app) on pushes to `main`. To use it, set the following in your repo settings:

- **Secret** `RAILWAY_TOKEN` — a Railway project token.
- **Variables** on the Railway service: `API_URL`, `API_KEY_X`, and (optionally) `PORT`.

## License

See [LICENSE](./LICENSE).
