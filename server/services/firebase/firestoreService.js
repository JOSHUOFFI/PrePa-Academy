const { getFirebaseAdmin } = require("./firebaseAdmin");

function getFirestore() {
  const admin = getFirebaseAdmin();
  return admin && typeof admin.firestore === "function" ? admin.firestore() : null;
}

module.exports = { getFirestore };
