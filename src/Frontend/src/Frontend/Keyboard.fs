[<AutoOpen>]
module Disco.Web.Core.Keyboard

open Disco.Web.Core
open Fable.Import
open Fable.Import.Browser

[<RequireQualifiedAccess>]
module Codes =
  let [<Literal>] backspace = 8.
  let [<Literal>] tab = 9.
  let [<Literal>] enter = 13.
  let [<Literal>] shift = 16.
  let [<Literal>] ctrl = 17.
  let [<Literal>] alt = 18.
  let [<Literal>] pause_break = 19.
  let [<Literal>] caps_lock = 20.
  let [<Literal>] escape = 27.
  let [<Literal>] page_up = 33.
  let [<Literal>] page_down = 34.
  let [<Literal>] ``end`` = 35.
  let [<Literal>] home = 36.
  let [<Literal>] left_arrow = 37.
  let [<Literal>] up_arrow = 38.
  let [<Literal>] right_arrow = 39.
  let [<Literal>] down_arrow = 40.
  let [<Literal>] insert = 45.
  let [<Literal>] delete = 46.
  let [<Literal>] _0 = 48.
  let [<Literal>] _1 = 49.
  let [<Literal>] _2 = 50.
  let [<Literal>] _3 = 51.
  let [<Literal>] _4 = 52.
  let [<Literal>] _5 = 53.
  let [<Literal>] _6 = 54.
  let [<Literal>] _7 = 55.
  let [<Literal>] _8 = 56.
  let [<Literal>] _9 = 57.
  let [<Literal>] a = 65.
  let [<Literal>] b = 66.
  let [<Literal>] c = 67.
  let [<Literal>] d = 68.
  let [<Literal>] e = 69.
  let [<Literal>] f = 70.
  let [<Literal>] g = 71.
  let [<Literal>] h = 72.
  let [<Literal>] i = 73.
  let [<Literal>] j = 74.
  let [<Literal>] k = 75.
  let [<Literal>] l = 76.
  let [<Literal>] m = 77.
  let [<Literal>] n = 78.
  let [<Literal>] o = 79.
  let [<Literal>] p = 80.
  let [<Literal>] q = 81.
  let [<Literal>] r = 82.
  let [<Literal>] s = 83.
  let [<Literal>] t = 84.
  let [<Literal>] u = 85.
  let [<Literal>] v = 86.
  let [<Literal>] w = 87.
  let [<Literal>] x = 88.
  let [<Literal>] y = 89.
  let [<Literal>] z = 90.
  let [<Literal>] left_window_key = 91.
  let [<Literal>] right_window_key = 92.
  let [<Literal>] select_key = 93.
  let [<Literal>] numpad_0 = 96.
  let [<Literal>] numpad_1 = 97.
  let [<Literal>] numpad_2 = 98.
  let [<Literal>] numpad_3 = 99.
  let [<Literal>] numpad_4 = 100.
  let [<Literal>] numpad_5 = 101.
  let [<Literal>] numpad_6 = 102.
  let [<Literal>] numpad_7 = 103.
  let [<Literal>] numpad_8 = 104.
  let [<Literal>] numpad_9 = 105.
  let [<Literal>] multiply = 106.
  let [<Literal>] add = 107.
  let [<Literal>] subtract = 109.
  let [<Literal>] decimal_point =110
  let [<Literal>] divide = 111.
  let [<Literal>] f1 = 112.
  let [<Literal>] f2 = 113.
  let [<Literal>] f3 = 114.
  let [<Literal>] f4 = 115.
  let [<Literal>] f5 = 116.
  let [<Literal>] f6 = 117.
  let [<Literal>] f7 = 118.
  let [<Literal>] f8 = 119.
  let [<Literal>] f9 = 120.
  let [<Literal>] f10 = 121.
  let [<Literal>] f11 = 122.
  let [<Literal>] f12 = 123.
  let [<Literal>] num_lock = 144
  let [<Literal>] scroll_lock = 145
  let [<Literal>] semi_colon = 186.
  let [<Literal>] equal_sign =187
  let [<Literal>] comma = 188.
  let [<Literal>] dash = 189.
  let [<Literal>] period = 190.
  let [<Literal>] forward_slash = 191.
  let [<Literal>] grave_accent = 192.
  let [<Literal>] open_bracket = 219.
  let [<Literal>] back_slash = 220.
  let [<Literal>] close_braket = 221.
  let [<Literal>] single_quote = 222.

type KeyBinding = (bool * bool * float * (unit->unit))

let matches (kev : KeyboardEvent) ((ctrl, shift, key, action) : KeyBinding) =
  if kev.keyCode  = key   &&
     kev.shiftKey = shift &&
     kev.ctrlKey  = ctrl
  then
    kev.preventDefault()
    action()

let keydownHandler keyBindings (ev : KeyboardEvent) =
  Array.iter (matches ev) keyBindings

let registerKeyHandlers (keyBindings: KeyBinding[]) =
  Browser.window.onkeydown <- fun e ->
    keydownHandler keyBindings e
    null

/// Sets the modifier key used for multiple selection
let isMultiSelection (ev: Browser.MouseEvent) =
  ev.shiftKey // ev.ctrlKey
