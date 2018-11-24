import Realm from 'realm'


export class ClipyMate {
  realm: Realm
  opt: {
    realmPath?: string,
    watchBoards?: string[],
  }

  init(): Promise<void>

  readSchemas(keys?: string[]): Promise<{
    schemaVersion: number,
    CPYClip?: {},
    CPYFolder?: {},
    CPYSnippet?: {},
  }>
}
