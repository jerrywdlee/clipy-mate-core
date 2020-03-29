import ClipyMate from '../index'
import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'

const readFile = util.promisify(fs.readFile)

describe('Test ClipyMate', () => {
  let clipy: ClipyMate = null
  const testOpt: ClipyMate.ClipyMateOpt = { realmPath: path.join(__dirname, '../default.realm') }
  const boards = ['CPYClip', 'CPYFolder', 'CPYSnippet']
  let xmlResult: ClipyMate.upsertFolderOpt[] = []

  beforeAll(async () => {
    clipy = new ClipyMate(testOpt)
    await clipy.init()
  })
  beforeEach(() => {})
  afterEach(() => {})
  afterAll(() => {
    clipy.disconnect()
  })

  test('Should create Realm instance', async () => {
    // await clipy.init()
    expect(clipy.realm).not.toBeUndefined()
  })

  test('Should show schemas', async () => {
    const schemas = await clipy.readSchemas()
    expect(schemas.schemaVersion).toBeGreaterThanOrEqual(7)
    boards.forEach(key => {
      expect(schemas[key]).toBeTruthy()
    })
  })

  test('Should show snippets', async () => {
    const snippets = await clipy.readSnippets()
    expect(snippets).toBeTruthy()
  })

  test('Should load snippet.xml', async () => {
    const xmlPath = path.join(__dirname, 'snippets.xml')
    const xmlString = await readFile(xmlPath, 'utf8')
    const folders = await clipy.parseXml(xmlString)
    xmlResult = folders

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
    expect(await clipy.getFolder(uuid)).toBeTruthy()

    const newTitle = 'new test folder'
    folder = await clipy.upsertFolder({ title: newTitle, identifier: uuid })
    expect((await clipy.getFolder(uuid)).title).toBe(newTitle)
  })

  test('Should update folder with snippets', async () => {
    const snippets: ClipyMate.upsertSnippetOpt[] = [
      { title: 'test snippet 1', content: 'test 1' },
      { title: 'test snippet 2', content: 'test 2' },
    ]
    let folder = await clipy.upsertFolder({ title: 'test folder', snippets })
    expect(folder.snippets.length).toEqual(2)

    const folderId = folder.identifier
    const newSnippets: ClipyMate.upsertSnippetOpt[] = []
    for (const key in folder.snippets) {
      const snpt = folder.snippets[key]
      const identifier = snpt.identifier
      const title = `${snpt.title} Alted`
      const content = `${snpt.content} Alted`
      newSnippets.push({ title, content, identifier })
    }

    newSnippets.push({
      title: 'test snippet 3 Alted',
      content: 'test 3 Alted',
    })

    folder = await clipy.upsertFolder({
      title: 'new test folder',
      identifier: folderId,
      snippets: newSnippets,
    })

    expect(folder.snippets.length).toEqual(3)
    for (const key in folder.snippets) {
      const snptId = folder.snippets[key].identifier
      const res = await clipy.getSnippet(snptId)
      expect(res).toBeTruthy()
      expect(res.content).toMatch(/Alted/)
    }
  })

  test('Should create and update snippet', async () => {
    let folder = clipy.CPYFolder[0]
    const folderId = folder.identifier
    const snippet = await clipy.upsertSnippet({ title: 'test snippet', content: 'test' }, folderId)
    const snippetId = snippet.identifier
    let res = await clipy.getSnippet(snippetId)
    expect(res).toBeTruthy()
    expect(res.content).toEqual('test')

    const newCont = 'new test content'
    await clipy.upsertSnippet({ content: newCont, identifier: snippetId }, folderId)
    res = await clipy.getSnippet(snippetId)
    expect(res.content).toEqual('new test content')
  })

  test('Should output snippets xml from object', async () => {
    const xml = await clipy.buildXml(true, true)
    expect(xml).toBeTruthy()
  })

  test('Should output snippets json from object', async () => {
    const snippets = await clipy.readSnippets()
    const json = JSON.stringify(snippets, null, '\t')
    expect(json).toBeTruthy()
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

    test('Should destroy all snippet', async () => {
      await clipy.clearAllSnippets()

      const snippets = await clipy.readSnippets()
      expect(snippets.length).toBe(0)
    })

    test('Should insert snippets from XML', async () => {
      for (const folder of xmlResult) {
        await clipy.upsertFolder(folder)
      }

      const snippets = await clipy.readSnippets()
      expect(snippets.length).toBe(2)
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
