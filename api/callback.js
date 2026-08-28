// /api/callback — Step 2 of the CMS login.
//
// GitHub redirects here after the admin approves access. This exchanges
// the short-lived code GitHub gave us for a real access token (that
// exchange has to happen on a server, since it needs the Client Secret,
// which must never be visible in the browser), then hands the token back
// to the admin panel window that opened this popup.

function parseCookie(header, name) {
  if (!header) return null;
  const match = header.split(';').map((p) => p.trim()).find((p) => p.startsWith(name + '='));
  return match ? match.slice(name.length + 1) : null;
}

module.exports = async (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send(
      'OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET are not set. Add them under Vercel → Settings → Environment Variables, then redeploy.'
    );
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = parseCookie(req.headers.cookie, 'cms_oauth_state');

  if (!code) {
    res.status(400).send('Missing authorization code from GitHub.');
    return;
  }
  if (!state || !cookieState || state !== cookieState) {
    res.status(400).send('Login could not be verified (state mismatch). Please try logging in again.');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      res.status(400).send('GitHub OAuth error: ' + (tokenData.error_description || tokenData.error));
      return;
    }

    var payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });
    var message = 'authorization:github:success:' + payload;

    var html =
      '<!DOCTYPE html><html><body>' +
      '<script>' +
      '(function() {' +
      'function receiveMessage(e) {' +
      'window.opener.postMessage(' + JSON.stringify(message) + ', e.origin);' +
      "window.removeEventListener('message', receiveMessage, false);" +
      '}' +
      "window.addEventListener('message', receiveMessage, false);" +
      "window.opener.postMessage('authorizing:github', '*');" +
      '})();' +
      '</script>' +
      '</body></html>';

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Set-Cookie', 'cms_oauth_state=; Path=/; Max-Age=0');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('OAuth callback failed: ' + err.message);
  }
};
