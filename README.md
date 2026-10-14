# Programming Club Website

```bash
npm install
npm start    # dev server at localhost:3000
```

## Deploy

Pushing to `main` runs the `website-deploy` workflow, which builds the app and copies it to the server.

The judge API URL and the Firebase project are set in `.env.development` and `.env.production`. `npm start` uses the dev project `nnhs-prog-club-dev`, so local work never touches production data.
