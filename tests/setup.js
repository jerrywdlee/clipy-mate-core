const Realm = require('realm');
const ClipyMate = require('../index');
const schema = require('../lib/schema');

module.exports = async function (params) {
  console.log('Run setup.js');
  // console.log(params);

  const clipy = new ClipyMate();
  clipy.realm = await Realm.open({ schema: Object.values(schema), schemaVersion: 7 });
  // console.log(clipy.realm.schemaVersion);
  clipy.disconnect();
};
