const express = require('express');
const router = express.Router();
const { getAuthUrl: getGoogleAuthUrl, getTokens: getGoogleTokens } = require('../services/googleOAuth');
const { getAuthUrl: getMicrosoftAuthUrl, getTokenByCode: getMicrosoftTokenByCode } = require('../services/microsoftOAuth');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Google OAuth - Redirect user to Google consent screen
router.get('/google', (req, res) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const tokens = await getGoogleTokens(code);
    // Here you would save tokens to DB associated with user/tenant
    // For demo, create JWT with tokens info
    const jwtToken = jwt.sign({ provider: 'google', tokens }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ jwtToken, tokens });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get Google tokens' });
  }
});

// Microsoft OAuth - Redirect user to Microsoft consent screen
router.get('/microsoft', async (req, res) => {
  try {
    const url = await getMicrosoftAuthUrl();
    res.redirect(url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get Microsoft auth URL' });
  }
});

// Microsoft OAuth callback
router.get('/microsoft/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const tokenResponse = await getMicrosoftTokenByCode(code);
    // Save tokens to DB associated with user/tenant
    const jwtToken = jwt.sign({ provider: 'microsoft', tokens: tokenResponse }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ jwtToken, tokens: tokenResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get Microsoft tokens' });
  }
});

module.exports = router;