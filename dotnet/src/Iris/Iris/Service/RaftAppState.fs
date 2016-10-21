namespace Iris.Service

open LibGit2Sharp
open Iris.Core.Utils
open Iris.Core
open Iris.Raft

//  ____        __ _      _               ____  _        _
// |  _ \ __ _ / _| |_   / \   _ __  _ __/ ___|| |_ __ _| |_ ___
// | |_) / _` | |_| __| / _ \ | '_ \| '_ \___ \| __/ _` | __/ _ \
// |  _ < (_| |  _| |_ / ___ \| |_) | |_) |__) | || (_| | ||  __/
// |_| \_\__,_|_|  \__|_/   \_\ .__/| .__/____/ \__\__,_|\__\___|
//                            |_|   |_|
[<NoComparison;NoEquality>]
type RaftAppContext =
  { Context: ZeroMQ.ZContext
  ; Raft:    Raft
  ; Options: IrisConfig }

  with
    override self.ToString() =
      sprintf "Raft: %A" self.Raft

[<RequireQualifiedAccess>]
module RaftContext =

  /// ## pull Raft state value out of RaftAppContext value
  ///
  /// Get Raft state value from RaftAppContext.
  ///
  /// ### Signature:
  /// - context: RaftAppContext
  ///
  /// Returns: Raft
  let getRaft (context: RaftAppContext) =
    context.Raft

  /// ## Update Raft in RaftAppContext
  ///
  /// Update the Raft field of a given RaftAppContext
  ///
  /// ### Signature:
  /// - raft: new Raft value to add to RaftAppContext
  /// - state: RaftAppContext to update
  ///
  /// Returns: RaftAppContext
  let updateRaft (raft: Raft) (state: RaftAppContext) : RaftAppContext =
    { state with Raft = raft }

  (*
  /// ## Add Project to RaftAppContext
  ///
  /// Unsafely adds a `Project` to an `RaftAppContext`, meaning no checks are performed to indicate
  /// whether the project already existed in the Map or not.
  ///
  /// ### Signature:
  /// - `project`: Project to add
  /// - `state`: RaftAppContext to add project to
  ///
  /// Returns: RaftAppContext
  let internal appendProject (project: Project) (state: RaftAppContext) : RaftAppContext =
    { state with Projects = Map.add project.Id project state.Projects }


  /// ## Add a project to RaftAppContext
  ///
  /// Add a `Project` to current `RaftAppContext` value. If the `Project` is already added indicate
  /// failure by returning `None`.
  ///
  /// ### Signature:
  /// - `project`: Project to add
  /// - `state`: RaftAppContext to add project to
  ///
  /// Returns: RaftAppContext option
  let addProject (project: Project) (state: RaftAppContext) : RaftAppContext option =
    if Map.containsKey project.Id state.Projects |> not
    then appendProject project state |> Some
    else None

  /// ## Update a project loaded into RaftAppContext
  ///
  /// Update an existing `Project` in given `RaftAppContext`. Indicate failure to find existing entry by
  /// returning `None`.
  ///
  /// ### Signature:
  /// - `project`: Project to add
  /// - `state`: RaftAppContext to add project to
  ///
  /// Returns: RaftAppContext option
  let updateProject (project: Project) (state: RaftAppContext) =
    if Map.containsKey project.Id state.Projects
    then appendProject project state |> Some
    else None

  /// ## Find a project loaded into RaftAppContext
  ///
  /// Find a given `ProjectId` in current `RaftAppContext`. Indicate failure to do so by returning `None`.
  ///
  /// ### Signature:
  /// - `id`; ProjectId of Project
  /// - `state`: RaftAppContext to find Project in
  ///
  /// Returns: Project option
  let findProject (id: ProjectId) state : Project option =
    match Map.tryFind id state.Projects with
      | Some _ as project -> project
      |      _            -> None

  /// ## Load a Project into given RaftAppContext
  ///
  /// Attempt to load a `Project` into `RaftAppContext`. Indicate failure to do so by returning `None`.
  ///
  /// ### Signature:
  /// - `path`: FilePath to project yaml
  /// - `state`: RaftAppContext to load Project into
  ///
  /// Returns: RaftAppContext option
  let loadProject (path: FilePath) (state: RaftAppContext) : RaftAppContext option =
    match load path with
      | Some project -> addProject project state
      | _            -> None

  /// ## Save a loaded project to disk
  ///
  /// Save a project loaded into RaftAppContext to disk. Indicate failure to find or save the Project by
  /// returning `None`
  ///
  /// ### Signature:
  /// - `id`: Project Id
  /// - `committer`: the signature (name, email) of the person invoking the operation
  /// - `msg`: the commit message associated with the operation
  /// - `state`: the current `RaftAppContext`
  ///
  /// Returns: (Commit * RaftAppContext) option
  let saveProject (id : ProjectId) (committer : Signature) msg state : (Commit * RaftAppContext) option =
    match findProject id state with
      | Some project ->
        try
          match save committer msg project with
          | Some (commit, project) ->
            (commit, { state with Projects = Map.add id project state.Projects })
            |> Some
          | _ ->
            None
        with
          | exn -> None
      | _ -> None

  /// ## Create a new Project
  ///
  /// Create a new `Project`, save it to disk and load it into given RaftAppContext.
  ///
  /// ### Signature:
  /// - name: Project name
  /// - path: destination path for new Project
  /// - committer: signature of the person creating the project
  /// - state: current RaftAppContext
  ///
  /// Returns: (Project * RaftAppContext) option
  let createProject name path (committer: Signature) state : (Project * RaftAppContext) option =
    let now = System.DateTime.Now
    let msg = sprintf "On %s, %s created %s" (now.ToLongTimeString()) committer.Name name
    let project = { Project.Create name with Path = Some(path) }

    match addProject project state with
      | Some state ->
        match saveProject project.Id committer msg state with
          | Some (commit, state) -> Some (project, state)
          | _                    -> None
      | _ -> None

  /// ## Close/unload a loaded project
  ///
  /// Attempt to close a loaded project. If the project was not loaded, indicate failure by
  /// returning `None`.
  ///
  /// ### Signature:
  /// - id: ProjectId of Project to remove
  /// - state: current RaftAppContext
  ///
  /// Returns: RaftAppContext option
  let closeProject (id : ProjectId) (state : RaftAppContext) : RaftAppContext option =
    if Map.containsKey id state.Projects then
      { state with Projects = Map.remove id state.Projects } |> Some
    else None

  /// ## Check if a project is loaded
  ///
  /// Try to find a given `ProjectId` in the passed `RaftAppContext`.
  ///
  /// ### Signature:
  /// - id: ProjectId to search for
  /// - state: RaftAppContext to search project in
  ///
  /// Returns: boolean
  let projectLoaded (id : ProjectId) (state : RaftAppContext) : bool =
    findProject id state |> Option.isSome

  //  _   _           _
  // | \ | | ___   __| | ___  ___
  // |  \| |/ _ \ / _` |/ _ \/ __|
  // | |\  | (_) | (_| |  __/\__ \
  // |_| \_|\___/ \__,_|\___||___/

  /// ## Add a Node to current RaftAppContext
  ///
  /// Add a new node to current `Raft` and `RaftAppContext`.
  ///
  /// ### Signature:
  /// - node: the Node to add
  /// - state: the RaftAppContext to add it to
  ///
  /// Returns: RaftAppContext
  let addNode (node: string) (state: RaftAppContext) : RaftAppContext =
    failwith "FIXME: implement addNode RaftAppContext"

  let updateMember (newmem: string) (state: RaftAppContext) : RaftAppContext =
    failwith "FIXME: implement updateMember RaftAppContext"

  let removeMember (mem: string) (state: RaftAppContext) : RaftAppContext =
    failwith "FIXME: implement removeNode RaftAppContext"

  *)