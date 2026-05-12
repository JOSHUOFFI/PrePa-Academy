function getFirebaseAdmin() {
  // Firebase Admin is intentionally optional right now so the current localStorage auth
  // and Formspree flow continue to work without new dependencies.
  // When server-side Firebase is enabled, initialize firebase-admin here from Vercel env vars.
  return null;
}

module.exports = { getFirebaseAdmin };
