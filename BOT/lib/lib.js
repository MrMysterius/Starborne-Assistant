const fs = require('fs');

function e(n) {
    return fs.existsSync(n);
}

let expt = {};

if (e('./commands')) {
    expt.cmd = require('./lib/commands/commands/commands.js');
}
if (e('./functions')) {
    expt.fnc = require('./lib/functions/functions/functions.js');
}

module.exports = expt;