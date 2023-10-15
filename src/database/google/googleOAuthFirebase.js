const admin = require("firebase-admin");
const log = require("../../utils/logger");

// Firebase Admin SDK 초기화
const serviceAccount = require("../../../google-firebase-tower.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function auth(googleOAuthToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(googleOAuthToken);
        const uid = decodedToken.uid;
        log.info(`인증 성공, 사용자 UID: ${uid}`);
        return uid;
    } catch (e) {
        log.error("인증 실패", e);
        throw e;
    }
}

module.exports.auth = auth;

