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

let logMsg (state: AppState) (cbs: IRaftCallbacks<_,_>) (msg: string) =
  cbs.LogMsg state.Raft.Node msg

/// ## waitForCommit
///
/// Block execution until an entry has successfully been committed in the cluster.
///
/// ### Signature:
/// - appended: EntryResponse returned by receiveEntry
/// - appState: TVar<AppState> transactional state variable
/// - cbs: IRaftCallbacks
///
/// Returns: bool
let waitForCommit (appended: EntryResponse) (appState: TVar<AppState>) cbs =
  let ok = ref true
  let run = ref true

  // wait for the entry to be committed by everybody
  while !run do
    let state = readTVar appState |> atomically
    let committed =
      responseCommitted appended
      |> runRaft state.Raft cbs
      |> fun result ->
        match result with
          | Right (committed, _) -> committed
          | Middle _ | Left _ ->
            run := false
            ok  := false
            false

    if committed then
      run := false
    else
      printfn "%s not committed" (string appended.Id)
  !ok

/// ## enterJointConsensus
///
/// Enter the Joint-Consensus by apppending a respective log entry.
///
/// ### Signature:
/// - changes: the changes to make to the current cluster configuration
/// - state: current AppState to work against
/// - cbs: IRaftCallbacks
///
/// Returns: Either<RaftError * Raft, unit * Raft, EntryResponse * Raft>
let enterJointConsensus (changes: ConfigChange array) (state: AppState) cbs =
  raft {
    let! term = currentTermM ()
    let entry = JointConsensus(Id.Create(), 0UL, term, changes, None)
    do! log "HandShake: appending entry to enter joint-consensus"
    return! receiveEntry entry
  }
  |> runRaft state.Raft cbs

/// ## leaveJointConsensus
///
/// Leave the Joint-Consensus by appending a Configuration entry to the Log.
///
/// ### Signature:
/// - state: current AppState to work against
/// - cbs: IRaftCallbacks
///
/// Returns: Either<RaftError * Raft, unit * Raft, EntryResponse * Raft>
let leaveJointConsensus (state: AppState) cbs =
  raft {
    let! term = currentTermM ()
    let! nodes = getNodesM () >>= (Map.toArray >> Array.map snd >> returnM)
    let entry = Log.mkConfig term nodes
    do! log "HandShake: appending entry to exit joint-consensus into regular configuration"
    return! receiveEntry entry
  }
  |> runRaft state.Raft cbs

/// ## twoPhaseCommit
///
/// Function to execute a two-phase commit for adding/removing members from the cluster.
///
/// ### Signature:
/// - changes: configuration changes to make to the cluster
/// - success: RaftResponse to return when successful
/// - appState: transactional variable to work against
/// - cbs: IRaftCallbacks
///
/// Returns: RaftResponse
let twoPhaseCommit (changes: ConfigChange array) (success: RaftResponse) (appState: TVar<AppState>) cbs =
  let state = readTVar appState |> atomically
  let result = enterJointConsensus changes state cbs

  match result with
  | Right (appended, raftState) ->
    // save the new raft value back to the TVar
    writeTVar appState (updateRaft raftState state) |> atomically

    // block until entry has been committed
    let ok = waitForCommit appended appState cbs

    if ok then
      // now that all nodes are in joint-consensus we finalize the 2-phase
      // config change process by appending the Configuration entry
      let state = readTVar appState |> atomically
      let result = leaveJointConsensus state cbs

      match result with
      | Right (appended, raftState) ->
        // save the new raft value back to the TVar
        writeTVar appState (updateRaft raftState state) |> atomically

        // block until entry has been committed
        let ok = waitForCommit appended appState cbs

        if ok then
          success
        else
          ErrorResponse <| OtherError "Could not commit Configuration"

      | Middle _ ->
        ErrorResponse <| OtherError "Could not commit Configuration (unexpected intermediary result)"

      | Left (err,_) ->
        ErrorResponse err
    else
      ErrorResponse <| OtherError "Could not commit Joint-Consensus"

  | Middle _ ->
    ErrorResponse <| OtherError "Could not enter Joint-Consensus (unexpected result)"

  | Left (err,_) ->
    ErrorResponse err

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
let handleAppendEntries sender ae (appState: TVar<AppState>) cbs =
  let state = readTVar appState |> atomically

  let result =
    receiveAppendEntries (Some sender) ae
    |> runRaft state.Raft cbs

  match result with
  | Right (resp, raftState) ->
    writeTVar appState (updateRaft raftState state) |> atomically
    AppendEntriesResponse(raftState.Node.Id, resp)

  | Middle (resp, raftState) ->
    writeTVar appState (updateRaft raftState state) |> atomically
    AppendEntriesResponse(raftState.Node.Id, resp)

  | Left (err, raftState) ->
    writeTVar appState (updateRaft raftState state) |> atomically
    ErrorResponse err

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
let handleAppendResponse sender ar (appState: TVar<AppState>) cbs =
  let state = readTVar appState |> atomically

  receiveAppendEntriesResponse sender ar
  |> evalRaft state.Raft cbs
  |> flip updateRaft state
  |> writeTVar appState
  |> atomically

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
let handleVoteRequest sender req (appState: TVar<AppState>) cbs =
  let state = readTVar appState |> atomically

  let result =
    Raft.receiveVoteRequest sender req
    |> runRaft state.Raft cbs

  match result with
  | Right (resp, raftState) ->
    writeTVar appState (updateRaft raftState state) |> atomically
    RequestVoteResponse(raftState.Node.Id, resp)

  | Middle (resp, raftState) ->
    writeTVar appState (updateRaft raftState state) |> atomically
    RequestVoteResponse(raftState.Node.Id, resp)

  | Left (err, raftState) ->
    writeTVar appState (updateRaft raftState state) |> atomically
    ErrorResponse err

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
let handleVoteResponse sender rep (appState: TVar<AppState>) cbs =
  let state = readTVar appState |> atomically
  receiveVoteResponse sender rep
  |> evalRaft state.Raft cbs
  |> flip updateRaft state
  |> writeTVar appState
  |> atomically

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
let handleHandshake node (appState: TVar<AppState>) cbs =
  let state = readTVar appState |> atomically
  if isLeader state.Raft then
    let changes = [| NodeAdded node |]
    let result = Welcome state.Raft.Node
    twoPhaseCommit changes result appState cbs
  else
    doRedirect state

let handleHandwaive node (appState: TVar<AppState>) cbs =
  let state = readTVar appState |> atomically
  if isLeader state.Raft then
    let changes = [| NodeRemoved node |]
    let result = Arrivederci
    twoPhaseCommit changes result appState cbs
  else
    doRedirect state

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

let handleInstallSnapshot node snapshot (appState: TVar<AppState>) cbs =
  // let snapshot = createSnapshot () |> runRaft raft' cbs
  let state = readTVar appState |> atomically
  let ar = { Term         = state.Raft.CurrentTerm
           ; Success      = false
           ; CurrentIndex = currentIndex state.Raft
           ; FirstIndex   = match firstIndex state.Raft.CurrentTerm state.Raft with
                            | Some idx -> idx
                            | _        -> 0UL }
  InstallSnapshotResponse(state.Raft.Node.Id, ar)

let handleRequest msg (state: TVar<AppState>) cbs : RaftResponse =
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
    let request : RaftRequest option = decode request
    let response =
      match request with
      | Some message -> handleRequest message appState cbs
      | None         -> ErrorResponse (OtherError "Unable to decipher request")

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

      sprintf "Trying To Join Cluster. Retry: %d" retry
      |> logMsg state cbs

      let request = HandShake(state.Raft.Node)
      let result = rawRequest request client

      sprintf "Result: %A" result
      |> logMsg state cbs

      dispose client

      match result with
      | Some (Welcome node) ->
        sprintf "Received Welcome from %A" node.Id
        |> logMsg state cbs
        node

      | Some (Redirect next) ->
        sprintf "Got redirected to %A" (nodeUri next.Data)
        |> logMsg state cbs
        _tryJoin (retry + 1) (nodeUri next.Data)

      | Some (ErrorResponse err) ->
        sprintf "Unexpected error occurred. %A Aborting." err
        |> logMsg state cbs
        exit 1

      | Some resp ->
        sprintf "Unexpected response. %A Aborting." resp
        |> logMsg state cbs
        exit 1
      | _ ->
        sprintf "Node: %A unreachable. Aborting." uri
        |> logMsg state cbs
        exit 1
    else
      "Too many unsuccesful connection attempts. Aborting."
      |> logMsg state cbs
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
          "Too many retries. aborting" |> logMsg state cbs
          None

      | Some Arrivederci ->
        Some true

      | Some (ErrorResponse err) ->
        sprintf "Unexpected error occurred. %A" err |> logMsg state cbs
        None

      | Some resp ->
        sprintf "Unexpected response. Aborting.\n%A" resp |> logMsg state cbs
        None

      | _ ->
        "Node unreachable. Aborting." |> logMsg state cbs
        None
    else
      "Too many unsuccesful connection attempts." |> logMsg state cbs
      None

  match state.Raft.CurrentLeader with
    | Some nid ->
      match Map.tryFind nid state.Raft.Peers with
        | Some node -> nodeUri node.Data |> _tryLeave 0
        | _         ->
          "Node data for leader id not found" |> logMsg state cbs
          None
    | _ ->
      "no known leader" |> logMsg state cbs
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

  "initializing raft" |> logMsg state cbs

  let newstate =
    raft {
      warn "should read term from disk on startup"
      let term = 0UL

      do! setTermM term
      do! setTimeoutElapsedM 0UL

      if state.Options.Start then
        "initialize: becoming leader" |> logMsg state cbs
        do! becomeLeader ()
      else
        "initialize: requesting to join" |> logMsg state cbs
        match state.Options.LeaderIp, state.Options.LeaderPort with
          | (Some ip, Some port) ->
            let leader = tryJoin (IpAddress.Parse ip) port cbs state
            sprintf "Reached leader: %A Adding to nodes." leader.Id |> logMsg state cbs
            do! addNodeM leader

          | (None, _) ->
            "When joining a cluster, the leader's IP must be specified. Aborting."
            |> logMsg state cbs
            exit 1

          | (_, None) ->
            "When joining a cluster, the leader's port must be specified. Aborting."
            |> logMsg state cbs
            exit 1

    } |> evalRaft state.Raft cbs

  "initialize: save new state"
  |> logMsg state cbs

  sprintf "initialize: req-timeout: %A elec-timeout: %A" state.Raft.RequestTimeout state.Raft.ElectionTimeout
  |> logMsg state cbs

  // tryJoin leader
  writeTVar appState (updateRaft newstate state)
  |> atomically
