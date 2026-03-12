const fs = require('fs');
const path = 'c:/laragon/www/sidopa/Academico/src/pages/docente/ClasePage.vue';
let content = fs.readFileSync(path, 'utf8');

// Regex to find all {{ ... }} interpolations
// We use a more careful approach to handle nesting if any (though rare in Vue templates)
const interpolationRegex = /\{\{([\s\S]+?)\}\}/g;

content = content.replace(interpolationRegex, (match, inner) => {
    // Inside the interpolation, find all single-quoted strings that might contain newlines
    // We look for ' followed by anything (non-greedily) followed by '
    // and replace any internal newlines + surrounding whitespace with a single space
    const stringRegex = /'([^']*)'/g;

    let processedInner = inner.replace(stringRegex, (msgMatch, msgContent) => {
        // Replace all newline sequences and leading/trailing whitespace around them
        const cleanedContent = msgContent.replace(/\s*[\r\n]+\s*/g, ' ');
        return `'${cleanedContent}'`;
    });

    return `{{${processedInner}}}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully cleaned all multiline strings inside Vue interpolations.');
