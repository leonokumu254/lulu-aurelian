const fs = require('fs');
const file = 'src/components/AgentPortal.css';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/font-family:\s*['"]Plus Jakarta Sans['"],\s*sans-serif;/gi, 'font-family: var(--font-sans);');
content = content.replace(/font-family:\s*['"]Inter['"],\s*sans-serif;/gi, 'font-family: var(--font-sans);');
content = content.replace(/font-family:\s*var\(--font-serif\);/gi, 'font-family: var(--font-sans);');
fs.writeFileSync(file, content);
console.log('Fonts updated in AgentPortal.css');
