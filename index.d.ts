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
  public readonly CPYClip: Realm.Results<ClipyMate.clip>
  public readonly CPYFolder: Realm.Results<ClipyMate.folder>
  public readonly CPYSnippet: Realm.Results<ClipyMate.snippet>

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
  getFolder(folderId: string): Promise<ClipyMate.folder>
  getSnippet(snippetId: string): Promise<ClipyMate.snippet>
  upsertFolder(opt: ClipyMate.upsertFolderOpt): Promise<ClipyMate.folder>
  upsertSnippet(opt: ClipyMate.upsertSnippetOpt, folderId?: string): Promise<ClipyMate.snippet>
  destroyFolder(folderId: string, orderByIndex?: boolean): Promise<ClipyMate.folder>
  destroySnippet(snippetId: string): Promise<ClipyMate.snippet>
  clearAllSnippets(): Promise<void>
  private destroy(obj: Realm.Object): Promise<void>
  buildXml(orderByIndex?: boolean, detailMode?: boolean): Promise<string>
  parseXml(xmlString: string): Promise<ClipyMate.folder[]>
  addListener(
    boardName: ClipyMate.WatchBoard,
    callbacks: ClipyMate.RealmListener | ClipyMate.RealmListenerSet,
    rawCollection?: boolean
  ): Promise<void>
  removeAllListeners(boardName?: ClipyMate.WatchBoard): void
}

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
  type DefaultClipyMateOpt = {
    realmPath: string,
    watchBoards: WatchBoard[],
    events: RealmEventName[],
  }
  type ClipyMateOpt = Partial<DefaultClipyMateOpt>
  interface clip {
    title: string,
    dataPath?: string,
    dataHash?: string,
    primaryType?: string, // Only NSStringPboardType?
    updateTime?: number,
    thumbnailPath?: string,
    isColorCode?: boolean,
  }
  type folder = {
    title: string,
    snippets: snippet[] | upsertSnippetOpt[],
    index: number,
    identifier: string,
    enable: boolean,
  }
  type upsertFolderOpt = Partial<folder>
  type snippet = {
    title: string,
    content: string,
    index: number,
    identifier: string,
    enable: boolean,
  }
  type upsertSnippetOpt = Partial<snippet>
}

export = ClipyMate
