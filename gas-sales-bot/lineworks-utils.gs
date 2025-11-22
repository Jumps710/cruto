const SALES_LINE_WORKS = {
  TOKEN_CACHE_KEY: 'SALES_LW_ACCESS_TOKEN',
  TOKEN_TTL_SEC: 3300
};

function replyLineWorksMessages(context, messages) {
  
  if (!messages || messages.length === 0) {
    return;
  }

  const source = context && context.source;
  const userId = source && source.userId;
  if (userId) {
    
    sendLineWorksUserMessage(userId, messages);
    return;
  }

  const channelCandidate = source && (source.channelId || source.roomId || source.chatId);
  const channelId = channelCandidate || ENV.SALES_BOT.CHANNEL_ID;
  if (channelId) {
    
    sendLineWorksChannelMessage(channelId, messages);
    return;
  }

  
  console.warn('LINE WORKS: no userId or channelId available. Messages will not be delivered.');
}

function getLineWorksAccessToken() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(SALES_LINE_WORKS.TOKEN_CACHE_KEY);
  if (cached) {
    
    return cached;
  }
  

  try {
    const privateKey = getLineWorksPrivateKey();
    const jwt = generateLineWorksJWT(
      ENV.LINE_WORKS.CLIENT_ID,
      ENV.LINE_WORKS.SERVICE_ACCOUNT,
      privateKey
    );
    const token = requestLineWorksAccessToken(
      jwt,
      ENV.LINE_WORKS.CLIENT_ID,
      ENV.LINE_WORKS.CLIENT_SECRET
    );
    cache.put(SALES_LINE_WORKS.TOKEN_CACHE_KEY, token, SALES_LINE_WORKS.TOKEN_TTL_SEC);
    
    return token;
  } catch (error) {
    SalesLogger.log('lineworks_token_error', {
      message: error && error.message,
      stack: error && error.stack
    });
    throw error;
  }
}

function getLineWorksPrivateKey() {
  const target = ENV.LINE_WORKS.PRIVATE_KEY_FILE;
  const files = DriveApp.getFilesByName(target);
  if (!files.hasNext()) {
    throw new Error('Private key file not found: ' + target);
  }
  const raw = files.next().getBlob().getDataAsString();
  return raw
    .replace(/\uFEFF/g, '')
    .replace(/\r\n/g, '\n');
}



function generateLineWorksJWT(clientId, serviceAccount, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const headerPayload = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
  const claimPayload = JSON.stringify({
    iss: clientId,
    sub: serviceAccount,
    aud: 'https://auth.worksmobile.com/oauth2/v2.0/token',
    iat: now,
    exp: now + 600
  });
  const header = base64UrlEncodeString(headerPayload);
  const claim = base64UrlEncodeString(claimPayload);
  const unsigned = header + '.' + claim;
  const normalizedKey = privateKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const signatureBytes = Utilities.computeRsaSha256Signature(unsigned, normalizedKey);
  const signature = base64UrlEncodeBytes(signatureBytes);
  
  return unsigned + '.' + signature;
}

function base64UrlEncodeString(value) {
  return Utilities.base64EncodeWebSafe(value, Utilities.Charset.UTF_8).replace(/=+$/, '');
}

function base64UrlEncodeBytes(bytes) {
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

function requestLineWorksAccessToken(jwt, clientId, clientSecret) {
  const url = 'https://auth.worksmobile.com/oauth2/v2.0/token';
  const payload = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'bot'
  };
  
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    payload,
    muteHttpExceptions: true
  });
  const code = response.getResponseCode();
  const body = response.getContentText();
  
  if (code >= 400) {
    throw new Error('LINE WORKS token request failed: ' + code + ' ' + body);
  }
  const json = JSON.parse(body);
  if (!json.access_token) {
    throw new Error('LINE WORKS token response did not include access_token');
  }
  return json.access_token;
}


function testLineWorksTokenFlow() {
  console.log('[testLineWorksTokenFlow] start', new Date().toISOString());
  const env = (typeof ENV !== 'undefined' && ENV.LINE_WORKS) ? ENV.LINE_WORKS : null;
  const report = {
    timestamp: new Date().toISOString(),
    env: {
      clientId: !!(env && env.CLIENT_ID),
      serviceAccount: !!(env && env.SERVICE_ACCOUNT),
      clientSecret: !!(env && env.CLIENT_SECRET),
      privateKeyFile: env && env.PRIVATE_KEY_FILE ? env.PRIVATE_KEY_FILE : null
    }
  };

  if (!env) {
    report.configuration = { error: 'ENV.LINE_WORKS is not configured.' };
    console.error('[testLineWorksTokenFlow] missing configuration', report.configuration);
    return report;
  }

  if (!env.PRIVATE_KEY_FILE) {
    report.privateKey = {
      loaded: false,
      error: 'ENV.LINE_WORKS.PRIVATE_KEY_FILE is not set.'
    };
    console.error('[testLineWorksTokenFlow] private key file not configured', report.privateKey);
    return report;
  }

  let privateKey;
  try {
    privateKey = getLineWorksPrivateKey();
    const digestBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, privateKey);
    const fingerprint = digestBytes.map(function(byte) {
      return ('0' + (byte & 0xff).toString(16)).slice(-2);
    }).join('');
    report.privateKey = {
      loaded: true,
      length: privateKey ? privateKey.length : 0,
      fingerprint: fingerprint
    };
    console.log('[testLineWorksTokenFlow] private key loaded', report.privateKey);
  } catch (error) {
    report.privateKey = {
      loaded: false,
      error: error && error.message ? error.message : String(error)
    };
    console.error('[testLineWorksTokenFlow] private key load failed', report.privateKey);
    return report;
  }

  if (!env.CLIENT_ID || !env.SERVICE_ACCOUNT) {
    report.jwt = {
      generated: false,
      error: 'ENV.LINE_WORKS.CLIENT_ID or SERVICE_ACCOUNT is not set.'
    };
    console.error('[testLineWorksTokenFlow] jwt prerequisites missing', report.jwt);
    return report;
  }

  let jwt;
  try {
    jwt = generateLineWorksJWT(
      env.CLIENT_ID,
      env.SERVICE_ACCOUNT,
      privateKey
    );
    const parts = jwt ? jwt.split('.') : [];
    report.jwt = {
      generated: true,
      header: parts[0] || null,
      claim: parts[1] || null,
      compact: jwt
    };
    console.log('[testLineWorksTokenFlow] jwt generated', report.jwt);
  } catch (error) {
    report.jwt = {
      generated: false,
      error: error && error.message ? error.message : String(error)
    };
    console.error('[testLineWorksTokenFlow] jwt generation failed', report.jwt);
    return report;
  }

  if (!env.CLIENT_SECRET) {
    report.token = {
      acquired: false,
      error: 'ENV.LINE_WORKS.CLIENT_SECRET is not set.'
    };
    console.error('[testLineWorksTokenFlow] token request prerequisites missing', report.token);
    return report;
  }

  try {
    const token = requestLineWorksAccessToken(
      jwt,
      env.CLIENT_ID,
      env.CLIENT_SECRET
    );
    report.token = {
      acquired: true,
      length: token ? token.length : 0,
      preview: token ? token.slice(0, 16) + '...' : null
    };
    console.log('[testLineWorksTokenFlow] token acquired', report.token);
  } catch (error) {
    report.token = {
      acquired: false,
      error: error && error.message ? error.message : String(error)
    };
    console.error('[testLineWorksTokenFlow] token acquisition failed', report.token);
    return report;
  }

  console.log('[testLineWorksTokenFlow] complete', report);
  return report;
}

const LineWorksMenu = {
  ensureFixedMenu(commands) {
    if (!commands || commands.length === 0) {
      throw new Error('Fixed menu commands are empty.');
    }
    const botId = ENV.SALES_BOT.BOT_ID;
    if (!botId) {
      throw new Error('ENV.SALES_BOT.BOT_ID is not set.');
    }
    const accessToken = getLineWorksAccessToken();
    const url = 'https://www.worksapis.com/v1.0/bots/' + botId + '/persistentmenu';
    const menuItems = commands.map(command => {
      if (!command || !command.action || !command.action.type) {
        throw new Error('Invalid fixed menu command definition.');
      }
      const type = command.action.type;
      if (type === 'postback') {
        return {
          label: command.label,
          type: 'message',
          value: command.action.text || command.label || '',
          postback: command.action.data || ''
        };
      }
      if (type === 'message') {
        return {
          label: command.label,
          type: 'message',
          value: command.action.text || command.label || ''
        };
      }
      if (type === 'uri') {
        return {
          label: command.label,
          type: 'uri',
          value: command.action.uri || ''
        };
      }
      throw new Error('Unsupported menu action type: ' + type);
    });
    const payload = {
      locale: 'default',
      menuItems
    };
    const options = {
      method: 'post',
      muteHttpExceptions: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=utf-8'
      },
      payload: JSON.stringify(payload)
    };
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    if (code >= 400) {
      throw new Error('Fixed menu update failed: ' + code + ' ' + response.getContentText());
    }
  }
};

function sendLineWorksUserMessage(userId, messages) {
  if (!userId) {
    throw new Error('userId is required to send a message.');
  }
  if (!messages) {
    return;
  }
  const normalized = Array.isArray(messages) ? messages : [messages];
  if (normalized.length === 0) {
    return;
  }
  const botId = ENV.SALES_BOT.BOT_ID;
  if (!botId) {
    throw new Error('ENV.SALES_BOT.BOT_ID is not set.');
  }
  const accessToken = getLineWorksAccessToken();
  const encodedUser = encodeURIComponent(userId);
  const url = 'https://www.worksapis.com/v1.0/bots/' + botId + '/users/' + encodedUser + '/messages';

  

  normalized.forEach(content => {
    const payload = { content };
    const options = {
      method: 'post',
      muteHttpExceptions: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=utf-8'
      },
      payload: JSON.stringify(payload)
    };
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const body = response.getContentText();
    if (code >= 400) {
      SalesLogger.log('reply_send_user_error', { userId, code, body });
      throw new Error('LINE WORKS user send error: ' + code + ' ' + body);
    }
    
  });
}

function sendLineWorksChannelMessage(channelId, messages) {
  if (!channelId) {
    throw new Error('channelId is required to send a channel message.');
  }
  if (!messages) {
    return;
  }
  const normalized = Array.isArray(messages) ? messages : [messages];
  if (normalized.length === 0) {
    return;
  }

  

  const accessToken = getLineWorksAccessToken();
  const url = 'https://www.worksapis.com/v1.0/bots/' + ENV.SALES_BOT.BOT_ID + '/channels/' + channelId + '/messages';

  normalized.forEach(content => {
    const payload = { content };
    const options = {
      method: 'post',
      muteHttpExceptions: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=utf-8'
      },
      payload: JSON.stringify(payload)
    };
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const body = response.getContentText();
    if (code >= 400) {
      SalesLogger.log('reply_send_channel_error', { channelId, code, body });
      throw new Error('LINE WORKS channel send error: ' + code + ' ' + body);
    }
    
  });
}
