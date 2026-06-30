# Build-A-GOAT

Build-A-GOAT is a static web basketball build game. Players spin for NBA traits, complete a build, share it, and run a season simulation.

## Project Structure

```text
/
  index.html
  css/
    styles.css
  js/
    app.js
    animations.js
    data.js
    game.js
    share.js
    simulation.js
    ui.js
  assets/
    backgrounds/
    icons/
    logos/
    players/
    sounds/
  data/
    players.json
    teams.json
  netlify.toml
  vercel.json
```

## Local Testing

Open `index.html` in a browser for a quick desktop check.

For the most reliable mobile and hosted-style test, serve the folder with any static server:

```bash
npx serve .
```

Then open the local URL shown by the server.

## Deploy To Vercel

1. Push this folder to GitHub.
2. In Vercel, choose `Add New Project`.
3. Import the GitHub repo.
4. Leave framework preset as `Other`.
5. Leave build command blank.
6. Leave output directory blank or set it to `.`.
7. Deploy.

`vercel.json` routes all requests back to `index.html` so shared URLs continue to load the game.

## Deploy To Netlify

1. Push this folder to GitHub.
2. In Netlify, choose `Add new site`.
3. Import the GitHub repo.
4. Leave build command blank.
5. Set publish directory to `.`.
6. Deploy.

`netlify.toml` publishes the root folder and keeps static routing simple.

## Notes For Public Beta

- The app currently runs fully in the browser.
- No backend is required.
- The old one-file prototype is retained as a legacy backup.
- The JSON data files are exported from the current embedded roster/team data so future database work can start cleanly.
