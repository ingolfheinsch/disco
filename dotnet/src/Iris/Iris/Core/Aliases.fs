namespace Iris.Core

// * Custom Units

[<Measure>] type filepath
[<Measure>] type name
[<Measure>] type password
[<Measure>] type timestamp

[<AutoOpen>]
module Measure =
  let filepath p: string<filepath> = UoM.wrap p
  let name u: string<name> = UoM.wrap u
  let password p: string<password> = UoM.wrap p
  let timestamp t: string<timestamp> = UoM.wrap t

// * aliases

//     _    _ _
//    / \  | (_) __ _ ___  ___  ___
//   / _ \ | | |/ _` / __|/ _ \/ __|
//  / ___ \| | | (_| \__ \  __/\__ \
// /_/   \_\_|_|\__,_|___/\___||___/

type NodeId     = Id
type MemberId   = Id
type Long       = uint32
type Index      = Long
type Term       = Long
type Name       = string<name>
type Email      = string
type Tag        = string
type NodePath   = string
type OSCAddress = string
type Version    = string
type VectorSize = int    option
type Min        = int    option
type Max        = int    option
type Unit       = string option
type Filemask   = string option
type Precision  = int    option
type MaxChars   = int
type FilePath   = string
type UserName   = string<name>
type UserAgent  = string
type ClientLog  = string
type TimeStamp  = string
type CallSite   = string
type FileName   = string
type Hash       = string
type Password   = string
type Salt       = string
type Port       = uint16

type IPProtocol =
  | IPv4
  | IPv6

type Actor<'t> = MailboxProcessor<'t>

type StringPayload = Payload of string

/// ## Coordinate
///
/// Represents a point in Euclidian space
///
type Coordinate = Coordinate of (int * int) with

  override self.ToString() =
    match self with
    | Coordinate (x, y) -> "(" + string x + ", " + string y + ")"

  member self.X
    with get () =
      match self with
      | Coordinate (x,_) -> x

  member self.Y
    with get () =
      match self with
      | Coordinate (_,y) -> y

/// ## Rect
///
/// Represents a rectangle in by width * height
///
type Rect = Rect of (int * int) with

  override self.ToString() =
    match self with
    | Rect (x, y) -> "(" + string x + ", " + string y + ")"

  member self.X
    with get () =
      match self with
      | Rect (x,_) -> x

  member self.Y
    with get () =
      match self with
      | Rect (_,y) -> y

// * ServiceStatus

//  ____                  _          ____  _        _
// / ___|  ___ _ ____   _(_) ___ ___/ ___|| |_ __ _| |_ _   _ ___
// \___ \ / _ \ '__\ \ / / |/ __/ _ \___ \| __/ _` | __| | | / __|
//  ___) |  __/ |   \ V /| | (_|  __/___) | || (_| | |_| |_| \__ \
// |____/ \___|_|    \_/ |_|\___\___|____/ \__\__,_|\__|\__,_|___/

[<RequireQualifiedAccess>]
type ServiceStatus =
  | Starting
  | Running
  | Stopping
  | Stopped
  | Degraded of IrisError
  | Failed   of IrisError

  override self.ToString() =
    match self with
    | Starting     -> "Starting"
    | Running      -> "Running"
    | Stopping     -> "Stopping"
    | Stopped      -> "Stopped"
    | Degraded err -> sprintf "Degraded %A" err
    | Failed   err -> sprintf "Failed %A" err

// * Service module

[<RequireQualifiedAccess>]
module Service =

  let isRunning = function
    | ServiceStatus.Running -> true
    | _                     -> false

  let isStopping = function
    | ServiceStatus.Stopping -> true
    | _                      -> false

  let isStopped = function
    | ServiceStatus.Stopped -> true
    | _                     -> false

  let hasFailed = function
    | ServiceStatus.Failed _ -> true
    |                      _ -> false
