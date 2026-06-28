const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace fetch('/api/
    content = content.replace(/fetch\('\/api\//g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/");
    
    // Replace fetch(`/api/
    content = content.replace(/fetch\(`\/api\//g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/");

    // Replace fetch("/api/  (just in case)
    content = content.replace(/fetch\("\/api\//g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/");

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
      console.log(`Updated ${filePath}`);
    }
  }
});
console.log(`Done. Updated ${count} files.`);
