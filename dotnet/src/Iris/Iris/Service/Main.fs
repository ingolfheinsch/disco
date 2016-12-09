﻿namespace Iris.Service

open Argu
open Iris.Core
open Iris.Service.CommandLine

[<AutoOpen>]
module Main =
  ////////////////////////////////////////
  //  __  __       _                    //
  // |  \/  | __ _(_)_ __               //
  // | |\/| |/ _` | | '_ \              //
  // | |  | | (_| | | | | |             //
  // |_|  |_|\__,_|_|_| |_|             //
  ////////////////////////////////////////

  [<EntryPoint>]
  let main args =
    let parsed =
      try
        parser.ParseCommandLine args
      with
        | exn -> Error.exitWith CliParseError

    validateOptions parsed

    let interactive = parsed.Contains <@ Interactive @>
    let web =
      match parsed.TryGetResult <@ Http @> with
      | Some basePath ->
        match bool.TryParse basePath with
        | true, false -> None
        | true, true -> Http.getDefaultBasePath() |> Some
        | false, _ -> System.IO.Path.GetFullPath basePath |> Some
      | None -> Http.getDefaultBasePath() |> Some

    #if FRONTEND_DEV
    printfn "Starting service for Frontend development..."
    Option.iter (printfn "HttpServer will serve from %s") web
    #endif

    let res =
      match parsed.GetResult <@ Cmd @>, parsed.TryGetResult <@ Dir @> with
      | Create,       _ -> createProject parsed
      | Start, Some dir -> startService web interactive dir
      | Reset, Some dir -> resetProject dir
      | Dump,  Some dir -> dumpDataDir dir
      | User,  Some dir -> addUser dir
      | Setup, Some dir -> setup (Some dir)
      | Setup,        _ -> setup None
      | Help,         _ -> help ()
      |  _ ->
        sprintf "Unexpected command line failure: %A" args
        |> ParseError
        |> Either.fail

    res
    |> Error.orExit id
    |> ignore

    Error.exitWith OK
