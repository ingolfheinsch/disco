[<AutoOpen>]
module Iris.Web.Core.Global

open System
open System.Collections.Generic
open Fable.Core
open Fable.Import
open Fable.Core.JsInterop
open Fable.PowerPack
open Iris.Core
open Iris.Core.Commands

type ISubscriber = obj -> unit
type ISubscriber<'T> = 'T -> unit
type IWidget = interface end
type ITab = interface end

[<Literal>]
let private LOG_MAX = 100

// Polyfill, Fable doesn't support RemoveRange yet
[<Emit("$2.splice($0,$1)")>]
let private removeRange (index: int) (count: int) (ar: ResizeArray<'T>): unit = jsNative

// INTERFACES --------------------------------------------------

// As these interfaces are exposed to JS, we start the members
// with lower case to follow JS conventions

type IDisposableJS =
  abstract dispose: unit->unit

type IGlobalState =
  abstract logs: IEnumerable<string>
  abstract tabs: IDictionary<Guid,ITab>
  abstract widgets: IDictionary<Guid,IWidget>
  abstract clock: int
  abstract useRightClick: bool
  abstract serviceInfo: ServiceInfo
  abstract project: IrisProject option
  abstract pinGroups: Map<Id,PinGroup>
  abstract cues: Map<Id,Cue>
  abstract cueLists: Map<Id,CueList>
  abstract cuePlayers: Map<Id,CuePlayer>

type IGlobalModel =
  abstract state: IGlobalState
  abstract subscribe: keys: U2<string, string[]> * subscriber: ISubscriber -> IDisposableJS
  abstract subscribeToEvent: event: string * subscriber: ISubscriber<'T> -> IDisposableJS
  abstract useRightClick: value: bool -> unit
  abstract addWidget: widget: IWidget * ?id: Guid -> Guid
  abstract removeWidget: id: Guid -> unit
  abstract addTab: tab: ITab * ?id: Guid -> Guid
  abstract removeTab: id: Guid -> unit
  abstract addLog: log: string -> unit
  abstract triggerEvent: event: string * data: obj -> unit

// IMPLEMENTATIONS --------------------------------------------------

type private Disposable(f: unit->unit) =
  interface IDisposableJS with
    member __.dispose() = f()
  interface System.IDisposable with
    member __.Dispose() = f()

type private GlobalStateMutable(readState: unit->State option) =
  let projectOrEmpty (project: State -> Map<Id,'T>) =
      match readState() with
      | Some state -> project state
      | None -> Map.empty
  member val Logs = ResizeArray()
  member val Tabs = Dictionary()
  member val Widgets = Dictionary()
  member val Clock = 0 with get, set
  member val UseRightClick = false with get, set
  member val ServiceInfo =
      { webSocket = "0"
        version = "0.0.0"
        buildNumber = "0"  } with get, set
  interface IGlobalState with

    member this.logs = upcast this.Logs
    member this.tabs = upcast this.Tabs
    member this.widgets = upcast this.Widgets
    member this.clock = this.Clock
    member this.useRightClick = this.UseRightClick
    member this.serviceInfo = this.ServiceInfo
    member this.project = readState() |> Option.map (fun s -> s.Project)
    member this.pinGroups = projectOrEmpty (fun s -> s.PinGroups)
    member this.cues = projectOrEmpty (fun s -> s.Cues)
    member this.cueLists = projectOrEmpty (fun s -> s.CueLists)
    member this.cuePlayers = projectOrEmpty (fun s -> s.CuePlayers)

/// To prevent duplication, this is the model all other views have access to.
/// It manages the information coming from backend/shared worker.
type GlobalModel() =
  // Private fields
  let context = ClientContext.Singleton
  let stateMutable: GlobalStateMutable = GlobalStateMutable(fun () ->
    context.Store |> Option.map (fun x -> x.State))
  let stateImmutable: IGlobalState = upcast stateMutable
  let subscribers = Dictionary<string, Dictionary<Guid, ISubscriber>>()
  let eventSubscribers = Dictionary<string, Dictionary<Guid, ISubscriber>>()

  // Private methods
  let notify key (newValue: obj) =
    match subscribers.TryGetValue(key) with
    | true, keySubscribers -> for s in keySubscribers.Values do s(newValue)
    | false, _ -> ()

  let notifyAll () =
    for KeyValue(key, keySubscribers) in subscribers do
      let value = stateMutable?(key)
      for subscriber in keySubscribers.Values do
        subscriber(value)

  let addLogPrivate (log: string) =
    let length = stateMutable.Logs.Count
    if length > LOG_MAX then
      let diff = LOG_MAX / 10
      removeRange (length - diff) diff stateMutable.Logs
    stateMutable.Logs.Insert(0, log)
    notify (nameof(stateImmutable.logs)) stateImmutable.logs

  // Constructor
  do context.Start()
  |> Promise.iter (fun () ->
    context.OnMessage
    |> Observable.add (function
      | ClientMessage.Initialized _ ->
        notifyAll()
      | ClientMessage.Event(_, ev) ->
        match ev with
        | DataSnapshot _ -> notifyAll()
        | StateMachine.UnloadProject -> notifyAll()
        | UpdateProject _ ->
          notify (nameof(stateImmutable.project)) stateImmutable.project
        | AddPinGroup _
        | UpdatePinGroup _
        | RemovePinGroup _
        | AddPin _
        | UpdatePin _
        | RemovePin _
        | UpdateSlices _ ->
          notify (nameof(stateImmutable.pinGroups)) stateImmutable.pinGroups
        | AddCue _
        | UpdateCue _
        | RemoveCue _
        | CallCue _ ->
          notify (nameof(stateImmutable.cues)) stateImmutable.cues
        | AddCueList _
        | UpdateCueList _
        | RemoveCueList _ ->
          notify (nameof(stateImmutable.cueLists)) stateImmutable.cueLists
        | AddCuePlayer    _
        | UpdateCuePlayer _
        | RemoveCuePlayer _ ->
          notify (nameof(stateImmutable.cuePlayers)) stateImmutable.cuePlayers
        // TODO: Add members to global state for cluster widget
        // | AddMember _
        // | UpdateMember _
        // | RemoveMember _
        | _ -> ()
      | _ -> ())
  )

  // Public methods
  member this.State: IGlobalState = stateImmutable

  member this.Subscribe(keys: U2<string, string[]>, subscriber: ISubscriber): IDisposable =
    let keys =
      match keys with
      | U2.Case1 key -> [|key|]
      | U2.Case2 keys -> keys
    let disposables = ResizeArray<IDisposable>()
    for key in keys do
      let id = Guid.NewGuid()
      if subscribers.ContainsKey(key) |> not then
        subscribers.Add(key, Dictionary())
      subscribers.[key].Add(id, subscriber)
      new Disposable(fun () -> subscribers.[key].Remove(id) |> ignore)
      |> disposables.Add
    upcast new Disposable(fun () -> for d in disposables do d.Dispose())

  member this.SubscribeToEvent(event: string, subscriber: ISubscriber<'T>): IDisposable =
    let id = Guid.NewGuid()
    if eventSubscribers.ContainsKey(event) |> not then
      eventSubscribers.Add(event, Dictionary())
    eventSubscribers.[event].Add(id, !!subscriber)
    printfn "Subscription to event %s" event
    upcast new Disposable(fun () -> eventSubscribers.[event].Remove(id) |> ignore)

  member this.UseRightClick(value: bool) =
    stateMutable.UseRightClick <- value
    notify (nameof(this.State.useRightClick)) value

  member this.AddWidget(widget: IWidget, ?id: Guid) =
    let id = match id with Some id -> id | None -> Guid.NewGuid()
    stateMutable.Widgets.Add(id, widget)
    notify (nameof(this.State.widgets)) this.State.widgets
    id

  member this.RemoveWidget(id: Guid) =
    stateMutable.Widgets.Remove(id) |> ignore
    notify (nameof(this.State.widgets)) this.State.widgets

  member this.AddTab(tab: ITab, ?id: Guid) =
    let id = match id with Some id -> id | None -> Guid.NewGuid()
    stateMutable.Tabs.Add(id, tab)
    notify (nameof(this.State.tabs)) this.State.tabs
    id

  member this.RemoveTab(id: Guid) =
    stateMutable.Tabs.Remove(id) |> ignore
    notify (nameof(this.State.tabs)) this.State.tabs

  member this.AddLog(log: string) =
    addLogPrivate log

  member this.TriggerEvent(event: string, data: obj) =
    match eventSubscribers.TryGetValue(event) with
    | true, subscribers -> for s in subscribers.Values do s(data)
    | false, _ -> ()

  interface IGlobalModel with
    member this.state: IGlobalState = this.State
    member this.subscribe(keys, subscriber) = this.Subscribe(keys, subscriber) :?> IDisposableJS
    member this.subscribeToEvent(event, subscriber) = this.SubscribeToEvent(event, subscriber) :?> IDisposableJS
    member this.useRightClick(value) = this.UseRightClick(value)
    member this.addWidget(widget, ?id) = this.AddWidget(widget, ?id=id)
    member this.removeWidget(id) = this.RemoveWidget(id)
    member this.addTab(tab, ?id) = this.AddTab(tab, ?id=id)
    member this.removeTab(id) = this.RemoveTab(id)
    member this.addLog(log) = this.AddLog(log)
    member this.triggerEvent(event, data) = this.TriggerEvent(event, data)
