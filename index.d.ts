import Realm from 'realm'

declare class ClipyMate {
  realm: Realm
  opt: ClipyMate.DefaultClipyMateOpt
  models: {
    CPYClip: Realm.Results<ClipyMate.clip>,
    CPYFolder: Realm.Results<ClipyMate.folder>,
    CPYSnippet: Realm.Results<ClipyMate.snippet>,
  }
  // getters
  public CPYClip: Realm.Results<ClipyMate.clip>
  public CPYFolder: Realm.Results<ClipyMate.folder>
  public CPYSnippet: Realm.Results<ClipyMate.snippet>

  constructor(opt?: ClipyMate.ClipyMateOpt)
  init(): Promise<void>
  disconnect(): void
  readSchemas(keys?: ClipyMate.WatchBoard[]): Promise<{
    schemaVersion: number,
    CPYClip?: {},
    CPYFolder?: {},
    CPYSnippet?: {},
  }>
  readSnippets(orderByIndex?: boolean): Promise<ClipyMate.folder[]>
  buildXml(orderByIndex?: boolean, detailMode?: boolean): Promise<string>
  addListener(
    boardName: ClipyMate.WatchBoard,
    callbacks: ClipyMate.RealmListener | ClipyMate.RealmListenerSet,
    rawCollection?: boolean
  ): Promise<void>
  removeAllListeners(boardName?: ClipyMate.WatchBoard): void
}

// export default ClipyMate

declare namespace ClipyMate {
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
  interface ClipyMateOpt {
    realmPath?: string,
    watchBoards?: WatchBoard[],
    events?: RealmEventName[],
  }
  interface clip {
    title: string;
    dataPath?: string;
    dataHash?: string;
    primaryType?: string; // Only NSStringPboardType?
    updateTime?: number;
    thumbnailPath?: string;
    isColorCode?: boolean;
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
}

export = ClipyMate

