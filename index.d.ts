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
  readSnippets(): Promise<folder[]>
}

// export default ClipyMate

type WatchBoard = 'CPYClip' | 'CPYFolder' | 'CPYSnippet'
interface ClipyMateOpt {
  realmPath?: string,
  watchBoards?: WatchBoard[],
}
interface folder {
  index: number,
  title: string,
  snippets: snippet[],
  identifier: string,
  enable?: boolean,
}
interface snippet {
  index: number,
  title: string,
  content: string,
  identifier: string,
  enable?: boolean,
}
