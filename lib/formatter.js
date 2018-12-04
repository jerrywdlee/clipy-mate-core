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

  static async buildXml(folders, superMode = true) {
    if (!Array.isArray(folders) && !Array.isArray(folders['folder'])) {
      throw Error('Wrong folder and snippets formats!');
    }
    const seed = folderObj2XmlObj(folders, superMode)
    const result = xmlbuilder.create(seed, XML_CONF).end({ pretty: true });
    return result;
  }

}

module.exports = Fmt;

function folderObj2XmlObj(folders, superMode) {
  const seed = { folders: { folder: [] } };
  folders.forEach(f => {
    const fld = {
      title: f.title,
      snippets: { snippet: [] },
    };
    if (superMode) {
      fld['index'] = f.index;
      fld['identifier'] = f.identifier;
    }
    f.snippets.forEach(s => {
      const snpt = {
        title: s.title,
        content: s.content,
      };
      if (superMode) {
        fld['index'] = s.index;
        fld['identifier'] = s.identifier;
      }
      fld.snippets.snippet.push(snpt);
    });
    seed.folders.folder.push(fld);
  });
  return seed;
}
