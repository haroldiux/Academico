const fs = require('fs');
const path = 'c:/laragon/www/sidopa/Academico/src/pages/docente/ClasePage.vue';
let content = fs.readFileSync(path, 'utf8');

// Use a more generic regex to find {{ ... }} blocks and remove newlines inside single quotes
content = content.replace(/\{\{([\s\S]+?)\}\}/g, (match, p1) => {
    // Inside the interpolation, replace newlines that are inside single quotes
    // This is a bit complex for a single regex, so let's do it specifically for known problematic strings
    let inner = p1;

    // Replace newlines inside '...'
    inner = inner.replace(/'([^']*)[\r\n]+\s*([^']*)'/g, "'$1 $2'");
    // Do it twice in case there are multiple newlines in one string
    inner = inner.replace(/'([^']*)[\r\n]+\s*([^']*)'/g, "'$1 $2'");

    return `{{${inner}}}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('File updated successfully with recursive newline removal');
