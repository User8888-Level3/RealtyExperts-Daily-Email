const QRCode = require('qrcode');

const POST_ID = '85d998f9-b965-4556-9b41-3d37dfce7bf8';
const SHORT_ID = POST_ID.substring(0, 8); // 85d998f9
const SHARE_URL = `https://teamrealtyexperts.com/share/${POST_ID}`;
const QR_FILE = `note-qr-${SHORT_ID}.png`;

QRCode.toFile(QR_FILE, SHARE_URL, {
  width: 200,
  margin: 1,
  errorCorrectionLevel: 'M'
}, (err) => {
  if (err) {
    console.error('Error generating QR:', err);
  } else {
    console.log(`✅ QR code saved: ${QR_FILE}`);
    console.log(`   URL: ${SHARE_URL}`);
  }
});
