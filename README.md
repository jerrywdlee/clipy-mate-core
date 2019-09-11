# Clipy Mate Core
[![npm version](https://badge.fury.io/js/clipy-mate-core.svg)](https://badge.fury.io/js/clipy-mate-core)
[![Build Status](https://travis-ci.org/jerrywdlee/clipy-mate-core.svg?branch=master)](https://travis-ci.org/jerrywdlee/clipy-mate-core)
[![Coverage Status](https://coveralls.io/repos/github/jerrywdlee/clipy-mate-core/badge.svg?branch=update-readme)](https://coveralls.io/github/jerrywdlee/clipy-mate-core?branch=update-readme)
[![Known Vulnerabilities](https://snyk.io//test/github/jerrywdlee/clipy-mate-core/badge.svg?targetFile=package.json)](https://snyk.io//test/github/jerrywdlee/clipy-mate-core?targetFile=package.json)


Access [Clipy](https://clipy-app.com/) From Node.js  
[English](./README.md) | [日本語](https://qiita.com/jerrywdlee/items/276959193735fe2bd02e)

## Introduction
[Clipy](https://github.com/Clipy/Clipy) is a Clipboard extension app for macOS. This package allow developers access Clipy's folders and snippets using Node.js.  
It also provides [TypeScript API](./index.d.ts) and all tests are written by TypeScript.  

**[Attention]** This package will access Clipy's [Realm](https://realm.io/) Database directly, so you may need to restart Clipy App if snippets updated.

## Table of Contents
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Import](#import)
  - [Read Snippets](#read-snippets)
  - [Parse XML](#parse-xml)
  - [Create and Update](#create-and-update)
  - [Destroy](#destroy)
  - [Close Realm Connection](#close-realm-connection)
- [Contributing](#contributing)
- [License](#license)

## Requirements
- MacOS 10.10 and over
- Clipy v1.2.0 and over
- Node.js v8.9.0 and over

## Installation
Use the package manager [npm](https://www.npmjs.com/) to install.

```sh
npm i clipy-mate-core
```

## Usage

### Import

```js
const ClipyMate = require('clipy-mate-core');
const clipy = new ClipyMate();
```

```ts
import ClipyMate from 'clipy-mate-core'
const clipy: ClipyMate = new ClipyMate();
```

### Read Snippets

```js
// Read all Folders and Snippets
clipy.readSnippets().then((folders) => {
  console.log(folders);
  console.log(folders[0].snippets);
});
```

### Parse XML

```js
// Parse `snippet.xml`
const fs = require('fs');
clipy.parseXml(fs.readFileSync('./snippet.xml')).then((folders) => {
  console.log(folders);
  console.log(folders[0].snippets);
});
```

### Create and Update

```js
// Create or Update a folder
// it will update a folder has same `identifier` field
// or create a new folder if `identifier` is blank or not found
clipy.upsertFolder({ title: 'test folder' }).then(folder => {
  console.log(folder.identifier);
});

// Create or Update a snippet inside a folder
// it will update a snippet has same `identifier` field
// or create a new snippet if `identifier` is blank or not found
const folder = clipy.CPYFolder[0];
const folderId = folder.identifier;
clipy.upsertSnippet({ title: 'test snippet', content: 'test' }, folderId).then(snippet => {
  console.log(snippet.identifier);
});
```

### Destroy

```js
// Destroy a specific folder (All snippets in this folder will also be destroyed)
const folder = clipy.CPYFolder[0];
const folderId = folder.identifier;
clipy.destroyFolder(snippetId).then(folder => {
  console.log(folder);
});

// Destroy a specific snippet
const snippet = clipy.CPYSnippet[0];
const snippetId = snippet.identifier;
clipy.destroySnippet(snippetId).then(snippet => {
  console.log(snippet);
});

// [Danger!] Destroy all folders and snippets
clipy.clearAllSnippets().then();
```

### Close Realm Connection

```js
// After all
clipy.disconnect();
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## [License](./LICENSE)
[BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)
