const fs = require('fs');
const path = require('path');

const filePath = 'src/pages/docente/ClasePage.vue';
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find all {{ ... }} blocks
const regex = /\{\{([\s\S]*?)\}\}/g;

let modifiedCount = 0;
const newContent = content.replace(regex, (match, p1) => {
    // If the block contains a newline and quotes
    if (p1.includes('\n') && (p1.includes("'") || p1.includes('"'))) {
        modifiedCount++;
        // Replace all newlines and multiple spaces with a single space
        const flattened = p1.replace(/\s+/g, ' ').trim();
        return `{{ ${flattened} }}`;
    }
    return match;
});

if (modifiedCount > 0) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Successfully flattened ${modifiedCount} multiline interpolations.`);
} else {
    console.log('No multiline interpolations found.');
}
