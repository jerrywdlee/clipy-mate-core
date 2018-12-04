import Realm from 'realm'

declare class ClipyMate {
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

export default ClipyMate

type WatchBoard = 'CPYClip' | 'CPYFolder' | 'CPYSnippet'
interface ClipyMateOpt {
  realmPath?: string,
  watchBoards?: WatchBoard[],
}
interface folder {
  title: string,
  snippets: snippet[],
  index?: number,
  identifier?: string,
  enable?: boolean,
}
interface snippet {
  title: string,
  content: string,
  index?: number,
  identifier?: string,
  enable?: boolean,
}
