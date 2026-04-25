const fs = require('fs');
const path = require('path');

const dir = 'z:/last cash book/KiryanaBook/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Fix sticky headers Top Padding
  content = content.replace(/(<(?:div|header)[^>]*className="(?:[^"]* )?sticky top-0(?: [^"]*)?")[^>]*(>)/g, (match) => {
     let newHeader = match;
     // Remove existing vertical heights/paddings
     newHeader = newHeader.replace(/\b(pt|pb|py|h|mt|mb)-[a-zA-Z0-9\[\]\-]+\b/g, '');
     newHeader = newHeader.replace(/\s+/g, ' '); // clean up spaces
     
     // Insert pt-12 pb-3
     newHeader = newHeader.replace('className="', 'className="pt-12 pb-3 ');
     return newHeader;
  });

  // 2. Fix bottom padding for the main scrollable container.
  // We'll search for <PageTransition>\s*<div className="..." and ensure it has pb-32
  content = content.replace(/<PageTransition>[\s\S]*?<div className="([^"]+)"/, (match, classes) => {
     let newClasses = classes.replace(/\bpb-[a-zA-Z0-9\[\]\-]+\b/g, '');
     newClasses = newClasses.replace(/\s+/g, ' ');
     newClasses = newClasses.trim() + ' pb-32';
     return match.replace(classes, newClasses);
  });

  if (content !== original) {
     fs.writeFileSync(filePath, content, 'utf8');
     console.log('Fixed:', file);
  }
}
