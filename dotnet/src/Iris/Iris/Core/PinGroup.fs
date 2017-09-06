namespace rec Iris.Core

// * Imports

#if FABLE_COMPILER

open Fable.Core
open Fable.Import
open Iris.Core.FlatBuffers
open Iris.Web.Core.FlatBufferTypes

#else

open System.IO
open FlatBuffers
open Iris.Serialization

#endif

open Path

// * PinGroupYaml

#if !FABLE_COMPILER && !IRIS_NODES

open SharpYaml.Serialization

type PinGroupYaml() =
  [<DefaultValue>] val mutable Id: string
  [<DefaultValue>] val mutable Name: string
  [<DefaultValue>] val mutable Path: string
  [<DefaultValue>] val mutable Client: string
  [<DefaultValue>] val mutable RefersTo: ReferencedValueYaml
  [<DefaultValue>] val mutable Pins: PinYaml array

  static member From (group: PinGroup) =
    let yml = PinGroupYaml()
    yml.Id <- string group.Id
    yml.Name <- unwrap group.Name
    yml.Client <- string group.Client
    yml.Path <- Option.defaultValue null (Option.map unwrap group.Path)
    yml.Pins <- group.Pins |> Map.toArray |> Array.map (snd >> Yaml.toYaml)
    Option.iter (fun reference -> yml.RefersTo <- Yaml.toYaml reference) group.RefersTo
    yml

  member yml.ToPinGroup() =
    either {
      let! pins =
        Array.fold
          (fun (m: Either<IrisError,Map<Id,Pin>>) pinyml -> either {
            let! pins = m
            let! (pin : Pin) = Yaml.fromYaml pinyml
            return Map.add pin.Id pin pins
          })
          (Right Map.empty)
          yml.Pins

      let path =
        if isNull yml.Path
        then None
        else Some (filepath yml.Path)

      let! refersTo =
        if isNull yml.RefersTo then
          Either.succeed None
        else
          Yaml.fromYaml yml.RefersTo
          |> Either.map Some

      return { Id = Id yml.Id
               Name = name yml.Name
               Path = path
               RefersTo = refersTo
               Client = Id yml.Client
               Pins = pins }
    }

// * ReferencedValueYaml

[<AllowNullLiteral>]
type ReferencedValueYaml() =
  [<DefaultValue>] val mutable Id: string
  [<DefaultValue>] val mutable Type: string

  static member From (value: ReferencedValue) =
    let yml = ReferencedValueYaml()
    match value with
    | ReferencedValue.Player id ->
      yml.Id <- string id
      yml.Type <- "Player"
    | ReferencedValue.Widget id ->
      yml.Id <- string id
      yml.Type <- "Widget"
    yml

  member yml.ToReferencedValue() =
    match yml.Type.ToLowerInvariant() with
    | "player" -> ReferencedValue.Player (Id yml.Id) |> Either.succeed
    | "widget" -> ReferencedValue.Widget (Id yml.Id) |> Either.succeed
    | other ->
      other
      |> String.format "Could not parse ReferencedValue type: {0}"
      |> Error.asParseError "ReferencedValueYaml.ToReferencedValue"
      |> Either.fail

#endif

// * ReferencedValue

[<RequireQualifiedAccess>]
type ReferencedValue =
  | Player of Id
  | Widget of Id

  // ** Id

  member reference.Id
    with get () = match reference with | Player id | Widget id -> id

  // ** ToYamlObject

  // __   __              _
  // \ \ / /_ _ _ __ ___ | |
  //  \ V / _` | '_ ` _ \| |
  //   | | (_| | | | | | | |
  //   |_|\__,_|_| |_| |_|_|

  #if !FABLE_COMPILER && !IRIS_NODES

  member reference.ToYamlObject () = ReferencedValueYaml.From(reference)

  // ** ToYaml

  member reference.ToYaml (serializer: Serializer) =
    reference
    |> Yaml.toYaml
    |> serializer.Serialize

  // ** FromYamlObject

  static member FromYamlObject (yml: ReferencedValueYaml) = yml.ToReferencedValue()

  // ** FromYaml

  static member FromYaml (str: string) : Either<IrisError,ReferencedValue> =
    let serializer = Serializer()
    let yml = serializer.Deserialize<ReferencedValueYaml>(str)
    Yaml.fromYaml yml

  #endif

  // ** FromFB

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  static member FromFB (fb: ReferencedValueFB) =
    #if FABLE_COMPILER
    match fb.Type with
    | x when x = ReferencedValueTypeFB.PlayerFB -> fb.Id |> Id |> Player |> Either.succeed
    | x when x = ReferencedValueTypeFB.WidgetFB -> fb.Id |> Id |> Widget |> Either.succeed
    | x ->
      x
      |> String.format "Could not parse unknown ReferencedValueTypeFB {0}"
      |> Error.asParseError "ReferencedValue.FromFB"
      |> Either.fail
    #else
    match fb.Type with
    | ReferencedValueTypeFB.PlayerFB -> fb.Id |> Id |> Player |> Either.succeed
    | ReferencedValueTypeFB.WidgetFB -> fb.Id |> Id |> Widget |> Either.succeed
    | other ->
      other
      |> String.format "Could not parse unknown ReferencedValueTypeFB {0}"
      |> Error.asParseError "ReferencedValue.FromFB"
      |> Either.fail
    #endif

  // ** ToOffset

  member reference.ToOffset(builder: FlatBufferBuilder) : Offset<ReferencedValueFB> =
    let id = reference.Id |> string |> builder.CreateString
    ReferencedValueFB.StartReferencedValueFB(builder)
    ReferencedValueFB.AddId(builder, id)
    match reference with
    | Player _ -> ReferencedValueFB.AddType(builder, ReferencedValueTypeFB.PlayerFB)
    | Widget _ -> ReferencedValueFB.AddType(builder, ReferencedValueTypeFB.WidgetFB)
    ReferencedValueFB.EndReferencedValueFB(builder)

  // ** ToBytes

  member reference.ToBytes() : byte[] = Binary.buildBuffer reference

  // ** FromBytes

  static member FromBytes (bytes: byte[]) : Either<IrisError,ReferencedValue> =
    Binary.createBuffer bytes
    |> ReferencedValueFB.GetRootAsReferencedValueFB
    |> ReferencedValue.FromFB

// * PinGroup

//  ____  _        ____
// |  _ \(_)_ __  / ___|_ __ ___  _   _ _ __
// | |_) | | '_ \| |  _| '__/ _ \| | | | '_ \
// |  __/| | | | | |_| | | | (_) | |_| | |_) |
// |_|   |_|_| |_|\____|_|  \___/ \__,_| .__/
//                                     |_|

type PinGroup =
  { Id: Id
    Name: Name
    Client: Id
    RefersTo: ReferencedValue option    /// optionally add a reference to a player/widget
    Path: FilePath option               /// optionally the location of this group on disk
    Pins: Map<Id,Pin> }

  // ** ToYamlObject

  // __   __              _
  // \ \ / /_ _ _ __ ___ | |
  //  \ V / _` | '_ ` _ \| |
  //   | | (_| | | | | | | |
  //   |_|\__,_|_| |_| |_|_|

  #if !FABLE_COMPILER && !IRIS_NODES

  member group.ToYamlObject () = PinGroupYaml.From(group)

  // ** ToYaml

  member self.ToYaml (serializer: Serializer) =
    self
    |> Yaml.toYaml
    |> serializer.Serialize

  // ** FromYamlObject

  static member FromYamlObject (yml: PinGroupYaml) = yml.ToPinGroup()

  // ** FromYaml

  static member FromYaml (str: string) : Either<IrisError,PinGroup> =
    let serializer = Serializer()
    let yml = serializer.Deserialize<PinGroupYaml>(str)
    Yaml.fromYaml yml

  #endif

  // ** FromFB

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  static member FromFB (fb: PinGroupFB) =
    either {
      let! pins =
        let arr = Array.zeroCreate fb.PinsLength
        Array.fold
          (fun (m: Either<IrisError,int * Map<Id,Pin>>) _ -> either {
              let! (i, pins) = m

              #if FABLE_COMPILER
              let! pin = i |> fb.Pins |> Pin.FromFB
              #else
              let! pin =
                let nullable = fb.Pins(i)
                if nullable.HasValue then
                  nullable.Value
                  |> Pin.FromFB
                else
                  "Could not parse empty PinFB"
                  |> Error.asParseError "PinGroup.FromFB"
                  |> Either.fail
              #endif

              return (i + 1, Map.add pin.Id pin pins)
            })
          (Right (0, Map.empty))
          arr
        |> Either.map snd

      let! refersTo =
        #if FABLE_COMPILER
        if isNull fb.RefersTo then
          Either.succeed None
        else
          fb.RefersTo
          |> ReferencedValue.FromFB
          |> Either.map Some
        #else
        let refish = fb.RefersTo
        if refish.HasValue then
          let value = refish.Value
          ReferencedValue.FromFB value
          |> Either.map Some
        else
          Either.succeed None
        #endif

      let path =
        if isNull fb.Path
        then None
        else Some (filepath fb.Path)

      return { Id = Id fb.Id
               Name = name fb.Name
               Path = path
               RefersTo = refersTo
               Client = Id fb.Client
               Pins = pins }
    }

  // ** ToOffset

  member self.ToOffset(builder: FlatBufferBuilder) : Offset<PinGroupFB> =
    let id = string self.Id |> builder.CreateString
    let name = self.Name |> unwrap |> Option.mapNull builder.CreateString
    let path = self.Path |> Option.map (unwrap >> builder.CreateString)
    let client = self.Client |> string |> builder.CreateString
    let refersTo = self.RefersTo |> Option.map (Binary.toOffset builder)
    let pinoffsets =
      self.Pins
      |> Map.toArray
      |> Array.map (fun (_,pin: Pin) -> pin.ToOffset(builder))

    let pins = PinGroupFB.CreatePinsVector(builder, pinoffsets)
    PinGroupFB.StartPinGroupFB(builder)
    PinGroupFB.AddId(builder, id)
    Option.iter (fun value -> PinGroupFB.AddName(builder,value)) name
    Option.iter (fun value -> PinGroupFB.AddPath(builder,value)) path
    Option.iter (fun value -> PinGroupFB.AddRefersTo(builder,value)) refersTo
    PinGroupFB.AddClient(builder, client)
    PinGroupFB.AddPins(builder, pins)
    PinGroupFB.EndPinGroupFB(builder)

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromBytes

  static member FromBytes (bytes: byte[]) : Either<IrisError,PinGroup> =
    Binary.createBuffer bytes
    |> PinGroupFB.GetRootAsPinGroupFB
    |> PinGroup.FromFB

  // ** HasParent

  /// PinGroups do live in nested directories, hence true
  member widget.HasParent with get () = true

  // ** Load

  //  _                    _
  // | |    ___   __ _  __| |
  // | |   / _ \ / _` |/ _` |
  // | |__| (_) | (_| | (_| |
  // |_____\___/ \__,_|\__,_|

  #if !FABLE_COMPILER && !IRIS_NODES

  static member Load(path: FilePath) : Either<IrisError, PinGroup> =
    IrisData.load path

  // ** LoadAll

  static member LoadAll(basePath: FilePath) : Either<IrisError, PinGroup array> =
    basePath </> filepath Constants.PINGROUP_DIR
    |> IrisData.loadAll

  // ** Save

  member group.Save (basePath: FilePath) =
    PinGroup.save basePath group

  // ** Delete

  member group.Delete (basePath: FilePath) =
    IrisData.delete basePath group


  // ** Persisted

  member group.Persisted
    with get () = PinGroup.persisted group

  // ** IsSaved

  member group.Exists (basePath: FilePath) =
    basePath </> PinGroup.assetPath group
    |> File.exists

  #endif

  // ** AssetPath

  //     _                 _   ____       _   _
  //    / \   ___ ___  ___| |_|  _ \ __ _| |_| |__
  //   / _ \ / __/ __|/ _ \ __| |_) / _` | __| '_ \
  //  / ___ \\__ \__ \  __/ |_|  __/ (_| | |_| | | |
  // /_/   \_\___/___/\___|\__|_|   \__,_|\__|_| |_|

  member pingroup.AssetPath
    with get () = PinGroup.assetPath pingroup

// * PinGroup module

module PinGroup =

  // ** isEmpty

  let isEmpty (group: PinGroup) =
    group.Pins.IsEmpty

  // ** create

  let create (groupName: Name) =
    { Id = Id.Create()
      Name = groupName
      Client = Id.Create()
      RefersTo = None
      Path = None
      Pins = Map.empty }

  // ** contains

  let contains (pin: PinId) (group: PinGroup) =
    Map.containsKey pin group.Pins

  // ** persisted

  let persisted (group: PinGroup) =
    group.Pins
    |> Map.filter (fun _ (pin: Pin) -> pin.Persisted)
    |> Map.isEmpty
    |> not

  // ** persistedPins

  let persistedPins (group: PinGroup) =
    Map.filter (fun _ (pin: Pin) -> pin.Persisted) group.Pins

  // ** volatilePins

  let volatilePins (group: PinGroup) =
    Map.filter (fun _ (pin: Pin) -> not pin.Persisted) group.Pins

  // ** removeVolatile

  let removeVolatile (group: PinGroup) =
    { group with Pins = persistedPins group }

  // ** save

  #if !FABLE_COMPILER && !IRIS_NODES

  let save basePath (group: PinGroup) =
    if persisted group then
      group
      |> removeVolatile
      |> IrisData.save basePath
    else Either.succeed ()

  #endif

  // ** assetPath

  let assetPath (group: PinGroup) =
    let fn = (string group.Id |> String.sanitize) + ASSET_EXTENSION
    let path = (string group.Client) <.> fn
    filepath PINGROUP_DIR </> path

  // ** findPin

  let findPin (id: Id) (group: PinGroup) =
    Map.find id group.Pins

  // ** tryFindPin

  let tryFindPin (id: Id) (group: PinGroup) =
    Map.tryFind id group.Pins

  // ** addPin

  let addPin (pin : Pin) (group : PinGroup) : PinGroup =
    if contains pin.Id group
    then   group
    else { group with Pins = Map.add pin.Id pin group.Pins }

  // ** updatePin

  let updatePin (pin : Pin) (group : PinGroup) : PinGroup =
    if contains pin.Id group
    then { group with Pins = Map.add pin.Id pin group.Pins }
    else   group

  // ** updateSlices

  let updateSlices (slices: Slices) (group : PinGroup) : PinGroup =
    match Map.tryFind slices.PinId group.Pins with
    | Some pin -> { group with Pins = Map.add pin.Id (Pin.setSlices slices pin) group.Pins }
    | None -> group

  // ** processSlices

  let processSlices (slices: Map<Id,Slices>) (group: PinGroup) : PinGroup =
    let mapper _ (pin: Pin) =
      match Map.tryFind pin.Id slices with
      | Some slices -> Pin.setSlices slices pin
      | None -> pin
    { group with Pins = Map.map mapper group.Pins }

  // ** removePin

  //                                    ____  _
  //  _ __ ___ _ __ ___   _____   _____|  _ \(_)_ __
  // | '__/ _ \ '_ ` _ \ / _ \ \ / / _ \ |_) | | '_ \
  // | | |  __/ | | | | | (_) \ V /  __/  __/| | | | |
  // |_|  \___|_| |_| |_|\___/ \_/ \___|_|   |_|_| |_|

  let removePin (pin : Pin) (group : PinGroup) : PinGroup =
    { group with Pins = Map.remove pin.Id group.Pins }

  // ** setPinsOffline

  let setPinsOffline (group: PinGroup) =
    { group with Pins = Map.map (fun _ pin -> Pin.setOnline false pin) group.Pins }

  // ** ofPlayer

  let ofPlayer (player: CuePlayer) =
    let client = Id Constants.CUEPLAYER_GROUP_DIR
    let call = Pin.Player.call     player.Id client
    let next = Pin.Player.next     player.Id client
    let prev = Pin.Player.previous player.Id client
    { Id = player.Id
      Name = name (unwrap player.Name + " (Cue Player)")
      Client = client
      Path = None
      RefersTo = Some (ReferencedValue.Player player.Id)
      Pins = Map.ofList
                [ (call.Id, call)
                  (next.Id, next)
                  (prev.Id, prev) ] }

  // ** ofWidget

  let ofWidget (widget: PinWidget) =
    { Id = widget.Id
      Name = name (unwrap widget.Name + " (Widget)")
      Client = Id Constants.PINWIDGET_GROUP_DIR
      RefersTo = Some (ReferencedValue.Widget widget.Id)
      Path = None
      Pins = Map.empty }

  // ** isPlayer

  let isPlayer (group: PinGroup) =
    match group.RefersTo with
    | Some (ReferencedValue.Player _) -> true
    | _ -> false

  // ** isWidget

  let isWidget (group: PinGroup) =
    match group.RefersTo with
    | Some (ReferencedValue.Widget _) -> true
    | _ -> false

  // ** filter

  let filter (pred: Pin -> bool) (group: PinGroup) =
    group.Pins
    |> Map.filter (fun _ pin -> pred pin)
    |> flip updatePins group

  // ** hasPresetPins

  let hasPresetPins (group: PinGroup) =
    group.Pins
    |> Map.filter (fun _ (pin: Pin) -> Pin.isPreset pin)
    |> Map.isEmpty
    |> not

  // ** hasUnifiedPins

  let hasUnifiedPins (group: PinGroup) =
    group.Pins
    |> Map.filter (fun _ (pin: Pin) -> Pin.isPreset pin |> not)
    |> Map.isEmpty
    |> not

  // ** updatePins

  let updatePins pins (group: PinGroup) =
    { group with Pins = pins }

  // ** unifiedPins

  let unifiedPins (group: PinGroup) =
    filter (Pin.isPreset >> not) group

  // ** presetPins

  let presetPins (group: PinGroup) =
    filter Pin.isPreset group

  // ** sinks

  let sinks (group: PinGroup) =
    filter Pin.isSink group

  // ** sources

  let sources (group: PinGroup) =
    filter Pin.isSource group

// * PinGroupMap

type GroupMap = Map<PinGroupId, PinGroup>

type PinGroupMap = PinGroupMap of Map<ClientId,GroupMap>
  with
    // ** Count

    member map.Count with get () = PinGroupMap.count map

    // ** ContainsGroup

    member map.ContainsGroup (client: ClientId) (group: PinGroupId) =
      PinGroupMap.containsGroup client group map

    // ** Item

    member map.Item (client, group) =
      PinGroupMap.findGroup client group map

    // ** Groups

    member map.Groups
      with get () = match map with PinGroupMap groups -> groups

    // ** ToOffset

    member map.ToOffset(builder: FlatBufferBuilder) =
      let vector =
        map.Groups
        |> Map.toArray
        |> Array.map (snd >> Map.toArray >> Array.map (snd >> Binary.toOffset builder))
        |> Array.concat
        |> fun arr -> PinGroupMapFB.CreateGroupsVector(builder, arr)
      PinGroupMapFB.StartPinGroupMapFB(builder)
      PinGroupMapFB.AddGroups(builder, vector)
      PinGroupMapFB.EndPinGroupMapFB(builder)

    // ** FromFB

    static member FromFB(fb: PinGroupMapFB) =
      [ 0 .. fb.GroupsLength - 1 ]
      |> List.fold
        (fun (m: Either<IrisError,Map<ClientId,GroupMap>>) idx -> either {
            let! current = m
            let! parsed =
              #if FABLE_COMPILER
              fb.Groups(idx)
              |> PinGroup.FromFB
              #else
              let groupish = fb.Groups(idx)
              if groupish.HasValue then
                let value = groupish.Value
                PinGroup.FromFB value
              else
                "Could not parse empty PinGroup value"
                |> Error.asParseError "PinGroupMap.FromFB"
                |> Either.fail
              #endif
            return
              match Map.tryFind parsed.Client current with
              | Some group -> Map.add parsed.Client (Map.add parsed.Id parsed group) current
              | None -> Map.add parsed.Client (Map.ofList [(parsed.Id,parsed)]) current
          })
        (Right Map.empty)
      |> Either.map PinGroupMap

    // ** ToBytes

    member self.ToBytes() : byte[] = Binary.buildBuffer self

    // ** FromBytes

    static member FromBytes (bytes: byte[]) : Either<IrisError,PinGroupMap> =
      Binary.createBuffer bytes
      |> PinGroupMapFB.GetRootAsPinGroupMapFB
      |> PinGroupMap.FromFB

    // ** Load

    #if !FABLE_COMPILER && !IRIS_NODES

    static member Load(path: FilePath) : Either<IrisError, PinGroupMap> =
      either {
        let! groups = Asset.loadAll path
        return PinGroupMap.ofArray groups
      }

    // ** Save

    member map.Save (basePath: FilePath) =
      Map.fold
        (fun (m: Either<IrisError,unit>) _ groups ->
          either {
            let! _ = m
            return! Map.fold (Asset.saveMap basePath) Either.nothing groups
          })
        Either.nothing
        map.Groups

    #endif

// * PinGroupMap module

module PinGroupMap =

  // ** empty

  let empty = PinGroupMap Map.empty

  // ** groups

  let groups (map: PinGroupMap) = map.Groups

  // ** add

  let add (group: PinGroup) (map: PinGroupMap) =
    let current = map.Groups
    match Map.tryFind group.Client current with
    | Some groups ->
      let groups = Map.add group.Id group groups
      Map.add group.Client groups current
      |> PinGroupMap
    | None ->
      Map.ofList [(group.Id,group)]
      |> fun groups -> Map.add group.Client groups current
      |> PinGroupMap

  // ** update

  let update = add

  // ** remove

  let remove (group: PinGroup) (map: PinGroupMap) =
    let current = map.Groups
    match Map.tryFind group.Client current with
    | None -> map
    | Some groups ->
      let groups = Map.remove group.Id groups
      if groups.IsEmpty then
        Map.remove group.Client current
        |> PinGroupMap
      else
        Map.add group.Client groups current
        |> PinGroupMap

  // ** containsGroup

  let containsGroup (client: ClientId) (group: PinGroupId) (map: PinGroupMap)  =
    match Map.tryFind client map.Groups with
    | Some groups -> Map.containsKey group groups
    | None -> false

  // ** containsPin

  let containsPin (client: ClientId) (group: PinGroupId) (pin: PinId) (map: PinGroupMap) =
    match Map.tryFind client map.Groups with
    | None -> false
    | Some groups -> Map.tryFind group groups |> function
      | Some group -> PinGroup.contains pin group
      | None -> false

  // ** modifyGroup

  let modifyGroup (f: PinGroup -> PinGroup) (client: ClientId) (group: PinGroupId) map =
    match map |> groups |> Map.tryFind client with
    | Some groups -> Map.tryFind group groups |> function
      | Some group ->
        let group = f group
        if PinGroup.isEmpty group
        then remove group map
        else update group map
      | None -> map
    | None -> map

  // ** addPin

  let addPin (pin: Pin) (map: PinGroupMap) =
    modifyGroup (PinGroup.addPin pin) pin.Client pin.PinGroup map

  // ** updatePin

  let updatePin (pin: Pin) (map: PinGroupMap) =
    modifyGroup (PinGroup.updatePin pin) pin.Client pin.PinGroup map

  // ** removePin

  let removePin (pin: Pin) (map: PinGroupMap) =
    modifyGroup (PinGroup.removePin pin) pin.Client pin.PinGroup map

  // ** fold

  let fold (f: 'a -> ClientId -> GroupMap -> 'a) (state: 'a) (map: PinGroupMap) =
    Map.fold f state map.Groups

  // ** foldGroups

  let foldGroups (f: 'a -> PinGroupId -> PinGroup -> 'a) (state: 'a) (map: PinGroupMap) =
    fold (fun s _ groups -> Map.fold f s groups) state map

  // ** iter

  let iter (f: ClientId -> GroupMap -> unit) (map: PinGroupMap) =
    Map.iter f map.Groups

  // ** iterGroups

  let iterGroups (f: PinGroup -> unit) (map: PinGroupMap) =
    iter (fun _ map -> Map.iter (fun _ group -> f group) map) map

  // ** map

  let map (f: ClientId -> GroupMap -> GroupMap) (map: PinGroupMap) =
    map.Groups |> Map.map f |> PinGroupMap

  // ** mapGroups

  let mapGroups (f: PinGroup -> PinGroup) (pgm: PinGroupMap) =
    map (fun _ groups -> Map.map (fun _ group -> f group) groups) pgm

  // ** count

  let count (map: PinGroupMap) =
    foldGroups (fun count _ _ -> count + 1) 0 map

  // ** updateSlices

  let updateSlices (slices: Map<Id,Slices>) (map: PinGroupMap) =
    mapGroups (PinGroup.processSlices slices) map

  // ** findPin

  let findPin (id: PinId) (map: PinGroupMap) : Map<ClientId,Pin> =
    foldGroups
      (fun out _ group ->
        group
        |> PinGroup.tryFindPin id
        |> Option.map (fun pin -> Map.add pin.Client pin out)
        |> Option.defaultValue out)
      Map.empty
      map

  // ** tryFindGroup

  let tryFindGroup (cid: ClientId) (pid: PinGroupId) (map: PinGroupMap) =
    foldGroups
      (fun out gid (group: PinGroup) ->
        if gid = pid && cid = group.Client
        then Some group
        else out)
      None
      map

  // ** findGroup

  let findGroup (client: ClientId) (group: PinGroupId) (map: PinGroupMap) =
    Map.find client map.Groups |> Map.find group

  // ** findGroupBy

  let findGroupBy (pred: PinGroup -> bool) (map: PinGroupMap) : Map<ClientId,PinGroup> =
    foldGroups
      (fun out _ group ->
        if pred group
        then Map.add group.Client group out
        else out)
      Map.empty
      map

  // ** byGroup

  let byGroup (map: PinGroupMap) =
    foldGroups
      (fun out gid group -> Map.add gid group out)
      Map.empty
      map

  // ** ofSeq

  let ofSeq (groups: PinGroup seq) =
    Seq.fold (flip add) empty groups

  // ** ofList

  let ofList (groups: PinGroup list) =
    ofSeq groups

  // ** ofArray

  let ofArray (groups: PinGroup array) =
    ofSeq groups

  // ** toList

  let toList (map: PinGroupMap) =
    foldGroups
      (fun groups _ group -> group :: groups)
      List.empty
      map

  // ** toSeq

  let toSeq (map: PinGroupMap) =
    map |> toList |> Seq.ofList

  // ** toArray

  let toArray (map: PinGroupMap) =
    map |> toList |> Array.ofList

  // ** filter

  let filter (pred: PinGroup -> bool) (map: PinGroupMap) =
    foldGroups
      (fun out _ group ->
        if pred group
        then add group out
        else out)
      PinGroupMap.empty
      map

  // ** unifiedPins

  let unifiedPins (map: PinGroupMap) =
    map
    |> filter PinGroup.hasUnifiedPins
    |> mapGroups PinGroup.unifiedPins

  // ** presetPins

  let presetPins (map: PinGroupMap) =
    map
    |> filter PinGroup.hasPresetPins
    |> mapGroups PinGroup.presetPins

// * Map module

module Map =

  // ** tryFindPin

  //  _              _____ _           _ ____  _
  // | |_ _ __ _   _|  ___(_)_ __   __| |  _ \(_)_ __
  // | __| '__| | | | |_  | | '_ \ / _` | |_) | | '_ \
  // | |_| |  | |_| |  _| | | | | | (_| |  __/| | | | |
  //  \__|_|   \__, |_|   |_|_| |_|\__,_|_|   |_|_| |_|
  //           |___/

  let tryFindPin (id : Id) (groups : Map<Id, PinGroup>) : Pin option =
    let folder (m : Pin option) _ (group: PinGroup) =
      match m with
        | Some _ as res -> res
        |      _        -> Map.tryFind id group.Pins
    Map.fold folder None groups

  // ** containsPin

  //                  _        _           ____  _
  //   ___ ___  _ __ | |_ __ _(_)_ __  ___|  _ \(_)_ __
  //  / __/ _ \| '_ \| __/ _` | | '_ \/ __| |_) | | '_ \
  // | (_| (_) | | | | || (_| | | | | \__ \  __/| | | | |
  //  \___\___/|_| |_|\__\__,_|_|_| |_|___/_|   |_|_| |_|

  let containsPin (id: Id) (groups : Map<Id,PinGroup>) : bool =
    let folder m _ group =
      if m then m else PinGroup.contains id group || m
    Map.fold folder false groups
