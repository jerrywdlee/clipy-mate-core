<h1 align="center"> Clipy Mate Core </h1>
<p align="center">
  <b>Access Clipy From Node.js</b>
</p>

## Table of Contents
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

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install foobar.

```sh
npm i clipy-mate-core
```

## Usage

### Import
_**Attention: Node.js version 8 or over needed.**_  

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
