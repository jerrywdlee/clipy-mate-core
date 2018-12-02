import Realm from 'realm'

export declare class ClipyMate {
  realm: Realm
  opt: ClipyMateOpt

  constructor(opt?: ClipyMateOpt)

  init(): Promise<void>
  disconnect(): void
  readSchemas(keys?: WatchBoard[]): Promise<{
    schemaVersion: number,
    CPYClip?: {},
    CPYFolder?: {},
    CPYSnippet?: {},
  }>
}

// export default ClipyMate

type WatchBoard = 'CPYClip' | 'CPYFolder' | 'CPYSnippet'
interface ClipyMateOpt {
  realmPath?: string,
  watchBoards?: WatchBoard[],
}
