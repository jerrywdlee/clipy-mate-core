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
const uuidv4 = require('uuid/v4');
const fmt = require('./lib/formatter');

const access = util.promisify(fs.access);

const $HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const ClipyAppPath = path.join($HOME, '/Library/Application Support/com.clipy-app.Clipy');
const ClipyRealmPath = path.join(ClipyAppPath, '/default.realm');

const defaultOpt = {
  realmPath: ClipyRealmPath,
  watchBoards: ['CPYClip', 'CPYFolder', 'CPYSnippet'],
  events: ['insertions', 'modifications', 'deletions'],
};

class ClipyMate {
  constructor(opt) {
    this.opt = { ...defaultOpt, ...opt };
    this.models = { CPYClip: null, CPYFolder: null,CPYSnippet: null };
  }

  async init(opt) {
    const ClipyRealmPath = this.opt['realmPath'];
    const RealmOpt = { path: ClipyRealmPath, ...opt }
    try {
      await access(ClipyRealmPath, fs.constants.R_OK | fs.constants.W_OK);
      this.realm = await Realm.open(RealmOpt);
      this.opt.watchBoards.forEach(name => {
        Object.defineProperty(this, name, {
          get: () => {
            if (!this.models[name]) {
              this.models[name] = this.realm.objects(name);
            }
            return this.models[name];
          },
          set: () => {
            throw Error(`Cannot set read-only property '${name}'`);
          }
        });
      })
    } catch (err) {
      console.error(`Cannot access to Clipy!\nPath: ${ClipyRealmPath}`);
      console.error(err);
      throw err;
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
        // console.log(name, schema);
        schemas[name] = fmt.formSchema(schema);
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
      const folder = fmt.formFolder(folders[i], orderByIndex);
      result.push(folder);
    }
    return result;
  }

  async buildXml(orderByIndex = true, detailMode = false) {
    const folders = await this.readSnippets(orderByIndex);
    const xml = await fmt.buildXml(folders, detailMode);
    return xml;
  }

  async addListener(boardName, callbacks, rawCollection = false) {
    if (!this.realm || this.realm.isClosed) {
      await this.init();
    }
    const board = this[boardName];
    let cb = null;
    if (typeof callbacks === 'function') {
      cb = async (collection, changes) => {
        const eventNames = this.opt.events.filter(name => changes[name].length > 0);
        if (eventNames.length === 0) { return; }
        try {
          const result = { changes, eventNames };
          if (rawCollection) {
            result['collection'] = collection;
          } else {
            result['targets'] = fmt.formEventResults(collection, changes, eventNames);
          }
          await callbacks(result);
        } catch (e) {
          console.error(e);
        }
      };
    } else {
      cb = async (collection, changes) => {
        const events = Object.keys(callbacks).filter(name => this.opt.events.includes(name));
        // await Promise.all(
        //   events.map(name => formListener(name, collection, changes, callbacks[name], rawCollection))
        // );
        for (const name of events) {
          await formListener(name, collection, changes, callbacks[name], rawCollection);
        }
      }
    }
    board.addListener(cb);
  }

  removeAllListeners(boardName) {
    if (!this.realm || this.realm.isClosed) {
      return;
    }
    if (!boardName) {
      this.realm.removeAllListeners();
    } else {
      const board = this[boardName];
      board.removeAllListeners();
    }
  }

  async upsertFolder(opt) {
    if (!this.realm || this.realm.isClosed) {
      await this.init();
    }
    const realm = this.realm;
    let folder = null;

    const folderOpt = {
      title: 'untitled folder', snippets: [],
      identifier: uuidv4().toUpperCase(),
      enable: true, ...opt,
    }
    if (!folderOpt['index']) {
      folderOpt['index'] = await getIndex(this.CPYFolder);
    }
    realm.write(() => {
      folder = realm.create('CPYFolder', folderOpt, true);
    });
    return folder;
  }

  async upsertSnippet(opt, folderId) {
    if (!this.realm || this.realm.isClosed) {
      await this.init();
    }
    const realm = this.realm;

    if (opt['identifier']) {
      const snippet = this.CPYSnippet
        .filtered(`identifier == '${opt['identifier'].toUpperCase()}'`)[0];
      if (snippet) {
        realm.write(() => {
          realm.create('CPYSnippet', opt, true);
        });
        return snippet;
      }
    }
    const folder = this.CPYFolder
      .filtered(`identifier == '${folderId.toUpperCase()}'`)[0];
    if (!folder) {
      throw Error(`No such folder!\nidentifier: ${folderId}`);
    }
    const snippetOpt = {
      title: 'untitled snippet', content: '',
      identifier: uuidv4().toUpperCase(),
      enable: true, ...opt,
    }
    if (!snippetOpt['index']) {
      snippetOpt['index'] = await getIndex(folder.snippets);
    }
    let snippetIndex = -1;
    realm.write(() => {
      snippetIndex = folder.snippets.push(snippetOpt)
    })
    // console.log(snippetOpt);
    return folder.snippets[snippetIndex - 1];
  }

  disconnect() {
    if (!this.realm || this.realm.isClosed) {
      return;
    }
    this.realm.close();
  }

}

async function formListener(eventName, collection, changes, fn, rawCollection) {
  if (changes[eventName].length > 0) {
    try {
      const eventNames = [ eventName ];
      const result = { changes, eventNames };
      if (rawCollection) {
        result['collection'] = collection;
      } else {
        result['targets'] = fmt.formEventResults(collection, changes, eventNames);
      }
      await fn(result);
    } catch (e) {
      console.error(e);
    }
  }
}

async function getIndex(boardObj) {
  const lastOne = boardObj.sorted('index', true)[0];
  if (!lastOne) {
    return 0;
  } else {
    return lastOne['index'] + 1;
  }
}

module.exports = ClipyMate;
module.exports.default = ClipyMate;

if (!module.parent) {
  const clipy = new ClipyMate();
  (async () => {
    let schemas = await clipy.readSchemas();
    // console.log(schemas);
    await clipy.addListener('CPYClip', async (res) => {
      // console.log(ClipyMate.formEventResults(...res));
      // const { collection, changes, eventNames } = res;
      // eventNames.forEach(name => {
      //   changes[name].forEach(i => {
      //     console.log(name, i, collection[i]);
      //   });
      // });
      console.log(res);
      console.log(res.targets);
      
    });
    setTimeout(() => {
      clipy.removeAllListeners('CPYClip');
    }, 10 * 1000);
    // clipy.realm.close();
    // process.exit(0);
  })()
}
