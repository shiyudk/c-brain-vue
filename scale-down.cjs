const fs = require('fs');
const path = require('path');

const scaleFactor = 0.7;
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
            const minSizes = { 'px': 10, 'rem': 0.7, 'em': 0.7 };
            let newVal = numericVal * scaleFactor;

            if (minSizes[unit] && newVal < minSizes[unit]) {
                newVal = minSizes[unit];
            }

            const newValStr = newVal.toFixed(2).replace(/\.?0+$/, '');
            count++;
            return `font-size: ${newValStr}${unit}`;
        });

        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Processed ${filePath} - Scaled ${count} fonts by 70%`);
    } else {
        console.log(`Skipped ${filePath} - Not found`);
    }
});
