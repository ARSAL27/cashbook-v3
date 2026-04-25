const fs = require('fs');
const path = require('path');

const dir = 'z:/last cash book/KiryanaBook/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Remove the over-aggressive pb-32 I added inside PageTransition containers
  content = content.replace(/(<PageTransition>[\s\S]*?<div className="[^"]*)\bpb-32\b([^"]*")/g, (match, before, after) => {
     let newClasses = (before + after).replace(/\s+/g, ' ');
     return newClasses;
  });

  // 2. Fix inner pages floating footers that were manually pushed up to avoid main bottom nav that isn't even present 
  content = content.replace(/\bfixed bottom-\[[0-9]+px\]/g, 'fixed bottom-6');

  if (content !== original) {
     fs.writeFileSync(filePath, content, 'utf8');
     console.log('Cleaned up padding in:', file);
  }
}
