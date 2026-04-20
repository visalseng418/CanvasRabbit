const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

// In-memory token cache (chatId -> token)
const tokenCache = new Map();

// Get existing token or create new one
exports.getOrCreateToken = async (chatId, username = null) => {
  console.log(`🔐 Getting token for chatId: ${chatId}`);

  const cachedToken = tokenCache.get(chatId.toString());

  if (cachedToken) {
    console.log(`✅ Found cached token for ${chatId}`);
    try {
      await axios.post(`${API_URL}/auth/verify`, { token: cachedToken });
      console.log(`✅ Cached token is valid, reusing it`);
      return cachedToken;
    } catch (error) {
      console.log(`❌ Cached token expired, getting new one...`);
      tokenCache.delete(chatId.toString());
    }
  }

  console.log(`🆕 Generating new token for ${chatId}...`);
  const response = await axios.post(`${API_URL}/auth/token`, {
    chatId: chatId.toString(),
    username: username,
  });

  const token = response.data.data.token;
  console.log(`✅ New token generated and cached`);

  tokenCache.set(chatId.toString(), token);
  return token;
};

// Clear token from cache (e.g., on logout)
exports.clearToken = (chatId) => {
  tokenCache.delete(chatId.toString());
};
