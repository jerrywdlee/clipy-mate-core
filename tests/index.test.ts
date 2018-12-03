import { ClipyMate } from '../index'

describe('Test ClipyMate', () => {
  let clipy: ClipyMate = null
  const boards = ['CPYClip', 'CPYFolder', 'CPYSnippet']

  beforeAll(() => {})
  beforeEach(() => {})
  afterEach(() => {})
  afterAll(() => {
    clipy.disconnect()
  })

  test('Should create Realm instance', async () => {
    clipy = new ClipyMate()
    await clipy.init()
    // console.log(clipy.opt)
    // console.log(clipy.realm)
    expect(clipy.realm).not.toBeUndefined()
  })

  test('Should show schemas', async () => {
    const schemas = await clipy.readSchemas()
    expect(schemas.schemaVersion).toBeGreaterThan(0)
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

  test('Should close realm', async () => {
    clipy.disconnect()
    expect(clipy.realm.isClosed).toBeTruthy()
  })
})
