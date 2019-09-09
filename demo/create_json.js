'use strict';
const fs = require('fs');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);
const Clipy = require('../index.js');
const clipy = new Clipy();

(async () => {
  const snippets = await clipy.readSnippets()
  const json = JSON.stringify(snippets, null, '\t')
  await writeFileAsync('snippets.json', json, 'utf8');

  console.log('`snippets.json` Created');
  clipy.realm.close();
  process.exit(0);
})();
