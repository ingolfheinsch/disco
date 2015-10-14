[<ReflectedDefinition>]
module Test.Units.VirtualDom

#nowarn "1182"

open FunScript
open FunScript.TypeScript


[<JSEmit(""" if(!{0}) { throw new Error({1}) } else { ({2})(); } """)>]
let ok (res : bool) (msg : string) (cb : unit -> unit) : unit = failwith "never"

[<JSEmit(""" suite({0}) """)>]
let suite (desc : string) : unit = failwith "never "

[<JSEmit(""" test({0}, {1}) """)>]
let test (str : string) (f : (unit -> unit) -> unit) : unit = failwith "never"

let main () =
  suite "Test.Units.VirtualDom" 
  test "it is ok!" (fun cb -> ok true "never to be seen" cb)
  test "is it ok?" (fun cb -> ok false "OMG it happened!" cb)
  

