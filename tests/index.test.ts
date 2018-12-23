import ClipyMate from '../index'
import * as path from 'path'
import * as uuid from 'uuid/v4'
import Realm from 'realm'

describe('Test ClipyMate', () => {
  let clipy: ClipyMate = null
  const testOpt: ClipyMate.ClipyMateOpt = { realmPath: path.join(__dirname, '/default.realm') }
  const boards = ['CPYClip', 'CPYFolder', 'CPYSnippet']

  beforeAll(async () => {
    const sampleSnippet: ClipyMate.snippet = {
      title: 'sampleSnippet',
      content: 'Sample Snippet',
      index: 0,
      identifier: uuid().toUpperCase(),
      enable: true,
    }
    const sampleFolder: ClipyMate.folder = {
      title: "sampleFolder",
      snippets: [sampleSnippet],
      index: 0,
      identifier: uuid().toUpperCase(),
      enable: true,
    }
    clipy = new ClipyMate()
    // const initClipyMate = new ClipyMate(testOpt)
    // initClipyMate.realm = await Realm.open({});
    // // await initClipyMate.init()
    // console.log(initClipyMate.realm.schemaVersion)
    // initClipyMate.disconnect()
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

  test('Should return collections', async () => {
    const [CPYClip, CPYFolder, CPYSnippet] = boards.map(b => clipy[b])
    expect(CPYClip).toBeTruthy()
    expect(CPYFolder).toBeTruthy()
    expect(CPYSnippet).toBeTruthy()
  })

  test('Should listen changes', async done => {
    await clipy.addListener('CPYClip', res => {
      expect(res.changes).toBeTruthy()
      expect(res.eventNames).toBeTruthy()
      done()
    })
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

  test('Shouid remove specified listeners', async done => {
    await clipy.addListener('CPYSnippet', () => {
      done.fail()
    })
    await clipy.addListener('CPYClip', () => {
      done()
    })
    clipy.removeAllListeners('CPYSnippet')
    done() // TODO: mock needed
  })

  test('Shouid remove all listeners', async done => {
    await clipy.addListener('CPYClip', () => {
      done.fail()
    })
    clipy.removeAllListeners()
    done() // TODO: mock needed
  })

  test('Should close realm', async () => {
    clipy.disconnect()
    expect(clipy.realm.isClosed).toBeTruthy()
  })
})
