namespace Iris.Zmq

// * Imports

open System
open System.Threading
open System.Collections.Concurrent
open ZeroMQ
open Iris.Core

// * Sub

[<AutoOpen>]
module Sub =

  // ** Listener

  type private Listener = IObservable<byte array>

  // ** Subscriptions

  type private Subscriptions = Subscriptions<byte array>

  // ** Sub (type)

  /// ## Sub
  ///
  /// Thread-safe Sub socket (corresponds to ZSocketType.SUB)
  ///
  /// ### Signature:
  /// - addr:    Address to connect to
  /// - prefix:  string prefix to match traffic to
  ///
  /// Returns: instance of Sub
  type Sub (addr: string, prefix: string, ctx: ZContext) =

    let tag = sprintf "Sub.%s"

    let mutable status : ServiceStatus = ServiceStatus.Starting

    let mutable disposed = false
    let mutable run = true
    let mutable sock: ZSocket = null
    let mutable thread: Thread = null
    let mutable error : Exception option = None
    let mutable starter: AutoResetEvent = new AutoResetEvent(false)
    let mutable stopper: AutoResetEvent = new AutoResetEvent(false)

    let mutable subscriptions = Subscriptions()

    // *** worker

    /// ## worker
    ///
    /// Worker function to wrap the ZSocket and ZContext. This provides a thread-safe means to run
    /// ZSockets in a multi-threaded environment.
    ///
    /// ### Signature:
    /// - unit: unit
    ///
    /// Returns: unit
    let worker () =

      /// ## Initialization
      ///
      /// In the beginning, there was darkness, and no server responded. So God decided, its time
      /// for some action and create the `ZContext` and a `SUB`-`ZSocket` such that the universe
      /// shall respond to requests.
      ///
      /// God decided to set the `RCVTIMEO` timeout value to 50ms, in order to be able to shut the
      /// thing down in case she gets bored with it all, as calls to `ReceiveFrame` would block
      /// indefinitely. When startup was done, the `starter.Set()` call signals to the parent thread
      /// that everything is hunky dory, and allow it to pass control back to the caller.
      ///
      /// In case of an error (e.g. EADDRINUSE), the run loop is not entered and everything is
      /// disposed again.
      ///
      if isNull sock then
        try
          sock <- new ZSocket(ctx, ZSocketType.SUB)
          sock.Connect(addr)
          sock.Subscribe(prefix)
          setOption sock ZSocketOption.RATE 100000
          setOption sock ZSocketOption.RCVTIMEO 50
          status <- ServiceStatus.Running
          starter.Set() |> ignore
        with
          | exn ->
            run <- false
            error <- Some exn
            let err = SocketError(tag "worker", exn.Message)
            status <- ServiceStatus.Failed err
            starter.Set() |> ignore

      /// Inner Loop
      while run do
        try
          let msg = sock.ReceiveMessage()
          let addr = msg.[0].ReadString()
          let bytes = msg.[1].Read()

          bytes
          |> Array.length
          |> sprintf "[%s] Got %d bytes long message on " addr
          |> Logger.debug (tag "worker")

          Observable.notify subscriptions bytes

          dispose msg

        with
          /// ignore timeouts, since they are our way to ensure we can
          /// cancel close and dispose the socket in time
          | :? ZException as e when ignoreErr e.ErrNo ->
            ignore e

          | exn ->
            run <- false
            let err = SocketError (tag "worker", exn.Message)
            status <- ServiceStatus.Failed err
            error <- Some exn

      /// ## Disposal of resources
      ///
      /// First the socket option `LINGER` is set to 0, to ensure the socket can be disposed of
      /// switftly. Finally, we dispose the thread-local `ZSocket` and `ZContext` and signal that we
      /// are done.

      setOption sock ZSocketOption.LINGER 0

      tryClose  sock
      tryDispose sock ignore

      disposed <- true

      stopper.Set() |> ignore

    // *** Status

    member self.Status
      with get () = status

    // *** Stop

    member private self.Stop () =
      if not disposed then
        run <- false                                   // break loop by setting to false
        stopper.WaitOne() |> ignore                    // wait for signal that stopping is done
                                                      // and return to caller

    // *** Start

    member self.Start () : Either<IrisError,unit> =
      if not disposed then
        thread <- Thread(worker)                       // create worker thread
        thread.Start()                                // start worker thread
        starter.WaitOne() |> ignore                    // wait for startup-done signal

        match error with
        | Some exn ->                                  // if an exception happened on the thread
          exn.Message                                 // format it as an error and return it
          |> Error.asSocketError (tag "Start")
          |> Either.fail
        | _ -> Right ()                                // parents thread, so it can be
                                                      // caught and handled synchronously
      else
        "already disposed"
        |> Error.asSocketError (tag "Start")
        |> Either.fail

    // *** Subscribe

    member self.Subscribe (callback: byte array -> unit) =
      let listener = Observable.createListener subscriptions
      { new IObserver<byte array> with
          member self.OnCompleted() = ()
          member self.OnError(error) = ()
          member self.OnNext(value) = callback value }
      |> listener.Subscribe

    // *** Dispose

    interface IDisposable with
      member self.Dispose() =
        subscriptions.Clear()
        self.Stop()
