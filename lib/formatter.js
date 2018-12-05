'use strict';

const util = require('util');
// const fs = require('fs');
// const path = require('path');

const xmlbuilder = require('xmlbuilder');
const xml2js = require('xml2js')

// const readFile = util.promisify(fs.readFile);
// const access = util.promisify(fs.access);
// const writeFile = util.promisify(fs.writeFile);
const parseString = util.promisify(xml2js.parseString);

const XML_CONF = {
  version: '1.0',
  encoding: 'UTF-8',
  standalone: false,
};

class Fmt {
  /*
  static async loadXml(path) {
    await access(path, fs.constants.R_OK);
    const snippetsXml = await readFile(path, 'utf8');
    const snippets = await parseString(snippetsXml);
    return snippets;
    // TODO: proccess snippets
  }
  */

  static async buildXml(folders, detailMode = true) {
    if (!Array.isArray(folders) && !Array.isArray(folders['folder'])) {
      throw Error('Wrong folder and snippets formats!');
    }
    const seed = folderObj2XmlObj(folders, detailMode)
    const result = xmlbuilder.create(seed, XML_CONF).end({ pretty: true });
    return result;
  }

  static formSchema(schema) {
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

  static formFolder(realmFolderObj, orderByIndex) {
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

  static formLeafObject(obj) {
    const props = Object.keys(obj);
    const res = {};
    props.forEach(prop => res[prop] = obj[prop]);
    return res;
  }

  static formEventResults(collection, changes, eventNames) {
    const res = {};
    eventNames.forEach(name => {
      res[name] = [];
      changes[name].forEach(i => {
        // const obj = Fmt.formLeafObject(collection[i]);
        // res[name].push(obj);
        res[name].push(collection[i]);
      });
    });
    return res;
  }

}

module.exports = Fmt;

function folderObj2XmlObj(folders, detailMode) {
  const seed = { folders: { folder: [] } };
  folders.forEach(f => {
    const fld = {
      title: f.title,
      snippets: { snippet: [] },
    };
    if (detailMode) {
      fld['index'] = f.index;
      fld['identifier'] = f.identifier;
    }
    f.snippets.forEach(s => {
      const snpt = {
        title: s.title,
        content: s.content,
      };
      if (detailMode) {
        fld['index'] = s.index;
        fld['identifier'] = s.identifier;
      }
      fld.snippets.snippet.push(snpt);
    });
    seed.folders.folder.push(fld);
  });
  return seed;
}
