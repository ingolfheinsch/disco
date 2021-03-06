namespace VVVV.Nodes

open System
open System.ComponentModel.Composition
open VVVV.PluginInterfaces.V1
open VVVV.PluginInterfaces.V2
open VVVV.Utils.VColor
open VVVV.Utils.VMath
open VVVV.Core.Logging
open Disco.Raft
open Disco.Core
open Disco.Nodes

//  _____ _           _
// |_   _(_)_ __ ___ (_)_ __   __ _
//   | | | | '_ ` _ \| | '_ \ / _` |
//   | | | | | | | | | | | | | (_| |
//   |_| |_|_| |_| |_|_|_| |_|\__, |
//                            |___/

[<PluginInfo(Name="TimingConfig", Category=Settings.NODES_CATEGORY, AutoEvaluate=true)>]
type TimingConfigNode() =

  [<Import();DefaultValue>]
  val mutable Logger: ILogger

  [<DefaultValue>]
  [<Input("Timing")>]
  val mutable InTiming: ISpread<TimingConfig>

  [<DefaultValue>]
  [<Input("Update", IsSingle = true, IsBang = true)>]
  val mutable InUpdate: IDiffSpread<bool>

  [<DefaultValue>]
  [<Output("Framebase")>]
  val mutable OutFramebase: ISpread<int>

  [<DefaultValue>]
  [<Output("Input")>]
  val mutable OutInput: ISpread<string>

  [<DefaultValue>]
  [<Output("Servers")>]
  val mutable OutServers: ISpread<ISpread<string>>

  [<DefaultValue>]
  [<Output("UDPPort")>]
  val mutable OutUDPPort: ISpread<int>

  [<DefaultValue>]
  [<Output("TCPPort")>]
  val mutable OutTCPPort: ISpread<int>

  [<DefaultValue>]
  [<Output("Update", IsSingle = true, IsBang = true)>]
  val mutable OutUpdate: ISpread<bool>

  interface IPluginEvaluate with
    member self.Evaluate (spreadMax: int) : unit =
      if self.InUpdate.[0] then

        self.OutFramebase.SliceCount <- self.InTiming.SliceCount
        self.OutInput.SliceCount <- self.InTiming.SliceCount
        self.OutServers.SliceCount <- self.InTiming.SliceCount
        self.OutUDPPort.SliceCount <- self.InTiming.SliceCount
        self.OutTCPPort.SliceCount <- self.InTiming.SliceCount

        for n in 0 .. (spreadMax - 1) do
          if not (Util.isNullReference self.InTiming.[n]) then
            let config = self.InTiming.[n]
            let servers = Array.map string config.Servers
            self.OutFramebase.[n] <- int config.Framebase
            self.OutInput.[n] <- config.Input
            self.OutServers.[n].SliceCount <- (Array.length servers)
            self.OutServers.[n].AssignFrom servers
            self.OutUDPPort.[n] <- int config.UDPPort
            self.OutTCPPort.[n] <- int config.TCPPort

      if self.InUpdate.IsChanged then
        self.OutUpdate.[0] <- self.InUpdate.[0]
