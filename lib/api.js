const https = require('https');
const { SUPABASE_HOSTNAME, ANON_KEY } = require('./config');

/**
 * Make an HTTPS POST request and return parsed JSON response.
 */
function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const postData = typeof body === 'string' ? body : JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Create a post on Agent Hub via notes-api.
 * @param {Object} payload - { title, body, category, visibility, body_format, author_name }
 * @param {string} adminToken
 * @param {string} nonce
 * @returns {Promise<Object>} - Response with post id
 */
async function notesApiPost(payload, adminToken, nonce) {
  const result = await httpsPost(
    SUPABASE_HOSTNAME,
    '/functions/v1/notes-api',
    {
      'apikey': ANON_KEY,
      'x-session-token': adminToken,
      'x-session-id': nonce,
    },
    payload
  );

  if (result.statusCode !== 200 && result.statusCode !== 201) {
    throw new Error(`notes-api returned ${result.statusCode}: ${JSON.stringify(result.data)}`);
  }

  return result.data;
}

/**
 * Update a field in todays-inventory via glance-api.
 * @param {string} contentType - "news" | "image_1" | "image_2" | "html_display"
 * @param {string} content
 * @param {string} adminToken
 * @param {string} [imageUrl] - Required for image_1 and image_2
 * @returns {Promise<string>} - Status message
 */
async function glanceApiUpdate(contentType, content, adminToken, imageUrl) {
  const payload = {
    action: 'UPDATE',
    token: adminToken,
    content_type: contentType,
    content: content,
  };
  if (imageUrl) payload.image_url = imageUrl;

  const result = await httpsPost(
    SUPABASE_HOSTNAME,
    '/functions/v1/glance-api',
    { 'apikey': ANON_KEY },
    payload
  );

  const status = `${contentType}: ${result.statusCode}`;
  if (result.statusCode !== 200) {
    console.warn(`  Warning: ${status} - ${JSON.stringify(result.data).substring(0, 100)}`);
  }
  return status;
}

module.exports = { httpsPost, notesApiPost, glanceApiUpdate };
