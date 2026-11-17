// Node loader for tests: loads core + all components + labs
global.window = undefined;
const OL = require('./core.js');
const fs = require('fs');
for (const f of fs.readdirSync(__dirname + '/components').sort()) { new Function('OL', fs.readFileSync(__dirname + '/components/' + f, 'utf8'))(OL); }
const LABS = require('./labs.js');
module.exports = { OL, LABS };
