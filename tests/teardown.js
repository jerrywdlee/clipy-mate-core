const Realm = require('realm');

module.exports = async function (params) {
  console.log('Run teardown.js');
  // console.log(params)

  // delete test Realm db
  Realm.deleteFile({});
};
