const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

async function generate() {
    const svgPath = path.join(__dirname, 'public', 'icons', 'ambajizon.svg');
    const out192 = path.join(__dirname, 'public', 'icons', 'ambajizon-192.png');
    const out512 = path.join(__dirname, 'public', 'icons', 'ambajizon-512.png');

    try {
        await sharp(svgPath)
            .resize(192, 192)
            .png()
            .toFile(out192);

        await sharp(svgPath)
            .resize(512, 512)
            .png()
            .toFile(out512);

        console.log('Icons generated successfully.');
    } catch (err) {
        console.error('Error generating icons:', err.message);
    }
}

generate();
