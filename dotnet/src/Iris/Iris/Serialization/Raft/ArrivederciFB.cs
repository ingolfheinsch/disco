// automatically generated by the FlatBuffers compiler, do not modify

namespace Iris.Serialization.Raft
{

using System;
using FlatBuffers;

public sealed class ArrivederciFB : Table {
  public static ArrivederciFB GetRootAsArrivederciFB(ByteBuffer _bb) { return GetRootAsArrivederciFB(_bb, new ArrivederciFB()); }
  public static ArrivederciFB GetRootAsArrivederciFB(ByteBuffer _bb, ArrivederciFB obj) { return (obj.__init(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public ArrivederciFB __init(int _i, ByteBuffer _bb) { bb_pos = _i; bb = _bb; return this; }


  public static void StartArrivederciFB(FlatBufferBuilder builder) { builder.StartObject(0); }
  public static Offset<ArrivederciFB> EndArrivederciFB(FlatBufferBuilder builder) {
    int o = builder.EndObject();
    return new Offset<ArrivederciFB>(o);
  }
};


}