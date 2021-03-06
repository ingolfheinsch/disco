namespace Disco.Core

  (*
    ____ _ _            _
   / ___| (_) ___ _ __ | |_
  | |   | | |/ _ \ '_ \| __|
  | |___| | |  __/ | | | |_
   \____|_|_|\___|_| |_|\__|

  The client state machine:

        Window 1                        SharedWorker                             Window 2
  +------------------+               +------------------------+               +------------------+
  | Create Worker    |-------------->| make id, save port[0]  |<--------------| Create Worker    |
  |                  | "initialized" |     |                  | "initialized" |                  |
  | save session id  |<--------------|-----+------------------|-------------->| save session id  |
  |                  |               |                        |               |                  |
  |                  |   "close"     |                        |  "closed"     |                  |
  | User closes tab  |-------------->|    removes session     |-------------->| Notified of Close|
  |                  |               |                        |               |                  |
  |                  |    "log"      |                        |   "log"       |                  |
  | console.log      |<--------------|         Log            |-------------->| console.log      |
  |                  |               |                        |               |                  |
  |                  |  "connect"    |                        |  "connect"    |                  |
  |                  |-------------->|      Connect           |<------------- |                  |
  |                  |               |                        |               |                  |
  |                  |  "connected"  |                        |  "connected"  |                  |
  |                  |<--------------|      Connected         |-------------->|                  |
  |                  |               |                        |               |                  |
  |                  | "disconnected"|                        |"disconnected" |                  |
  |                  |<--------------|     Disconnected       |-------------->|                  |
  |                  |               |                        |               |                  |
  |                  |  "error"      |                        |  "error"      |                  |
  |   Handle Error   |<--------------|        Error           |-------------->|   Handle Error   |
  |                  |               |                        |               |                  |
  |                  |   "render"    |                        |  "render"     |                  |
  |   Updates view   |<--------------|       Render           |-------------->|   Updates view   |
  |                  |               |                        |               |                  |
  |                  |   "update"    |                        |  "render"     |                  |
  |    User Edits    |-------------->|    Updates State       |-------------->|   Updates view   |
  |                  |               |                        |               |                  |
  +------------------+               +------------------------+               +------------------+

  *)

[<RequireQualifiedAccess; NoComparison>]
type ClientMessage<'state> =
  | Initialized  of DiscoId                 // the worker has created a session for this tab/window
  | Close        of DiscoId                 // client tab/window was closed, so request to remove session
  | Closed       of DiscoId                 // other client tab/window notified of close
  | Stop                                   // SharedWorker is requested to stop
  | Stopped                                // SharedWorker process has stopped
  | Error        of string                 // an error occuring inside the worker
  | Event        of DiscoId * StateMachine  // encapsulates an action or event that happened on the client
  | Connect      of string                 // Connect to the specified endpoint
  | Connected                              // worker websocket is connected to service
  | Disconnect   of string                 // Disconnect from server
  | Disconnected                           // worker websocket was disconnected from service
