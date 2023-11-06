const { OAuth2Client } = require('google-auth-library');
const log = require("../../utils/logger");

const CLIENT_ID = CONFIG.google.clientId;
const client = new OAuth2Client(CLIENT_ID);

async function auth( accessToken ) {
    try {
        // Google OAuth 2.0 클라이언트를 사용하여 토큰 검증
        const ticket = await client.verifyIdToken({
          idToken: accessToken,
          audience: CLIENT_ID,
        });
    
        // 검증 결과
        const payload = ticket.getPayload();
        const userId = payload.sub; // 사용자의 고유 ID
        //const userEmail = payload.email; // 사용자 이메일

        return userId;
        
      } catch (e) {
        throw e;
      }
}

module.exports.auth = auth;

