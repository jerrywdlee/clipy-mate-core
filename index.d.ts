import Realm from 'realm'

declare class ClipyMate {
  realm: Realm
  opt: DefaultClipyMateOpt
  models: {
    CPYClip: Realm.Results<clip>,
    CPYFolder: Realm.Results<folder>,
    CPYSnippet: Realm.Results<snippet>,
  }
  // getters
  public CPYClip: Realm.Results<clip>
  public CPYFolder: Realm.Results<folder>
  public CPYSnippet: Realm.Results<snippet>

  constructor(opt?: ClipyMateOpt)
  init(): Promise<void>
  disconnect(): void
  readSchemas(keys?: WatchBoard[]): Promise<{
    schemaVersion: number,
    CPYClip?: {},
    CPYFolder?: {},
    CPYSnippet?: {},
  }>
  readSnippets(orderByIndex?: boolean): Promise<folder[]>
  buildXml(orderByIndex?: boolean, detailMode?: boolean): Promise<string>
  addListener(
    boardName: WatchBoard,
    callbacks: RealmListener | RealmListenerSet,
    rawCollection?: boolean
  ): Promise<void>
  removeAllListeners(boardName?: WatchBoard): void
}

export default ClipyMate

type WatchBoard = 'CPYClip' | 'CPYFolder' | 'CPYSnippet'
type RealmEventName = 'insertions' | 'modifications' | 'deletions'
type RealmListener = (results: RealmEventObjects) => void | Promise<void>
interface RealmListenerSet {
  insertions?: RealmListener,
  modifications?: RealmListener,
  deletions?: RealmListener,
}
interface RealmEventObjects {
  changes: Realm.CollectionChangeSet,
  eventNames: RealmEventName[],
  collection?: Realm.Collection<Realm.Object>,
  targets?: RealmEventTargets,
}
interface RealmEventTargets {
  insertions?: Realm.Object,
  modifications?: Realm.Object,
}
interface DefaultClipyMateOpt {
  realmPath: string,
  watchBoards: WatchBoard[],
  events: RealmEventName[],
}
export interface ClipyMateOpt {
  realmPath?: string,
  watchBoards?: WatchBoard[],
  events?: RealmEventName[],
}
export interface clip {
  title: string;
  dataPath?: string;
  dataHash?: string;
  primaryType?: string; // Only NSStringPboardType?
  updateTime?: number;
  thumbnailPath?: string;
  isColorCode?: boolean;
}
export interface folder {
  title: string,
  snippets: snippet[],
  index?: number,
  identifier?: string,
  enable?: boolean,
}
export interface snippet {
  title: string,
  content: string,
  index?: number,
  identifier?: string,
  enable?: boolean,
}
