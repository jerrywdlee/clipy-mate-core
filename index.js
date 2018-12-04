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
const fmt = require('./lib/formatter');

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

  async readSnippets(orderByIndex = true) {
    if (!this.realm || this.realm.isClosed) {
      await this.init();
    }
    const realm = this.realm;
    let folders = realm.objects('CPYFolder');
    if (orderByIndex) {
      // index of Clipy is ordered by A->Z
      folders = folders.sorted('index', false);
    }
    const result = [];
    for (let i = 0; i < folders.length; i++) {
      const folder = formFolder(folders[i], orderByIndex);
      result.push(folder);
    }
    return result;
  }

  async buildXml(orderByIndex = true, superMode = false) {
    const folders = await this.readSnippets(orderByIndex);
    const xml = await fmt.buildXml(folders, superMode);
    return xml;
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

function formFolder(realmFolderObj, orderByIndex) {
  const f = realmFolderObj;
  const folder = {
    index: f.index, enable: f.enable, title: f.title,
    identifier: f.identifier, snippets: [],
  };
  let snpts = f.snippets;
  if (orderByIndex) {
    // index of Clipy is ordered by A->Z
    snpts = f.snippets.sorted('index', false);
  }
  for (let j = 0; j < snpts.length; j++) {
    const s = snpts[j];
    const snippet = {
      index: s.index, enable: s.enable, title: s.title,
      content: s.content, identifier: s.identifier,
    };
    folder.snippets.push(snippet);
  }
  return folder;
}

module.exports = ClipyMate;
module.exports.default = ClipyMate;

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
