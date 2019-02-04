import ClipyMate from '../index'
import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'

const readFile = util.promisify(fs.readFile)

describe('Test ClipyMate', () => {
  let clipy: ClipyMate = null
  const testOpt: ClipyMate.ClipyMateOpt = { realmPath: path.join(__dirname, '../default.realm') }
  const boards = ['CPYClip', 'CPYFolder', 'CPYSnippet']

  beforeAll(async () => {
    clipy = new ClipyMate(testOpt)
  })
  beforeEach(() => {})
  afterEach(() => {})
  afterAll(() => {
    clipy.disconnect()
  })

  test('Should create Realm instance', async () => {
    // clipy = new ClipyMate()
    await clipy.init()
    // console.log(clipy.opt)
    // console.log(clipy.realm)
    expect(clipy.realm).not.toBeUndefined()
  })

  test('Should show schemas', async () => {
    const schemas = await clipy.readSchemas()
    // expect(schemas.schemaVersion).toBeGreaterThan(0)
    expect(schemas.schemaVersion).toBeGreaterThanOrEqual(7)
    boards.forEach(key => {
      expect(schemas[key]).toBeTruthy()
    })
    // console.log(schemas);
  })

  test('Should show snippets', async () => {
    const snippets = await clipy.readSnippets()
    // console.log(JSON.stringify(snippets, null, '\t'))
    expect(snippets).toBeTruthy()
    // console.log(snippets)
  })

  test('Should output snippets xml', async () => {
    const xml = await clipy.buildXml(true, true);
    expect(xml).toBeTruthy()
    // console.log(xml)
  })

  test('Should load snippet.xml', async () => {
    const xmlPath = path.join(__dirname, 'snippets.xml')
    const xmlString = await readFile(xmlPath, 'utf8');
    const folders = await clipy.parseXml(xmlString)

    expect(folders.length).toBe(2)
    expect(folders[0].title).toBe('Foo')
    expect(folders[0].snippets.length).toBe(3)
    expect(folders[0].snippets[0].title).toBe('Foo 01')
  })

  test('Should return collections', async () => {
    const [CPYClip, CPYFolder, CPYSnippet] = boards.map(b => clipy[b])
    expect(CPYClip).toBeTruthy()
    expect(CPYFolder).toBeTruthy()
    expect(CPYSnippet).toBeTruthy()
  })

  test('Should create and update folder', async () => {
    let folder = await clipy.upsertFolder({ title: 'test folder' })
    const uuid = folder.identifier
    // console.log(uuid)
    expect(clipy.CPYFolder.filtered(`identifier == '${uuid}'`)[0]).toBeTruthy()
    const newTitle = 'new test folder'
    folder = await clipy.upsertFolder({ title: newTitle, identifier: uuid })
    expect(clipy.CPYFolder.filtered(`identifier == '${uuid}'`)[0].title).toBe(newTitle)
  })

  test('Should create and update snippet', async () => {
    let folder = clipy.CPYFolder[0]
    const folderId = folder.identifier
    const snippet = await clipy.upsertSnippet({ title: 'test snippet', content: 'test' }, folderId)
    const snippetId = snippet.identifier
    expect(clipy.CPYSnippet.filtered(`identifier == '${snippetId}'`)[0]).toBeTruthy()
    const newCont = 'new test content'
    clipy.upsertSnippet({ content: newCont, identifier: snippetId }, folderId)
    expect(clipy.CPYSnippet.filtered(`identifier == '${snippetId}'`)[0].content).toBe(newCont)
  })

  describe('Test destroying objects', () => {
    const folderTitle = 'destry test folder'
    let folder: ClipyMate.folder, snippet: ClipyMate.snippet, snippet2: ClipyMate.snippet
    beforeAll(async () => {
      folder = await clipy.upsertFolder({ title: folderTitle })
      const folderId = folder.identifier
      snippet = await clipy.upsertSnippet({ title: 'test snippet', content: 'test' }, folderId)
      snippet2 = await clipy.upsertSnippet({ title: 'test snippet2', content: 'test2' }, folderId)
    })

    test('Should destroy snippet', async () => {
      const snippet2Id = snippet2.identifier
      snippet2 = await clipy.destroySnippet(snippet2Id)
      expect(snippet2.identifier).toBe(snippet2Id)
      // console.log(snippet2)
    })

    test('Should destroy folder and snippet', async () => {
      const folderId = folder.identifier
      const snippetId = snippet.identifier

      folder = await clipy.destroyFolder(folderId)
      expect(folder.identifier).toBe(folderId)
      expect(folder.title).toBe(folderTitle)
      expect(folder.snippets.length).toBe(1)
      expect(folder.snippets[0].identifier).toBe(snippetId)
    })

    test('Should destroy folder and snippet', async () => {
      await clipy.clearAllSnippets()

      const snippets = await clipy.readSnippets()
      expect(snippets.length).toBe(0)
    })
  })

  describe('Test listeners', () => {
    const folderTtl = 'test folder', snippetTtl = 'test snippet'
    let folder: ClipyMate.folder, snippet: ClipyMate.snippet
    beforeAll(async () => {
      folder = await clipy.upsertFolder({ title: folderTtl })
      const folderId = folder.identifier
      snippet = await clipy.upsertSnippet({ title: snippetTtl, content: 'test' }, folderId)
    })

    test('Should listen changes', async done => {
      await clipy.addListener('CPYSnippet', res => {
        expect(res.changes).toBeTruthy()
        expect(res.eventNames).toBeTruthy()
        done()
      })
      const snippetId = snippet.identifier
      await clipy.upsertSnippet({ content: 'test2', identifier: snippetId})
      done() // TODO: mock needed
    })

    test('Should listen specified events', async done => {
      await clipy.addListener('CPYSnippet', {
        insertions: res => {
          expect(res.eventNames[0]).toBe('insertions')
        },
        deletions: res => {
          expect(res.eventNames[0]).toBe('deletions')
        }
      })
      done() // TODO: mock needed
    })

    test('Should remove specified listeners', async done => {
      await clipy.addListener('CPYSnippet', () => {
        done.fail()
      })
      await clipy.addListener('CPYClip', () => {
        done()
      })
      clipy.removeAllListeners('CPYSnippet')
      done() // TODO: mock needed
    })

    test('Should remove all listeners', async done => {
      await clipy.addListener('CPYClip', () => {
        done.fail()
      })
      clipy.removeAllListeners()
      done() // TODO: mock needed
    })
  })

  test('Should close realm', async () => {
    clipy.disconnect()
    expect(clipy.realm.isClosed).toBeTruthy()
  })
})
