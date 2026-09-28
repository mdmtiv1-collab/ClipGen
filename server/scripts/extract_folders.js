const fs = require('fs');
const html = fs.readFileSync('server/scripts/drive_html.txt', 'utf8');

const regex = /aria-label="([^"]+) Shared folder"[^>]*ssk='5:[^:]+:([0-9a-zA-Z_-]+)-0/g;
let match;
const folders = [];
while ((match = regex.exec(html)) !== null) {
  folders.push({ name: match[1], id: match[2] });
}
console.log('Extracted ' + folders.length + ' folders:');
console.log(JSON.stringify(folders, null, 2));

// Save to JSON for our library categories
fs.writeFileSync('server/storage/drive_categories.json', JSON.stringify(folders, null, 2), 'utf8');
