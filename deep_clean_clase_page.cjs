const fs = require('fs');
const filePath = 'src/pages/docente/ClasePage.vue';
let content = fs.readFileSync(filePath, 'utf8');

// Normalizar finales de línea a LF y eliminar \r
content = content.replace(/\r/g, '');

// Aplanar interpolaciones de Vue que contienen cadenas de texto
const regex = /\{\{([\s\S]*?)\}\}/g;
let count = 0;
const newContent = content.replace(regex, (match, p1) => {
    if (p1.includes('\n') && (p1.includes("'") || p1.includes('"'))) {
        count++;
        const flattened = p1.replace(/\s+/g, ' ').trim();
        return `{{ ${flattened} }}`;
    }
    return match;
});

fs.writeFileSync(filePath, newContent);
console.log(`Deep cleaning complete. Normalised line endings and flattened ${count} problematic interpolations.`);
