const fs = require('fs');
const path = require('path');

const scaleFactor = 0.8;
const filesToProcess = [
    'src/App.vue',
    'src/components/AuthPage.vue',
    'src/components/CheckoutPage.vue',
    'src/components/GuestbookList.vue'
];

filesToProcess.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf-8');

        let count = 0;
        // Regex for font-size
        content = content.replace(/font-size:\s*([\d.]+)(px|rem|em|vw|vh)/g, (match, val, unit) => {
            let numericVal = parseFloat(val);
            // Hard clamp tiny fonts to prevent becoming unreadable microscopic dots
            const minSizes = { 'px': 11, 'rem': 0.75, 'em': 0.75 };
            let newVal = numericVal * scaleFactor;

            if (minSizes[unit] && newVal < minSizes[unit]) {
                newVal = minSizes[unit];
            }

            const newValStr = newVal.toFixed(2).replace(/\.?0+$/, '');
            count++;
            return `font-size: ${newValStr}${unit}`;
        });

        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Processed ${filePath} - Scaled ${count} fonts globally by 80%`);
    } else {
        console.log(`Skipped ${filePath} - Not found`);
    }
});
