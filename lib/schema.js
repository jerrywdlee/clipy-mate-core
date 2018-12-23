'use strict';

const FolderSchema = {
  name: 'CPYFolder',
  properties: {
    index: { name: 'index', type: 'int', indexed: false, optional: false },
    enable: { name: 'enable', type: 'bool', indexed: false, optional: false },
    title: { name: 'title', type: 'string', indexed: false, optional: false },
    identifier: {
      name: 'identifier',
      type: 'string',
      indexed: true,
      optional: false
    },
    snippets: {
      name: 'snippets',
      type: 'list',
      objectType: 'CPYSnippet',
      indexed: false,
      optional: false
    }
  },
  primaryKey: 'identifier'
};

const SnippetSchema = {
  name: 'CPYSnippet',
  properties: {
    index: { name: 'index', type: 'int', indexed: false, optional: false },
    enable: { name: 'enable', type: 'bool', indexed: false, optional: false },
    title: { name: 'title', type: 'string', indexed: false, optional: false },
    content: {
      name: 'content',
      type: 'string',
      indexed: false,
      optional: false
    },
    identifier: {
      name: 'identifier',
      type: 'string',
      indexed: true,
      optional: false
    }
  },
  primaryKey: 'identifier'
};

const ClipySchema = {
  name: 'CPYClip',
  properties: {
    dataPath: {
      name: 'dataPath',
      type: 'string',
      indexed: false,
      optional: false
    },
    title: { name: 'title', type: 'string', indexed: false, optional: false },
    dataHash: {
      name: 'dataHash',
      type: 'string',
      indexed: true,
      optional: false
    },
    primaryType: {
      name: 'primaryType',
      type: 'string',
      indexed: false,
      optional: false
    },
    updateTime: {
      name: 'updateTime',
      type: 'int',
      indexed: false,
      optional: false
    },
    thumbnailPath: {
      name: 'thumbnailPath',
      type: 'string',
      indexed: false,
      optional: false
    },
    isColorCode: {
      name: 'isColorCode',
      type: 'bool',
      indexed: false,
      optional: false
    }
  },
  primaryKey: 'dataHash'
};

module.exports = { FolderSchema, SnippetSchema, ClipySchema };
