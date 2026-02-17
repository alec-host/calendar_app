const { refreshAccessToken } = require('./googleOAuth');
const { getTokens, storeTokens } = require('../services/redisService');

async function getValidTokens(tenantId) {
    // 1. Try to get the short-lived access tokens
    let tokens = await getTokens(tenantId);

    // 2. If access tokens expired/missing, try to refresh
    if (!tokens) {
        console.log(`Access token expired for ${tenantId}, attempting refresh...`);
        const refreshToken = await client.get(`tenant:${tenantId}:refresh_token`);

        if (refreshToken) {
            try {
                // Get new tokens from Google
                const newCredentials = await refreshAccessToken(refreshToken);
                
                // Important: Google doesn't always send the refresh_token back in a refresh call
                // so we merge the new access_token with our existing refresh_token
                const updatedTokens = {
                    ...newCredentials,
                    refresh_token: refreshToken 
                };

                // Save back to Redis
                await storeTokens(tenantId, updatedTokens);
                return updatedTokens;
            } catch (error) {
                console.error("Refresh failed. User must re-authenticate.");
                return null;
            }
        }
    }
    return tokens;
}
