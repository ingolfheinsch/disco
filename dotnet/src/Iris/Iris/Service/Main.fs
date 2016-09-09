﻿namespace Iris.Service

open System
open System.Security.Cryptography
open System.Net
open System.Linq
open System.Threading
open System.Diagnostics

open Iris.Core
open Iris.Core.Utils
open Iris.Service.Types
open Iris.Service.Core
open Iris.Service.CommandLine
open Iris.Service.Raft.Server
open FSharpx.Functional
open LibGit2Sharp
open Argu
open ZeroMQ
open Iris.Raft
open Iris.Service.Raft.Db
open Iris.Service.Raft.Utilities

[<AutoOpen>]
module Main =

  //  ____  _             _
  // / ___|| |_ __ _ _ __| |_
  // \___ \| __/ _` | '__| __|
  //  ___) | || (_| | |  | |_
  // |____/ \__\__,_|_|   \__|

  let startRaft (projectdir: FilePath) =
    let projFile = IO.Path.Combine(projectdir, PROJECT_FILENAME)

    if IO.File.Exists projFile |> not then
      printfn "Project file not found. Aborting."
      exit 2

    match Project.Load(projFile) with
      | Some project ->
        use kontext = new ZContext()

        // 1. Initialise the application server from the supplied options
        // let options = parseOptions args
        use server = new RaftServer(project.Config, kontext)
        use wsserver = new WsServer(project.Config, server)
        use httpserver = new AssetServer(project.Config)

        server.OnConfigured <-
          Array.map (fun (node: RaftNode) -> string node.Id)
          >> Array.fold (fun s id -> sprintf "%s %s" s  id) "New Configuration with: "
          >> (fun str -> LogMsg(Iris.Core.LogLevel.Debug, str))
          >> wsserver.Broadcast

        server.OnLogMsg <- fun _ msg ->
          wsserver.Broadcast(LogMsg(Iris.Core.LogLevel.Debug, msg))

        server.OnNodeAdded   <- AddNode    >> wsserver.Broadcast
        server.OnNodeUpdated <- UpdateNode >> wsserver.Broadcast
        server.OnNodeRemoved <- RemoveNode >> wsserver.Broadcast

        server.OnApplyLog <- fun sm ->
          match sm with
          | AppEvent ae -> wsserver.Broadcast ae
          | _           -> printfn "DataSnapshots are not propagated to browsers"

        printfn "Starting Http Server on %d" project.Config.PortConfig.Http
        httpserver.Start()
        printfn "Starting WebSocket Server on %d" project.Config.PortConfig.WebSocket
        wsserver.Start()
        printfn "Starting Raft Server %d" project.Config.PortConfig.Raft
        server.Start()

        // 6. Start the console input loop.
        printfn "Welcome to the Raft REPL. Type help to see all commands."
        consoleLoop server
      | _ ->
        printfn "Could not load project. Aborting."
        exit 2

  //   ____                _
  //  / ___|_ __ ___  __ _| |_ ___
  // | |   | '__/ _ \/ _` | __/ _ \
  // | |___| | |  __/ (_| | ||  __/
  //  \____|_|  \___|\__,_|\__\___|

  let createDataDir (parsed: ParseResults<CLIArguments>) =
    let baseDir = parsed.GetResult <@ Dir @>
    let name = parsed.GetResult <@ Name @>
    let dir = IO.Path.Combine(baseDir, name)
    let raftDir = IO.Path.Combine(IO.Path.GetFullPath(dir), RAFT_DIRECTORY)

    if IO.Directory.Exists dir then
      let empty = IO.Directory.EnumerateFileSystemEntries(dir).Count() = 0
      if  not empty then
        printf "%A not empty. I clean first? y/n" dir
        match Console.ReadLine() with
          | "y" -> rmDir dir
          | _   -> exit 1

    mkDir dir
    mkDir raftDir

    let me = new Signature("Operator", "operator@localhost", new DateTimeOffset(DateTime.Now))

    let project  =
      let def = Project.Create(name)
      let cfg =
        def.Config
        |> updateEngine
          { def.Config.RaftConfig with
              DataDir     = raftDir
              BindAddress = parsed.GetResult <@ Bind @> }
        |> updatePorts
          { def.Config.PortConfig with
              WebSocket = parsed.GetResult <@ Ws @>
              Http = parsed.GetResult <@ Web @>
              Raft = parsed.GetResult <@ Raft @> }
      { def with
          Path = Some dir
          Config = cfg }

    match createDB raftDir with
      | Some db ->
        createRaft project.Config
        |> flip saveRaft db
        dispose db
        printfn "successfully created database"
      | _      -> printfn "unable to create database"

    match project.Save(me,"project created") with
      | Some(commit, project) ->
        printfn "project initialized in %A" project.Path
      | _ ->
        failwith "unable to create project"

  //  ____                _
  // |  _ \ ___  ___  ___| |_
  // | |_) / _ \/ __|/ _ \ __|
  // |  _ <  __/\__ \  __/ |_
  // |_| \_\___||___/\___|\__|

  let resetDataDir (datadir: FilePath) =
    match Project.Load(datadir </> PROJECT_FILENAME) with
    | Some project ->
      let raftDir = IO.Path.Combine(datadir, RAFT_DIRECTORY)
      if IO.Directory.Exists raftDir then
        rmDir raftDir

      mkDir raftDir

      match createDB raftDir with
      | Some db ->
        createRaft project.Config
        |> flip saveRaft db
        dispose db
        printfn "successfully reset database"
      | _ -> printfn "unable to reset database"

    | _ -> printfn "project could not be loaded. doing nothing.."

  //  ____
  // |  _ \ _   _ _ __ ___  _ __
  // | | | | | | | '_ ` _ \| '_ \
  // | |_| | |_| | | | | | | |_) |
  // |____/ \__,_|_| |_| |_| .__/
  //                       |_|

  let dumpDataDir (datadir: FilePath) =
    let raftDir = IO.Path.Combine(datadir, RAFT_DIRECTORY)
    match openDB raftDir with
      | Some db ->
        dumpDB db
        |> indent 4
        |> printfn "Database contents:\n%s"
      | _ ->
        printfn "No Database found at %A." raftDir

  ////////////////////////////////////////
  //  __  __       _                    //
  // |  \/  | __ _(_)_ __               //
  // | |\/| |/ _` | | '_ \              //
  // | |  | | (_| | | | | |             //
  // |_|  |_|\__,_|_|_| |_|             //
  ////////////////////////////////////////
  [<EntryPoint>]
  let main args =

    let cue : Cue =
      { Id = Id.Create(); Name = "Cue Baby"; IOBoxes = [| |] }
    in
      cue
      |> Json.encode
      |> fun json -> printfn "%s" json; json
      |> Json.decode<Cue>
      |> printfn "Cue: %A"

    let parsed =
      try
        parser.ParseCommandLine args
      with
        | _ ->
          printfn "%s" <| parser.Usage("Unable to parse command line. Usage: ")
          exit 2

    validateOptions parsed

    if parsed.Contains <@ Create @> then
      createDataDir parsed
    else
      match parsed.TryGetResult <@ Dir @> with
        | Some dir ->
          if parsed.Contains <@ Start @> then
            startRaft dir
          elif parsed.Contains <@ Reset @> then
            resetDataDir dir
          elif parsed.Contains <@ Dump @> then
            dumpDataDir dir
        | _ ->
          printfn "Missing project directory. Aborting"
          exit 2

    0
