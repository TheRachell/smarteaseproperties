// /api/auth — Step 1 of the CMS login.
//
// The admin panel opens this in a popup when someone clicks "Login with
// GitHub". It sends them to GitHub to approve access, then GitHub sends
// them back to /api/callback.
//
// Requires two environment variables, set in the Vercel project settings
// (Settings → Environment Variables) — see admin/README.md:
//   OAUTH_CLIENT_ID      the GitHub OAuth App's Client ID
//   OAUTH_CLIENT_SECRET  the GitHub OAuth App's Client Secret (used in
//                        api/callback.js, but both are usually set together)

module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send(
      'OAUTH_CLIENT_ID is not set. Add it under Vercel → Settings → Environment Variables, then redeploy.'
    );
    return;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${req.headers.host}/api/callback`;

  // Random, single-use value to make sure the callback we receive really
  // started from this login attempt (basic CSRF protection).
  const state = Array.from({ length: 20 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('');

  res.setHeader(
    'Set-Cookie',
    `cms_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state,
  });

  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params.toString()}` });
  res.end();
};
