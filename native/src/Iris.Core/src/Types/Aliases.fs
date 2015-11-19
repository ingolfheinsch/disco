namespace Iris.Core.Types

[<AutoOpen>]
[<ReflectedDefinition>]
module Aliases =
  type Name       = string
  type Tag        = string option
  type IrisId     = string
  type IrisIP     = string
  type NodePath   = string
  type OSCAddress = string
  type VectorSize = int    option
  type Min        = int    option
  type Max        = int    option
  type Unit       = string option
  type FileMask   = string option
  type Precision  = int    option
  type MaxChars   = int    option
  type FilePath   = string
  type Properties = string array
  
