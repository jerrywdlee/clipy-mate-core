'use strict';
const fs = require('fs');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);
const Clipy = require('../index.js');
const clipy = new Clipy();

(async () => {
  const xml = await clipy.buildXml(true, true);
  await writeFileAsync('snippets.xml', xml, 'utf8');

  console.log('`snippets.xml` Created');
  clipy.realm.close();
  process.exit(0);
})();
