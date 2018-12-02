/**
 * Read Data From Clipy
 * [Clipy](https://github.com/Clipy/Clipy)
 * Data At: `$HOME/Library/Application Support/com.clipy-app.Clipy/`
 * Use [Realm Browser](https://itunes.apple.com/jp/app/realm-browser/id1007457278)
 * to confirm how DB like
 */

'use strict';

const Realm = require('realm');
const fs = require('fs');
const path = require('path');
const util = require('util');

const access = util.promisify(fs.access);

const $HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const ClipyAppPath = path.join($HOME, '/Library/Application Support/com.clipy-app.Clipy');
const ClipyRealmPath = path.join(ClipyAppPath, '/default.realm');

const defaultOpt = {
  realmPath: ClipyRealmPath,
  watchBoards: ['CPYClip', 'CPYFolder', 'CPYSnippet'],
};

class ClipyMate {
  constructor(opt) {
    this.opt = {...defaultOpt, ...opt};
  }

  async init() {
    const ClipyRealmPath = this.opt['realmPath'];
    try {
      await access(ClipyRealmPath, fs.constants.R_OK | fs.constants.W_OK);
      this.realm = await Realm.open({ path: ClipyRealmPath });
    } catch (err) {
      console.error(`Cannot access to Clipy!\nPath: ${ClipyRealmPath}`);
      console.error(err);
      // process.exit(1);
    }
  }

  async readSchemas(keys) {
    if (!this.realm || this.realm.isClosed) {
      await this.init();
    }

    if (!keys) {
      keys = this.opt['watchBoards'];
    }

    const schemas = { schemaVersion: this.realm.schemaVersion };
    this.realm.schema.forEach(schema => {
      const name = schema['name'];
      if (keys.includes(name)) {
        schemas[name] = formSchema(schema);
      }
    });

    return schemas;
  }

  disconnect() {
    this.realm.close();
  }
}

function formSchema(schema) {
  const schemaObj = {};
  for (const prop in schema['properties']) {
    if (schema['properties'].hasOwnProperty(prop)) {
      const type = schema['properties'][prop]['type'];
      let initValue = null;
      switch (type) {
        case 'int':
          initValue = 0;
          break;
        case 'bool':
          initValue = false;
          break;
        case 'string':
          initValue = '';
          break;
        case 'list':
          initValue = [];
          break;
        default:
          break;
      }
      schemaObj[prop] = initValue;
    }
  }
  return schemaObj;
}

// module.exports = ClipyMate;
exports.ClipyMate = ClipyMate;

if (!module.parent) {
  const clipy = new ClipyMate();
  (async () => {
    // await clipy.init();
    let schemas = await clipy.readSchemas();
    console.log(schemas);
    clipy.realm.close();
    process.exit(0);
  })()
}
