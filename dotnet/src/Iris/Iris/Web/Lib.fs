module Iris.Web.Lib

//  _____                _                 _   __  __       _
// |  ___| __ ___  _ __ | |_ ___ _ __   __| | |  \/  | __ _(_)_ __
// | |_ | '__/ _ \| '_ \| __/ _ \ '_ \ / _` | | |\/| |/ _` | | '_ \
// |  _|| | | (_) | | | | ||  __/ | | | (_| | | |  | | (_| | | | | |
// |_|  |_|  \___/|_| |_|\__\___|_| |_|\__,_| |_|  |_|\__,_|_|_| |_|

open Iris.Core
open Iris.Web.Core
open Fable.Core

type [<Pojo; NoComparison>] StateInfo =
  { context: ClientContext; state: State }

let getCurrentSession(info: StateInfo) =
  match info.context.Session with
  | Some id ->
    info.state.Sessions |> Map.find id
  | None ->
    failwith "Context not initialized"

let login(info: StateInfo, username: string, password: string) =
  let curSession = getCurrentSession info
  { curSession with Status = { StatusType=Login; Payload=username+"\n"+password}}
  |> UpdateSession
  |> info.context.Post
