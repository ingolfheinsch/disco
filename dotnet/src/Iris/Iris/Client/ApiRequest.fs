namespace Iris.Client

// * Imports

open System
open Iris.Core
open Iris.Raft
open FlatBuffers
open Iris.Serialization

// * ApiError

[<RequireQualifiedAccess>]
type ApiError =
  | Internal         of string
  | UnknownCommand   of string
  | MalformedRequest of string

  override error.ToString() =
    match error with
    | Internal         str -> String.Format("Internal: {0}", str)
    | UnknownCommand   str -> String.Format("UnknownCommand: {0}", str)
    | MalformedRequest str -> String.Format("MalformedRequest: {0}", str)

  member error.ToOffset(builder: FlatBufferBuilder) =
    match error with
    | Internal         str ->
      let err = builder.CreateString str
      ApiErrorFB.StartApiErrorFB(builder)
      ApiErrorFB.AddType(builder, ApiErrorTypeFB.InternalFB)
      ApiErrorFB.AddData(builder, err)
      ApiErrorFB.EndApiErrorFB(builder)

    | UnknownCommand   str ->
      let err = builder.CreateString str
      ApiErrorFB.StartApiErrorFB(builder)
      ApiErrorFB.AddType(builder, ApiErrorTypeFB.UnknownCommandFB)
      ApiErrorFB.AddData(builder, err)
      ApiErrorFB.EndApiErrorFB(builder)

    | MalformedRequest str ->
      let err = builder.CreateString str
      ApiErrorFB.StartApiErrorFB(builder)
      ApiErrorFB.AddType(builder, ApiErrorTypeFB.MalformedRequestFB)
      ApiErrorFB.AddData(builder, err)
      ApiErrorFB.EndApiErrorFB(builder)

  static member FromFB(fb: ApiErrorFB) =
    match fb.Type with
    | ApiErrorTypeFB.InternalFB         ->
      Internal fb.Data
      |> Either.succeed
    | ApiErrorTypeFB.UnknownCommandFB   ->
      UnknownCommand fb.Data
      |> Either.succeed
    | ApiErrorTypeFB.MalformedRequestFB ->
      MalformedRequest fb.Data
      |> Either.succeed
    | x ->
      sprintf "Unknown ApiErrorFB: %A" x
      |> Error.asClientError "ApiErrorFB.FromFB"
      |> Either.fail

// * ApiRequest

type ApiRequest =
  | Snapshot   of State
  | Update     of StateMachine
  | Register   of IrisClient
  | UnRegister of IrisClient

  // ** ToOffset

  member request.ToOffset(builder: FlatBufferBuilder) =
    let inline withPayload param cmd (value: Offset<'a>) =
      ApiRequestFB.StartApiRequestFB(builder)
      ApiRequestFB.AddCommand(builder, cmd)
      ApiRequestFB.AddParameterType(builder, param)
      ApiRequestFB.AddParameter(builder, value.Value)
      ApiRequestFB.EndApiRequestFB(builder)

    let withoutPayload param cmd =
      ApiRequestFB.StartApiRequestFB(builder)
      ApiRequestFB.AddCommand(builder, cmd)
      ApiRequestFB.AddParameterType(builder, param)
      ApiRequestFB.EndApiRequestFB(builder)

    match request with
    //  ____                        _           _
    // / ___| _ __   __ _ _ __  ___| |__   ___ | |_
    // \___ \| '_ \ / _` | '_ \/ __| '_ \ / _ \| __|
    //  ___) | | | | (_| | |_) \__ \ | | | (_) | |_
    // |____/|_| |_|\__,_| .__/|___/_| |_|\___/ \__|
    //                   |_|
    | Snapshot state ->
      state
      |> Binary.toOffset builder
      |> withPayload ParameterFB.StateFB ApiCommandFB.SnapshotFB

    //  ____            _     _             _   _
    // |  _ \ ___  __ _(_)___| |_ _ __ __ _| |_(_) ___  _ __
    // | |_) / _ \/ _` | / __| __| '__/ _` | __| |/ _ \| '_ \
    // |  _ <  __/ (_| | \__ \ |_| | | (_| | |_| | (_) | | | |
    // |_| \_\___|\__, |_|___/\__|_|  \__,_|\__|_|\___/|_| |_|
    //            |___/

    | Register client ->
      client
      |> Binary.toOffset builder
      |> withPayload ParameterFB.IrisClientFB ApiCommandFB.RegisterFB

    | UnRegister client ->
      client
      |> Binary.toOffset builder
      |> withPayload ParameterFB.IrisClientFB ApiCommandFB.UnRegisterFB

    //  _   _           _       _
    // | | | |_ __   __| | __ _| |_ ___
    // | | | | '_ \ / _` |/ _` | __/ _ \
    // | |_| | |_) | (_| | (_| | ||  __/
    //  \___/| .__/ \__,_|\__,_|\__\___|
    //       |_|

    | Update UnloadProject -> withoutPayload ParameterFB.NONE ApiCommandFB.UnloadFB

    | Update (UpdateProject project) ->
      project
      |> Binary.toOffset builder
      |> withPayload ParameterFB.ProjectFB ApiCommandFB.UpdateFB

    | Update (CommandBatch batch) ->
      batch
      |> Binary.toOffset builder
      |> withPayload ParameterFB.CommandBatchFB ApiCommandFB.BatchFB

    | Update (AddCuePlayer    player as cmd)
    | Update (UpdateCuePlayer player as cmd)
    | Update (RemoveCuePlayer player as cmd) ->
      player
      |> Binary.toOffset builder
      |> withPayload ParameterFB.CuePlayerFB cmd.ApiCommand

    | Update (AddClient    client as cmd)
    | Update (UpdateClient client as cmd)
    | Update (RemoveClient client as cmd) ->
      client
      |> Binary.toOffset builder
      |> withPayload ParameterFB.IrisClientFB cmd.ApiCommand

    | Update (AddMember    mem as cmd)
    | Update (UpdateMember mem as cmd)
    | Update (RemoveMember mem as cmd) ->
      mem
      |> Binary.toOffset builder
      |> withPayload ParameterFB.RaftMemberFB cmd.ApiCommand

    | Update (AddPinGroup    group as cmd)
    | Update (UpdatePinGroup group as cmd)
    | Update (RemovePinGroup group as cmd) ->
      group
      |> Binary.toOffset builder
      |> withPayload ParameterFB.PinGroupFB cmd.ApiCommand

    | Update (AddPin    pin as cmd)
    | Update (UpdatePin pin as cmd)
    | Update (RemovePin pin as cmd) ->
      pin
      |> Binary.toOffset builder
      |> withPayload ParameterFB.PinFB cmd.ApiCommand

    | Update (AddCue    cue as cmd)
    | Update (UpdateCue cue as cmd)
    | Update (RemoveCue cue as cmd) ->
      cue
      |> Binary.toOffset builder
      |> withPayload ParameterFB.CueFB cmd.ApiCommand

    | Update (AddCueList    cuelist as cmd)
    | Update (UpdateCueList cuelist as cmd)
    | Update (RemoveCueList cuelist as cmd) ->
      cuelist
      |> Binary.toOffset builder
      |> withPayload ParameterFB.CueListFB cmd.ApiCommand

    | Update (AddUser    user as cmd)
    | Update (UpdateUser user as cmd)
    | Update (RemoveUser user as cmd) ->
      user
      |> Binary.toOffset builder
      |> withPayload ParameterFB.UserFB cmd.ApiCommand

    | Update (AddSession    session as cmd)
    | Update (UpdateSession session as cmd)
    | Update (RemoveSession session as cmd) ->
      session
      |> Binary.toOffset builder
      |> withPayload ParameterFB.SessionFB cmd.ApiCommand

    | Update (AddDiscoveredService    service as cmd)
    | Update (UpdateDiscoveredService service as cmd)
    | Update (RemoveDiscoveredService service as cmd) ->
      service
      |> Binary.toOffset builder
      |> withPayload ParameterFB.DiscoveredServiceFB cmd.ApiCommand

    | Update (UpdateSlices slices as cmd) ->
      slices
      |> Binary.toOffset builder
      |> withPayload ParameterFB.SlicesFB cmd.ApiCommand

    // CLOCK
    | Update (UpdateClock tick) ->
      ClockFB.CreateClockFB(builder, tick)
      |> withPayload ParameterFB.ClockFB ApiCommandFB.UpdateFB

    // SNAPSHOT
    | Update (DataSnapshot state) ->
      state
      |> Binary.toOffset builder
      |> withPayload ParameterFB.StateFB ApiCommandFB.SnapshotFB

    // LOG
    | Update (LogMsg log) ->
      log
      |> Binary.toOffset builder
      |> withPayload ParameterFB.LogEventFB ApiCommandFB.LogEventFB

    // SET LOG LEVEL
    | Update (SetLogLevel level) ->
      let offset = string level |> builder.CreateString
      StringFB.CreateStringFB(builder, offset)
      |> withPayload ParameterFB.StringFB ApiCommandFB.SetLogLevelFB

    // CALL CUE
    | Update (CallCue cue) ->
      cue
      |> Binary.toOffset builder
      |> withPayload ParameterFB.CueFB ApiCommandFB.CallCueFB

    | Update (Command AppCommand.Undo)  -> withoutPayload ParameterFB.NONE ApiCommandFB.UndoFB
    | Update (Command AppCommand.Redo)  -> withoutPayload ParameterFB.NONE ApiCommandFB.RedoFB
    | Update (Command AppCommand.Reset) -> withoutPayload ParameterFB.NONE ApiCommandFB.ResetFB
    | Update (Command AppCommand.Save)  -> withoutPayload ParameterFB.NONE ApiCommandFB.SaveFB

  // ** FromFB

  static member FromFB(fb: ApiRequestFB) =
    match fb.Command, fb.ParameterType with

    //  ____                        _           _
    // / ___| _ __   __ _ _ __  ___| |__   ___ | |_
    // \___ \| '_ \ / _` | '_ \/ __| '_ \ / _ \| __|
    //  ___) | | | | (_| | |_) \__ \ | | | (_) | |_
    // |____/|_| |_|\__,_| .__/|___/_| |_|\___/ \__|
    //                   |_|
    | ApiCommandFB.SnapshotFB, ParameterFB.StateFB ->
      either {
        let! state =
          let statish = fb.Parameter<StateFB>()
          if statish.HasValue then
            let value = statish.Value
            State.FromFB(value)
          else
            "Empty StateFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return Snapshot state
      }

    //   ____ _ _            _
    //  / ___| (_) ___ _ __ | |_
    // | |   | | |/ _ \ '_ \| __|
    // | |___| | |  __/ | | | |_
    //  \____|_|_|\___|_| |_|\__|

    | ApiCommandFB.RegisterFB, ParameterFB.IrisClientFB ->
      let clientish = fb.Parameter<IrisClientFB>()
      if clientish.HasValue then
        either {
          let value = clientish.Value
          let! client = IrisClient.FromFB(value)
          return Register client
        }
      else
        "Empty IrisClientFB Parameter in ApiRequest"
        |> Error.asClientError "ApiRequest.FromFB"
        |> Either.fail

    | ApiCommandFB.UnRegisterFB, ParameterFB.IrisClientFB ->
      let clientish = fb.Parameter<IrisClientFB>()
      if clientish.HasValue then
        either {
          let value = clientish.Value
          let! client = IrisClient.FromFB(value)
          return UnRegister client
        }
      else
        "Empty IrisClientFB Parameter in ApiRequest"
        |> Error.asClientError "ApiRequest.FromFB"
        |> Either.fail

    //  ____            _           _
    // |  _ \ _ __ ___ (_) ___  ___| |_
    // | |_) | '__/ _ \| |/ _ \/ __| __|
    // |  __/| | | (_) | |  __/ (__| |_
    // |_|   |_|  \___// |\___|\___|\__|
    //               |__/

    | ApiCommandFB.UnloadFB, _ ->
      UnloadProject
      |> ApiRequest.Update
      |> Either.succeed

    | ApiCommandFB.UpdateFB, ParameterFB.ProjectFB ->
      either {
        let! project =
          let projectish = fb.Parameter<ProjectFB>()
          if projectish.HasValue then
            let value = projectish.Value
            IrisProject.FromFB value
          else
            "Empty IrisProjectFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateProject project)
      }

    //   ____                                          _ ____        _       _
    //  / ___|___  _ __ ___  _ __ ___   __ _ _ __   __| | __ )  __ _| |_ ___| |__
    // | |   / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` |  _ \ / _` | __/ __| '_ \
    // | |__| (_) | | | | | | | | | | | (_| | | | | (_| | |_) | (_| | || (__| | | |
    //  \____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|____/ \__,_|\__\___|_| |_|

    | ApiCommandFB.BatchFB, ParameterFB.CommandBatchFB ->
      either {
        let! commands =
          let batchish = fb.Parameter<CommandBatchFB>()
          if batchish.HasValue then
            let batch = batchish.Value
            StateMachineBatch.FromFB batch
          else
            "Empty CommandBatchFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail

        return ApiRequest.Update (CommandBatch commands)
      }

    //   ____           ____  _
    //  / ___|   _  ___|  _ \| | __ _ _   _  ___ _ __
    // | |  | | | |/ _ \ |_) | |/ _` | | | |/ _ \ '__|
    // | |__| |_| |  __/  __/| | (_| | |_| |  __/ |
    //  \____\__,_|\___|_|   |_|\__,_|\__, |\___|_|
    //                                |___/

    | ApiCommandFB.AddFB, ParameterFB.CuePlayerFB ->
      either {
        let! player =
          let playerish = fb.Parameter<CuePlayerFB>()
          if playerish.HasValue then
            let value = playerish.Value
            CuePlayer.FromFB value
          else
            "Empty CuePlayer payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddCuePlayer player)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.CuePlayerFB ->
      either {
        let! player =
          let playerish = fb.Parameter<CuePlayerFB>()
          if playerish.HasValue then
            let value = playerish.Value
            CuePlayer.FromFB value
          else
            "Empty CuePlayer payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateCuePlayer player)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.CuePlayerFB ->
      either {
        let! player =
          let playerish = fb.Parameter<CuePlayerFB>()
          if playerish.HasValue then
            let value = playerish.Value
            CuePlayer.FromFB value
          else
            "Empty CuePlayer payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveCuePlayer player)
      }

    //   ____ _ _            _
    //  / ___| (_) ___ _ __ | |_
    // | |   | | |/ _ \ '_ \| __|
    // | |___| | |  __/ | | | |_
    //  \____|_|_|\___|_| |_|\__|

    | ApiCommandFB.AddFB, ParameterFB.IrisClientFB ->
      either {
        let! client =
          let clientish = fb.Parameter<IrisClientFB>()
          if clientish.HasValue then
            let value = clientish.Value
            IrisClient.FromFB value
          else
            "Empty IrisClientFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddClient client)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.IrisClientFB ->
      either {
        let! client =
          let clientish = fb.Parameter<IrisClientFB>()
          if clientish.HasValue then
            let value = clientish.Value
            IrisClient.FromFB value
          else
            "Empty IrisClientFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateClient client)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.IrisClientFB ->
      either {
        let! client =
          let clientish = fb.Parameter<IrisClientFB>()
          if clientish.HasValue then
            let value = clientish.Value
            IrisClient.FromFB value
          else
            "Empty IrisClientFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveClient client)
      }

    //  __  __                _
    // |  \/  | ___ _ __ ___ | |__   ___ _ __
    // | |\/| |/ _ \ '_ ` _ \| '_ \ / _ \ '__|
    // | |  | |  __/ | | | | | |_) |  __/ |
    // |_|  |_|\___|_| |_| |_|_.__/ \___|_|

    | ApiCommandFB.AddFB, ParameterFB.RaftMemberFB ->
      either {
        let! mem =
          let memish = fb.Parameter<RaftMemberFB>()
          if memish.HasValue then
            let value = memish.Value
            RaftMember.FromFB value
          else
            "Empty RaftMemberFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddMember mem)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.RaftMemberFB ->
      either {
        let! mem =
          let memish = fb.Parameter<RaftMemberFB>()
          if memish.HasValue then
            let value = memish.Value
            RaftMember.FromFB value
          else
            "Empty RaftMemberFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateMember mem)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.RaftMemberFB ->
      either {
        let! mem =
          let memish = fb.Parameter<RaftMemberFB>()
          if memish.HasValue then
            let value = memish.Value
            RaftMember.FromFB value
          else
            "Empty RaftMemberFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveMember mem)
      }

    //  ____       _       _
    // |  _ \ __ _| |_ ___| |__
    // | |_) / _` | __/ __| '_ \
    // |  __/ (_| | || (__| | | |
    // |_|   \__,_|\__\___|_| |_|

    | ApiCommandFB.AddFB, ParameterFB.PinGroupFB ->
      either {
        let! group =
          let groupish = fb.Parameter<PinGroupFB>()
          if groupish.HasValue then
            let value = groupish.Value
            PinGroup.FromFB value
          else
            "Empty PinGroupFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddPinGroup group)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.PinGroupFB ->
      either {
        let! group =
          let groupish = fb.Parameter<PinGroupFB>()
          if groupish.HasValue then
            let value = groupish.Value
            PinGroup.FromFB value
          else
            "Empty PinGroupFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdatePinGroup group)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.PinGroupFB ->
      either {
        let! group =
          let groupish = fb.Parameter<PinGroupFB>()
          if groupish.HasValue then
            let value = groupish.Value
            PinGroup.FromFB value
          else
            "Empty PinGroupFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemovePinGroup group)
      }

    //  ____  _
    // |  _ \(_)_ __
    // | |_) | | '_ \
    // |  __/| | | | |
    // |_|   |_|_| |_|

    | ApiCommandFB.AddFB, ParameterFB.PinFB ->
      either {
        let! pin =
          let pinish = fb.Parameter<PinFB>()
          if pinish.HasValue then
            let value = pinish.Value
            Pin.FromFB value
          else
            "Empty PinFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddPin pin)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.PinFB ->
      either {
        let! pin =
          let pinish = fb.Parameter<PinFB>()
          if pinish.HasValue then
            let value = pinish.Value
            Pin.FromFB value
          else
            "Empty PinFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdatePin pin)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.PinFB ->
      either {
        let! pin =
          let pinish = fb.Parameter<PinFB>()
          if pinish.HasValue then
            let value = pinish.Value
            Pin.FromFB value
          else
            "Empty PinFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemovePin pin)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.SlicesFB ->
      either {
        let! slices =
          let slicish = fb.Parameter<SlicesFB>()
          if slicish.HasValue then
            let value = slicish.Value
            Slices.FromFB value
          else
            "Empty SlicesFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateSlices slices)
      }

    //   ____
    //  / ___|   _  ___
    // | |  | | | |/ _ \
    // | |__| |_| |  __/
    //  \____\__,_|\___|

    | ApiCommandFB.AddFB, ParameterFB.CueFB ->
      either {
        let! cue =
          let cueish = fb.Parameter<CueFB>()
          if cueish.HasValue then
            let value = cueish.Value
            Cue.FromFB value
          else
            "Empty CueFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddCue cue)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.CueFB ->
      either {
        let! cue =
          let cueish = fb.Parameter<CueFB>()
          if cueish.HasValue then
            let value = cueish.Value
            Cue.FromFB value
          else
            "Empty CueFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateCue cue)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.CueFB ->
      either {
        let! cue =
          let cueish = fb.Parameter<CueFB>()
          if cueish.HasValue then
            let value = cueish.Value
            Cue.FromFB value
          else
            "Empty CueFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveCue cue)
      }
    | ApiCommandFB.CallCueFB, ParameterFB.CueFB ->
      either {
        let! cue =
          let cueish = fb.Parameter<CueFB>()
          if cueish.HasValue then
            let value = cueish.Value
            Cue.FromFB value
          else
            "Empty CueFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (CallCue cue)
      }

    //   ____           _     _     _
    //  / ___|   _  ___| |   (_)___| |_
    // | |  | | | |/ _ \ |   | / __| __|
    // | |__| |_| |  __/ |___| \__ \ |_
    //  \____\__,_|\___|_____|_|___/\__|

    | ApiCommandFB.AddFB, ParameterFB.CueListFB ->
      either {
        let! cueList =
          let cueListish = fb.Parameter<CueListFB>()
          if cueListish.HasValue then
            let value = cueListish.Value
            CueList.FromFB value
          else
            "Empty CueListFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddCueList cueList)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.CueListFB ->
      either {
        let! cueList =
          let cueListish = fb.Parameter<CueListFB>()
          if cueListish.HasValue then
            let value = cueListish.Value
            CueList.FromFB value
          else
            "Empty CueListFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateCueList cueList)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.CueListFB ->
      either {
        let! cueList =
          let cueListish = fb.Parameter<CueListFB>()
          if cueListish.HasValue then
            let value = cueListish.Value
            CueList.FromFB value
          else
            "Empty CueListFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveCueList cueList)
      }

    //  _   _
    // | | | |___  ___ _ __
    // | | | / __|/ _ \ '__|
    // | |_| \__ \  __/ |
    //  \___/|___/\___|_|

    | ApiCommandFB.AddFB, ParameterFB.UserFB ->
      either {
        let! user =
          let userish = fb.Parameter<UserFB>()
          if userish.HasValue then
            let value = userish.Value
            User.FromFB value
          else
            "Empty UserFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddUser user)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.UserFB ->
      either {
        let! user =
          let userish = fb.Parameter<UserFB>()
          if userish.HasValue then
            let value = userish.Value
            User.FromFB value
          else
            "Empty UserFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateUser user)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.UserFB ->
      either {
        let! user =
          let userish = fb.Parameter<UserFB>()
          if userish.HasValue then
            let value = userish.Value
            User.FromFB value
          else
            "Empty UserFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveUser user)
      }

    //  ____                _
    // / ___|  ___  ___ ___(_) ___  _ __
    // \___ \ / _ \/ __/ __| |/ _ \| '_ \
    //  ___) |  __/\__ \__ \ | (_) | | | |
    // |____/ \___||___/___/_|\___/|_| |_|

    | ApiCommandFB.AddFB, ParameterFB.SessionFB ->
      either {
        let! session =
          let sessionish = fb.Parameter<SessionFB>()
          if sessionish.HasValue then
            let value = sessionish.Value
            Session.FromFB value
          else
            "Empty SessionFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddSession session)
      }
    | ApiCommandFB.UpdateFB, ParameterFB.SessionFB ->
      either {
        let! session =
          let sessionish = fb.Parameter<SessionFB>()
          if sessionish.HasValue then
            let value = sessionish.Value
            Session.FromFB value
          else
            "Empty SessionFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateSession session)
      }
    | ApiCommandFB.RemoveFB, ParameterFB.SessionFB ->
      either {
        let! session =
          let sessionish = fb.Parameter<SessionFB>()
          if sessionish.HasValue then
            let value = sessionish.Value
            Session.FromFB value
          else
            "Empty SessionFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveSession session)
      }

    //  ____  _                                     _
    // |  _ \(_)___  ___ _____   _____ _ __ ___  __| |
    // | | | | / __|/ __/ _ \ \ / / _ \ '__/ _ \/ _` |
    // | |_| | \__ \ (_| (_) \ V /  __/ | |  __/ (_| |
    // |____/|_|___/\___\___/ \_/ \___|_|  \___|\__,_|

    | ApiCommandFB.AddFB, ParameterFB.DiscoveredServiceFB ->
      either {
        let! service =
          let serviceish = fb.Parameter<DiscoveredServiceFB>()
          if serviceish.HasValue then
            let value = serviceish.Value
            DiscoveredService.FromFB value
          else
            "Empty DiscoveredServiceFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (AddDiscoveredService service)
      }

    | ApiCommandFB.UpdateFB, ParameterFB.DiscoveredServiceFB ->
      either {
        let! service =
          let serviceish = fb.Parameter<DiscoveredServiceFB>()
          if serviceish.HasValue then
            let value = serviceish.Value
            DiscoveredService.FromFB value
          else
            "Empty DiscoveredServiceFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateDiscoveredService service)
      }

    | ApiCommandFB.RemoveFB, ParameterFB.DiscoveredServiceFB ->
      either {
        let! service =
          let serviceish = fb.Parameter<DiscoveredServiceFB>()
          if serviceish.HasValue then
            let value = serviceish.Value
            DiscoveredService.FromFB value
          else
            "Empty DiscoveredServiceFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (RemoveDiscoveredService service)
      }

    //  _
    // | |    ___   __ _
    // | |   / _ \ / _` |
    // | |__| (_) | (_| |
    // |_____\___/ \__, |
    //             |___/

    | ApiCommandFB.LogEventFB, ParameterFB.LogEventFB ->
      either {
        let! log =
          let logish = fb.Parameter<LogEventFB>()
          if logish.HasValue then
            let value = logish.Value
            LogEvent.FromFB value
          else
            "Empty LogEventFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (LogMsg log)
      }

    | ApiCommandFB.SetLogLevelFB, _ ->
      either {
        let! level =
          let levelish = fb.Parameter<StringFB>()
          if levelish.HasValue then
            let value = levelish.Value
            LogLevel.TryParse value.Value
          else
            "Empty StringFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (SetLogLevel level)
      }

    //   ____ _            _
    //  / ___| | ___   ___| | __
    // | |   | |/ _ \ / __| |/ /
    // | |___| | (_) | (__|   <
    //  \____|_|\___/ \___|_|\_\

    | ApiCommandFB.UpdateFB, ParameterFB.ClockFB ->
      either {
        let! clock =
          let clockish = fb.Parameter<ClockFB>()
          if clockish.HasValue then
            let value = clockish.Value
            Right value.Value
          else
            "Empty ClockFB payload"
            |> Error.asParseError "ApiRequest.FromFB"
            |> Either.fail
        return ApiRequest.Update (UpdateClock clock)
      }

    //   ____               _
    //  / ___|_ __ ___   __| |
    // | |   | '_ ` _ \ / _` |
    // | |___| | | | | | (_| |
    //  \____|_| |_| |_|\__,_|

    | ApiCommandFB.UndoFB, _ ->
      AppCommand.Undo
      |> Command
      |> ApiRequest.Update
      |> Either.succeed

    | ApiCommandFB.RedoFB, _ ->
      AppCommand.Redo
      |> Command
      |> ApiRequest.Update
      |> Either.succeed

    | ApiCommandFB.ResetFB, _ ->
      AppCommand.Reset
      |> Command
      |> ApiRequest.Update
      |> Either.succeed

    | x,y ->
      sprintf "Unknown Command/Type combination in ApiRequest: %A/%A" x y
      |> Error.asClientError "ApiRequest.FromFB"
      |> Either.fail

  // ** ToBytes

  member request.ToBytes() =
    Binary.buildBuffer request

  // ** FromBytes

  static member FromBytes(raw: byte array) =
    raw
    |> Binary.createBuffer
    |> ApiRequestFB.GetRootAsApiRequestFB
    |> ApiRequest.FromFB

// * ApiResponse

//     _          _ ____
//    / \   _ __ (_)  _ \ ___  ___ _ __   ___  _ __  ___  ___
//   / _ \ | '_ \| | |_) / _ \/ __| '_ \ / _ \| '_ \/ __|/ _ \
//  / ___ \| |_) | |  _ <  __/\__ \ |_) | (_) | | | \__ \  __/
// /_/   \_\ .__/|_|_| \_\___||___/ .__/ \___/|_| |_|___/\___|
//         |_|                    |_|

type ApiResponse =
  | Registered
  | Unregistered
  | NOK of ApiError

  member response.ToOffset(builder: FlatBufferBuilder) =
    match response with
    | Registered ->
      ApiResponseFB.StartApiResponseFB(builder)
      ApiResponseFB.AddStatus(builder, StatusFB.RegisteredFB)
      ApiResponseFB.EndApiResponseFB(builder)
    | Unregistered ->
      ApiResponseFB.StartApiResponseFB(builder)
      ApiResponseFB.AddStatus(builder, StatusFB.UnregisteredFB)
      ApiResponseFB.EndApiResponseFB(builder)
    | NOK error ->
      let err = error.ToOffset(builder)
      ApiResponseFB.StartApiResponseFB(builder)
      ApiResponseFB.AddStatus(builder, StatusFB.NOKFB)
      ApiResponseFB.AddError(builder, err)
      ApiResponseFB.EndApiResponseFB(builder)

  static member FromFB(fb: ApiResponseFB) =
    match fb.Status with
    | StatusFB.RegisteredFB   -> Right Registered
    | StatusFB.UnregisteredFB -> Right Unregistered
    | StatusFB.NOKFB  ->
      either {
        let! error =
          let errorish = fb.Error
          if errorish.HasValue then
            let value = errorish.Value
            ApiError.FromFB value
          else
            "Empty ApiErrorFB value"
            |> Error.asParseError "ApiResponse.FromFB"
            |> Either.fail
        return NOK error
      }
    | x ->
      sprintf "Unknown StatusFB value: %A" x
      |> Error.asParseError "ApiResponse.FromFB"
      |> Either.fail

  member request.ToBytes() =
    Binary.buildBuffer request

  static member FromBytes(raw: byte array) =
    Binary.createBuffer raw
    |> ApiResponseFB.GetRootAsApiResponseFB
    |> ApiResponse.FromFB
