// automatically generated by the FlatBuffers compiler, do not modify

namespace Iris.Serialization.Raft
{

using System;
using FlatBuffers;

public struct RemoveCueListFB : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static RemoveCueListFB GetRootAsRemoveCueListFB(ByteBuffer _bb) { return GetRootAsRemoveCueListFB(_bb, new RemoveCueListFB()); }
  public static RemoveCueListFB GetRootAsRemoveCueListFB(ByteBuffer _bb, RemoveCueListFB obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p.bb_pos = _i; __p.bb = _bb; }
  public RemoveCueListFB __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public CueListFB? CueList { get { int o = __p.__offset(4); return o != 0 ? (CueListFB?)(new CueListFB()).__assign(__p.__indirect(o + __p.bb_pos), __p.bb) : null; } }

  public static Offset<RemoveCueListFB> CreateRemoveCueListFB(FlatBufferBuilder builder,
      Offset<CueListFB> CueListOffset = default(Offset<CueListFB>)) {
    builder.StartObject(1);
    RemoveCueListFB.AddCueList(builder, CueListOffset);
    return RemoveCueListFB.EndRemoveCueListFB(builder);
  }

  public static void StartRemoveCueListFB(FlatBufferBuilder builder) { builder.StartObject(1); }
  public static void AddCueList(FlatBufferBuilder builder, Offset<CueListFB> CueListOffset) { builder.AddOffset(0, CueListOffset.Value, 0); }
  public static Offset<RemoveCueListFB> EndRemoveCueListFB(FlatBufferBuilder builder) {
    int o = builder.EndObject();
    return new Offset<RemoveCueListFB>(o);
  }
};


}