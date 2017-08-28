namespace rec Iris.Core

// * Imports

#if FABLE_COMPILER

open System
open Fable.Core
open Iris.Core.FlatBuffers
open Iris.Web.Core.FlatBufferTypes

#else

open System
open System.Text
open FlatBuffers
open Iris.Serialization

#endif

#if !FABLE_COMPILER && !IRIS_NODES
open SharpYaml.Serialization
#endif

// * Behavior

//  ____       _                 _
// | __ )  ___| |__   __ ___   _(_) ___  _ __
// |  _ \ / _ \ '_ \ / _` \ \ / / |/ _ \| '__|
// | |_) |  __/ | | | (_| |\ V /| | (_) | |
// |____/ \___|_| |_|\__,_| \_/ |_|\___/|_|

type Behavior =
  | Simple
  | MultiLine
  | FileName
  | Directory
  | Url
  | IP

  // ** TryParse

  static member TryParse (str: string) =
    match String.toLower str with
    | "string" | "simple" -> Right Simple
    | "multiline" -> Right MultiLine
    | "filename"  -> Right FileName
    | "directory" -> Right Directory
    | "url"       -> Right Url
    | "ip"        -> Right IP
    | _ ->
      sprintf "Invalid Behavior value: %s" str
      |> Error.asParseError "Behavior.TryParse"
      |> Either.fail

  // ** ToString

  override self.ToString() =
    match self with
    | Simple    -> "Simple"
    | MultiLine -> "MultiLine"
    | FileName  -> "FileName"
    | Directory -> "Directory"
    | Url       -> "Url"
    | IP        -> "IP"

  // ** FromFB

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  static member FromFB (fb: BehaviorFB) =
    #if FABLE_COMPILER
    match fb with
    | x when x = BehaviorFB.SimpleFB    -> Right Simple
    | x when x = BehaviorFB.MultiLineFB -> Right MultiLine
    | x when x = BehaviorFB.FileNameFB  -> Right FileName
    | x when x = BehaviorFB.DirectoryFB -> Right Directory
    | x when x = BehaviorFB.UrlFB       -> Right Url
    | x when x = BehaviorFB.IPFB        -> Right IP
    | x ->
      sprintf "Cannot parse Behavior. Unknown type: %A" x
      |> Error.asParseError "Behavior.FromFB"
      |> Either.fail

    #else

    match fb with
    | BehaviorFB.SimpleFB    -> Right Simple
    | BehaviorFB.MultiLineFB -> Right MultiLine
    | BehaviorFB.FileNameFB  -> Right FileName
    | BehaviorFB.DirectoryFB -> Right Directory
    | BehaviorFB.UrlFB       -> Right Url
    | BehaviorFB.IPFB        -> Right IP
    | x ->
      sprintf "Cannot parse Behavior. Unknown type: %A" x
      |> Error.asParseError "Behavior.FromFB"
      |> Either.fail

    #endif

  // ** ToOffset

  member self.ToOffset(_: FlatBufferBuilder) : BehaviorFB =
    match self with
    | Simple    -> BehaviorFB.SimpleFB
    | MultiLine -> BehaviorFB.MultiLineFB
    | FileName  -> BehaviorFB.FileNameFB
    | Directory -> BehaviorFB.DirectoryFB
    | Url       -> BehaviorFB.UrlFB
    | IP        -> BehaviorFB.IPFB


// * ConnectionDirection

[<RequireQualifiedAccess>]
type ConnectionDirection =
  | Input
  | Output

  override direction.ToString() =
    match direction with
    | Input  -> "Input"
    | Output -> "Output"

  static member Parse(str: string) =
    match str with
    | "Input" -> Input
    | "Output" -> Output
    | _ -> failwithf "Unknown ConnectionDirection %A" str

  static member TryParse(str: string) =
    try
      str
      |> ConnectionDirection.Parse
      |> Either.succeed
    with
      | x ->
        x.Message
        |> Error.asParseError "ConnectionDirection.TryParse"
        |> Either.fail

  member direction.ToOffset(_: FlatBufferBuilder) =
    match direction with
    | Input -> ConnectionDirectionFB.InputFB
    | Output -> ConnectionDirectionFB.OutputFB

  static member FromFB(fb: ConnectionDirectionFB) =
    #if FABLE_COMPILER
    match fb with
    | x when x = ConnectionDirectionFB.InputFB  -> Right Input
    | x when x = ConnectionDirectionFB.OutputFB -> Right Output
    | x ->
      sprintf "Unknown ConnectionDirectionFB value: %A" x
      |> Error.asParseError "ConnectionDirection.FromFB"
      |> Either.fail
    #else
    match fb with
    | ConnectionDirectionFB.InputFB  -> Right Input
    | ConnectionDirectionFB.OutputFB -> Right Output
    | x ->
      sprintf "Unknown ConnectionDirectionFB value: %A" x
      |> Error.asParseError "ConnectionDirection.FromFB"
      |> Either.fail
    #endif

// * VecSize

[<RequireQualifiedAccess>]
type VecSize =
  | Dynamic
  | Fixed of uint16

  override vecsize.ToString() =
    match vecsize with
    | Dynamic -> "dynamic"
    | Fixed n -> sprintf "fixed %d" n

  static member Parse(str: string) =
    match str with
    | "dynamic" -> Dynamic
    | other ->
      match other.Split(' ') with
      | [| "fixed"; n |] ->
        try
          let num = System.Convert.ToUInt16 n
          Fixed num
        with
          | _ -> failwithf "Unable to parse %A in VecSize string %A" n str
      | _ -> failwithf "Unable to parse VecSize string %A" str

  static member TryParse(str: string) =
    try
      str
      |> VecSize.Parse
      |> Either.succeed
    with
      | x ->
        x.Message
        |> Error.asParseError "VecSize.TryParse"
        |> Either.fail

  member vecsize.ToOffset(builder: FlatBufferBuilder) =
    match vecsize with
    | Dynamic ->
      VecSizeFB.StartVecSizeFB(builder)
      VecSizeFB.AddType(builder, VecSizeTypeFB.DynamicFB)
      VecSizeFB.EndVecSizeFB(builder)
    | Fixed n ->
      VecSizeFB.StartVecSizeFB(builder)
      VecSizeFB.AddType(builder, VecSizeTypeFB.FixedFB)
      VecSizeFB.AddSize(builder, n)
      VecSizeFB.EndVecSizeFB(builder)

  static member FromFB(fb: VecSizeFB) =
    #if FABLE_COMPILER
    match fb.Type with
    | x when x = VecSizeTypeFB.DynamicFB -> Right Dynamic
    | x when x = VecSizeTypeFB.FixedFB ->
      Right (Fixed fb.Size)
    | x ->
      sprintf "Unknown VecSizeFB value: %A" x
      |> Error.asParseError "VecSize.FromFB"
      |> Either.fail
    #else
    match fb.Type with
    | VecSizeTypeFB.DynamicFB -> Right Dynamic
    | VecSizeTypeFB.FixedFB -> Right (Fixed fb.Size)
    | x ->
      sprintf "Unknown ConnectionDirectionFB value: %A" x
      |> Error.asParseError "ConnectionDirection.FromFB"
      |> Either.fail
    #endif

// * SliceYaml

#if !FABLE_COMPILER && !IRIS_NODES

//  ____  _ _        __   __              _
// / ___|| (_) ___ __\ \ / /_ _ _ __ ___ | |
// \___ \| | |/ __/ _ \ V / _` | '_ ` _ \| |
//  ___) | | | (_|  __/| | (_| | | | | | | |
// |____/|_|_|\___\___||_|\__,_|_| |_| |_|_|

type SliceYaml(tipe, idx, value: obj) as self =
  [<DefaultValue>] val mutable SliceType : string
  [<DefaultValue>] val mutable Index     : int
  [<DefaultValue>] val mutable Value     : obj

  new () = new SliceYaml(null,0,null)

  do
    self.SliceType <- tipe
    self.Index     <- idx
    self.Value     <- value

  static member StringSlice (idx: int) (value: string) =
    new SliceYaml("StringSlice", idx, value)

  static member NumberSlice (idx: int) (value: double) =
    new SliceYaml("NumberSlice", idx, value)

  static member BoolSlice idx (value: bool) =
    new SliceYaml("BoolSlice", idx, value)

  static member ByteSlice idx (value: byte array) =
    new SliceYaml("ByteSlice", idx, Convert.ToBase64String(value))

  static member EnumSlice idx (value: Property) =
    new SliceYaml("EnumSlice", idx, Yaml.toYaml value)

  static member ColorSlice idx (value: ColorSpace) =
    new SliceYaml("ColorSlice", idx, Yaml.toYaml value)

  member self.ToSlice() =
    match self.SliceType with
    | "StringSlice" ->
      Either.tryWith (Error.asParseError "SliceYaml.ToSlice (String)") <| fun _ ->
        let parse (str: obj) =
          match str with
          | null -> null
          | _ -> str :?> String
        StringSlice(index self.Index, parse self.Value)
    | "NumberSlice" ->
      Either.tryWith (Error.asParseError "SliceYaml.ToSlice (Number)") <| fun _ ->
        let parse (value: obj) =
          try
            match value with
            | :? Double -> value :?> Double
            | :? String when (value :?> string).Contains "-Infinity" -> Double.NegativeInfinity
            | :? String when (value :?> string).Contains "Infinity" -> Double.PositiveInfinity
            | :? String when (value :?> string).Contains "NaN" -> Double.NaN
            | _ -> 0.0
          with
            | exn ->
              exn.Message
              |> sprintf "normalizing to 0.0. offending value: %A reason: %s" value
              |> Logger.err "Slices.ToSlices (Number)"
              0.0
        NumberSlice(index self.Index, parse self.Value)
    | "BoolSlice" ->
      Either.tryWith (Error.asParseError "SliceYaml.ToSlice (Bool)") <| fun _ ->
        BoolSlice(index self.Index, self.Value :?> bool)
    | "ByteSlice" ->
      Either.tryWith (Error.asParseError "SliceYaml.ToSlice (Byte)") <| fun _ ->
        // let parse (value: obj) =
        //   match value with
        //   | :? String -> (value :?> String) |> Convert.FromBase64String
        //   | :? Double ->
        //     printfn "(ByteSlice.Double) offending byte value: %A" value
        //     (value :?> Double) |> BitConverter.GetBytes
        //   | :? Int32 ->
        //     printfn "(ByteSlice.Int32) offending byte value: %A" value
        //     (value :?> Int32)   |> BitConverter.GetBytes
        //   | other ->
        //     printfn "(ByteSlice): offending value: %A" other
        //     printfn "(ByteSlice): type of offending value: %A" (other.GetType())
        //     [| |]
        ByteSlice(index self.Index, self.Value |> string |> Convert.FromBase64String)
    | "EnumSlice" ->
      Either.tryWith (Error.asParseError "SliceYaml.ToSlice (Enum)") <| fun _ ->
        let pyml = self.Value :?> PropertyYaml
        EnumSlice(index self.Index, { Key = pyml.Key; Value = pyml.Value })
    | "ColorSlice" ->
      either {
        let! color = Yaml.fromYaml(self.Value :?> ColorYaml)
        return ColorSlice(index self.Index, color)
      }
    | unknown ->
      sprintf "Could not de-serialize unknown type: %A" unknown
      |> Error.asParseError "SliceYaml.ToSlice"
      |> Either.fail

// * SlicesYaml

//  ____  _ _             __   __              _
// / ___|| (_) ___ ___  __\ \ / /_ _ _ __ ___ | |
// \___ \| | |/ __/ _ \/ __\ V / _` | '_ ` _ \| |
//  ___) | | | (_|  __/\__ \| | (_| | | | | | | |
// |____/|_|_|\___\___||___/|_|\__,_|_| |_| |_|_|

type SlicesYaml(tipe, id, values: obj array) as self =
  [<DefaultValue>] val mutable Id: string
  [<DefaultValue>] val mutable SliceType: string
  [<DefaultValue>] val mutable Values: obj array

  new () = new SlicesYaml(null,null,null)

  do
    self.Id        <- id
    self.SliceType <- tipe
    self.Values    <- values

  static member StringSlices id (values: string array) =
    new SlicesYaml("StringSlices", id, Array.map box values)

  static member NumberSlices id (values: double array) =
    new SlicesYaml("NumberSlices", id, Array.map box values)

  static member BoolSlices id (values: bool array) =
    new SlicesYaml("BoolSlices", id, Array.map box values)

  static member ByteSlices id (values: byte array array) =
    new SlicesYaml("ByteSlices", id, Array.map (Convert.ToBase64String >> box) values)

  static member EnumSlices id (values: Property array) =
    new SlicesYaml("EnumSlices", id, Array.map (Yaml.toYaml >> box) values)

  static member ColorSlices id (values: ColorSpace array) =
    new SlicesYaml("ColorSlices", id, Array.map (Yaml.toYaml >> box) values)

  member self.ToSlices() =
    match self.SliceType with
    | "StringSlices" ->
      Either.tryWith (Error.asParseError "SlicesYaml.ToSlice (String)") <| fun _ ->
        let parse (str: obj) =
          match str with
          | null -> null
          | _ -> str :?> String
        StringSlices(Id self.Id, Array.map parse self.Values)
    | "NumberSlices" ->
      Either.tryWith (Error.asParseError "SlicesYaml.ToSlice (Number)") <| fun _ ->
        let parse (value: obj) =
          try
            match value with
            | :? Double -> value :?> Double
            | :? String when (value :?> string).Contains "-Infinity" -> Double.NegativeInfinity
            | :? String when (value :?> string).Contains "Infinity" -> Double.PositiveInfinity
            | :? String when (value :?> string).Contains "NaN" -> Double.NaN
            | _ -> 0.0
          with
            | exn ->
              exn.Message
              |> sprintf "normalizing to 0.0. offending value: %A reason: %s" value
              |> Logger.err "Slices.ToSlices (Number)"
              0.0
        NumberSlices(Id self.Id, Array.map parse self.Values)
    | "BoolSlices" ->
      Either.tryWith (Error.asParseError "SlicesYaml.ToSlice (Bool)") <| fun _ ->
        BoolSlices(Id self.Id, Array.map unbox<bool> self.Values)
    | "ByteSlices" ->
      Either.tryWith (Error.asParseError "SlicesYaml.ToSlice (Byte)") <| fun _ ->
        let parse (value: obj) =
          match value with
          | :? String -> (value :?> String) |> Convert.FromBase64String
          | :? Double -> (value :?> Double) |> BitConverter.GetBytes
          | :? Int32  -> (value :?> Int32)  |> BitConverter.GetBytes
          | other ->
            printfn "(ByteSlices): offending value: %A" other
            printfn "(ByteSlices): type of offending value: %A" (other.GetType())
            [| |]
        ByteSlices(Id self.Id, Array.map parse self.Values)
    | "EnumSlices" ->
      Either.tryWith (Error.asParseError "SlicesYaml.ToSlice (Enum)") <| fun _ ->
        let ofPyml (o: obj) =
          let pyml: PropertyYaml = unbox o
          { Key = pyml.Key; Value = pyml.Value }
        EnumSlices(Id self.Id, Array.map ofPyml self.Values)
    | "ColorSlices" ->
      either {
        let! colors =
          Array.fold
            (fun (m: Either<IrisError,int * ColorSpace array>) value -> either {
              let! (idx, colors) = m
              let unboxed: ColorYaml = unbox value
              let! color = Yaml.fromYaml unboxed
              colors.[idx] <- color
              return (idx + 1, colors)
              })
            (Right(0, Array.zeroCreate self.Values.Length))
            self.Values
          |> Either.map snd
        return ColorSlices(Id self.Id, colors)
      }
    | unknown ->
      sprintf "Could not de-serialize unknown type: %A" unknown
      |> Error.asParseError "SlicesYaml.ToSlice"
      |> Either.fail

// * PinYaml

type PinYaml() =
  [<DefaultValue>] val mutable PinType    : string
  [<DefaultValue>] val mutable Id         : string
  [<DefaultValue>] val mutable Name       : string
  [<DefaultValue>] val mutable PinGroup   : string
  [<DefaultValue>] val mutable Tags       : string array
  [<DefaultValue>] val mutable Persisted  : bool
  [<DefaultValue>] val mutable Behavior   : string
  [<DefaultValue>] val mutable Direction  : string
  [<DefaultValue>] val mutable MaxChars   : int
  [<DefaultValue>] val mutable IsTrigger  : bool
  [<DefaultValue>] val mutable VecSize    : string
  [<DefaultValue>] val mutable Precision  : uint32
  [<DefaultValue>] val mutable Min        : int
  [<DefaultValue>] val mutable Max        : int
  [<DefaultValue>] val mutable Unit       : string
  [<DefaultValue>] val mutable Properties : PropertyYaml array
  [<DefaultValue>] val mutable Labels     : string array
  [<DefaultValue>] val mutable Values     : SliceYaml array

#endif

// * Pin

type Pin =
  | StringPin   of StringPinD
  | NumberPin   of NumberPinD
  | BoolPin     of BoolPinD
  | BytePin     of BytePinD
  | EnumPin     of EnumPinD
  | ColorPin    of ColorPinD

  // ** Id

  member self.Id
    with get () =
      match self with
      | StringPin   data -> data.Id
      | NumberPin   data -> data.Id
      | BoolPin     data -> data.Id
      | BytePin     data -> data.Id
      | EnumPin     data -> data.Id
      | ColorPin    data -> data.Id

  // ** Name

  member self.Name
    with get () =
      match self with
      | StringPin   data -> data.Name
      | NumberPin   data -> data.Name
      | BoolPin     data -> data.Name
      | BytePin     data -> data.Name
      | EnumPin     data -> data.Name
      | ColorPin    data -> data.Name

  // ** Direction

  member self.Direction
    with get () =
      match self with
      | StringPin   data -> data.Direction
      | NumberPin   data -> data.Direction
      | BoolPin     data -> data.Direction
      | BytePin     data -> data.Direction
      | EnumPin     data -> data.Direction
      | ColorPin    data -> data.Direction

  // ** PinGroup

  member self.PinGroup
    with get () =
      match self with
      | StringPin   data -> data.PinGroup
      | NumberPin   data -> data.PinGroup
      | BoolPin     data -> data.PinGroup
      | BytePin     data -> data.PinGroup
      | EnumPin     data -> data.PinGroup
      | ColorPin    data -> data.PinGroup

  // ** Type

  member self.Type
    with get () =
      match self with
      | StringPin   _ -> "StringPin"
      | NumberPin   _ -> "NumberPin"
      | BoolPin     _ -> "BoolPin"
      | BytePin     _ -> "BytePin"
      | EnumPin     _ -> "EnumPin"
      | ColorPin    _ -> "ColorPin"

  // ** GetTags

  member self.GetTags
    with get () =
      match self with
      | StringPin data -> data.Tags
      | NumberPin data -> data.Tags
      | BoolPin   data -> data.Tags
      | BytePin   data -> data.Tags
      | EnumPin   data -> data.Tags
      | ColorPin  data -> data.Tags

  // ** VecSize

  member self.VecSize
    with get () =
      match self with
      | StringPin data -> data.VecSize
      | NumberPin data -> data.VecSize
      | BoolPin   data -> data.VecSize
      | BytePin   data -> data.VecSize
      | EnumPin   data -> data.VecSize
      | ColorPin  data -> data.VecSize

  // ** Slices

  member pin.Slices
    with get () =
      match pin with
      | StringPin   data -> StringSlices (pin.Id, data.Values)
      | NumberPin   data -> NumberSlices (pin.Id, data.Values)
      | BoolPin     data -> BoolSlices   (pin.Id, data.Values)
      | BytePin     data -> ByteSlices   (pin.Id, data.Values)
      | EnumPin     data -> EnumSlices   (pin.Id, data.Values)
      | ColorPin    data -> ColorSlices  (pin.Id, data.Values)

  // ** Labels

  member pin.Labels
    with get () =
      match pin with
      | StringPin data -> data.Labels
      | NumberPin data -> data.Labels
      | BoolPin   data -> data.Labels
      | BytePin   data -> data.Labels
      | EnumPin   data -> data.Labels
      | ColorPin  data -> data.Labels

  // ** Values

  member pin.Values
    with get () =
      match pin with
      | StringPin data -> StringSlices(data.Id, data.Values)
      | NumberPin data -> NumberSlices(data.Id, data.Values)
      | BoolPin   data -> BoolSlices(data.Id, data.Values)
      | BytePin   data -> ByteSlices(data.Id, data.Values)
      | EnumPin   data -> EnumSlices(data.Id, data.Values)
      | ColorPin  data -> ColorSlices(data.Id, data.Values)

  // ** Persisted

  member pin.Persisted
    with get () =
      match pin with
      | StringPin data -> data.Persisted
      | NumberPin data -> data.Persisted
      | BoolPin   data -> data.Persisted
      | BytePin   data -> data.Persisted
      | EnumPin   data -> data.Persisted
      | ColorPin  data -> data.Persisted

  // ** ToSpread

  #if !FABLE_COMPILER

  member pin.ToSpread() =
    pin.Values.ToSpread()

  #endif

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) : Offset<PinFB> =
    let inline build (data: ^t) tipe =
      let offset = Binary.toOffset builder data
      PinFB.StartPinFB(builder)
      #if FABLE_COMPILER
      PinFB.AddPin(builder, offset)
      #else
      PinFB.AddPin(builder, offset.Value)
      #endif
      PinFB.AddPinType(builder, tipe)
      PinFB.EndPinFB(builder)

    match self with
    | StringPin   data -> build data PinTypeFB.StringPinFB
    | NumberPin   data -> build data PinTypeFB.NumberPinFB
    | BoolPin     data -> build data PinTypeFB.BoolPinFB
    | BytePin     data -> build data PinTypeFB.BytePinFB
    | EnumPin     data -> build data PinTypeFB.EnumPinFB
    | ColorPin    data -> build data PinTypeFB.ColorPinFB

  // ** FromFB

  static member FromFB(fb: PinFB) : Either<IrisError,Pin> =
    #if FABLE_COMPILER
    match fb.PinType with
    | x when x = PinTypeFB.StringPinFB ->
      StringPinFB.Create()
      |> fb.Pin
      |> StringPinD.FromFB
      |> Either.map StringPin

    | x when x = PinTypeFB.NumberPinFB ->
      NumberPinFB.Create()
      |> fb.Pin
      |> NumberPinD.FromFB
      |> Either.map NumberPin

    | x when x = PinTypeFB.BoolPinFB ->
      BoolPinFB.Create()
      |> fb.Pin
      |> BoolPinD.FromFB
      |> Either.map BoolPin

    | x when x = PinTypeFB.BytePinFB ->
      BytePinFB.Create()
      |> fb.Pin
      |> BytePinD.FromFB
      |> Either.map BytePin

    | x when x = PinTypeFB.EnumPinFB ->
      EnumPinFB.Create()
      |> fb.Pin
      |> EnumPinD.FromFB
      |> Either.map EnumPin

    | x when x = PinTypeFB.ColorPinFB ->
      ColorPinFB.Create()
      |> fb.Pin
      |> ColorPinD.FromFB
      |> Either.map ColorPin

    | x ->
      sprintf "%A is not a valid PinTypeFB" x
      |> Error.asParseError "PinFB.FromFB"
      |> Either.fail

    #else

    match fb.PinType with
    | PinTypeFB.StringPinFB ->
      let v = fb.Pin<StringPinFB>()
      if v.HasValue then
        v.Value
        |> StringPinD.FromFB
        |> Either.map StringPin
      else
        "StringPinFB has no value"
        |> Error.asParseError "PinFB.FromFB"
        |> Either.fail

    | PinTypeFB.NumberPinFB ->
      let v = fb.Pin<NumberPinFB>()
      if v.HasValue then
        v.Value
        |> NumberPinD.FromFB
        |> Either.map NumberPin
      else
        "NumberPinFB has no value"
        |> Error.asParseError "PinFB.FromFB"
        |> Either.fail

    | PinTypeFB.BoolPinFB ->
      let v = fb.Pin<BoolPinFB>()
      if v.HasValue then
        v.Value
        |> BoolPinD.FromFB
        |> Either.map BoolPin
      else
        "BoolPinFB has no value"
        |> Error.asParseError "PinFB.FromFB"
        |> Either.fail

    | PinTypeFB.BytePinFB ->
      let v = fb.Pin<BytePinFB>()
      if v.HasValue then
        v.Value
        |> BytePinD.FromFB
        |> Either.map BytePin
      else
        "BytePinFB has no value"
        |> Error.asParseError "PinFB.FromFB"
        |> Either.fail

    | PinTypeFB.EnumPinFB ->
      let v = fb.Pin<EnumPinFB>()
      if v.HasValue then
        v.Value
        |> EnumPinD.FromFB
        |> Either.map EnumPin
      else
        "EnumPinFB has no value"
        |> Error.asParseError "PinFB.FromFB"
        |> Either.fail

    | PinTypeFB.ColorPinFB ->
      let v = fb.Pin<ColorPinFB>()
      if v.HasValue then
        v.Value
        |> ColorPinD.FromFB
        |> Either.map ColorPin
      else
        "ColorPinFB has no value"
        |> Error.asParseError "PinFB.FromFB"
        |> Either.fail

    | x ->
      sprintf "PinTypeFB not recognized: %A" x
      |> Error.asParseError "PinFB.FromFB"
      |> Either.fail

    #endif

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromBytes

  static member FromBytes(bytes: byte[]) : Either<IrisError,Pin> =
    Binary.createBuffer bytes
    |> PinFB.GetRootAsPinFB
    |> Pin.FromFB

  // ** ToYamlObject

  // __   __              _
  // \ \ / /_ _ _ __ ___ | |
  //  \ V / _` | '_ ` _ \| |
  //   | | (_| | | | | | | |
  //   |_|\__,_|_| |_| |_|_|

  #if !FABLE_COMPILER && !IRIS_NODES

  member self.ToYamlObject() =
    let yaml = new PinYaml()
    match self with
    | StringPin data ->
      yaml.PinType    <- "StringPin"
      yaml.Id         <- string data.Id
      yaml.Name       <- data.Name
      yaml.PinGroup   <- string data.PinGroup
      yaml.Persisted  <- data.Persisted
      yaml.Tags       <- Array.map unwrap data.Tags
      yaml.MaxChars   <- int data.MaxChars
      yaml.Behavior   <- string data.Behavior
      yaml.Direction  <- string data.Direction
      yaml.VecSize    <- string data.VecSize
      yaml.Labels     <- data.Labels
      yaml.Values     <- Array.mapi SliceYaml.StringSlice data.Values

    | NumberPin data ->
      yaml.PinType    <- "NumberPin"
      yaml.Id         <- string data.Id
      yaml.Name       <- data.Name
      yaml.PinGroup   <- string data.PinGroup
      yaml.Persisted  <- data.Persisted
      yaml.Tags       <- Array.map unwrap data.Tags
      yaml.Precision  <- data.Precision
      yaml.Min        <- data.Min
      yaml.Max        <- data.Max
      yaml.Unit       <- data.Unit
      yaml.VecSize    <- string data.VecSize
      yaml.Direction  <- string data.Direction
      yaml.Labels     <- data.Labels
      yaml.Values     <- Array.mapi SliceYaml.NumberSlice data.Values

    | BoolPin data ->
      yaml.PinType    <- "BoolPin"
      yaml.Id         <- string data.Id
      yaml.Name       <- data.Name
      yaml.PinGroup   <- string data.PinGroup
      yaml.Persisted  <- data.Persisted
      yaml.Tags       <- Array.map unwrap data.Tags
      yaml.IsTrigger  <- data.IsTrigger
      yaml.VecSize    <- string data.VecSize
      yaml.Direction  <- string data.Direction
      yaml.Labels     <- data.Labels
      yaml.Values     <- Array.mapi SliceYaml.BoolSlice data.Values

    | BytePin data ->
      yaml.PinType    <- "BytePin"
      yaml.Id         <- string data.Id
      yaml.Name       <- data.Name
      yaml.PinGroup   <- string data.PinGroup
      yaml.Persisted  <- data.Persisted
      yaml.Tags       <- Array.map unwrap data.Tags
      yaml.VecSize    <- string data.VecSize
      yaml.Direction  <- string data.Direction
      yaml.Labels     <- data.Labels
      yaml.Values     <- Array.mapi SliceYaml.ByteSlice data.Values

    | EnumPin data ->
      yaml.PinType    <- "EnumPin"
      yaml.Id         <- string data.Id
      yaml.Name       <- data.Name
      yaml.PinGroup   <- string data.PinGroup
      yaml.Persisted  <- data.Persisted
      yaml.Tags       <- Array.map unwrap data.Tags
      yaml.VecSize    <- string data.VecSize
      yaml.Direction  <- string data.Direction
      yaml.Properties <- Array.map Yaml.toYaml data.Properties
      yaml.Labels     <- data.Labels
      yaml.Values     <- Array.mapi SliceYaml.EnumSlice data.Values

    | ColorPin  data ->
      yaml.PinType    <- "ColorPin"
      yaml.Id         <- string data.Id
      yaml.Name       <- data.Name
      yaml.PinGroup   <- string data.PinGroup
      yaml.Persisted  <- data.Persisted
      yaml.Tags       <- Array.map unwrap data.Tags
      yaml.VecSize    <- string data.VecSize
      yaml.Direction  <- string data.Direction
      yaml.Labels     <- data.Labels
      yaml.Values     <- Array.mapi SliceYaml.ColorSlice data.Values

    yaml

  // ** ParseSliceYamls

  /// ## Parse all SliceYamls for a given Pin data type
  ///
  /// Takes an array> of SliceYaml and folds over it, parsing the
  /// slices. If an error occurs, it will be returned in the left-hand
  /// side.
  ///
  /// ### Signature:
  /// - slices: SliceYaml array>
  ///
  /// Returns: Either<IrisError,^a>
  static member inline ParseSliceYamls< ^t when ^t : (static member FromYamlObject : SliceYaml -> Either<IrisError, ^t>)>
                                           (slices: SliceYaml array)
                                           : Either<IrisError, ^t array> =
    Array.fold
      (fun (m: Either<IrisError,int * ^t array>) yml -> either {
        let! arr = m
        let! parsed = Yaml.fromYaml yml
        (snd arr).[fst arr] <- parsed
        return (fst arr + 1, snd arr)
      })
      (Right (0, Array.zeroCreate slices.Length))
      slices
    |> Either.map snd

  #endif

  // ** ParseTags

  /// ## Parse all tags in a Flatbuffer-serialized type
  ///
  /// Parses all tags in a given Pin inner data type.
  ///
  /// ### Signature:
  /// - fb: the inner Pin data type (BoolPinD, StringPinD, etc.)
  ///
  /// Returns: Either<IrisError, Tag array>
  static member inline ParseTagsFB< ^a when ^a : (member TagsLength : int)
                                       and  ^a : (member Tags : int -> string)>
                                       (fb: ^a)
                                       : Either<IrisError, Tag array> =
    let len = (^a : (member TagsLength : int) fb)
    let arr = Array.zeroCreate len
    Array.fold
      (fun (result: Either<IrisError,int * Tag array>) _ -> either {
          let! (i, tags) = result
          let value =
            try (^a : (member Tags : int -> string) (fb, i))
            with | _ -> null
          tags.[i] <- astag value
          return (i + 1, tags)
        })
      (Right (0, arr))
      arr
    |> Either.map snd

  // ** ParseLabels

  /// ## Parse all labels in a Flatbuffer-serialized type
  ///
  /// Parses all labels in a given Pin inner data type.
  ///
  /// ### Signature:
  /// - fb: the inner Pin data type (BoolPinD, StringPinD, etc.)
  ///
  /// Returns: Either<IrisError, Label array>
  static member inline ParseLabelsFB< ^a when ^a : (member LabelsLength : int)
                                         and  ^a : (member Labels : int -> string)>
                                         (fb: ^a)
                                         : Either<IrisError, string array> =
    let len = (^a : (member LabelsLength : int) fb)
    let arr = Array.zeroCreate len
    Array.fold
      (fun (result: Either<IrisError,int * string array>) _ -> either {
          let! (i, labels) = result
          let value =
            try (^a : (member Labels : int -> string) (fb, i))
            with | _ -> null
          labels.[i] <- value
          return (i + 1, labels)
        })
      (Right (0, arr))
      arr
    |> Either.map snd

  // ** ParseVecSize

  #if FABLE_COMPILER
  static member inline ParseVecSize< ^a when ^a : (member VecSize : VecSizeFB)> (fb: ^a)=
    let fb = (^a : (member VecSize : VecSizeFB) fb)
    VecSize.FromFB fb

  #else
  static member inline ParseVecSize< ^a when ^a : (member VecSize : Nullable<VecSizeFB>)> (fb: ^a) =
    let fb = (^a : (member VecSize : Nullable<VecSizeFB>) fb)
    if fb.HasValue then
      let sizish = fb.Value
      VecSize.FromFB sizish
    else
      "Cannot parse empty VecSize"
      |> Error.asParseError "VecSize.FromFB"
      |> Either.fail
  #endif

  // ** ParseSimpleValuesFB

  #if FABLE_COMPILER

  static member inline ParseSimpleValuesFB< ^a, ^b when ^b : (member ValuesLength : int)
                                                   and ^b : (member Values : int -> ^a)>
                                                   (fb: ^b)
                                                   : Either<IrisError, ^a array> =
    let len = (^b : (member ValuesLength : int) fb)
    let arr = Array.zeroCreate len
    Array.fold
      (fun (result: Either<IrisError,int * ^a array>) _ -> either {

          let! (i, slices) = result

          // In Javascript, Flatbuffer types are not modeled as nullables,
          // hence parsing code is much simpler
          let slice = (^b : (member Values : int -> ^a) (fb, i))

          // add the slice to the array> at its correct position
          slices.[i] <- slice
          return (i + 1, slices)
      })
      (Right (0, arr))
      arr
    |> Either.map snd

  #else

  static member inline ParseSimpleValuesFB< ^a, ^b when ^b : (member ValuesLength : int)
                                                   and ^b : (member Values : int -> ^a)>
                                                   (fb: ^b)
                                                   : Either<IrisError, ^a array> =
    let len = (^b : (member ValuesLength : int) fb)
    let arr = Array.zeroCreate len
    Array.fold
      (fun (result: Either<IrisError,int * ^a array>) _ -> either {
          let! (i, slices) = result

          // In .NET, Flatbuffers are modelled with nullables, hence
          // parsing is slightly more elaborate
          let slice =
            try (^b : (member Values : int -> ^a) (fb, i))
            with | _ -> Unchecked.defaultof< ^a >

          // add the slice to the array> at its correct position
          slices.[i] <- slice
          return (i + 1, slices)
      })
      (Right (0, arr))
      arr
    |> Either.map snd

  #endif

  // ** ParseComplexValuesFB

  #if FABLE_COMPILER

  static member inline ParseComplexValuesFB< ^a, ^b, ^t when ^t : (static member FromFB : ^a -> Either<IrisError, ^t>)
                                                 and ^b : (member ValuesLength : int)
                                                 and ^b : (member Values : int -> ^a)>
                                                 (fb: ^b)
                                                 : Either<IrisError, ^t array> =
    let len = (^b : (member ValuesLength : int) fb)
    let arr = Array.zeroCreate len
    Array.fold
      (fun (result: Either<IrisError,int * ^t array>) _ -> either {

          let! (i, slices) = result

          // In Javascript, Flatbuffer types are not modeled as nullables,
          // hence parsing code is much simpler
          let! slice =
            let value = (^b : (member Values : int -> ^a) (fb, i))
            (^t : (static member FromFB : ^a -> Either<IrisError, ^t>) value)

          // add the slice to the array> at its correct position
          slices.[i] <- slice
          return (i + 1, slices)
      })
      (Right (0, arr))
      arr
    |> Either.map snd

  #else

  static member inline ParseComplexValuesFB< ^a, ^b, ^t when ^t : (static member FromFB : ^a -> Either<IrisError, ^t>)
                                                        and ^b : (member ValuesLength : int)
                                                        and ^b : (member Values : int -> Nullable< ^a >)>
                                                        (fb: ^b)
                                                        : Either<IrisError, ^t array> =
    let len = (^b : (member ValuesLength : int) fb)
    let arr = Array.zeroCreate len
    Array.fold
      (fun (result: Either<IrisError,int * ^t array>) _ -> either {
          let! (i, slices) = result

          // In .NET, Flatbuffers are modelled with nullables, hence
          // parsing is slightly more elaborate
          let! slice =
            let value = (^b : (member Values : int -> Nullable< ^a >) (fb, i))
            if value.HasValue then
              (^t : (static member FromFB : ^a -> Either<IrisError, ^t>) value.Value)
            else
              "Could not parse empty slice"
              |> Error.asParseError (sprintf "ParseSlices of %s" (typeof< ^t >).Name)
              |> Either.fail

          // add the slice to the array> at its correct position
          slices.[i] <- slice
          return (i + 1, slices)
      })
      (Right (0, arr))
      arr
    |> Either.map snd

  #endif

  // ** FromYamlObject

  #if !FABLE_COMPILER && !IRIS_NODES

  static member FromYamlObject(yml: PinYaml) =
    try
      match yml.PinType with
      | "StringPin" -> either {
          let! strtype = Behavior.TryParse yml.Behavior
          let! dir = ConnectionDirection.TryParse yml.Direction
          let! vecsize = VecSize.TryParse yml.VecSize
          let! (_, slices) =
            let arr = Array.zeroCreate yml.Values.Length
            Array.fold
              (fun (m: Either<IrisError,int * string array>) (yml: SliceYaml) ->
                either {
                  let! (i, arr) = m
                  let! value = yml.ToSlice()
                  arr.[i] <- (value.Value :?> String)
                  return (i + 1, arr)
                })
              (Right(0, arr))
              yml.Values

          return StringPin {
            Id         = Id yml.Id
            Name       = yml.Name
            PinGroup   = Id yml.PinGroup
            Tags       = Array.map astag yml.Tags
            Persisted  = yml.Persisted
            MaxChars   = yml.MaxChars * 1<chars>
            Behavior   = strtype
            VecSize    = vecsize
            Direction  = dir
            Labels     = yml.Labels
            Values     = slices
          }
        }

      | "NumberPin" -> either {
          let! dir = ConnectionDirection.TryParse yml.Direction
          let! vecsize = VecSize.TryParse yml.VecSize
          let! (_, slices) =
            let arr = Array.zeroCreate yml.Values.Length
            Array.fold
              (fun (m: Either<IrisError,int * double array>) (yml: SliceYaml) ->
                either {
                  let! (i, arr) = m
                  let! value = yml.ToSlice()
                  let! value =
                    try value.Value :?> double |> Either.succeed
                    with | x ->
                      sprintf "Could not parse double: %s" x.Message
                      |> Error.asParseError "FromYamlObject NumberPin"
                      |> Either.fail
                  arr.[i] <- value
                  return (i + 1, arr)
                })
              (Right(0, arr))
              yml.Values

          return NumberPin {
            Id        = Id yml.Id
            Name      = yml.Name
            PinGroup  = Id yml.PinGroup
            Tags      = Array.map astag yml.Tags
            VecSize   = vecsize
            Direction = dir
            Persisted = yml.Persisted
            Min       = yml.Min
            Max       = yml.Max
            Unit      = yml.Unit
            Precision = yml.Precision
            Labels    = yml.Labels
            Values    = slices
          }
        }

      | "BoolPin" -> either {
          let! dir = ConnectionDirection.TryParse yml.Direction
          let! vecsize = VecSize.TryParse yml.VecSize
          let! (_, slices) =
            let arr = Array.zeroCreate yml.Values.Length
            Array.fold
              (fun (m: Either<IrisError,int * bool array>) (yml: SliceYaml) ->
                either {
                  let! (i, arr) = m
                  let! value = yml.ToSlice()
                  let! value =
                    try
                      value.Value
                      :?> bool
                      |> Either.succeed
                    with
                      | x ->
                        sprintf "Could not parse double: %s" x.Message
                        |> Error.asParseError "FromYamlObject NumberPin"
                        |> Either.fail
                  arr.[i] <- value
                  return (i + 1, arr)
                })
              (Right(0, arr))
              yml.Values

          return BoolPin {
            Id        = Id yml.Id
            Name      = yml.Name
            PinGroup  = Id yml.PinGroup
            Tags      = Array.map astag yml.Tags
            Persisted = yml.Persisted
            IsTrigger = yml.IsTrigger
            VecSize   = vecsize
            Direction = dir
            Labels    = yml.Labels
            Values    = slices
          }
        }

      | "BytePin" -> either {
          let! dir = ConnectionDirection.TryParse yml.Direction
          let! vecsize = VecSize.TryParse yml.VecSize
          let! (_, slices) =
            let arr = Array.zeroCreate yml.Values.Length
            Array.fold
              (fun (m: Either<IrisError,int * byte[] array>) (yml: SliceYaml) ->
                either {
                  let! (i, arr) = m
                  let! value = yml.ToSlice()
                  let! value =
                    try
                      value.Value
                      :?> byte array
                      |> Either.succeed
                    with
                      | x ->
                        sprintf "Could not parse double: %s" x.Message
                        |> Error.asParseError "FromYamlObject NumberPin"
                        |> Either.fail
                  arr.[i] <- value
                  return (i + 1, arr)
                })
              (Right(0, arr))
              yml.Values

          return BytePin {
            Id        = Id yml.Id
            Name      = yml.Name
            PinGroup  = Id yml.PinGroup
            Tags      = Array.map astag yml.Tags
            Persisted = yml.Persisted
            VecSize   = vecsize
            Direction = dir
            Labels    = yml.Labels
            Values    = slices
          }
        }

      | "EnumPin" -> either {
          let! properties =
            Array.fold
              (fun (m: Either<IrisError, int * Property array>) yml ->
                either {
                  let! state = m
                  let! parsed = Yaml.fromYaml yml
                  (snd state).[fst state] <- parsed
                  return (fst state + 1, snd state)
                })
              (Right (0, Array.zeroCreate yml.Properties.Length))
              yml.Properties
            |> Either.map snd

          let! (_, slices) =
            let arr = Array.zeroCreate yml.Values.Length
            Array.fold
              (fun (m: Either<IrisError,int * Property array>) (yml: SliceYaml) ->
                either {
                  let! (i, arr) = m
                  let! value = yml.ToSlice()
                  let! value =
                    try
                      value.Value
                      :?> Property
                      |> Either.succeed
                    with
                      | x ->
                        sprintf "Could not parse Property: %s" x.Message
                        |> Error.asParseError "FromYamlObject NumberPin"
                        |> Either.fail
                  arr.[i] <- value
                  return (i + 1, arr)
                })
              (Right(0, arr))
              yml.Values

          let! dir = ConnectionDirection.TryParse yml.Direction
          let! vecsize = VecSize.TryParse yml.VecSize

          return EnumPin {
            Id         = Id yml.Id
            Name       = yml.Name
            PinGroup   = Id yml.PinGroup
            Tags       = Array.map astag yml.Tags
            Persisted = yml.Persisted
            Properties = properties
            VecSize    = vecsize
            Direction  = dir
            Labels     = yml.Labels
            Values     = slices
          }
        }

      | "ColorPin" -> either {
          let! dir = ConnectionDirection.TryParse yml.Direction
          let! vecsize = VecSize.TryParse yml.VecSize

          let! (_, slices) =
            let arr = Array.zeroCreate yml.Values.Length
            Array.fold
              (fun (m: Either<IrisError,int * ColorSpace array>) (yml: SliceYaml) ->
                either {
                  let! (i, arr) = m
                  let! value = yml.ToSlice()
                  let! value =
                    try
                      value.Value
                      :?> ColorSpace
                      |> Either.succeed
                    with
                      | x ->
                        sprintf "Could not parse Property: %s" x.Message
                        |> Error.asParseError "FromYamlObject NumberPin"
                        |> Either.fail
                  arr.[i] <- value
                  return (i + 1, arr)
                })
              (Right(0, arr))
              yml.Values

          return ColorPin {
            Id        = Id yml.Id
            Name      = yml.Name
            PinGroup  = Id yml.PinGroup
            Tags      = Array.map astag yml.Tags
            Persisted = yml.Persisted
            VecSize   = vecsize
            Direction = dir
            Labels    = yml.Labels
            Values    = slices
          }
        }

      | x ->
        sprintf "Could not parse PinYml type: %s" x
        |> Error.asParseError "PynYml.FromYamlObject"
        |> Either.fail

    with
      | exn ->
        sprintf "Could not parse PinYml: %s" exn.Message
        |> Error.asParseError "PynYml.FromYamlObject"
        |> Either.fail

  // ** ToYaml

  member self.ToYaml(serializer: Serializer) =
    self
    |> Yaml.toYaml
    |> serializer.Serialize

  // ** FromYaml

  static member FromYaml(str: string) =
    let serializer = new Serializer()
    serializer.Deserialize<PinYaml>(str)
    |> Pin.FromYamlObject

  #endif

// * Pin module

module Pin =

  // ** emtpyLabels

  let private emptyLabels (count: int) =
    let arr = Array.zeroCreate count
    Array.fill arr 0 count ""
    arr

  // ** toggle

  let toggle id name group tags values =
    BoolPin { Id        = id
              Name      = name
              PinGroup  = group
              Tags      = tags
              IsTrigger = false
              Persisted = false
              Direction = ConnectionDirection.Input
              VecSize   = VecSize.Dynamic
              Labels    = emptyLabels(Array.length values)
              Values    = values }

  // ** bang

  let bang id name group tags values =
    BoolPin { Id        = id
              Name      = name
              PinGroup  = group
              Tags      = tags
              IsTrigger = true
              Persisted = false
              Direction = ConnectionDirection.Input
              VecSize   = VecSize.Dynamic
              Labels    = emptyLabels(Array.length values)
              Values    = values }

  // ** string

  let string id name group tags values =
    StringPin { Id        = id
                Name      = name
                PinGroup  = group
                Tags      = tags
                Persisted = false
                Behavior  = Simple
                Direction = ConnectionDirection.Input
                VecSize   = VecSize.Dynamic
                MaxChars  = sizeof<int> * 1<chars>
                Labels    = emptyLabels(Array.length values)
                Values    = values }

  // ** multiLine

  let multiLine id name group tags values =
    StringPin { Id        = id
                Name      = name
                PinGroup  = group
                Tags      = tags
                Persisted = false
                Behavior  = MultiLine
                Direction = ConnectionDirection.Input
                VecSize   = VecSize.Dynamic
                MaxChars  = sizeof<int> * 1<chars>
                Labels    = emptyLabels(Array.length values)
                Values    = values }

  // ** fileName

  let fileName id name group tags values =
    StringPin { Id        = id
                Name      = name
                PinGroup  = group
                Tags      = tags
                Persisted = false
                Behavior  = FileName
                Direction = ConnectionDirection.Input
                VecSize   = VecSize.Dynamic
                MaxChars  = sizeof<int> * 1<chars>
                Labels    = emptyLabels(Array.length values)
                Values    = values }

  // ** directory

  let directory id name group tags values =
    StringPin { Id        = id
                Name      = name
                PinGroup  = group
                Tags      = tags
                Persisted = false
                Behavior  = Directory
                Direction = ConnectionDirection.Input
                VecSize   = VecSize.Dynamic
                MaxChars  = sizeof<int> * 1<chars>
                Labels    = emptyLabels(Array.length values)
                Values    = values }

  // ** url

  let url id name group tags values =
    StringPin { Id        = id
                Name      = name
                PinGroup  = group
                Tags      = tags
                Persisted = false
                Behavior  = Url
                Direction = ConnectionDirection.Input
                VecSize   = VecSize.Dynamic
                MaxChars  = sizeof<int> * 1<chars>
                Labels    = emptyLabels(Array.length values)
                Values    = values }

  // ** ip

  let ip id name group tags values =
    StringPin { Id        = id
                Name      = name
                PinGroup  = group
                Tags      = tags
                Persisted = false
                Behavior  = IP
                Direction = ConnectionDirection.Input
                VecSize   = VecSize.Dynamic
                MaxChars  = sizeof<int> * 1<chars>
                Labels    = emptyLabels(Array.length values)
                Values    = values }

  // ** number

  let number id name group tags values =
    NumberPin { Id        = id
                Name      = name
                PinGroup  = group
                Tags      = tags
                Persisted = false
                Min       = 0
                Max       = sizeof<double>
                Unit      = ""
                Precision = 4u
                VecSize   = VecSize.Dynamic
                Direction = ConnectionDirection.Input
                Labels    = emptyLabels(Array.length values)
                Values    = values }

  // ** bytes

  let bytes id name group tags values =
    BytePin { Id        = id
              Name      = name
              PinGroup  = group
              Tags      = tags
              Persisted = false
              VecSize   = VecSize.Dynamic
              Direction = ConnectionDirection.Input
              Labels    = emptyLabels(Array.length values)
              Values    = values }

  // ** color

  let color id name group tags values =
    ColorPin { Id        = id
               Name      = name
               PinGroup  = group
               Tags      = tags
               Persisted = false
               VecSize   = VecSize.Dynamic
               Direction = ConnectionDirection.Input
               Labels    = emptyLabels(Array.length values)
               Values    = values }

  // ** enum

  let enum id name group tags properties values =
    EnumPin { Id         = id
              Name       = name
              PinGroup   = group
              Tags       = tags
              Persisted  = false
              Properties = properties
              Direction  = ConnectionDirection.Input
              VecSize    = VecSize.Dynamic
              Labels     = emptyLabels(Array.length values)
              Values     = values }

  // ** Player module

  module Player =

    // *** next

    let next id =
      BoolPin { Id         = Id (sprintf "/%O/next" id)
                Name       = "Next"
                PinGroup   = id
                Tags       = Array.empty
                Persisted  = true
                IsTrigger  = true
                Direction  = ConnectionDirection.Input
                VecSize    = VecSize.Dynamic
                Labels     = Array.empty
                Values     = [| false |] }

    // *** previous

    let previous id =
      BoolPin { Id         = Id (sprintf "/%O/previous" id)
                Name       = "Previous"
                PinGroup   = id
                Tags       = Array.empty
                Persisted  = true
                IsTrigger  = true
                Direction  = ConnectionDirection.Input
                VecSize    = VecSize.Dynamic
                Labels     = Array.empty
                Values     = [| false |] }

    // *** call

    let call id =
      BoolPin { Id         = Id (sprintf "/%O/call" id)
                Name       = "Call"
                PinGroup   = id
                Tags       = Array.empty
                Persisted  = true
                IsTrigger  = true
                Direction  = ConnectionDirection.Input
                VecSize    = VecSize.Dynamic
                Labels     = Array.empty
                Values     = [| false |] }

  // ** setVecSize

  let setVecSize vecSize = function
    | StringPin data -> StringPin { data with VecSize = vecSize }
    | NumberPin data -> NumberPin { data with VecSize = vecSize }
    | BoolPin   data -> BoolPin   { data with VecSize = vecSize }
    | BytePin   data -> BytePin   { data with VecSize = vecSize }
    | EnumPin   data -> EnumPin   { data with VecSize = vecSize }
    | ColorPin  data -> ColorPin  { data with VecSize = vecSize }

  // ** setDirection

  let setDirection direction = function
    | StringPin   data -> StringPin   { data with Direction = direction }
    | NumberPin   data -> NumberPin   { data with Direction = direction }
    | BoolPin     data -> BoolPin     { data with Direction = direction }
    | BytePin     data -> BytePin     { data with Direction = direction }
    | EnumPin     data -> EnumPin     { data with Direction = direction }
    | ColorPin    data -> ColorPin    { data with Direction = direction }

  // ** setName

  let setName name = function
    | StringPin   data -> StringPin   { data with Name = name }
    | NumberPin   data -> NumberPin   { data with Name = name }
    | BoolPin     data -> BoolPin     { data with Name = name }
    | BytePin     data -> BytePin     { data with Name = name }
    | EnumPin     data -> EnumPin     { data with Name = name }
    | ColorPin    data -> ColorPin    { data with Name = name }

  // ** setTags

  let setTags tags = function
    | StringPin data -> StringPin { data with Tags = tags }
    | NumberPin data -> NumberPin { data with Tags = tags }
    | BoolPin   data -> BoolPin   { data with Tags = tags }
    | BytePin   data -> BytePin   { data with Tags = tags }
    | EnumPin   data -> EnumPin   { data with Tags = tags }
    | ColorPin  data -> ColorPin  { data with Tags = tags }

  // ** setSlice

  //  ____       _   ____  _ _
  // / ___|  ___| |_/ ___|| (_) ___ ___
  // \___ \ / _ \ __\___ \| | |/ __/ _ \
  //  ___) |  __/ |_ ___) | | | (_|  __/
  // |____/ \___|\__|____/|_|_|\___\___|

  let setSlice (value: Slice) (pin: Pin) =
    let update (arr : 'a array) (idx: Index) (data: 'a) =
      let idx = int idx
      if idx > Array.length arr then
        #if FABLE_COMPILER
        /// Rationale:
        ///
        /// in JavaScript an array> will re-allocate automatically under the hood
        /// hence we don't need to worry about out-of-bounds errors.
        let newarr = Array.copy arr
        newarr.[idx] <- data
        newarr
        #else
        /// Rationale:
        ///
        /// in .NET, we need to worry about out-of-bounds errors, and we
        /// detected that we are about to run into one, hence re-alloc, copy
        /// and finally set the value at the correct index.
        let newarr = Array.zeroCreate (idx + 1)
        arr.CopyTo(newarr, 0)
        newarr.[idx] <- data
        newarr
        #endif
      else
        Array.mapi (fun i old -> if i = idx then data else old) arr

    match pin with
    | StringPin data as current ->
      match value with
        | StringSlice (i,slice) -> StringPin { data with Values = update data.Values i slice }
        | _                     -> current

    | NumberPin data as current ->
      match value with
        | NumberSlice (i,slice) -> NumberPin { data with Values = update data.Values i slice }
        | _                     -> current

    | BoolPin data as current   ->
      match value with
        | BoolSlice (i,slice)   -> BoolPin { data with Values = update data.Values i slice }
        | _                     -> current

    | BytePin data as current   ->
      match value with
        | ByteSlice (i,slice)   -> BytePin { data with Values = update data.Values i slice }
        | _                     -> current

    | EnumPin data as current   ->
      match value with
        | EnumSlice (i,slice)   -> EnumPin { data with Values = update data.Values i slice }
        | _                     -> current

    | ColorPin data as current  ->
      match value with
        | ColorSlice (i,slice)  -> ColorPin { data with Values = update data.Values i slice }
        | _                     -> current

  // ** setSlices

  let setSlices slices = function
    | StringPin data as value ->
      match slices with
      | StringSlices (id,arr) when id = data.Id ->
        StringPin { data with Values = arr }
      | _ -> value

    | NumberPin data as value ->
      match slices with
      | NumberSlices (id,arr) when id = data.Id ->
        NumberPin { data with Values = arr }
      | _ -> value

    | BoolPin data as value ->
      match slices with
      | BoolSlices (id, arr) when id = data.Id ->
        BoolPin { data with Values = arr }
      | _ -> value

    | BytePin data as value ->
      match slices with
      | ByteSlices (id, arr) when id = data.Id ->
        BytePin { data with Values = arr }
      | _ -> value

    | EnumPin data as value ->
      match slices with
      | EnumSlices (id, arr) when id = data.Id ->
        EnumPin { data with Values = arr }
      | _ -> value

    | ColorPin data as value ->
      match slices with
      | ColorSlices (id,arr) when id = data.Id ->
        ColorPin { data with Values = arr }
      | _ -> value


  // ** setPersisted

  let setPersisted (persisted: bool) = function
    | StringPin data -> StringPin { data with Persisted = persisted }
    | NumberPin data -> NumberPin { data with Persisted = persisted }
    | BoolPin   data -> BoolPin   { data with Persisted = persisted }
    | BytePin   data -> BytePin   { data with Persisted = persisted }
    | EnumPin   data -> EnumPin   { data with Persisted = persisted }
    | ColorPin  data -> ColorPin  { data with Persisted = persisted }

  // ** str2offset

  let str2offset (builder: FlatBufferBuilder) = function
    #if FABLE_COMPILER
    | null -> Unchecked.defaultof<Offset<string>>
    #else
    | null -> Unchecked.defaultof<StringOffset>
    #endif
    | str  -> builder.CreateString str

// * NumberPinD

//  ____              _     _      ____
// |  _ \  ___  _   _| |__ | | ___| __ )  _____  __
// | | | |/ _ \| | | | '_ \| |/ _ \  _ \ / _ \ \/ /
// | |_| | (_) | |_| | |_) | |  __/ |_) | (_) >  <
// |____/ \___/ \__,_|_.__/|_|\___|____/ \___/_/\_\

[<CustomComparison; CustomEquality>]
type NumberPinD =
  { Id         : Id
    Name       : string
    PinGroup   : Id
    Tags       : Tag array
    Persisted  : bool
    Direction  : ConnectionDirection
    VecSize    : VecSize
    Min        : int
    Max        : int
    Unit       : string
    Precision  : uint32
    Labels     : string array
    Values     : double array }

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) =
    let id = string self.Id |> builder.CreateString
    let name = self.Name |> Option.mapNull builder.CreateString
    let group = self.PinGroup |> string |> builder.CreateString
    let unit = self.Unit |> Option.mapNull builder.CreateString
    let tagoffsets = Array.map (unwrap >> Pin.str2offset builder) self.Tags
    let tags = NumberPinFB.CreateTagsVector(builder, tagoffsets)
    let labeloffsets = Array.map (Pin.str2offset builder) self.Labels
    let labels = NumberPinFB.CreateLabelsVector(builder, labeloffsets)
    let values = NumberPinFB.CreateValuesVector(builder, self.Values)
    let vecsize = self.VecSize.ToOffset(builder)
    let direction = self.Direction.ToOffset(builder)
    NumberPinFB.StartNumberPinFB(builder)
    NumberPinFB.AddId(builder, id)
    Option.iter (fun value -> NumberPinFB.AddName(builder, value)) name
    NumberPinFB.AddPinGroup(builder, group)
    NumberPinFB.AddPersisted(builder, self.Persisted)
    NumberPinFB.AddTags(builder, tags)
    NumberPinFB.AddVecSize(builder, vecsize)
    NumberPinFB.AddMin(builder, self.Min)
    NumberPinFB.AddMax(builder, self.Max)
    Option.iter (fun value -> NumberPinFB.AddUnit(builder, value)) unit
    NumberPinFB.AddPrecision(builder, self.Precision)
    NumberPinFB.AddVecSize(builder, vecsize)
    NumberPinFB.AddDirection(builder, direction)
    NumberPinFB.AddLabels(builder, labels)
    NumberPinFB.AddValues(builder, values)
    NumberPinFB.EndNumberPinFB(builder)

  // ** FromFB

  static member FromFB(fb: NumberPinFB) : Either<IrisError,NumberPinD> =
    either {
      let! tags = Pin.ParseTagsFB fb
      let! labels = Pin.ParseLabelsFB fb
      let! vecsize = Pin.ParseVecSize fb
      let! direction = ConnectionDirection.FromFB fb.Direction

      let! slices =
        Pin.ParseSimpleValuesFB fb
        |> Either.map (Array.map double)

      return { Id        = Id fb.Id
               Name      = fb.Name
               PinGroup  = Id fb.PinGroup
               Tags      = tags
               Persisted = fb.Persisted
               Min       = fb.Min
               Max       = fb.Max
               Unit      = fb.Unit
               Precision = fb.Precision
               VecSize   = vecsize
               Direction = direction
               Labels    = labels
               Values    = slices }
    }

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromBytes

  static member FromBytes(bytes: byte[]) : Either<IrisError,NumberPinD> =
    Binary.createBuffer bytes
    |> NumberPinFB.GetRootAsNumberPinFB
    |> NumberPinD.FromFB

  // ** Equals

  override self.Equals(other) =
    match other with
    | :? NumberPinD as pin ->
      (self :> System.IEquatable<NumberPinD>).Equals(pin)
    | _ -> false

  override self.GetHashCode() =
    self.Id.ToString().GetHashCode()

  // ** Equals<NumberPinD>

  interface System.IEquatable<NumberPinD> with
    member self.Equals(pin: NumberPinD) =
      let valuesEqual =
        if Array.length pin.Values = Array.length self.Values then
          Array.fold
            (fun m (left, right) ->
              if m then
                match left, right with
                | _,_ when Double.IsNaN left && Double.IsNaN right -> true
                | _ -> left = right
              else m)
            true
            (Array.zip pin.Values self.Values)
        else false

      pin.Id = self.Id &&
      pin.Name = self.Name &&
      pin.PinGroup = self.PinGroup &&
      pin.Tags = self.Tags &&
      pin.VecSize = self.VecSize &&
      pin.Direction = self.Direction &&
      pin.Labels = self.Labels &&
      valuesEqual

  // ** CompareTo

  interface System.IComparable with
    member self.CompareTo other =
      match other with
      | :? NumberPinD as pin -> compare self.Name pin.Name
      | _ -> invalidArg "other" "cannot compare value of different types"

// * StringPinD

//  ____  _        _             ____
// / ___|| |_ _ __(_)_ __   __ _| __ )  _____  __
// \___ \| __| '__| | '_ \ / _` |  _ \ / _ \ \/ /
//  ___) | |_| |  | | | | | (_| | |_) | (_) >  <
// |____/ \__|_|  |_|_| |_|\__, |____/ \___/_/\_\
//                         |___/

type StringPinD =
  { Id         : Id
    Name       : string
    PinGroup   : Id
    Tags       : Tag array
    Persisted  : bool
    Direction  : ConnectionDirection
    Behavior   : Behavior
    MaxChars   : MaxChars
    VecSize    : VecSize
    Labels     : string array
    Values     : string array }

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) =
    let id = string self.Id |> builder.CreateString
    let name = self.Name |> Option.mapNull builder.CreateString
    let group = self.PinGroup |> string |> builder.CreateString
    let tipe = self.Behavior.ToOffset(builder)
    let tagoffsets = Array.map (unwrap >> Pin.str2offset builder) self.Tags
    let labeloffsets = Array.map (Pin.str2offset builder) self.Labels
    let sliceoffsets = Array.map (Pin.str2offset builder) self.Values
    let tags = StringPinFB.CreateTagsVector(builder, tagoffsets)
    let labels = StringPinFB.CreateLabelsVector(builder, labeloffsets)
    let slices = StringPinFB.CreateValuesVector(builder, sliceoffsets)
    let vecsize = self.VecSize.ToOffset(builder)
    let direction = self.Direction.ToOffset(builder)

    StringPinFB.StartStringPinFB(builder)
    StringPinFB.AddId(builder, id)
    Option.iter (fun value -> StringPinFB.AddName(builder,value)) name
    StringPinFB.AddPinGroup(builder, group)
    StringPinFB.AddPersisted(builder, self.Persisted)
    StringPinFB.AddTags(builder, tags)
    StringPinFB.AddBehavior(builder, tipe)
    StringPinFB.AddMaxChars(builder, int self.MaxChars)
    StringPinFB.AddVecSize(builder, vecsize)
    StringPinFB.AddDirection(builder, direction)
    StringPinFB.AddLabels(builder, labels)
    StringPinFB.AddValues(builder, slices)
    StringPinFB.EndStringPinFB(builder)

  // ** FromFB

  static member FromFB(fb: StringPinFB) : Either<IrisError,StringPinD> =
    either {
      let! tags = Pin.ParseTagsFB fb
      let! labels = Pin.ParseLabelsFB fb
      let! slices = Pin.ParseSimpleValuesFB fb
      let! tipe = Behavior.FromFB fb.Behavior
      let! vecsize = Pin.ParseVecSize fb
      let! direction = ConnectionDirection.FromFB fb.Direction

      return { Id        = Id fb.Id
               Name      = fb.Name
               PinGroup  = Id fb.PinGroup
               Tags      = tags
               Persisted = fb.Persisted
               Behavior  = tipe
               MaxChars  = 1<chars> * fb.MaxChars
               VecSize   = vecsize
               Direction = direction
               Labels    = labels
               Values    = slices }
    }

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromStrings

  static member FromStrings(bytes: byte[]) : Either<IrisError,StringPinD> =
    Binary.createBuffer bytes
    |> StringPinFB.GetRootAsStringPinFB
    |> StringPinD.FromFB

// * BoolPinD

//  ____              _ ____
// | __ )  ___   ___ | | __ )  _____  __
// |  _ \ / _ \ / _ \| |  _ \ / _ \ \/ /
// | |_) | (_) | (_) | | |_) | (_) >  <
// |____/ \___/ \___/|_|____/ \___/_/\_\

type BoolPinD =
  { Id         : Id
    Name       : string
    PinGroup   : Id
    Tags       : Tag array
    Persisted  : bool
    Direction  : ConnectionDirection
    IsTrigger  : bool
    VecSize    : VecSize
    Labels     : string array
    Values     : bool array }

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) =
    let id = string self.Id |> builder.CreateString
    let name = self.Name |> Option.mapNull builder.CreateString
    let group = self.PinGroup |> string |> builder.CreateString
    let tagoffsets = Array.map (unwrap >> Pin.str2offset builder) self.Tags
    let tags = BoolPinFB.CreateTagsVector(builder, tagoffsets)
    let labeloffsets = Array.map (Pin.str2offset builder) self.Labels
    let labels = BoolPinFB.CreateLabelsVector(builder, labeloffsets)
    let slices = BoolPinFB.CreateValuesVector(builder, self.Values)
    let direction = self.Direction.ToOffset(builder)
    let vecsize = self.VecSize.ToOffset(builder)
    BoolPinFB.StartBoolPinFB(builder)
    BoolPinFB.AddId(builder, id)
    Option.iter (fun value -> BoolPinFB.AddName(builder,value)) name
    BoolPinFB.AddPinGroup(builder, group)
    BoolPinFB.AddPersisted(builder, self.Persisted)
    BoolPinFB.AddIsTrigger(builder, self.IsTrigger)
    BoolPinFB.AddTags(builder, tags)
    BoolPinFB.AddDirection(builder, direction)
    BoolPinFB.AddVecSize(builder, vecsize)
    BoolPinFB.AddLabels(builder, labels)
    BoolPinFB.AddValues(builder, slices)
    BoolPinFB.EndBoolPinFB(builder)

  // ** FromFB

  static member FromFB(fb: BoolPinFB) : Either<IrisError,BoolPinD> =
    either {
      let! tags = Pin.ParseTagsFB fb
      let! labels = Pin.ParseLabelsFB fb
      let! slices = Pin.ParseSimpleValuesFB fb
      let! vecsize = Pin.ParseVecSize fb
      let! direction = ConnectionDirection.FromFB fb.Direction

      return { Id        = Id fb.Id
               Name      = fb.Name
               PinGroup  = Id fb.PinGroup
               Tags      = tags
               Persisted = fb.Persisted
               IsTrigger = fb.IsTrigger
               VecSize   = vecsize
               Direction = direction
               Labels    = labels
               Values    = slices }
    }

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromBytes

  static member FromBytes(bytes: byte[]) : Either<IrisError,BoolPinD> =
    Binary.createBuffer bytes
    |> BoolPinFB.GetRootAsBoolPinFB
    |> BoolPinD.FromFB

// * BytePinD

//  ____        _       ____
// | __ ) _   _| |_ ___| __ )  _____  __
// |  _ \| | | | __/ _ \  _ \ / _ \ \/ /
// | |_) | |_| | ||  __/ |_) | (_) >  <
// |____/ \__, |\__\___|____/ \___/_/\_\
//        |___/

type [<CustomEquality;CustomComparison>] BytePinD =

  { Id         : Id
    Name       : string
    PinGroup   : Id
    Tags       : Tag array
    Persisted  : bool
    Direction  : ConnectionDirection
    VecSize    : VecSize
    Labels     : string array
    Values     : byte[] array }

  // ** Equals

  override self.Equals(other) =
    match other with
    | :? BytePinD as pin ->
      (self :> System.IEquatable<BytePinD>).Equals(pin)
    | _ -> false

  override self.GetHashCode() =
    self.Id.ToString().GetHashCode()

  // ** Equals<ByteSliceD>

  interface System.IEquatable<BytePinD> with
    member self.Equals(pin: BytePinD) =
      let mutable contentsEqual = false
      let lengthEqual =
        #if FABLE_COMPILER
        let mylen = Array.fold (fun m (t: byte[]) -> m + int t.Length) (Array.length self.Values) self.Values
        let itlen = Array.fold (fun m (t: byte[]) -> m + int t.Length) (Array.length pin.Values) pin.Values
        let result = mylen = itlen
        if result then
          let mutable contents = true
          let mutable n = 0

          while n < Array.length self.Values do
            let me = self.Values.[n]
            let it = pin.Values.[n]
            let mutable i = 0
            while i < int self.Values.[n].Length do
              if contents then
                contents <- me.[i] = it.[i]
              i <- i + 1
            n <- n + 1

          contentsEqual <- contents
        result
        #else
        let result = self.Values = pin.Values
        contentsEqual <- result
        result
        #endif
      pin.Id = self.Id &&
      pin.Name = self.Name &&
      pin.PinGroup = self.PinGroup &&
      pin.Tags = self.Tags &&
      pin.VecSize = self.VecSize &&
      pin.Direction = self.Direction &&
      pin.Labels = self.Labels &&
      lengthEqual &&
      contentsEqual

  // ** CompareTo

  interface System.IComparable with
    member self.CompareTo other =
      match other with
      | :? BytePinD as pin -> compare self.Name pin.Name
      | _ -> invalidArg "other" "cannot compare value of different types"

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) =
    let id = string self.Id |> builder.CreateString
    let name = self.Name |> Option.mapNull builder.CreateString
    let group = self.PinGroup |> string |> builder.CreateString
    let tagoffsets = Array.map (unwrap >> Pin.str2offset builder) self.Tags
    let labeloffsets = Array.map (Pin.str2offset builder) self.Labels
    let sliceoffsets = Array.map (String.encodeBase64 >> builder.CreateString) self.Values
    let labels = BytePinFB.CreateLabelsVector(builder, labeloffsets)
    let tags = BytePinFB.CreateTagsVector(builder, tagoffsets)
    let slices = BytePinFB.CreateValuesVector(builder, sliceoffsets)
    let vecsize = self.VecSize.ToOffset(builder)
    let direction = self.Direction.ToOffset(builder)
    BytePinFB.StartBytePinFB(builder)
    BytePinFB.AddId(builder, id)
    Option.iter (fun value -> BytePinFB.AddName(builder,value)) name
    BytePinFB.AddPinGroup(builder, group)
    BytePinFB.AddPersisted(builder, self.Persisted)
    BytePinFB.AddTags(builder, tags)
    BytePinFB.AddVecSize(builder, vecsize)
    BytePinFB.AddDirection(builder, direction)
    BytePinFB.AddLabels(builder, labels)
    BytePinFB.AddValues(builder, slices)
    BytePinFB.EndBytePinFB(builder)

  // ** FromFB

  static member FromFB(fb: BytePinFB) : Either<IrisError,BytePinD> =
    either {
      let! tags = Pin.ParseTagsFB fb
      let! labels = Pin.ParseLabelsFB fb
      let! vecsize = Pin.ParseVecSize fb
      let! direction = ConnectionDirection.FromFB fb.Direction
      let! slices =
        Pin.ParseSimpleValuesFB fb
        |> Either.map (Array.map String.decodeBase64)

      return { Id        = Id fb.Id
               Name      = fb.Name
               PinGroup  = Id fb.PinGroup
               Tags      = tags
               Persisted = fb.Persisted
               VecSize   = vecsize
               Direction = direction
               Labels    = labels
               Values    = slices }
    }

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromBytes

  static member FromBytes(bytes: byte[]) : Either<IrisError,BytePinD> =
    Binary.createBuffer bytes
    |> BytePinFB.GetRootAsBytePinFB
    |> BytePinD.FromFB

// * EnumPinD

//  _____                       ____
// | ____|_ __  _   _ _ __ ___ | __ )  _____  __
// |  _| | '_ \| | | | '_ ` _ \|  _ \ / _ \ \/ /
// | |___| | | | |_| | | | | | | |_) | (_) >  <
// |_____|_| |_|\__,_|_| |_| |_|____/ \___/_/\_\

type EnumPinD =
  { Id         : Id
    Name       : string
    PinGroup   : Id
    Tags       : Tag array
    Persisted  : bool
    Direction  : ConnectionDirection
    VecSize    : VecSize
    Properties : Property array
    Labels     : string array
    Values     : Property array }

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) =
    let id = string self.Id |> builder.CreateString
    let name = self.Name |> Option.mapNull builder.CreateString
    let group = self.PinGroup |> string |> builder.CreateString
    let tagoffsets = Array.map (unwrap >> Pin.str2offset builder) self.Tags
    let labeloffsets = Array.map (Pin.str2offset builder) self.Labels
    let sliceoffsets = Array.map (Binary.toOffset builder) self.Values
    let propoffsets = Array.map (Binary.toOffset builder) self.Properties
    let tags = EnumPinFB.CreateTagsVector(builder, tagoffsets)
    let labels = EnumPinFB.CreateLabelsVector(builder, labeloffsets)
    let slices = EnumPinFB.CreateValuesVector(builder, sliceoffsets)
    let properties = EnumPinFB.CreatePropertiesVector(builder, propoffsets)
    let direction = self.Direction.ToOffset(builder)
    let vecsize = self.VecSize.ToOffset(builder)
    EnumPinFB.StartEnumPinFB(builder)
    EnumPinFB.AddId(builder, id)
    Option.iter (fun value -> EnumPinFB.AddName(builder,value)) name
    EnumPinFB.AddPinGroup(builder, group)
    EnumPinFB.AddPersisted(builder, self.Persisted)
    EnumPinFB.AddTags(builder, tags)
    EnumPinFB.AddProperties(builder, properties)
    EnumPinFB.AddDirection(builder, direction)
    EnumPinFB.AddVecSize(builder, vecsize)
    EnumPinFB.AddLabels(builder, labels)
    EnumPinFB.AddValues(builder, slices)
    EnumPinFB.EndEnumPinFB(builder)

  // ** FromFB

  static member FromFB(fb: EnumPinFB) : Either<IrisError,EnumPinD> =
    either {
      let! labels = Pin.ParseLabelsFB fb
      let! tags = Pin.ParseTagsFB fb
      let! slices = Pin.ParseComplexValuesFB fb
      let! vecsize = Pin.ParseVecSize fb
      let! direction = ConnectionDirection.FromFB fb.Direction

      let! properties =
        let properties = Array.zeroCreate fb.PropertiesLength
        Array.fold
          (fun (m: Either<IrisError, int * Property array>) _ -> either {
            let! (i, arr) = m
            #if FABLE_COMPILER
            let prop = fb.Properties(i)
            #else
            let! prop =
              let nullable = fb.Properties(i)
              if nullable.HasValue then
                Either.succeed nullable.Value
              else
                "Cannot parse empty property"
                |> Error.asParseError "EnumPin.FromFB"
                |> Either.fail
            #endif
            arr.[i] <- { Key = prop.Key; Value = prop.Value }
            return (i + 1, arr)
          })
          (Right (0, properties))
          properties
        |> Either.map snd

      return { Id         = Id fb.Id
               Name       = fb.Name
               PinGroup   = Id fb.PinGroup
               Tags       = tags
               Persisted  = fb.Persisted
               Properties = properties
               Direction  = direction
               VecSize    = vecsize
               Labels     = labels
               Values     = slices }
    }

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromEnums

  static member FromEnums(bytes: byte[]) : Either<IrisError,EnumPinD> =
    Binary.createBuffer bytes
    |> EnumPinFB.GetRootAsEnumPinFB
    |> EnumPinD.FromFB

// * ColorPinD

//   ____      _            ____
//  / ___|___ | | ___  _ __| __ )  _____  __
// | |   / _ \| |/ _ \| '__|  _ \ / _ \ \/ /
// | |__| (_) | | (_) | |  | |_) | (_) >  <
//  \____\___/|_|\___/|_|  |____/ \___/_/\_\

type ColorPinD =
  { Id:        Id
    Name:      string
    PinGroup:  Id
    Tags:      Tag array
    Persisted: bool
    Direction: ConnectionDirection
    VecSize:   VecSize
    Labels:    string array
    Values:    ColorSpace array }

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) =
    let id = string self.Id |> builder.CreateString
    let name = self.Name |> Option.mapNull builder.CreateString
    let group = self.PinGroup |> string |> builder.CreateString
    let tagoffsets = Array.map (unwrap >> Pin.str2offset builder) self.Tags
    let labeloffsets = Array.map (Pin.str2offset builder) self.Labels
    let sliceoffsets = Array.map (Binary.toOffset builder) self.Values
    let tags = ColorPinFB.CreateTagsVector(builder, tagoffsets)
    let labels = ColorPinFB.CreateLabelsVector(builder, labeloffsets)
    let slices = ColorPinFB.CreateValuesVector(builder, sliceoffsets)
    let direction = self.Direction.ToOffset(builder)
    let vecsize = self.VecSize.ToOffset(builder)
    ColorPinFB.StartColorPinFB(builder)
    ColorPinFB.AddId(builder, id)
    Option.iter (fun value -> ColorPinFB.AddName(builder,value)) name
    ColorPinFB.AddPinGroup(builder, group)
    ColorPinFB.AddPersisted(builder, self.Persisted)
    ColorPinFB.AddTags(builder, tags)
    ColorPinFB.AddVecSize(builder, vecsize)
    ColorPinFB.AddDirection(builder, direction)
    ColorPinFB.AddLabels(builder, labels)
    ColorPinFB.AddValues(builder, slices)
    ColorPinFB.EndColorPinFB(builder)

  // ** FromFB

  static member FromFB(fb: ColorPinFB) : Either<IrisError,ColorPinD> =
    either {
      let! tags = Pin.ParseTagsFB fb
      let! labels = Pin.ParseLabelsFB fb
      let! slices = Pin.ParseComplexValuesFB fb
      let! vecsize = Pin.ParseVecSize fb
      let! direction = ConnectionDirection.FromFB fb.Direction

      return { Id        = Id fb.Id
               Name      = fb.Name
               PinGroup  = Id fb.PinGroup
               Tags      = tags
               Persisted = fb.Persisted
               VecSize   = vecsize
               Direction = direction
               Labels    = labels
               Values    = slices }
    }

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromColors

  static member FromColors(bytes: byte[]) : Either<IrisError,ColorPinD> =
    Binary.createBuffer bytes
    |> ColorPinFB.GetRootAsColorPinFB
    |> ColorPinD.FromFB

// * Slice

//  ____  _ _
// / ___|| (_) ___ ___
// \___ \| | |/ __/ _ \
//  ___) | | | (_|  __/
// |____/|_|_|\___\___|

[<CustomEquality;CustomComparison>]
type Slice =
  | StringSlice   of Index * string
  | NumberSlice   of Index * double
  | BoolSlice     of Index * bool
  | ByteSlice     of Index * byte[]
  | EnumSlice     of Index * Property
  | ColorSlice    of Index * ColorSpace

  // ** Index

  member self.Index
    with get () =
      match self with
      | StringSlice (idx, _) -> idx
      | NumberSlice (idx, _) -> idx
      | BoolSlice   (idx, _) -> idx
      | ByteSlice   (idx, _) -> idx
      | EnumSlice   (idx, _) -> idx
      | ColorSlice  (idx, _) -> idx

  // ** Value

  member self.Value
    with get () : obj =
      match self with
      | StringSlice  (_, data) -> data :> obj
      | NumberSlice  (_, data) -> data :> obj
      | BoolSlice    (_, data) -> data :> obj
      | ByteSlice    (_, data) -> data :> obj
      | EnumSlice    (_, data) -> data :> obj
      | ColorSlice   (_, data) -> data :> obj

  // ** Equals

  override self.Equals(other) =
    match other with
    | :? Slice as slice -> (self :> System.IEquatable<Slice>).Equals(slice)
    | _ -> false

  override self.GetHashCode() =
      match self with
      | StringSlice  _ -> 0
      | NumberSlice  _ -> 1
      | BoolSlice    _ -> 2
      | ByteSlice    _ -> 3
      | EnumSlice    _ -> 4
      | ColorSlice   _ -> 5

  // ** CompareTo

  interface System.IComparable with
    member self.CompareTo other =
      match other with
      | :? Slice as slice -> compare self.Index slice.Index
      | _ -> invalidArg "other" "cannot compare value of different types"

  // ** Equals<Slice>

  interface System.IEquatable<Slice> with
    member self.Equals(slice: Slice) =
      match slice with
      | StringSlice (idx, value) ->
        match self with
        | StringSlice (sidx, svalue) -> idx = sidx && value = svalue
        | _ -> false
      | NumberSlice (idx, value) when Double.IsNaN value ->
        match self with
        | NumberSlice (sidx, svalue) when Double.IsNaN svalue -> idx = sidx
        | _ -> false
      | NumberSlice (idx, value) ->
        match self with
        | NumberSlice (sidx, svalue) -> idx = sidx && value = svalue
        | _ -> false
      | BoolSlice   (idx, value) ->
        match self with
        | BoolSlice (sidx, svalue) -> idx = sidx && value = svalue
        | _ -> false
      | ByteSlice   (idx, value) ->
        match self with
        | ByteSlice (sidx, svalue) -> idx = sidx && value = svalue
        | _ -> false
      | EnumSlice (idx, value) ->
        match self with
        | EnumSlice (sidx, svalue) -> idx = sidx && value = svalue
        | _ -> false
      | ColorSlice (idx, value) ->
        match self with
        | ColorSlice (sidx, svalue) -> idx = sidx && value = svalue
        | _ -> false

  // ** StringValue

  member self.StringValue
    with get () =
      match self with
      | StringSlice (_,data) -> Some data
      | _                    -> None

  // ** NumberValue

  member self.NumberValue
    with get () =
      match self with
      | NumberSlice (_,data) -> Some data
      | _                    -> None

  // ** BoolValue

  member self.BoolValue
    with get () =
      match self with
      | BoolSlice (_,data) -> Some data
      | _                  -> None

  // ** ByteValue

  member self.ByteValue
    with get () =
      match self with
      | ByteSlice (_,data) -> Some data
      | _                  -> None

  // ** EnumValue

  member self.EnumValue
    with get () =
      match self with
      | EnumSlice (_,data) -> Some data
      | _                  -> None

  // ** ColorValue

  member self.ColorValue
    with get () =
      match self with
      | ColorSlice (_,data) -> Some data
      | _                   -> None

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member self.ToOffset(builder: FlatBufferBuilder) =
    match self with
    | StringSlice (idx, data) ->
      let str = Option.mapNull builder.CreateString data
      StringFB.StartStringFB(builder)
      Option.iter (fun data -> StringFB.AddValue(builder, data)) str
      let offset = StringFB.EndStringFB(builder)
      SliceFB.StartSliceFB(builder)
      SliceFB.AddIndex(builder, int idx)
      SliceFB.AddSliceType(builder, SliceTypeFB.StringFB)
      #if FABLE_COMPILER
      SliceFB.AddSlice(builder, offset)
      #else
      SliceFB.AddSlice(builder, offset.Value)
      #endif
      SliceFB.EndSliceFB(builder)

    | NumberSlice (idx, data) ->
      DoubleFB.StartDoubleFB(builder)
      DoubleFB.AddValue(builder, data)
      let offset = DoubleFB.EndDoubleFB(builder)
      SliceFB.StartSliceFB(builder)
      SliceFB.AddIndex(builder, int idx)
      SliceFB.AddSliceType(builder, SliceTypeFB.DoubleFB)
      #if FABLE_COMPILER
      SliceFB.AddSlice(builder, offset)
      #else
      SliceFB.AddSlice(builder, offset.Value)
      #endif
      SliceFB.EndSliceFB(builder)

    | BoolSlice (idx, data) ->
      BoolFB.StartBoolFB(builder)
      BoolFB.AddValue(builder,data)
      let offset = BoolFB.EndBoolFB(builder)
      SliceFB.StartSliceFB(builder)
      SliceFB.AddIndex(builder, int idx)
      SliceFB.AddSliceType(builder, SliceTypeFB.BoolFB)
      #if FABLE_COMPILER
      SliceFB.AddSlice(builder, offset)
      #else
      SliceFB.AddSlice(builder, offset.Value)
      #endif
      SliceFB.EndSliceFB(builder)

    | ByteSlice (idx, data) ->
      let str = data |> String.encodeBase64 |> builder.CreateString
      StringFB.StartStringFB(builder)
      StringFB.AddValue(builder,str)
      let offset = StringFB.EndStringFB(builder)
      SliceFB.StartSliceFB(builder)
      SliceFB.AddIndex(builder, int idx)
      SliceFB.AddSliceType(builder, SliceTypeFB.ByteFB)
      #if FABLE_COMPILER
      SliceFB.AddSlice(builder, offset)
      #else
      SliceFB.AddSlice(builder, offset.Value)
      #endif
      SliceFB.EndSliceFB(builder)

    | EnumSlice (idx, data) ->
      let offset: Offset<KeyValueFB> = data.ToOffset(builder)
      SliceFB.StartSliceFB(builder)
      SliceFB.AddIndex(builder, int idx)
      SliceFB.AddSliceType(builder, SliceTypeFB.KeyValueFB)
      #if FABLE_COMPILER
      SliceFB.AddSlice(builder, offset)
      #else
      SliceFB.AddSlice(builder, offset.Value)
      #endif
      SliceFB.EndSliceFB(builder)

    | ColorSlice (idx, data) ->
      let offset = data.ToOffset(builder)
      SliceFB.StartSliceFB(builder)
      SliceFB.AddIndex(builder, int idx)
      SliceFB.AddSliceType(builder, SliceTypeFB.ColorSpaceFB)
      #if FABLE_COMPILER
      SliceFB.AddSlice(builder, offset)
      #else
      SliceFB.AddSlice(builder, offset.Value)
      #endif
      SliceFB.EndSliceFB(builder)

  // ** FromFB

  static member FromFB(fb: SliceFB) : Either<IrisError,Slice>  =
    match fb.SliceType with
    #if FABLE_COMPILER
    | x when x = SliceTypeFB.StringFB ->
      let slice = StringFB.Create() |> fb.Slice
      StringSlice(index fb.Index, slice.Value)
      |> Either.succeed

    | x when x = SliceTypeFB.DoubleFB ->
      let slice = DoubleFB.Create() |> fb.Slice
      NumberSlice(index fb.Index, slice.Value)
      |> Either.succeed

    | x when x = SliceTypeFB.BoolFB ->
      let slice = BoolFB.Create() |> fb.Slice
      BoolSlice(index fb.Index,slice.Value)
      |> Either.succeed

    | x when x = SliceTypeFB.ByteFB ->
      let slice = ByteFB.Create() |> fb.Slice
      ByteSlice(index fb.Index,String.decodeBase64 slice.Value)
      |> Either.succeed

    | x when x = SliceTypeFB.KeyValueFB ->
      either {
        let slice = KeyValueFB.Create() |> fb.Slice
        let! prop = Property.FromFB slice
        return EnumSlice(index fb.Index,prop)
      }

    | x when x = SliceTypeFB.ColorSpaceFB ->
      either {
        let slice = ColorSpaceFB.Create() |> fb.Slice
        let! color = ColorSpace.FromFB slice
        return ColorSlice(index fb.Index, color)
      }

    | x ->
      sprintf "Could not parse slice. Unknown slice type %A" x
      |> Error.asParseError "Slice.FromFB"
      |> Either.fail

    #else

    | SliceTypeFB.StringFB   ->
      let slice = fb.Slice<StringFB>()
      if slice.HasValue then
        let value = slice.Value
        StringSlice(index fb.Index, value.Value)
        |> Either.succeed
      else
        "Could not parse StringSlice"
        |> Error.asParseError "Slice.FromFB"
        |> Either.fail

    | SliceTypeFB.DoubleFB   ->
      let slice = fb.Slice<DoubleFB>()
      if slice.HasValue then
        let value = slice.Value
        NumberSlice(index fb.Index,value.Value)
        |> Either.succeed
      else
        "Could not parse NumberSlice"
        |> Error.asParseError "Slice.FromFB"
        |> Either.fail

    | SliceTypeFB.BoolFB     ->
      let slice = fb.Slice<BoolFB>()
      if slice.HasValue then
        let value = slice.Value
        BoolSlice(index fb.Index, value.Value)
        |> Either.succeed
      else
        "Could not parse BoolSlice"
        |> Error.asParseError "Slice.FromFB"
        |> Either.fail

    | SliceTypeFB.ByteFB     ->
      let slice = fb.Slice<ByteFB>()
      if slice.HasValue then
        let value = slice.Value
        ByteSlice(index fb.Index, String.decodeBase64 value.Value)
        |> Either.succeed
      else
        "Could not parse ByteSlice"
        |> Error.asParseError "Slice.FromFB"
        |> Either.fail

    | SliceTypeFB.KeyValueFB     ->
      let slice = fb.Slice<KeyValueFB>()
      if slice.HasValue then
        either {
          let value = slice.Value
          let! prop = Property.FromFB value
          return EnumSlice(index fb.Index, prop)
        }
      else
        "Could not parse EnumSlice"
        |> Error.asParseError "Slice.FromFB"
        |> Either.fail

    | SliceTypeFB.ColorSpaceFB    ->
      let slice = fb.Slice<ColorSpaceFB>()
      if slice.HasValue then
        either {
          let value = slice.Value
          let! color = ColorSpace.FromFB value
          return ColorSlice(index fb.Index, color)
        }
      else
        "Could not parse ColorSlice"
        |> Error.asParseError "Slice.FromFB"
        |> Either.fail

    | x ->
      sprintf "Cannot parse slice. Unknown slice type: %A" x
      |> Error.asParseError "Slice.FromFB"
      |> Either.fail

    #endif

  // ** ToBytes

  member self.ToBytes() : byte[] = Binary.buildBuffer self

  // ** FromBytes

  static member FromBytes(bytes: byte[]) : Either<IrisError,Slice> =
    Binary.createBuffer bytes
    |> SliceFB.GetRootAsSliceFB
    |> Slice.FromFB

  // ** ToYaml

  #if !FABLE_COMPILER && !IRIS_NODES

  member self.ToYaml(serializer: Serializer) =
    let yaml =
      match self with
      | StringSlice (idx, slice) ->
        SliceYaml.StringSlice (int idx) slice

      | NumberSlice (idx, slice) ->
        SliceYaml.NumberSlice (int idx) slice

      | BoolSlice (idx, slice) ->
        SliceYaml.BoolSlice (int idx) slice

      | ByteSlice (idx, slice) ->
        SliceYaml.ByteSlice (int idx) slice

      | EnumSlice (idx, slice) ->
        SliceYaml.EnumSlice (int idx) slice

      | ColorSlice (idx, slice) ->
        SliceYaml.ColorSlice (int idx) slice

    serializer.Serialize yaml

  // ** FromYaml

  static member FromYaml(str: string) =
    let serializer = new Serializer()
    let yaml = serializer.Deserialize<SliceYaml>(str)
    yaml.ToSlice()

  #endif

// * Slices

//  ____  _ _
// / ___|| (_) ___ ___  ___
// \___ \| | |/ __/ _ \/ __|
//  ___) | | | (_|  __/\__ \
// |____/|_|_|\___\___||___/

[<CustomEquality; CustomComparison>]
type Slices =
  | StringSlices   of Id * string array
  | NumberSlices   of Id * double array
  | BoolSlices     of Id * bool array
  | ByteSlices     of Id * byte[] array
  | EnumSlices     of Id * Property array
  | ColorSlices    of Id * ColorSpace array

  // ** Id

  member self.Id
    with get () =
      match self with
      | StringSlices   (id,_) -> id
      | NumberSlices   (id,_) -> id
      | BoolSlices     (id,_) -> id
      | ByteSlices     (id,_) -> id
      | EnumSlices     (id,_) -> id
      | ColorSlices    (id,_) -> id

  // ** IsString

  member self.IsString
    with get () =
      match self with
      | StringSlices _ -> true
      |              _ -> false

  // ** IsNumber

  member self.IsNumber
    with get () =
      match self with
      | NumberSlices _ -> true
      |              _ -> false

  // ** IsBool

  member self.IsBool
    with get () =
      match self with
      | BoolSlices _ -> true
      |            _ -> false

  // ** IsByte

  member self.IsByte
    with get () =
      match self with
      | ByteSlices _ -> true
      |            _ -> false

  // ** IsEnum

  member self.IsEnum
    with get () =
      match self with
      | EnumSlices _ -> true
      |            _ -> false

  // ** IsColor

  member self.IsColor
    with get () =
      match self with
      | ColorSlices _ -> true
      |             _ -> false

  // ** Item

  //  ___ _
  // |_ _| |_ ___ _ __ ___
  //  | || __/ _ \ '_ ` _ \
  //  | || ||  __/ | | | | |
  // |___|\__\___|_| |_| |_|

  member self.Item (idx: Index) =
    match self with
    | StringSlices (_,arr) -> StringSlice (idx, arr.[int idx])
    | NumberSlices (_,arr) -> NumberSlice (idx, arr.[int idx])
    | BoolSlices   (_,arr) -> BoolSlice   (idx, arr.[int idx])
    | ByteSlices   (_,arr) -> ByteSlice   (idx, arr.[int idx])
    | EnumSlices   (_,arr) -> EnumSlice   (idx, arr.[int idx])
    | ColorSlices  (_,arr) -> ColorSlice  (idx, arr.[int idx])

  // ** At

  member self.At (idx: Index) = self.Item idx

  member self.Length =
    match self with
    | StringSlices (_,arr) -> arr.Length
    | NumberSlices (_,arr) -> arr.Length
    | BoolSlices   (_,arr) -> arr.Length
    | ByteSlices   (_,arr) -> arr.Length
    | EnumSlices   (_,arr) -> arr.Length
    | ColorSlices  (_,arr) -> arr.Length

  // ** Map

  //  __  __
  // |  \/  | __ _ _ __
  // | |\/| |/ _` | '_ \
  // | |  | | (_| | |_) |
  // |_|  |_|\__,_| .__/
  //              |_|

  member self.Map (f: Slice -> 'a) : 'a array =
    match self with
    | StringSlices   (_,arr) -> Array.mapi (fun i el -> StringSlice (index i, el) |> f) arr
    | NumberSlices   (_,arr) -> Array.mapi (fun i el -> NumberSlice (index i, el) |> f) arr
    | BoolSlices     (_,arr) -> Array.mapi (fun i el -> BoolSlice   (index i, el) |> f) arr
    | ByteSlices     (_,arr) -> Array.mapi (fun i el -> ByteSlice   (index i, el) |> f) arr
    | EnumSlices     (_,arr) -> Array.mapi (fun i el -> EnumSlice   (index i, el) |> f) arr
    | ColorSlices    (_,arr) -> Array.mapi (fun i el -> ColorSlice  (index i, el) |> f) arr

  #if !FABLE_COMPILER

  // ** ToSpread

  member self.ToSpread() =
    let sb = new StringBuilder()
    match self with
    | StringSlices(_,arr) ->
      Array.iteri
        (fun i (str: string) ->
          let escape =
            if isNull str then false
            else str.IndexOf ' ' > -1
          let value =
            if isNull str || str.IndexOf '|' = -1 then
              str
            else
              str.Replace("|","||")
          if i > 0  then sb.Append ',' |> ignore
          if escape then sb.Append '|' |> ignore
          sb.Append value |> ignore
          if escape then sb.Append '|' |> ignore)
        arr
    | NumberSlices(_,arr) ->
      Array.iteri
        (fun i (num: double) ->
          if i > 0 then sb.Append ',' |> ignore
          num |> string |> sb.Append |> ignore)
        arr
    | BoolSlices(_,arr) ->
      Array.iteri
        (fun i (value: bool) ->
          if i > 0 then sb.Append ',' |> ignore
          match value with
          | true  -> "1" |> string |> sb.Append |> ignore
          | false -> "0" |> string |> sb.Append |> ignore)
        arr
    | ByteSlices(_,arr) ->
      Array.iteri
        (fun i (value: byte[]) ->
          if i > 0 then sb.Append ',' |> ignore
          sb.Append '|' |> ignore
          value |> String.encodeBase64 |> sb.Append |> ignore
          sb.Append '|' |> ignore)
        arr
    | EnumSlices(_,arr) ->
      Array.iteri
        (fun i (prop: Property) ->
          let escape = prop.Value.IndexOf ' ' > -1
          if i > 0  then sb.Append ',' |> ignore
          if escape then sb.Append '|' |> ignore
          prop.Value |> sb.Append |> ignore
          if escape then sb.Append '|' |> ignore)
        arr
    | ColorSlices(_,arr) ->
      Array.iteri
        (fun i (color: ColorSpace) ->
          if i > 0 then sb.Append ',' |> ignore
          sb.Append '|' |> ignore
          let rgba =
            match color with
            | RGBA rgba -> rgba
            | HSLA hsla -> hsla.ToRGBA()
          // Add F# string conversion which is culture invariant
          sb.Append(float rgba.Red / 255.0 |> string)
            .Append(',')
            .Append(float rgba.Green / 255.0 |> string)
            .Append(',')
            .Append(float rgba.Blue / 255.0 |> string)
            .Append(',')
            .Append(float rgba.Alpha / 255.0 |> string)
          |> ignore
          sb.Append '|' |> ignore)
        arr
    string sb

  #endif

  // ** ToYamlObject

  #if !FABLE_COMPILER && !IRIS_NODES

  member self.ToYamlObject() =
    match self with
    | StringSlices (id, slices) -> SlicesYaml.StringSlices (string id) slices
    | NumberSlices (id, slices) -> SlicesYaml.NumberSlices (string id) slices
    | BoolSlices   (id, slices) -> SlicesYaml.BoolSlices   (string id) slices
    | ByteSlices   (id, slices) -> SlicesYaml.ByteSlices   (string id) slices
    | EnumSlices   (id, slices) -> SlicesYaml.EnumSlices   (string id) slices
    | ColorSlices  (id, slices) -> SlicesYaml.ColorSlices  (string id) slices

  // ** ToYaml

  member self.ToYaml(serializer: Serializer) =
    self
    |> Yaml.toYaml
    |> serializer.Serialize

  // ** FromYamlObject

  static member FromYamlObject(yaml: SlicesYaml) =
    yaml.ToSlices()

  // ** FromYaml

  static member FromYaml(str: string) =
    let serializer = Serializer()
    let yaml = serializer.Deserialize<SlicesYaml>(str)
    yaml.ToSlices()

  #endif

  // ** ToOffset

  //  ____  _
  // | __ )(_)_ __   __ _ _ __ _   _
  // |  _ \| | '_ \ / _` | '__| | | |
  // | |_) | | | | | (_| | |  | |_| |
  // |____/|_|_| |_|\__,_|_|   \__, |
  //                           |___/

  member slices.ToOffset(builder: FlatBufferBuilder) =
    match slices with
    | StringSlices (id,arr) ->
      let id = id |> string |> builder.CreateString

      let strings =
        Array.map (Pin.str2offset builder) arr
        |> fun coll -> StringsFB.CreateValuesVector(builder,coll)
      StringsFB.StartStringsFB(builder)
      StringsFB.AddValues(builder, strings)
      let offset = StringsFB.EndStringsFB(builder)

      SlicesFB.StartSlicesFB(builder)
      SlicesFB.AddId(builder,id)
      SlicesFB.AddSlicesType(builder,SlicesTypeFB.StringsFB)
      #if FABLE_COMPILER
      SlicesFB.AddSlices(builder, offset)
      #else
      SlicesFB.AddSlices(builder, offset.Value)
      #endif
      SlicesFB.EndSlicesFB(builder)

    | NumberSlices (id,arr) ->
      let id = id |> string |> builder.CreateString

      let vector = DoublesFB.CreateValuesVector(builder, arr)
      DoublesFB.StartDoublesFB(builder)
      DoublesFB.AddValues(builder, vector)
      let offset = DoublesFB.EndDoublesFB(builder)

      SlicesFB.StartSlicesFB(builder)
      SlicesFB.AddId(builder,id)
      SlicesFB.AddSlicesType(builder,SlicesTypeFB.DoublesFB)
      #if FABLE_COMPILER
      SlicesFB.AddSlices(builder,offset)
      #else
      SlicesFB.AddSlices(builder,offset.Value)
      #endif
      SlicesFB.EndSlicesFB(builder)

    | BoolSlices (id,arr) ->
      let id = id |> string |> builder.CreateString

      let vector = BoolsFB.CreateValuesVector(builder, arr)
      BoolsFB.StartBoolsFB(builder)
      BoolsFB.AddValues(builder, vector)
      let offset = BoolsFB.EndBoolsFB(builder)

      SlicesFB.StartSlicesFB(builder)
      SlicesFB.AddId(builder,id)
      SlicesFB.AddSlicesType(builder,SlicesTypeFB.BoolsFB)
      #if FABLE_COMPILER
      SlicesFB.AddSlices(builder,offset)
      #else
      SlicesFB.AddSlices(builder,offset.Value)
      #endif
      SlicesFB.EndSlicesFB(builder)

    | ByteSlices (id,arr) ->
      let id = id |> string |> builder.CreateString

      let vector =
        Array.map (String.encodeBase64 >> builder.CreateString) arr
        |> fun coll -> BytesFB.CreateValuesVector(builder, coll)

      BytesFB.StartBytesFB(builder)
      BytesFB.AddValues(builder, vector)
      let offset = BytesFB.EndBytesFB(builder)

      SlicesFB.StartSlicesFB(builder)
      SlicesFB.AddId(builder,id)
      SlicesFB.AddSlicesType(builder,SlicesTypeFB.BytesFB)
      #if FABLE_COMPILER
      SlicesFB.AddSlices(builder,offset)
      #else
      SlicesFB.AddSlices(builder,offset.Value)
      #endif
      SlicesFB.EndSlicesFB(builder)

    | EnumSlices (id,arr) ->
      let id = id |> string |> builder.CreateString

      let vector =
        Array.map (Binary.toOffset builder) arr
        |> fun coll -> KeyValuesFB.CreateValuesVector(builder, coll)

      KeyValuesFB.StartKeyValuesFB(builder)
      KeyValuesFB.AddValues(builder,vector)
      let offset = KeyValuesFB.EndKeyValuesFB(builder)

      SlicesFB.StartSlicesFB(builder)
      SlicesFB.AddId(builder,id)
      SlicesFB.AddSlicesType(builder,SlicesTypeFB.KeyValuesFB)
      #if FABLE_COMPILER
      SlicesFB.AddSlices(builder,offset)
      #else
      SlicesFB.AddSlices(builder,offset.Value)
      #endif
      SlicesFB.EndSlicesFB(builder)

    | ColorSlices (id,arr) ->
      let id = id |> string |> builder.CreateString
      let vector =
        Array.map (Binary.toOffset builder) arr
        |> fun coll -> ColorSpacesFB.CreateValuesVector(builder,coll)

      ColorSpacesFB.StartColorSpacesFB(builder)
      ColorSpacesFB.AddValues(builder, vector)
      let offset = ColorSpacesFB.EndColorSpacesFB(builder)

      SlicesFB.StartSlicesFB(builder)
      SlicesFB.AddId(builder,id)
      SlicesFB.AddSlicesType(builder,SlicesTypeFB.ColorSpacesFB)
      #if FABLE_COMPILER
      SlicesFB.AddSlices(builder,offset)
      #else
      SlicesFB.AddSlices(builder,offset.Value)
      #endif
      SlicesFB.EndSlicesFB(builder)

  // ** FromFB

  static member inline FromFB(fb: SlicesFB) : Either<IrisError,Slices> =
    either {
      let id = Id fb.Id

      return!
        //      _ ____
        //     | / ___|
        //  _  | \___ \
        // | |_| |___) |
        //  \___/|____/
        #if FABLE_COMPILER
        match fb.SlicesType with
        | x when x = SlicesTypeFB.StringsFB ->
          let slices = StringsFB.Create() |> fb.Slices
          let arr = Array.zeroCreate slices.ValuesLength
          Array.fold
            (fun (m: Either<IrisError,string array * int>) _ -> either {
                let! (parsed,idx) = m
                parsed.[idx] <- slices.Values(idx)
                return parsed, idx + 1 })
            (Right (arr, 0))
            arr
          |> Either.map (fun (strings, _) -> StringSlices(id, strings))
        | x when x = SlicesTypeFB.DoublesFB ->
          let slices = DoublesFB.Create() |> fb.Slices
          let arr = Array.zeroCreate slices.ValuesLength
          Array.fold
            (fun (m: Either<IrisError,double array * int>) _ -> either {
                let! (parsed,idx) = m
                parsed.[idx] <- slices.Values(idx)
                return parsed, idx + 1 })
            (Right (arr, 0))
            arr
          |> Either.map (fun (doubles,_) -> NumberSlices(id, doubles))
        | x when x = SlicesTypeFB.BoolsFB ->
          let slices = BoolsFB.Create() |> fb.Slices
          let arr = Array.zeroCreate slices.ValuesLength
          Array.fold
            (fun (m: Either<IrisError,bool array * int>) _ -> either {
                let! (parsed,idx) = m
                parsed.[idx] <- slices.Values(idx)
                return parsed, idx + 1 })
            (Right (arr, 0))
            arr
          |> Either.map (fun (bools,_) -> BoolSlices(id, bools))
        | x when x = SlicesTypeFB.BytesFB ->
          let slices = BytesFB.Create() |> fb.Slices
          let arr = Array.zeroCreate slices.ValuesLength
          Array.fold
            (fun (m: Either<IrisError,byte[] array * int>) _ -> either {
                let! (parsed,idx) = m
                let bytes = slices.Values(idx) |> String.decodeBase64
                parsed.[idx] <- bytes
                return parsed, idx + 1 })
            (Right (arr, 0))
            arr
          |> Either.map (fun (bytes,_) -> ByteSlices(id, bytes))
        | x when x = SlicesTypeFB.KeyValuesFB ->
          let slices = KeyValuesFB.Create() |> fb.Slices
          let arr = Array.zeroCreate slices.ValuesLength
          Array.fold
            (fun (m: Either<IrisError,Property array * int>) _ -> either {
                let! (parsed,idx) = m
                let! prop =
                  let value = slices.Values(idx)
                  Property.FromFB value
                parsed.[idx] <- prop
                return parsed, idx + 1 })
            (Right (arr, 0))
            arr
          |> Either.map (fun (props,_) -> EnumSlices(id, props))
        | x when x = SlicesTypeFB.ColorSpacesFB ->
          let slices = ColorSpacesFB.Create() |> fb.Slices
          let arr = Array.zeroCreate slices.ValuesLength
          Array.fold
            (fun (m: Either<IrisError,ColorSpace array * int>) _ -> either {
                let! (parsed,idx) = m
                let! color =
                  let value = slices.Values(idx)
                  ColorSpace.FromFB value
                parsed.[idx] <- color
                return parsed, idx + 1 })
            (Right (arr, 0))
            arr
          |> Either.map (fun (colors,_) -> ColorSlices(id,colors))
        | x ->
          sprintf "unknown slices type: %O" x
          |> Error.asParseError "Slices.FromFB"
          |> Either.fail

        //    _   _ _____ _____
        //   | \ | | ____|_   _|
        //   |  \| |  _|   | |
        //  _| |\  | |___  | |
        // (_)_| \_|_____| |_|

        #else

        match fb.SlicesType with
        | SlicesTypeFB.StringsFB ->
          let slicesish = fb.Slices<StringsFB>()
          if slicesish.HasValue then
            let slices = slicesish.Value
            let arr = Array.zeroCreate slices.ValuesLength
            Array.fold
              (fun (m: Either<IrisError,string array * int>) _ -> either {
                  let! (parsed,idx) = m
                  let value =
                    try slices.Values(idx)
                    with | _ -> null
                  parsed.[idx] <- value
                  return parsed, idx + 1 })
              (Right (arr, 0))
              arr
            |> Either.map (fun (strings, _) -> StringSlices(id, strings))
          else
            "empty slices value"
            |> Error.asParseError "Slices.FromFB"
            |> Either.fail
        | SlicesTypeFB.DoublesFB ->
          let slicesish = fb.Slices<DoublesFB>()
          if slicesish.HasValue then
            let slices = slicesish.Value
            let arr = Array.zeroCreate slices.ValuesLength
            Array.fold
              (fun (m: Either<IrisError,double array * int>) _ -> either {
                  let! (parsed,idx) = m
                  parsed.[idx] <- slices.Values(idx)
                  return parsed, idx + 1 })
              (Right (arr, 0))
              arr
            |> Either.map (fun (doubles,_) -> NumberSlices(id, doubles))
          else
            "empty slices value"
            |> Error.asParseError "Slices.FromFB"
            |> Either.fail
        | SlicesTypeFB.BoolsFB ->
          let slicesish = fb.Slices<BoolsFB>()
          if slicesish.HasValue then
            let slices = slicesish.Value
            let arr = Array.zeroCreate slices.ValuesLength
            Array.fold
              (fun (m: Either<IrisError,bool array * int>) _ -> either {
                  let! (parsed,idx) = m
                  parsed.[idx] <- slices.Values(idx)
                  return parsed, idx + 1 })
              (Right (arr, 0))
              arr
            |> Either.map (fun (bools,_) -> BoolSlices(id, bools))
          else
            "empty slices value"
            |> Error.asParseError "Slices.FromFB"
            |> Either.fail
        | SlicesTypeFB.BytesFB ->
          let slicesish = fb.Slices<BytesFB>()
          if slicesish.HasValue then
            let slices = slicesish.Value
            let arr = Array.zeroCreate slices.ValuesLength
            Array.fold
              (fun (m: Either<IrisError,byte[] array * int>) _ -> either {
                  let! (parsed,idx) = m
                  let bytes = slices.Values(idx) |> String.decodeBase64
                  parsed.[idx] <- bytes
                  return parsed, idx + 1 })
              (Right (arr, 0))
              arr
            |> Either.map (fun (bytes,_) -> ByteSlices(id, bytes))
          else
            "empty slices value"
            |> Error.asParseError "Slices.FromFB"
            |> Either.fail
        | SlicesTypeFB.KeyValuesFB ->
          let slicesish = fb.Slices<KeyValuesFB>()
          if slicesish.HasValue then
            let slices = slicesish.Value
            let arr = Array.zeroCreate slices.ValuesLength
            Array.fold
              (fun (m: Either<IrisError,Property array * int>) _ -> either {
                  let! (parsed,idx) = m
                  let! prop =
                    let propish = slices.Values(idx)
                    if propish.HasValue then
                      let value = propish.Value
                      Property.FromFB value
                    else
                      "could not parse empty property"
                      |> Error.asParseError "Slices.FromFB"
                      |> Either.fail
                  parsed.[idx] <- prop
                  return parsed, idx + 1 })
              (Right (arr, 0))
              arr
            |> Either.map (fun (props,_) -> EnumSlices(id, props))
          else
            "empty slices value"
            |> Error.asParseError "Slices.FromFB"
            |> Either.fail
        | SlicesTypeFB.ColorSpacesFB ->
          let slicesish = fb.Slices<ColorSpacesFB>()
          if slicesish.HasValue then
            let slices = slicesish.Value
            let arr = Array.zeroCreate slices.ValuesLength
            Array.fold
              (fun (m: Either<IrisError,ColorSpace array * int>) _ -> either {
                  let! (parsed,idx) = m
                  let! color =
                    let colorish = slices.Values(idx)
                    if colorish.HasValue then
                      let value = colorish.Value
                      ColorSpace.FromFB value
                    else
                      "could not parse empty colorspace"
                      |> Error.asParseError "Slices.FromFB"
                      |> Either.fail
                  parsed.[idx] <- color
                  return parsed, idx + 1 })
              (Right (arr, 0))
              arr
            |> Either.map (fun (colors,_) -> ColorSlices(id,colors))
          else
            "empty slices value"
            |> Error.asParseError "Slices.FromFB"
            |> Either.fail
        | x ->
          sprintf "unknown slices type: %O" x
          |> Error.asParseError "Slices.FromFB"
          |> Either.fail
        #endif
    }

  // ** ToBytes

  member slices.ToBytes() : byte[] =
    Binary.buildBuffer slices

  // ** FromBytes

  static member FromBytes(raw: byte[]) : Either<IrisError,Slices> =
    Binary.createBuffer raw
    |> SlicesFB.GetRootAsSlicesFB
    |> Slices.FromFB

  // ** CompareTo

  interface System.IComparable with
    member self.CompareTo other =
      match other with
      | :? Slices as slices -> compare self.Id slices.Id
      | _ -> invalidArg "other" "cannot compare value of different types"

  // ** Equals

  override self.Equals(other) =
    match other with
    | :? Slices as slices -> (self :> System.IEquatable<Slices>).Equals(slices)
    | _ -> false

  override self.GetHashCode() =
    self.Id.ToString().GetHashCode()

  // ** Equals<Slices>

  interface System.IEquatable<Slices> with
    member self.Equals(slices: Slices) =
      match slices with
      | StringSlices (id, values) ->
        match self with
        | StringSlices (sid, svalues) when id = sid -> values = svalues
        | _ -> false
      | NumberSlices (id, values) ->
        match self with
        | NumberSlices (sid, svalues) when id = sid ->
          if Array.length values = Array.length svalues then
            Array.fold
              (fun m (left,right) ->
                if m then
                  match left, right with
                  | _,_ when Double.IsNaN left && Double.IsNaN right  -> true
                  | _,_ when left = right -> true
                  | _ -> false
                else m)
              true
              (Array.zip values svalues)
          else false
        | _ -> false
      | BoolSlices  (id, values) ->
        match self with
        | BoolSlices (sid, svalues) when id = sid -> values = svalues
        | _ -> false
      | ByteSlices  (id, values) ->
        match self with
        | ByteSlices (sid, svalues) when id = sid -> values = svalues
        | _ -> false
      | EnumSlices (id, values) ->
        match self with
        | EnumSlices (sid, svalues) when id = sid -> values = svalues
        | _ -> false
      | ColorSlices (id, values) ->
        match self with
        | ColorSlices (sid, svalues) when id = sid -> values = svalues
        | _ -> false


// * Playground

#if INTERACTIVE

open SharpYaml
open SharpYaml.Serialization


type F() =
  [<DefaultValue>] val mutable a : obj


let serializer = Serializer()


let result = serializer.Serialize (F())

let parsed = serializer.Deserialize<F> result

parsed

#endif
