const fs = require('fs');
const path = 'c:/laragon/www/sidopa/Academico/src/pages/docente/ClasePage.vue';
let content = fs.readFileSync(path, 'utf8');

// Aggressively remove ALL newlines and surrounding whitespace within {{ ... }} interpolations
const interpolationRegex = /\{\{([\s\S]+?)\}\}/g;

content = content.replace(interpolationRegex, (match, inner) => {
    // Remove all newlines and collapse whitespace
    const cleanedInner = inner.replace(/\s*[\r\n]+\s*/g, ' ');
    return `{{${cleanedInner}}}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully flattened all Vue interpolations to single lines.');
