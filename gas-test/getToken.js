const scriptProperties = PropertiesService.getScriptProperties();
const CLIENT_ID = scriptProperties.getProperty('CLIENT_ID');
const CLIENT_SECRET = scriptProperties.getProperty('CLIENT_SECRET');
const SERVICE_ACCOUNT = scriptProperties.getProperty('SERVICE_ACCOUNT');
const PRIVATE_KEY_FILE_NAME = 'private_20250521164648.key';

// アクセストークン取得
function getLWBotAccessToken() {
  const privateKey = DriveApp.getFilesByName(PRIVATE_KEY_FILE_NAME).next().getBlob().getDataAsString("utf-8");
  const now = Math.floor(Date.now() / 1000);

  const header = Utilities.base64Encode(JSON.stringify({ "alg": "RS256", "typ": "JWT" }), Utilities.Charset.UTF_8);
  const claimSet = JSON.stringify({
    "iss": CLIENT_ID,
    "sub": SERVICE_ACCOUNT,
    "iat": now,
    "exp": now + 1800
  });
  const encodeText = header + "." + Utilities.base64Encode(claimSet, Utilities.Charset.UTF_8);
  const signature = Utilities.computeRsaSha256Signature(encodeText, privateKey);
  const jwtToken = encodeText + "." + Utilities.base64Encode(signature);

  const res = UrlFetchApp.fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    payload: {
      "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
      "assertion": jwtToken,
      "client_id": CLIENT_ID,
      "client_secret": CLIENT_SECRET,
      "scope": "bot"
    }
  });
  const accessToken = JSON.parse(res.getContentText()).access_token;
  return accessToken;
}
