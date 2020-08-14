const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'logEvents',
    run: async (data) => {
        const dbDir = path.join(process.cwd(), 'database/events.json');
        if (!(data && data.type && data.timestamp)) return;
        if (!fs.existsSync(dbDir)) {
            let db = [];
            fs.writeFileSync(dbDir, JSON.stringify(db, null, '\t'), 'utf-8');
        }
        let db = JSON.parse(fs.readFileSync(dbDir, 'utf-8'));

        db.push(data);
        fs.writeFileSync(dbDir, JSON.stringify(db, null, '\t'), 'utf-8');
    }
}