const https = require('https');
const fs = require('fs');

https.get('https://drive.google.com/drive/folders/1-e-F7hPcCHkKd3nsQ-KOKRryoDQzJMDm?usp=sharing', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('server/scripts/drive_html.txt', data);
    console.log('Saved html, searching for folder/file names...');
    
    // Look for string patterns that resemble folder names
    const folderPattern = /\["([0-9a-zA-Z_-]{20,})","([^"]+)",(?:true|false|null)/g;
    const items = [];
    let match;
    while ((match = folderPattern.exec(data)) !== null) {
      items.push({ id: match[1], name: match[2] });
    }
    console.log('Found items with folderPattern:', items.slice(0, 30));
    
    // General string search around Drive data
    const matches = data.match(/\["([a-zA-Z0-9_\-\sÀ-ÿ]{3,40})"/g) || [];
    console.log('Sample matched strings:', matches.slice(0, 40));
  });
});
