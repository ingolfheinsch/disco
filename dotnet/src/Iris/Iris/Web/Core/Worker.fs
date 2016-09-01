namespace Iris.Web.Core

open Fable.Core
open Iris.Core
open Iris.Web.Core


//  __  __                                ____            _
// |  \/  | ___  ___ ___  __ _  __ _  ___|  _ \ ___  _ __| |_
// | |\/| |/ _ \/ __/ __|/ _` |/ _` |/ _ \ |_) / _ \| '__| __|
// | |  | |  __/\__ \__ \ (_| | (_| |  __/  __/ (_) | |  | |_
// |_|  |_|\___||___/___/\__,_|\__, |\___|_|   \___/|_|   \__|
//                             |___/

type MessagePort =

  [<DefaultValue>] val mutable onmessage : MessageEvent -> unit

  [<Emit("$0.postMessage($1)")>]
  member self.PostMessage(_: string) = failwith "ONLY JS"

  [<Emit("console.log($0);$0.start()")>]
  member self.Start() = failwith "ONLY JS"

  [<Emit("$0.close()")>]
  member self.Close() = failwith "ONLY JS"

  [<Emit("new MessagePort()")>]
  new() = {}

//  ____  _                        ___        __         _
// / ___|| |__   __ _ _ __ ___  __| \ \      / /__  _ __| | _____ _ __
// \___ \| '_ \ / _` | '__/ _ \/ _` |\ \ /\ / / _ \| '__| |/ / _ \ '__|
//  ___) | | | | (_| | | |  __/ (_| | \ V  V / (_) | |  |   <  __/ |
// |____/|_| |_|\__,_|_|  \___|\__,_|  \_/\_/ \___/|_|  |_|\_\___|_|

type SharedWorker =
    [<DefaultValue>] val mutable onerror : (obj -> unit)

    [<DefaultValue>] val mutable port : MessagePort

    [<Emit "new SharedWorker($0)">]
    new(_: string) = {}

// __        __         _             _____                 _
// \ \      / /__  _ __| | _____ _ __| ____|_   _____ _ __ | |_
//  \ \ /\ / / _ \| '__| |/ / _ \ '__|  _| \ \ / / _ \ '_ \| __|
//   \ V  V / (_) | |  |   <  __/ |  | |___ \ V /  __/ | | | |_
//    \_/\_/ \___/|_|  |_|\_\___|_|  |_____| \_/ \___|_| |_|\__|

type WorkerEvent = { ports : MessagePort array }

//  __  __                                _____                 _
// |  \/  | ___  ___ ___  __ _  __ _  ___| ____|_   _____ _ __ | |_
// | |\/| |/ _ \/ __/ __|/ _` |/ _` |/ _ \  _| \ \ / / _ \ '_ \| __|
// | |  | |  __/\__ \__ \ (_| | (_| |  __/ |___ \ V /  __/ | | | |_
// |_|  |_|\___||___/___/\__,_|\__, |\___|_____| \_/ \___|_| |_|\__|
//                             |___/

type MessageEvent =
  [<DefaultValue>] val mutable data : string

  [<Emit("new MessageEvent()")>]
  new() = {}

// __        __   _    ____             _        _
// \ \      / /__| |__/ ___|  ___   ___| | _____| |_
//  \ \ /\ / / _ \ '_ \___ \ / _ \ / __| |/ / _ \ __|
//   \ V  V /  __/ |_) |__) | (_) | (__|   <  __/ |_
//    \_/\_/ \___|_.__/____/ \___/ \___|_|\_\___|\__|

[<Emit("new WebSocket($0)")>]
type WebSocket =

  [<Emit("$0.onerror = $1")>]
  member __.OnError
    with set (cb: unit -> unit) = failwith "ONLY JS"

  [<Emit("$0.onopen = $1")>]
  member __.OnOpen
    with set (cb: unit -> unit) = failwith "ONLY JS"

  [<Emit("$0.onclose = $1")>]
  member __.OnClose
    with set (cb: unit -> unit) = failwith "ONLY JS"

  [<Emit("$0.onmessage = $1")>]
  member __.OnMessage
    with set (cb: MessageEvent -> unit) = failwith "ONLY JS"

  [<Emit("$0.close()")>]
  member self.Close() = failwith "ONLY JS"

  [<Emit("$0.send($1)")>]
  member self.Send(stuff: string) = failwith "ONLY JS"

// __        __         _
// \ \      / /__  _ __| | _____ _ __
//  \ \ /\ / / _ \| '__| |/ / _ \ '__|
//   \ V  V / (_) | |  |   <  __/ |
//    \_/\_/ \___/|_|  |_|\_\___|_|

module Worker =

  [<Emit("onconnect = $0")>]
  let onConnect (_: WorkerEvent -> unit) = failwith "ONLY JS"


(*---------------------------------------------------------------------------*
       ____ _       _           _  ____            _            _
     / ___| | ___ | |__   __ _| |/ ___|___  _ __ | |_ _____  _| |_
    | |  _| |/ _ \| '_ \ / _` | | |   / _ \| '_ \| __/ _ \ \/ / __|
    | |_| | | (_) | |_) | (_| | | |__| (_) | | | | ||  __/>  <| |_
     \____|_|\___/|_.__/ \__,_|_|\____\___/|_| |_|\__\___/_/\_\\__|

                                                    +-----------------+
                                                    |                 |
                                                    |     BROWSER     |
    +---------------+      +-----------------+      |     WINDOW      |
    |               |      |                 |<---->|                 |
    |     IRIS      |----->|     SHARED      |      +-----------------+
    |    SERVICE    +<-----+     WORKER      |      +-----------------+
    |               |      |                 |<---->|                 |
    +---------------+      +-----------------+      |     BROWSER     |
                                                    |     WINDOW      |
                                                    |                 |
                                                    +-----------------+


    +--------------+               +---------------+              +----------------+
    | IRIS SERVICE |   ApiAction   | SHARED WORKER | ClientAction | BROWSER WINDOW |
    |              |               |               |              |                |
    |              |   AddPatch    |               |    Render    |                |
    |              | ------------> | update Store  | -----------> | re-render DOM  |
    |              |  UpdatePatch  |               |    Render    |                |
    |              | ------------> | update Store  | -----------> | re-render DOM  |
    |              |  RemovePatch  |               |    Render    |                |
    |              | ------------> | update Store  | -----------> | re-render DOM  |
    |              |               |               |              |                |
    |              |   AddIOBox    |               |    Render    |                |
    |              | ------------> | update Store  | -----------> | re-render DOM  |
    |              |  UpdateIOBox  |               |    Render    |                |
    |              | ------------> | update Store  | -----------> | re-render DOM  |
    |              |  RemoveIOBox  |               |    Render    |                |
    |              | ------------> | update Store  | -----------> | re-render DOM  |
    |              |               |               |              |                |
    |              |  UpdateIOBox  |               | UpdateIOBox  |                |
 <--|  relays msg  | <------------ | update Store  | <----------- |  edit IOBox    |
    |              |               |               |              |                |
    |              |    AddCue     |               |    AddCue    |                |
 <--|  relays msg  | <------------ | update Store  | <----------- |  create Cue    |
    |              |  UpdateCue    |               |  UpdateCue   |                |
 <--|  relays msg  | <------------ | update Store  | <----------- |   edits Cue    |
    |              |  RemoveCue    |               |  RemoveCue   |                |
 <--|  relays msg  | <------------ | update Store  | <----------- |  remove Cue    |
    |              |               |               |              |                |
    +--------------+               +---------------+              +----------------+

*----------------------------------------------------------------------------*)


let mkSession () =
  let time = JS.Date.now()
  let fac = Math.random()
  JSON.stringify(Math.floor(float(time) * fac))

type GlobalContext() as this =
  let mutable count = 0
  let mutable store = new Store<State>(Reducer, State.Empty)
  let mutable socket = None

  (*                      _                   _
        ___ ___  _ __  ___| |_ _ __ _   _  ___| |_ ___  _ __
      / __/ _ \| '_ \/ __| __| '__| | | |/ __| __/ _ \| '__|
      | (_| (_) | | | \__ \ |_| |  | |_| | (__| || (_) | |
      \___\___/|_| |_|___/\__|_|   \__,_|\___|\__\___/|_|
  *)
  do
    let sock = new WebSocket("ws://localhost:7000")

    socket <- Some sock


  [<Emit "$0[$1] = $2">]
  member private __.AddImpl (_: string, _: MessagePort) : unit = failwith "JS Only"

  [<Emit "delete $0[$1]">]
  member private __.RmImpl (_: string) : unit = failwith "JS Only"

  [<Emit "Object.keys($0)">]
  member private __.AllKeysImpl () : string array = failwith "JS Only"

  [<Emit "$0[$1]">]
  member private __.GetImpl (_: string) : MessagePort = failwith "JS Only"

  [<Emit "$0.close()">]
  member __.Close () = failwith "JS Only"

  member __.Send (msg : ClientMessage<State>, port : MessagePort) : unit =
    port.postMessage(msg, [| |])

  member __.Broadcast (msg : ClientMessage<State>) : unit =
    for k in __.AllKeysImpl() do
      let p = __.GetImpl(k)
      __.Send(msg, p)

  member __.Multicast (id: Session, msg: ClientMessage<State>) : unit =
    for k in __.AllKeysImpl() do
      if id <> k then
        let p = __.GetImpl(k)
        __.Send(msg, p)

  member __.Remove (id : Session) =
    count <- count - 1
    __.RmImpl(id)
    __.Broadcast <| ClientMessage.Closed(id)

  (*-------------------------------------------------------------------------*
      ____             _        _
      / ___|  ___   ___| | _____| |_
      \___ \ / _ \ / __| |/ / _ \ __|
      ___) | (_) | (__|   <  __/ |_
      |____/ \___/ \___|_|\_\___|\__| Message Handler

    *-------------------------------------------------------------------------*)

  member __.OnSocketMessage (ev : MessageEvent) : unit =
    let msg = JSON.parse(ev.data :?> string) :?> ApiAction
    let parsed =
      match msg with
        | AddPatch    patch -> PatchEvent(Create, patch)
        | UpdatePatch patch -> PatchEvent(Update, patch)
        | RemovePatch patch -> PatchEvent(Delete, patch)

        | AddIOBox    iobox -> IOBoxEvent(Create, iobox)
        | UpdateIOBox iobox -> IOBoxEvent(Update, iobox)
        | RemoveIOBox iobox -> IOBoxEvent(Delete, iobox)

    in store.Dispatch parsed
    __.Broadcast <| ClientMessage.Render(store.State)

  (*-------------------------------------------------------------------------*
      ____ _ _            _
      / ___| (_) ___ _ __ | |_
    | |   | | |/ _ \ '_ \| __|
    | |___| | |  __/ | | | |_
      \____|_|_|\___|_| |_|\__| Message Handler

    *------------------------------------------------------------------------*)

  member __.OnClientMessage (msg : MessageEvent) : unit =
    let parsed = msg.data :?> ClientMessage<State>
    match parsed with
      | ClientMessage.Close(session) -> __.Remove(session)

      | ClientMessage.Undo ->
        store.Undo()
        __.Broadcast <| ClientMessage.Render(store.State)

      | ClientMessage.Redo ->
        store.Redo()
        __.Broadcast <| ClientMessage.Render(store.State)

      | ClientMessage.Stop ->
        __.Broadcast <| ClientMessage.Stopped
        __.Close ()

      | ClientMessage.Event(session, event') ->
        match event' with
          | IOBoxEvent _    as ev ->
            store.Dispatch ev
            __.Multicast(session, ClientMessage.Render(store.State))
          | PatchEvent _    as ev ->
            store.Dispatch ev
            __.Multicast(session, ClientMessage.Render(store.State))
          | CueEvent _      as ev ->
            store.Dispatch ev
            __.Broadcast <| ClientMessage.Render(store.State)
          | _ -> __.Log "other are not supported in-worker"

      | _ -> __.Log "clients-only message ignored"

  member __.Add (port : MessagePort) =
    count <- count + 1                    // increase the connection count
    let id = mkSession()                  // create a session id
    port.onmessage <- (fun msg -> __.OnClientMessage msg; failwith "hm") // register callback on port
    __.AddImpl(id, port)                 // add port to ports object

    [ ClientMessage.Initialized(id)       // tell client all is good
    ; ClientMessage.Render(store.State) ] // tell client to render
    |> List.map __.Send
    |> ignore

  (* -------------------------------------------------------------------------

                +-------------+                  +-------------+
                |             |                  |             |
                |  SHARED     | ---------------> | BROWSER     |
                |  WORKER     | <--------------- | WINDOW      |
                |             |                  |             |
                +-------------+                  +-------------+

  ------------------------------------------------------------------------- *)

  member __.Store  with get () = store
  member __.Socket with get () = socket

  member __.Send (msg : ClientMessage<State>)  : unit =
    match socket with
      | Some(thing) -> thing.send(JSON.stringify(msg))
      | None -> __.Log("Not connected")

  member __.Log (thing : ClientLog) : unit =
    __.Broadcast <| ClientMessage.Log(thing)
