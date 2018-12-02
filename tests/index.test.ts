import { ClipyMate } from '../index'

describe('Test ClipyMate', () => {
  let clipy = null

  beforeAll(() => {})
  beforeEach(() => {})
  afterEach(() => {})
  afterAll(() => {
    clipy.realm.close();
  })

  test('Should create Realm instance', async () => {
    clipy = new ClipyMate()
    await clipy.init()
    // console.log(clipy.opt)
    // console.log(clipy.realm)
    expect(clipy.realm).not.toBeUndefined()
  })

})
