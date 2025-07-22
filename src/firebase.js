const admin = require("firebase-admin");
const serviceAccount = require("../firebaseServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "hotel-buddha-avenue.firebasestorage.app"
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
