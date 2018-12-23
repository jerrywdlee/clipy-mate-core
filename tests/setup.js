const Realm = require('realm');
const ClipyMate = require('../index');
const schema = require('../lib/schema');

module.exports = async function (params) {
  console.log('setup.js');
  // console.log(params);

  const clipy = new ClipyMate();
  clipy.realm = await Realm.open({ schema: Object.values(schema), schemaVersion: 7 });
  console.log(clipy.realm.schemaVersion);
  clipy.disconnect();

};
/*
const sampleSnippet = {
  title: 'sampleSnippet',
  content: 'Sample Snippet',
  index: 0,
  identifier: uuid().toUpperCase(),
  enable: true,
}

const sampleFolder = {
  title: "sampleFolder",
  snippets: [sampleSnippet],
  index: 0,
  identifier: uuid().toUpperCase(),
  enable: true,
}
*/