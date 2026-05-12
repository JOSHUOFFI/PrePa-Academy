const { getFirebaseAdmin } = require("./firebaseAdmin");

function getStorageBucket() {
  const admin = getFirebaseAdmin();
  return admin && typeof admin.storage === "function" ? admin.storage().bucket() : null;
}

module.exports = { getStorageBucket };
