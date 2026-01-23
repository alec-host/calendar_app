const msal = require('@azure/msal-node');
require('dotenv').config();

const config = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
};

const cca = new msal.ConfidentialClientApplication(config);

const scopes = [
  'https://graph.microsoft.com/Calendars.ReadWrite',
  'https://graph.microsoft.com/User.Read'
];

function getAuthUrl() {
  const authCodeUrlParameters = {
    scopes: scopes,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI,
  };
  return cca.getAuthCodeUrl(authCodeUrlParameters);
}

async function getTokenByCode(code) {
  const tokenRequest = {
    code: code,
    scopes: scopes,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI,
  };
  const response = await cca.acquireTokenByCode(tokenRequest);
  return response;
}

module.exports = { getAuthUrl, getTokenByCode };