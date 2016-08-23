module Iris.Service.Raft.Stm

// ----------------------------------------------------------------------------------------- //
//                                    ____ _____ __  __                                      //
//                                   / ___|_   _|  \/  |                                     //
//                                   \___ \ | | | |\/| |                                     //
//                                    ___) || | | |  | |                                     //
//                                   |____/ |_| |_|  |_|                                     //
// ----------------------------------------------------------------------------------------- //

open Iris.Core
open Iris.Service
open Iris.Raft
open FSharpx.Stm
open FSharpx.Functional
open System.Threading
open Utilities
open System
open Zmq
open Db

let log (cbs: IRaftCallbacks<_,_>) (state: AppState) (msg: string) =
  cbs.LogMsg state.Raft.Node msg

/// ## Add a new node to the Raft cluster
///
/// Adds a new node the Raft cluster. This is done in the 2-phase commit model described in the
/// Raft paper.
///
/// ### Signature:
/// - node: Node to be added to the cluster
/// - appState: AppState TVar
/// - cbs: Raft callbacks
///
/// Returns: unit
let addNodeR node state cbs =
  let term = currentTerm state.Raft
  let changes = [| NodeAdded node |]
  let entry = JointConsensus(Id.Create(), 0UL, term, changes, None)
  let response = receiveEntry entry |> runRaft state.Raft cbs

  match response with
  | Right(resp, raft) -> updateRaft raft state
  | Middle(_, raft)   -> updateRaft raft state
  | Left(err, raft)   -> updateRaft raft state

/// ## Remove a node from the Raft cluster
///
/// Safely remove a node from the Raft cluster. This operation also follows the 2-phase commit
/// model set out by the Raft paper.
///
/// ### Signature:
/// - ndoe: the node to remove from the current configuration
/// - appState: AppState TVar
/// - cbs: Raft callbacks
///
/// Returns: unit
let removeNodeR node state cbs =
  let term = currentTerm state.Raft
  let changes = [| NodeRemoved node |]
  let entry = JointConsensus(Id.Create(), 0UL, term, changes, None)
  receiveEntry entry
  |> evalRaft state.Raft cbs
  |> flip updateRaft state

/// ## Redirect to leader
///
/// Gets the current leader node from the Raft state and returns a corresponding RaftResponse.
///
/// ### Signature:
/// - state: AppState
///
/// Returns: Stm<RaftResponse>
let doRedirect state =
  match getLeader state.Raft with
  | Some node -> Redirect node
  | _         -> ErrorResponse (OtherError "No known leader")

/// ## Handle AppendEntries requests
///
/// Handler for AppendEntries requests. Returns an appropriate response value.
///
/// ### Signature:
/// - sender:   Raft node which sent the request
/// - ae:       AppendEntries request value
/// - appState: AppState TVar
/// - cbs:      Raft callbacks
///
/// Returns: Stm<RaftResponse>
let handleAppendEntries sender ae state cbs =
  let result =
    receiveAppendEntries (Some sender) ae
    |> runRaft state.Raft cbs

  match result with
  | Right (resp, raft) ->
    let state = updateRaft raft state
    let response = AppendEntriesResponse(raft.Node.Id, resp)
    (response, state)

  | Middle (resp, raft) ->
    let state = updateRaft raft state
    let response = AppendEntriesResponse(raft.Node.Id, resp)
    (response, state)

  | Left (err, raft) ->
    let state = updateRaft raft state
    (ErrorResponse err, state)

/// ## Handle the AppendEntries request response.
///
/// Handle the request entries response.
///
/// ### Signature:
/// - sender: Node who replied
/// - ar: AppendResponse to process
/// - appState: TVar<AppState>
/// - cbs: IRaftCallbacks
///
/// Returns: unit
let handleAppendResponse sender ar state cbs =
  receiveAppendEntriesResponse sender ar
  |> evalRaft state.Raft cbs
  |> flip updateRaft state

/// ## Handle a vote request.
///
/// Handle a vote request and return a response.
///
/// ### Signature:
/// - sender: Node which sent request
/// - req: the `VoteRequest`
/// - appState: current TVar<AppState>
/// - cbs: IRaftCallbacks
///
/// Returns: unit
let handleVoteRequest sender req state cbs =
  let result =
    Raft.receiveVoteRequest sender req
    |> runRaft state.Raft cbs

  match result with
  | Right (resp, raft) ->
    sprintf "processed vote request. RIGHT result: %s" (if resp.Granted then "granted" else "NOT granted")
    |> log cbs state

    let state = updateRaft raft state
    let response = RequestVoteResponse(raft.Node.Id, resp)
    (response, state)

  | Middle (resp, raft) ->
    sprintf "processed vote request. MIDDLE result: %s" (if resp.Granted then "granted" else "NOT granted")
    |> log cbs state

    let state = updateRaft raft state
    let response = RequestVoteResponse(raft.Node.Id, resp)
    (response, state)

  | Left (err, raft) ->
    sprintf "processed vote request. LEFT error: %A" err
    |> log cbs state

    let state = updateRaft raft state
    (ErrorResponse err, state)

/// ## Handle the response to a vote request.
///
/// Handle the response to a vote request.
///
/// ### Signature:
/// - sender: Node which sent the response
/// - resp: VoteResponse to process
/// - appState: current TVar<AppState>
///
/// Returns: unit
let handleVoteResponse sender rep state cbs =
  receiveVoteResponse sender rep
  |> evalRaft state.Raft cbs
  |> flip updateRaft state

/// ## Handle a HandShake request by a certain Node.
///
/// Handle a request to join the cluster. Respond with Welcome if everything is OK. Redirect to
/// leader if we are currently not Leader.
///
/// ### Signature:
/// - node: Node which wants to join the cluster
/// - appState: current TVar<AppState>
/// - cbs: IRaftCallbacks
///
/// Returns: RaftResponse
let handleHandshake node state cbs =
  if isLeader state.Raft then

    let result =
      raft {
        let run = ref true
        let! term = currentTermM ()
        let changes = [| NodeAdded node |]
        let entry = JointConsensus(Id.Create(), 0UL, term, changes, None)

        sprintf "initialize: appending entry to enter joint-consensus"
        |> log cbs state

        let! appended = receiveEntry entry

        // wait for the entry to be committed by everybody
        while !run do
          let! committed = responseCommitted appended
          if committed then
            run := false
          else printfn "Joint-Consensus not committed"

        run := true                     // reset

        sprintf "initialize: appending entry to exit joint-consensus into regular configuration"
        |> log cbs state

        // now that all nodes are in joint-consensus we finalize the 2-phase
        // config change process by appending the Configuration entry

        let! term = currentTermM ()
        let! nodes = getNodesM () >>= (Map.toArray >> Array.map snd >> returnM)
        let entry = Log.mkConfig term nodes
        let! appended = receiveEntry entry

        // wait for the entry to be committed by everybody
        while !run do
          let! committed = responseCommitted appended
          if committed then
            run := false
          else printfn "Configuration not committed"

        warn "Should I send a snapshot now?"
        warn "Also, should I implement timout logic at this level?"

      } |> runRaft state.Raft cbs

    let response = Welcome state.Raft.Node

    match result with
    | Right (_,raft) -> (response, updateRaft raft state)
    | Middle(_,raft) -> (response, updateRaft raft state)
    | Left(err,raft) -> (ErrorResponse err, updateRaft raft state)
  else
    doRedirect state, state

let handleHandwaive node state cbs =
  if isLeader state.Raft then
    let result =
      raft {
        let run = ref true
        let! term = currentTermM ()
        let changes = [| NodeRemoved node |]
        let entry = JointConsensus(Id.Create(), 0UL, term, changes, None)

        sprintf "appending entry to enter joint-consensus"
        |> log cbs state

        let! appended = receiveEntry entry

        // wait for the entry to be committed by everybody
        while !run do
          let! committed = responseCommitted appended
          if committed then
            run := false
          else printfn "Joint-Consensus not committed"

        run := true                     // reset

        sprintf "appending entry to exit joint-consensus into regular configuration"
        |> log cbs state

        // now that all nodes are in joint-consensus we finalize the 2-phase
        // config change process by appending the Configuration entry

        let! term = currentTermM ()
        let! nodes = getNodesM () >>= (Map.toArray >> Array.map snd >> returnM)
        let entry = Log.mkConfig term nodes
        let! appended = receiveEntry entry

        // wait for the entry to be committed by everybody
        while !run do
          let! committed = responseCommitted appended
          if committed then
            run := false
          else printfn "Configuration not committed"

        warn "Also, should I implement timout logic at this level?"

      } |> runRaft state.Raft cbs

    match result with
    | Right (_,raft) -> (Arrivederci, updateRaft raft state)
    | Middle(_,raft) -> (Arrivederci, updateRaft raft state)
    | Left(err,raft) -> (ErrorResponse err, updateRaft raft state)
  else
    doRedirect state, state

let appendEntry (cmd: StateMachine) appState cbs =
  let state = readTVar appState |> atomically

  let result =
    raft {
      let entry = Log.make (currentTerm state.Raft) cmd
      let! result = receiveEntry entry
      let run = ref true

      while !run do
        let! committed = responseCommitted result
        if committed then
          run := false

      return result
    }
    |> runRaft state.Raft cbs

  let (response, newstate) =
    match result with
      | Right  (result, newstate) -> (Some result, newstate)
      | Middle (_,      newstate) -> (None,        newstate)
      | Left   (err,    newstate) -> failwithf "Raft Error: %A" err

  writeTVar appState (updateRaft newstate state)
  |> atomically

  response

let handleInstallSnapshot node snapshot state cbs =
  // let snapshot = createSnapshot () |> runRaft raft' cbs
  let ar = { Term         = state.Raft.CurrentTerm
           ; Success      = true
           ; CurrentIndex = currentIndex state.Raft
           ; FirstIndex   = match firstIndex state.Raft.CurrentTerm state.Raft with
                            | Some idx -> idx
                            | _        -> 0UL }

  (InstallSnapshotResponse(state.Raft.Node.Id, ar), state)

let handleRequest msg state cbs : (RaftResponse * AppState) =
  match msg with
  | RequestVote (sender, req) ->
    handleVoteRequest sender req state cbs

  | AppendEntries (sender, ae) ->
    handleAppendEntries  sender ae state cbs

  | HandShake node ->
    handleHandshake node state cbs

  | HandWaive node ->
    handleHandwaive node state cbs

  | InstallSnapshot (sender, snapshot) ->
    handleInstallSnapshot sender snapshot state cbs

let startServer (appState: TVar<AppState>) (cbs: IRaftCallbacks<_,_>) =
  let uri =
    readTVar appState
    |> atomically
    |> fun state -> state.Raft.Node.Data
    |> nodeUri

  let handler (request: byte array) : byte array =
    let state = readTVar appState |> atomically
    let request : RaftRequest option = decode request

    let response =
      match request with
      | Some message ->
        "server loop: computing response" |> log cbs state
        let response, state = handleRequest message state cbs
        writeTVar appState state |> atomically
        response
      | None ->
        "server loop: could not decode response" |> log cbs state
        ErrorResponse (OtherError "Unable to decipher request")

    response |> encode

  let server = new Rep(uri, handler)
  server.Start()
  server

let periodicR (state: AppState) cbs =
  periodic state.Options.PeriodicInterval
  |> evalRaft state.Raft cbs
  |> flip updateRaft state

/// ## startPeriodic
///
/// Starts an asynchronous loop to run Raft's `periodic` function. Returns a token, with which the
/// loop can be cancelled at a later time.
///
/// ### Signature:
/// - timeoput: interval at which the loop runs
/// - appState: current AppState TVar
/// - cbs: Raft Callbacks
///
/// Returns: CancellationTokenSource
let startPeriodic appState cbs =
  let token = new CancellationTokenSource()
  let rec proc () =
    async {
      let state = readTVar appState |> atomically

      periodicR state cbs
      |> writeTVar appState
      |> atomically

      Thread.Sleep(int state.Options.PeriodicInterval) // sleep for 100ms
      return! proc ()                                  // recurse
    }
  Async.Start(proc(), token.Token)
  token                               // return the cancellation token source so this loop can be

// -------------------------------------------------------------------------
let tryJoin (ip: IpAddress) (port: uint32) cbs (state: AppState) =
  let rec _tryJoin retry uri =
    if retry < int state.Options.MaxRetries then
      let client = mkClientSocket uri state

      Thread.CurrentThread.ManagedThreadId
      |> sprintf "TRYING TO JOIN CLUSTER. [retry: %d] [thread: %d]" retry
      |> log cbs state

      let request = HandShake(state.Raft.Node)
      let result = rawRequest request client

      sprintf "TRYJOIN RESPONSE: %A" result
      |> log cbs state

      dispose client

      match result with
      | Some (Welcome node) ->
        sprintf "Received Welcome from %A" node.Id
        |> log cbs state
        node

      | Some (Redirect next) ->
        sprintf "Got redirected to %A" (nodeUri next.Data)
        |> log cbs state
        _tryJoin (retry + 1) (nodeUri next.Data)

      | Some (ErrorResponse err) ->
        sprintf "Unexpected error occurred. %A Aborting." err
        |> log cbs state
        exit 1

      | Some resp ->
        sprintf "Unexpected response. %A Aborting." resp
        |> log cbs state
        exit 1
      | _ ->
        sprintf "Node: %A unreachable. Aborting." uri
        |> log cbs state
        exit 1
    else
      "Too many unsuccesful connection attempts. Aborting."
      |> log cbs state
      exit 1

  formatUri ip (int port) |> _tryJoin 0

/// ## Attempt to leave a Raft cluster
///
/// Attempt to leave a Raft cluster by identifying the current cluster leader and sending an
/// AppendEntries request with a JointConsensus entry.
///
/// ### Signature:
/// - appState: AppState TVar
/// - cbs: Raft callbacks
///
/// Returns: unit
let tryLeave (appState: TVar<AppState>) cbs : bool option =
  let state = readTVar appState |> atomically

  let rec _tryLeave retry (uri: string) =
    if retry < int state.Options.MaxRetries then
      let client = mkClientSocket uri state
      let request = HandWaive(state.Raft.Node)
      let result = rawRequest request client

      dispose client

      match result with
      | Some (Redirect other) ->
        if retry <= int state.Options.MaxRetries then
          nodeUri other.Data |> _tryLeave (retry + 1)
        else
          printfn "Too many retries. aborting"
          None

      | Some Arrivederci ->
        Some true

      | Some (ErrorResponse err) ->
        printfn "Unexpected error occurred. %A" err
        None

      | Some resp ->
        printfn "Unexpected response. Aborting.\n%A" resp
        None

      | _ ->
        printfn "Node unreachable. Aborting."
        None
    else
      "Too many unsuccesful connection attempts."
      |> log cbs state
      None

  match state.Raft.CurrentLeader with
    | Some nid ->
      match Map.tryFind nid state.Raft.Peers with
        | Some node -> nodeUri node.Data |> _tryLeave 0
        | _         ->
          printfn "Node data for leader id not found"
          None
    | _ ->
      printfn "no known leader"
      None


let forceElection appState cbs =
  stm {
    let! state = readTVar appState

    do! raft {
          let! timeout = electionTimeoutM ()
          do! setTimeoutElapsedM timeout
          do! periodic timeout
        }
        |> evalRaft state.Raft cbs
        |> flip updateRaft state
        |> writeTVar appState
  }

let prepareSnapshot appState =
  stm {
    let! state = readTVar appState
    let snapshot = createSnapshot (DataSnapshot "snip snap snapshot") state.Raft
    return snapshot
  }

let resetConnections (connections: Map<MemberId,Zmq.Req>) =
  Map.iter (fun _ sock -> dispose sock) connections

let initialize appState cbs =
  let state = readTVar appState |> atomically

  sprintf "initializing raft" |> log cbs state

  let newstate =
    raft {
      warn "should read term from disk on startup"
      let term = 0UL

      do! setTermM term
      do! setTimeoutElapsedM 0UL

      if state.Options.Start then
        sprintf "initialize: becoming leader" |> log cbs state
        do! becomeLeader ()
      else
        sprintf "initialize: requesting to join" |> log cbs state
        match state.Options.LeaderIp, state.Options.LeaderPort with
          | (Some ip, Some port) ->
            let leader = tryJoin (IpAddress.Parse ip) port cbs state
            sprintf "Reached leader: %A Adding to nodes." leader.Id
            |> log cbs state
            do! addNodeM leader

          | (None, _) ->
            "When joining a cluster, the leader's IP must be specified. Aborting."
            |> log cbs state
            exit 1

          | (_, None) ->
            "When joining a cluster, the leader's port must be specified. Aborting."
            |> log cbs state
            exit 1

    } |> evalRaft state.Raft cbs

  sprintf "initialize: save new state"
  |> log cbs state

  sprintf "initialize: req-timeout: %A elec-timeout: %A" state.Raft.RequestTimeout state.Raft.ElectionTimeout
  |> log cbs state

  // tryJoin leader
  writeTVar appState (updateRaft newstate state)
  |> atomically
