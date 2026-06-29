const fs = require('fs');

const content = fs.readFileSync('MASTER_BUG_LIST.md', 'utf-8');
const lines = content.split('\n');

const bugs = [];
let currentBug = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('### ')) {
        if (currentBug && currentBug.status === 'Open' && currentBug.description && currentBug.description.length > 5) {
            bugs.push(currentBug);
        }
        currentBug = {
            title: line.substring(4).trim(),
            id: '',
            module: '',
            severity: '',
            status: '',
            description: '',
            steps: '',
            expected: '',
            actual: ''
        };
    } else if (currentBug) {
        if (line.startsWith('- **Bug ID**:')) currentBug.id = line.split(':')[1].trim();
        else if (line.startsWith('- **Module**:')) currentBug.module = line.split(':')[1].trim();
        else if (line.startsWith('- **Severity**:')) currentBug.severity = line.split(':')[1].trim();
        else if (line.startsWith('- **Status**:')) currentBug.status = line.split(':')[1].trim();
        else if (line.startsWith('**Description**:')) currentBug.description = line.substring(16).trim();
        else if (line.startsWith('**Steps to Reproduce**:')) {
            let steps = '';
            let j = i + 1;
            while (j < lines.length && !lines[j].trim().startsWith('**Expected Result**:')) {
                if (lines[j].trim() !== '') steps += lines[j].trim() + ' ';
                j++;
            }
            currentBug.steps = steps.trim();
            i = j - 1;
        }
        else if (line.startsWith('**Expected Result**:')) currentBug.expected = line.substring(20).trim();
        else if (line.startsWith('**Actual Result**:')) currentBug.actual = line.substring(18).trim();
    }
}
if (currentBug && currentBug.status === 'Open' && currentBug.description && currentBug.description.length > 5) {
    bugs.push(currentBug);
}

// deduplicate by id
const seen = new Set();
const uniqueBugs = bugs.filter(b => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
});

console.log(`Found ${uniqueBugs.length} unique valid open bugs.`);
fs.writeFileSync('parsed_bugs.json', JSON.stringify(uniqueBugs, null, 2));
