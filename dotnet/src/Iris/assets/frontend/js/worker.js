/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(4);
	module.exports = __webpack_require__(8);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.context = undefined;
	
	var _Worker = __webpack_require__(2);
	
	var _fableCore = __webpack_require__(5);
	
	var _ClientMessage = __webpack_require__(22);
	
	var context = exports.context = new _Worker.GlobalContext();
	
	onconnect = function onconnect(ev) {
	  var port = ev.ports[0];
	
	  port.onmessage = function (msg) {
	    (function (arg00) {
	      port.postMessage(arg00);
	    })(_fableCore.Serialize.toJson(new _ClientMessage.ClientMessage("ClientLog", [_fableCore.String.fsFormat("hello echo %A")(function (x) {
	      return x;
	    })(msg.data)])));
	  };
	
	  context.Register(port);
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.GlobalContext = exports.Worker = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _StateMachine = __webpack_require__(3);
	
	var _fableCore = __webpack_require__(5);
	
	var _ClientMessage = __webpack_require__(22);
	
	var _Id = __webpack_require__(12);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var _Worker = function ($exports) {
	  return $exports;
	}({});
	
	exports.Worker = _Worker;
	
	var GlobalContext = exports.GlobalContext = function () {
	  function GlobalContext() {
	    _classCallCheck(this, GlobalContext);
	
	    this.count = 0;
	    this.store = new _StateMachine.Store(_StateMachine.State.Empty);
	    this.socket = null;
	    this.ports = new Map();
	  }
	
	  GlobalContext.prototype.ConnectServer = function ConnectServer(addr) {
	    var _this = this;
	
	    var init = function init(_arg1) {
	      var sock = new WebSocket(addr);
	      sock.binaryType = "arraybuffer";
	
	      sock.onerror = function ($var47) {
	        return function (arg00) {
	          _this.Log(arg00);
	        }(_fableCore.String.fsFormat("Error: %A")(function (x) {
	          return x;
	        })($var47));
	      };
	
	      sock.onopen = function () {
	        _this.Broadcast(new _ClientMessage.ClientMessage("Connected", []));
	      };
	
	      sock.onclose = function () {
	        _this.Broadcast(new _ClientMessage.ClientMessage("Disconnected", []));
	      };
	
	      sock.onmessage = function (ev) {
	        var matchValue = _StateMachine.StateMachine.FromBytes(ev.data);
	
	        if (matchValue.Case === "Left") {
	          (function (arg00) {
	            _this.Log(arg00);
	          })(_fableCore.String.fsFormat("Unable to parse received message. %A")(function (x) {
	            return x;
	          })(matchValue.Fields[0]));
	        } else {
	          _this.OnSocketMessage(matchValue.Fields[0]);
	        }
	      };
	
	      _this.socket = [addr, sock];
	    };
	
	    var matchValue = this.socket;
	
	    if (matchValue != null) {
	      var sock = matchValue[1];
	      var current = matchValue[0];
	
	      if (addr !== current) {
	        sock.close();
	        init();
	      }
	    } else {
	      init();
	    }
	  };
	
	  GlobalContext.prototype.OnSocketMessage = function OnSocketMessage(ev) {
	    var _this2 = this;
	
	    if (ev.Case === "LogMsg") {
	      this.Log(_fableCore.String.fsFormat("[%A] %s")(function (x) {
	        return x;
	      })(ev.Fields[0])(ev.Fields[1]));
	    } else {
	      if (ev.Case === "DataSnapshot") {
	        this.store = new _StateMachine.Store(ev.Fields[0]);
	
	        (function (arg00) {
	          _this2.Broadcast(arg00);
	        })(new _ClientMessage.ClientMessage("Render", [this.store.State]));
	      } else {
	        try {
	          this.store.Dispatch(ev);
	        } catch (exn) {
	          this.Log(_fableCore.String.fsFormat("Crash: %s")(function (x) {
	            return x;
	          })(exn));
	        }
	
	        (function (arg00) {
	          _this2.Broadcast(arg00);
	        })(new _ClientMessage.ClientMessage("Render", [this.store.State]));
	      }
	    }
	  };
	
	  GlobalContext.prototype.OnClientMessage = function OnClientMessage(msg) {
	    var _this3 = this;
	
	    var matchValue = _fableCore.Serialize.ofJson(msg.data, _ClientMessage.ClientMessage);
	
	    if (matchValue.Case === "Close") {
	      this.UnRegister(matchValue.Fields[0]);
	    } else {
	      if (matchValue.Case === "Stop") {
	        (function (arg00) {
	          _this3.Broadcast(arg00);
	        })(new _ClientMessage.ClientMessage("Stopped", []));
	
	        this.close();
	      } else {
	        if (matchValue.Case === "Connect") {
	          this.Log(_fableCore.String.fsFormat("connecting to %s")(function (x) {
	            return x;
	          })(matchValue.Fields[0]));
	          this.ConnectServer(matchValue.Fields[0]);
	        } else {
	          if (matchValue.Case === "Event") {
	            this.SendServer(matchValue.Fields[1]);
	          } else {
	            this.Log("clients-only message ignored");
	          }
	        }
	      }
	    }
	  };
	
	  GlobalContext.prototype.Register = function Register(port) {
	    var _this4 = this;
	
	    this.count = this.count + 1;
	
	    var session = _Id.Id.Create();
	
	    port.onmessage = function (arg00) {
	      _this4.OnClientMessage(arg00);
	    };
	
	    this.ports.set(session, port);
	    (function (arg00) {
	      return function (arg10) {
	        _this4.SendClient(arg00, arg10);
	      };
	    })(port)(new _ClientMessage.ClientMessage("Initialized", [session]));
	    (function (arg00) {
	      return function (arg10) {
	        _this4.SendClient(arg00, arg10);
	      };
	    })(port)(new _ClientMessage.ClientMessage("Render", [this.store.State]));
	  };
	
	  GlobalContext.prototype.UnRegister = function UnRegister(session) {
	    this.count = this.count - 1;
	
	    if (this.ports.delete(session)) {
	      this.Broadcast(new _ClientMessage.ClientMessage("Closed", [session]));
	    }
	  };
	
	  GlobalContext.prototype.SendServer = function SendServer(msg) {
	    var buffer = msg.ToBytes();
	    var matchValue = this.socket;
	
	    if (matchValue != null) {
	      var server = matchValue[1];
	      server.send(buffer);
	    } else {
	      this.Log("Cannot update server: no connection.");
	    }
	  };
	
	  GlobalContext.prototype.SendClient = function SendClient(port, msg) {
	    port.postMessage(_fableCore.Serialize.toJson(msg));
	  };
	
	  GlobalContext.prototype.Broadcast = function Broadcast(msg) {
	    var _this5 = this;
	
	    var handler = function handler(port) {
	      return function (_arg3) {
	        return function (_arg2) {
	          (function (arg00) {
	            return function (arg10) {
	              _this5.SendClient(arg00, arg10);
	            };
	          })(port)(msg);
	        };
	      };
	    };
	
	    var func = function func(delegateArg0, delegateArg1, delegateArg2) {
	      handler(delegateArg0)(delegateArg1)(delegateArg2);
	    };
	
	    this.ports.forEach(func);
	  };
	
	  GlobalContext.prototype.Multicast = function Multicast(session, msg) {
	    var _this6 = this;
	
	    var handler = function handler(port) {
	      return function (token) {
	        return function (_arg4) {
	          if (!session.Equals(token)) {
	            (function (arg00) {
	              return function (arg10) {
	                _this6.SendClient(arg00, arg10);
	              };
	            })(port)(msg);
	          }
	        };
	      };
	    };
	
	    var func = function func(delegateArg0, delegateArg1, delegateArg2) {
	      handler(delegateArg0)(delegateArg1)(delegateArg2);
	    };
	
	    this.ports.forEach(func);
	  };
	
	  GlobalContext.prototype.Log = function Log(thing) {
	    var _this7 = this;
	
	    (function (arg00) {
	      _this7.Broadcast(arg00);
	    })(new _ClientMessage.ClientMessage("ClientLog", [thing]));
	  };
	
	  _createClass(GlobalContext, [{
	    key: "Store",
	    get: function get() {
	      return this.store;
	    }
	  }, {
	    key: "Socket",
	    get: function get() {
	      return this.socket;
	    }
	  }]);

	  return GlobalContext;
	}();

	_fableCore.Util.setInterfaces(GlobalContext.prototype, [], "Iris.Web.Core.GlobalContext");


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.StateMachine = exports.Store = exports.History = exports.StoreAction = exports.State = exports.AppCommand = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	var _buffers = __webpack_require__(8);
	
	var _Patch = __webpack_require__(10);
	
	var _IOBox = __webpack_require__(11);
	
	var _Cue = __webpack_require__(15);
	
	var _CueList = __webpack_require__(16);
	
	var _Node = __webpack_require__(17);
	
	var _User = __webpack_require__(19);
	
	var _Session = __webpack_require__(20);
	
	var _Serialization = __webpack_require__(9);
	
	var _LogLevel = __webpack_require__(21);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var AppCommand = exports.AppCommand = function () {
	  function AppCommand(caseName, fields) {
	    _classCallCheck(this, AppCommand);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  AppCommand.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  AppCommand.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  AppCommand.Parse = function Parse(str) {
	    var $var33 = null;
	
	    switch (str) {
	      case "Undo":
	        $var33 = new AppCommand("Undo", []);
	        break;
	
	      case "Redo":
	        $var33 = new AppCommand("Redo", []);
	        break;
	
	      case "Reset":
	        $var33 = new AppCommand("Reset", []);
	        break;
	
	      case "SaveProject":
	        $var33 = new AppCommand("SaveProject", []);
	        break;
	
	      default:
	        $var33 = _fableCore.String.fsFormat("AppCommand: parse error: %s")(function (x) {
	          throw x;
	        })(str);
	    }
	
	    return $var33;
	  };
	
	  AppCommand.TryParse = function TryParse(str) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return AppCommand.Parse(str);
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("AppCommand")(exn)));
	    }
	  };
	
	  AppCommand.FromFB = function FromFB(fb) {
	    return fb === _buffers.Iris.Serialization.Raft.ActionTypeFB.UndoFB ? new _Either.Either("Right", [new AppCommand("Undo", [])]) : fb === _buffers.Iris.Serialization.Raft.ActionTypeFB.RedoFB ? new _Either.Either("Right", [new AppCommand("Redo", [])]) : fb === _buffers.Iris.Serialization.Raft.ActionTypeFB.ResetFB ? new _Either.Either("Right", [new AppCommand("Reset", [])]) : fb === _buffers.Iris.Serialization.Raft.ActionTypeFB.SaveProjectFB ? new _Either.Either("Right", [new AppCommand("SaveProject", [])]) : _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse %A as AppCommand")(function (x) {
	      return x;
	    })(fb)]));
	  };
	
	  AppCommand.prototype.ToOffset = function ToOffset(_arg1) {
	    return this.Case === "Redo" ? _buffers.Iris.Serialization.Raft.ActionTypeFB.RedoFB : this.Case === "Reset" ? _buffers.Iris.Serialization.Raft.ActionTypeFB.ResetFB : this.Case === "SaveProject" ? _buffers.Iris.Serialization.Raft.ActionTypeFB.SaveProjectFB : _buffers.Iris.Serialization.Raft.ActionTypeFB.UndoFB;
	  };
	
	  return AppCommand;
	}();
	
	_fableCore.Util.setInterfaces(AppCommand.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.AppCommand");
	
	var State = exports.State = function () {
	  function State(patches, iOBoxes, cues, cueLists, nodes, sessions, users) {
	    _classCallCheck(this, State);
	
	    this.Patches = patches;
	    this.IOBoxes = iOBoxes;
	    this.Cues = cues;
	    this.CueLists = cueLists;
	    this.Nodes = nodes;
	    this.Sessions = sessions;
	    this.Users = users;
	  }
	
	  State.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  State.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  State.prototype.AddUser = function AddUser(user) {
	    var _this = this;
	
	    return this.Users.has(user.Id) ? this : function () {
	      var users = _fableCore.Map.add(user.Id, user, _this.Users);
	
	      return new State(_this.Patches, _this.IOBoxes, _this.Cues, _this.CueLists, _this.Nodes, _this.Sessions, users);
	    }();
	  };
	
	  State.prototype.UpdateUser = function UpdateUser(user) {
	    var _this2 = this;
	
	    return this.Users.has(user.Id) ? function () {
	      var users = _fableCore.Map.add(user.Id, user, _this2.Users);
	
	      return new State(_this2.Patches, _this2.IOBoxes, _this2.Cues, _this2.CueLists, _this2.Nodes, _this2.Sessions, users);
	    }() : this;
	  };
	
	  State.prototype.RemoveUser = function RemoveUser(user) {
	    var Users = _fableCore.Map.filter(function (k, _arg2) {
	      return !k.Equals(user.Id);
	    }, this.Users);
	
	    return new State(this.Patches, this.IOBoxes, this.Cues, this.CueLists, this.Nodes, this.Sessions, Users);
	  };
	
	  State.prototype.AddSession = function AddSession(session) {
	    var sessions = this.Sessions.has(session.Id) ? this.Sessions : _fableCore.Map.add(session.Id, session, this.Sessions);
	    return new State(this.Patches, this.IOBoxes, this.Cues, this.CueLists, this.Nodes, sessions, this.Users);
	  };
	
	  State.prototype.UpdateSession = function UpdateSession(session) {
	    var sessions = this.Sessions.has(session.Id) ? _fableCore.Map.add(session.Id, session, this.Sessions) : this.Sessions;
	    return new State(this.Patches, this.IOBoxes, this.Cues, this.CueLists, this.Nodes, sessions, this.Users);
	  };
	
	  State.prototype.RemoveSession = function RemoveSession(session) {
	    var Sessions = _fableCore.Map.filter(function (k, _arg3) {
	      return !k.Equals(session.Id);
	    }, this.Sessions);
	
	    return new State(this.Patches, this.IOBoxes, this.Cues, this.CueLists, this.Nodes, Sessions, this.Users);
	  };
	
	  State.prototype.AddPatch = function AddPatch(patch) {
	    return this.Patches.has(patch.Id) ? this : new State(_fableCore.Map.add(patch.Id, patch, this.Patches), this.IOBoxes, this.Cues, this.CueLists, this.Nodes, this.Sessions, this.Users);
	  };
	
	  State.prototype.UpdatePatch = function UpdatePatch(patch) {
	    return this.Patches.has(patch.Id) ? new State(_fableCore.Map.add(patch.Id, patch, this.Patches), this.IOBoxes, this.Cues, this.CueLists, this.Nodes, this.Sessions, this.Users) : this;
	  };
	
	  State.prototype.RemovePatch = function RemovePatch(patch) {
	    return new State(_fableCore.Map.remove(patch.Id, this.Patches), this.IOBoxes, this.Cues, this.CueLists, this.Nodes, this.Sessions, this.Users);
	  };
	
	  State.prototype.AddIOBox = function AddIOBox(iobox) {
	    var _this3 = this;
	
	    return this.Patches.has(iobox.Patch) ? function () {
	      var update = function update(_arg1) {
	        return function (patch) {
	          return patch.Id.Equals(iobox.Patch) ? function (arg00) {
	            return function (arg10) {
	              return _Patch.Patch.AddIOBox(arg00, arg10);
	            };
	          }(patch)(iobox) : patch;
	        };
	      };
	
	      return new State(_fableCore.Map.map(function ($var34, $var35) {
	        return update($var34)($var35);
	      }, _this3.Patches), _this3.IOBoxes, _this3.Cues, _this3.CueLists, _this3.Nodes, _this3.Sessions, _this3.Users);
	    }() : this;
	  };
	
	  State.prototype.UpdateIOBox = function UpdateIOBox(iobox) {
	    var mapper = function mapper(_arg2) {
	      return function (patch) {
	        return patch.Id.Equals(iobox.Patch) ? function (arg00) {
	          return function (arg10) {
	            return _Patch.Patch.UpdateIOBox(arg00, arg10);
	          };
	        }(patch)(iobox) : patch;
	      };
	    };
	
	    return new State(_fableCore.Map.map(function ($var36, $var37) {
	      return mapper($var36)($var37);
	    }, this.Patches), this.IOBoxes, this.Cues, this.CueLists, this.Nodes, this.Sessions, this.Users);
	  };
	
	  State.prototype.RemoveIOBox = function RemoveIOBox(iobox) {
	    var updater = function updater(_arg3) {
	      return function (patch) {
	        return iobox.Patch.Equals(patch.Id) ? function (arg00) {
	          return function (arg10) {
	            return _Patch.Patch.RemoveIOBox(arg00, arg10);
	          };
	        }(patch)(iobox) : patch;
	      };
	    };
	
	    return new State(_fableCore.Map.map(function ($var38, $var39) {
	      return updater($var38)($var39);
	    }, this.Patches), this.IOBoxes, this.Cues, this.CueLists, this.Nodes, this.Sessions, this.Users);
	  };
	
	  State.prototype.AddCueList = function AddCueList(cuelist) {
	    var _this4 = this;
	
	    return this.CueLists.has(cuelist.Id) ? this : function () {
	      var CueLists = _fableCore.Map.add(cuelist.Id, cuelist, _this4.CueLists);
	
	      return new State(_this4.Patches, _this4.IOBoxes, _this4.Cues, CueLists, _this4.Nodes, _this4.Sessions, _this4.Users);
	    }();
	  };
	
	  State.prototype.UpdateCueList = function UpdateCueList(cuelist) {
	    var _this5 = this;
	
	    return this.CueLists.has(cuelist.Id) ? function () {
	      var CueLists = _fableCore.Map.add(cuelist.Id, cuelist, _this5.CueLists);
	
	      return new State(_this5.Patches, _this5.IOBoxes, _this5.Cues, CueLists, _this5.Nodes, _this5.Sessions, _this5.Users);
	    }() : this;
	  };
	
	  State.prototype.RemoveCueList = function RemoveCueList(cuelist) {
	    var CueLists = _fableCore.Map.remove(cuelist.Id, this.CueLists);
	
	    return new State(this.Patches, this.IOBoxes, this.Cues, CueLists, this.Nodes, this.Sessions, this.Users);
	  };
	
	  State.prototype.AddCue = function AddCue(cue) {
	    var _this6 = this;
	
	    return this.Cues.has(cue.Id) ? this : function () {
	      var Cues = _fableCore.Map.add(cue.Id, cue, _this6.Cues);
	
	      return new State(_this6.Patches, _this6.IOBoxes, Cues, _this6.CueLists, _this6.Nodes, _this6.Sessions, _this6.Users);
	    }();
	  };
	
	  State.prototype.UpdateCue = function UpdateCue(cue) {
	    var _this7 = this;
	
	    return this.Cues.has(cue.Id) ? function () {
	      var Cues = _fableCore.Map.add(cue.Id, cue, _this7.Cues);
	
	      return new State(_this7.Patches, _this7.IOBoxes, Cues, _this7.CueLists, _this7.Nodes, _this7.Sessions, _this7.Users);
	    }() : this;
	  };
	
	  State.prototype.RemoveCue = function RemoveCue(cue) {
	    var Cues = _fableCore.Map.remove(cue.Id, this.Cues);
	
	    return new State(this.Patches, this.IOBoxes, Cues, this.CueLists, this.Nodes, this.Sessions, this.Users);
	  };
	
	  State.prototype.AddNode = function AddNode(node) {
	    var _this8 = this;
	
	    return this.Nodes.has(node.Id) ? this : function () {
	      var Nodes = _fableCore.Map.add(node.Id, node, _this8.Nodes);
	
	      return new State(_this8.Patches, _this8.IOBoxes, _this8.Cues, _this8.CueLists, Nodes, _this8.Sessions, _this8.Users);
	    }();
	  };
	
	  State.prototype.UpdateNode = function UpdateNode(node) {
	    var _this9 = this;
	
	    return this.Nodes.has(node.Id) ? function () {
	      var Nodes = _fableCore.Map.add(node.Id, node, _this9.Nodes);
	
	      return new State(_this9.Patches, _this9.IOBoxes, _this9.Cues, _this9.CueLists, Nodes, _this9.Sessions, _this9.Users);
	    }() : this;
	  };
	
	  State.prototype.RemoveNode = function RemoveNode(node) {
	    var Nodes = _fableCore.Map.remove(node.Id, this.Nodes);
	
	    return new State(this.Patches, this.IOBoxes, this.Cues, this.CueLists, Nodes, this.Sessions, this.Users);
	  };
	
	  State.prototype.ToOffset = function ToOffset(builder) {
	    var patches = Array.from(this.Patches).map(function ($var40) {
	      return function (thing) {
	        return thing.ToOffset(builder);
	      }(function (tuple) {
	        return tuple[1];
	      }($var40));
	    });
	
	    var patchesoffset = _buffers.Iris.Serialization.Raft.StateFB.createPatchesVector(builder, patches);
	
	    var ioboxes = Array.from(this.IOBoxes).map(function ($var41) {
	      return function (thing) {
	        return thing.ToOffset(builder);
	      }(function (tuple) {
	        return tuple[1];
	      }($var41));
	    });
	
	    var ioboxesoffset = _buffers.Iris.Serialization.Raft.StateFB.createIOBoxesVector(builder, ioboxes);
	
	    var cues = Array.from(this.Cues).map(function ($var42) {
	      return function (thing) {
	        return thing.ToOffset(builder);
	      }(function (tuple) {
	        return tuple[1];
	      }($var42));
	    });
	
	    var cuesoffset = _buffers.Iris.Serialization.Raft.StateFB.createCuesVector(builder, cues);
	
	    var cuelists = Array.from(this.CueLists).map(function ($var43) {
	      return function (thing) {
	        return thing.ToOffset(builder);
	      }(function (tuple) {
	        return tuple[1];
	      }($var43));
	    });
	
	    var cuelistsoffset = _buffers.Iris.Serialization.Raft.StateFB.createCueListsVector(builder, cuelists);
	
	    var nodes = Array.from(this.Nodes).map(function ($var44) {
	      return function (thing) {
	        return thing.ToOffset(builder);
	      }(function (tuple) {
	        return tuple[1];
	      }($var44));
	    });
	
	    var nodesoffset = _buffers.Iris.Serialization.Raft.StateFB.createNodesVector(builder, nodes);
	
	    var users = Array.from(this.Users).map(function ($var45) {
	      return function (thing) {
	        return thing.ToOffset(builder);
	      }(function (tuple) {
	        return tuple[1];
	      }($var45));
	    });
	
	    var usersoffset = _buffers.Iris.Serialization.Raft.StateFB.createUsersVector(builder, users);
	
	    var sessions = Array.from(this.Sessions).map(function ($var46) {
	      return function (thing) {
	        return thing.ToOffset(builder);
	      }(function (tuple) {
	        return tuple[1];
	      }($var46));
	    });
	
	    var sessionsoffset = _buffers.Iris.Serialization.Raft.StateFB.createSessionsVector(builder, sessions);
	
	    _buffers.Iris.Serialization.Raft.StateFB.startStateFB(builder);
	
	    _buffers.Iris.Serialization.Raft.StateFB.addPatches(builder, patchesoffset);
	
	    _buffers.Iris.Serialization.Raft.StateFB.addIOBoxes(builder, ioboxesoffset);
	
	    _buffers.Iris.Serialization.Raft.StateFB.addCues(builder, cuesoffset);
	
	    _buffers.Iris.Serialization.Raft.StateFB.addCueLists(builder, cuelistsoffset);
	
	    _buffers.Iris.Serialization.Raft.StateFB.addNodes(builder, nodesoffset);
	
	    _buffers.Iris.Serialization.Raft.StateFB.addSessions(builder, sessionsoffset);
	
	    _buffers.Iris.Serialization.Raft.StateFB.addUsers(builder, usersoffset);
	
	    return _buffers.Iris.Serialization.Raft.StateFB.endStateFB(builder);
	  };
	
	  State.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  State.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var arr = new Array(fb.PatchesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg4) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                  return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                    return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                  }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	            return x.CompareTo(y);
	          }))]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg4) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                    return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                    }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg4) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                    return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                    }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var arr = new Array(fb.PatchesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg4) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                  return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                    return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                  }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	            return x.CompareTo(y);
	          }))]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg4) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                    return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                    }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg4) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                    return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                    }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg6) {
	          return function () {
	            var arr = new Array(fb.IOBoxesLength());
	
	            if (_fableCore.Seq.fold(function (m, _arg5) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                    return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                      return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                    }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg5) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                      return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                        return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                      }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (m, _arg5) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                      return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                        return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                      }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Fields[0]));
	            }
	          }().Case === "Left" ? new _Either.Either("Left", [function () {
	            var arr = new Array(fb.IOBoxesLength());
	
	            if (_fableCore.Seq.fold(function (m, _arg5) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                    return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                      return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                    }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg5) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                      return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                        return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                      }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (m, _arg5) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                      return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                        return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                      }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Fields[0]));
	            }
	          }().Fields[0]]) : function (_arg9) {
	            return function () {
	              var arr = new Array(fb.CuesLength());
	
	              if (_fableCore.Seq.fold(function (m, _arg6_1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                      return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                        return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                      }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg6_1) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                        return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                          return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                        }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (m, _arg6_1) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                        return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                          return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                        }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Fields[0]));
	              }
	            }().Case === "Left" ? new _Either.Either("Left", [function () {
	              var arr = new Array(fb.CuesLength());
	
	              if (_fableCore.Seq.fold(function (m, _arg6_1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                      return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                        return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                      }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg6_1) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                        return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                          return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                        }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (m, _arg6_1) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                        return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                          return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                        }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Fields[0]));
	              }
	            }().Fields[0]]) : function (_arg12) {
	              return function () {
	                var arr = new Array(fb.CueListsLength());
	
	                if (_fableCore.Seq.fold(function (m, _arg7) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                        return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                          return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                        }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Case === "Left") {
	                  return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg7) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                          return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                            return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                          }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (tuple) {
	                    return tuple[1];
	                  }(_fableCore.Seq.fold(function (m, _arg7) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                          return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                            return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                          }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Fields[0]));
	                }
	              }().Case === "Left" ? new _Either.Either("Left", [function () {
	                var arr = new Array(fb.CueListsLength());
	
	                if (_fableCore.Seq.fold(function (m, _arg7) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                        return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                          return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                        }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Case === "Left") {
	                  return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg7) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                          return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                            return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                          }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (tuple) {
	                    return tuple[1];
	                  }(_fableCore.Seq.fold(function (m, _arg7) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                          return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                            return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                          }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Fields[0]));
	                }
	              }().Fields[0]]) : function (_arg15) {
	                return function () {
	                  var arr = new Array(fb.NodesLength());
	
	                  if (_fableCore.Seq.fold(function (m, _arg8) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                          return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                            return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                          }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Case === "Left") {
	                    return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg8) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                            return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                              return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                            }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (tuple) {
	                      return tuple[1];
	                    }(_fableCore.Seq.fold(function (m, _arg8) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                            return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                              return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                            }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Fields[0]));
	                  }
	                }().Case === "Left" ? new _Either.Either("Left", [function () {
	                  var arr = new Array(fb.NodesLength());
	
	                  if (_fableCore.Seq.fold(function (m, _arg8) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                          return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                            return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                          }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Case === "Left") {
	                    return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg8) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                            return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                              return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                            }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (tuple) {
	                      return tuple[1];
	                    }(_fableCore.Seq.fold(function (m, _arg8) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                            return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                              return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                            }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Fields[0]));
	                  }
	                }().Fields[0]]) : function (_arg18) {
	                  return function () {
	                    var arr = new Array(fb.UsersLength());
	
	                    if (_fableCore.Seq.fold(function (m, _arg9_1) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                            return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                              return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                            }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Case === "Left") {
	                      return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg9_1) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                              return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                                return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                              }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (tuple) {
	                        return tuple[1];
	                      }(_fableCore.Seq.fold(function (m, _arg9_1) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                              return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                                return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                              }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Fields[0]));
	                    }
	                  }().Case === "Left" ? new _Either.Either("Left", [function () {
	                    var arr = new Array(fb.UsersLength());
	
	                    if (_fableCore.Seq.fold(function (m, _arg9_1) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                            return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                              return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                            }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Case === "Left") {
	                      return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg9_1) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                              return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                                return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                              }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (tuple) {
	                        return tuple[1];
	                      }(_fableCore.Seq.fold(function (m, _arg9_1) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                              return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                                return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                              }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Fields[0]));
	                    }
	                  }().Fields[0]]) : function (_arg21) {
	                    return function () {
	                      var arr = new Array(fb.SessionsLength());
	
	                      if (_fableCore.Seq.fold(function (m, _arg10) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                              return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                              }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Case === "Left") {
	                        return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg10) {
	                          return function (builder__1) {
	                            return builder__1.Run(builder__1.Delay(function () {
	                              return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                                return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                  return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                                }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                              }(m.Fields[0]);
	                            }));
	                          }(_Either.EitherUtils.either);
	                        }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                          return x.CompareTo(y);
	                        }))]]), arr).Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (tuple) {
	                          return tuple[1];
	                        }(_fableCore.Seq.fold(function (m, _arg10) {
	                          return function (builder__1) {
	                            return builder__1.Run(builder__1.Delay(function () {
	                              return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                                return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                  return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                                }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                              }(m.Fields[0]);
	                            }));
	                          }(_Either.EitherUtils.either);
	                        }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                          return x.CompareTo(y);
	                        }))]]), arr).Fields[0]));
	                      }
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var arr = new Array(fb.SessionsLength());
	
	                      if (_fableCore.Seq.fold(function (m, _arg10) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                              return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                              }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Case === "Left") {
	                        return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg10) {
	                          return function (builder__1) {
	                            return builder__1.Run(builder__1.Delay(function () {
	                              return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                                return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                  return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                                }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                              }(m.Fields[0]);
	                            }));
	                          }(_Either.EitherUtils.either);
	                        }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                          return x.CompareTo(y);
	                        }))]]), arr).Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (tuple) {
	                          return tuple[1];
	                        }(_fableCore.Seq.fold(function (m, _arg10) {
	                          return function (builder__1) {
	                            return builder__1.Run(builder__1.Delay(function () {
	                              return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                                return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                  return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                                }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                              }(m.Fields[0]);
	                            }));
	                          }(_Either.EitherUtils.either);
	                        }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                          return x.CompareTo(y);
	                        }))]]), arr).Fields[0]));
	                      }
	                    }().Fields[0]]) : function (_arg24) {
	                      return builder_.Return(new State(_arg6, _arg9, _arg12, _arg15, _arg18, _arg24, _arg21));
	                    }(function () {
	                      var arr = new Array(fb.SessionsLength());
	
	                      if (_fableCore.Seq.fold(function (m, _arg10) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                              return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                              }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Case === "Left") {
	                        return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg10) {
	                          return function (builder__1) {
	                            return builder__1.Run(builder__1.Delay(function () {
	                              return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                                return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                  return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                                }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                              }(m.Fields[0]);
	                            }));
	                          }(_Either.EitherUtils.either);
	                        }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                          return x.CompareTo(y);
	                        }))]]), arr).Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (tuple) {
	                          return tuple[1];
	                        }(_fableCore.Seq.fold(function (m, _arg10) {
	                          return function (builder__1) {
	                            return builder__1.Run(builder__1.Delay(function () {
	                              return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg22) {
	                                return _Session.Session.FromFB(fb.Sessions(_arg22[0])).Case === "Left" ? new _Either.Either("Left", [_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]]) : function (_arg23) {
	                                  return builder__1.Return([_arg22[0] + 1, _fableCore.Map.add(_arg23.Id, _arg23, _arg22[1])]);
	                                }(_Session.Session.FromFB(fb.Sessions(_arg22[0])).Fields[0]);
	                              }(m.Fields[0]);
	                            }));
	                          }(_Either.EitherUtils.either);
	                        }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                          return x.CompareTo(y);
	                        }))]]), arr).Fields[0]));
	                      }
	                    }().Fields[0]);
	                  }(function () {
	                    var arr = new Array(fb.UsersLength());
	
	                    if (_fableCore.Seq.fold(function (m, _arg9_1) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                            return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                              return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                            }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Case === "Left") {
	                      return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg9_1) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                              return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                                return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                              }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (tuple) {
	                        return tuple[1];
	                      }(_fableCore.Seq.fold(function (m, _arg9_1) {
	                        return function (builder__1) {
	                          return builder__1.Run(builder__1.Delay(function () {
	                            return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg19) {
	                              return _User.User.FromFB(fb.Users(_arg19[0])).Case === "Left" ? new _Either.Either("Left", [_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]]) : function (_arg20) {
	                                return builder__1.Return([_arg19[0] + 1, _fableCore.Map.add(_arg20.Id, _arg20, _arg19[1])]);
	                              }(_User.User.FromFB(fb.Users(_arg19[0])).Fields[0]);
	                            }(m.Fields[0]);
	                          }));
	                        }(_Either.EitherUtils.either);
	                      }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                        return x.CompareTo(y);
	                      }))]]), arr).Fields[0]));
	                    }
	                  }().Fields[0]);
	                }(function () {
	                  var arr = new Array(fb.NodesLength());
	
	                  if (_fableCore.Seq.fold(function (m, _arg8) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                          return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                            return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                          }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Case === "Left") {
	                    return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg8) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                            return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                              return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                            }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (tuple) {
	                      return tuple[1];
	                    }(_fableCore.Seq.fold(function (m, _arg8) {
	                      return function (builder__1) {
	                        return builder__1.Run(builder__1.Delay(function () {
	                          return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg16) {
	                            return _Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Case === "Left" ? new _Either.Either("Left", [_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]]) : function (_arg17) {
	                              return builder__1.Return([_arg16[0] + 1, _fableCore.Map.add(_arg17.Id, _arg17, _arg16[1])]);
	                            }(_Node.RaftNode.FromFB(fb.Nodes(_arg16[0])).Fields[0]);
	                          }(m.Fields[0]);
	                        }));
	                      }(_Either.EitherUtils.either);
	                    }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                      return x.CompareTo(y);
	                    }))]]), arr).Fields[0]));
	                  }
	                }().Fields[0]);
	              }(function () {
	                var arr = new Array(fb.CueListsLength());
	
	                if (_fableCore.Seq.fold(function (m, _arg7) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                        return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                          return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                        }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Case === "Left") {
	                  return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg7) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                          return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                            return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                          }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (tuple) {
	                    return tuple[1];
	                  }(_fableCore.Seq.fold(function (m, _arg7) {
	                    return function (builder__1) {
	                      return builder__1.Run(builder__1.Delay(function () {
	                        return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg13) {
	                          return _CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Case === "Left" ? new _Either.Either("Left", [_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]]) : function (_arg14) {
	                            return builder__1.Return([_arg13[0] + 1, _fableCore.Map.add(_arg14.Id, _arg14, _arg13[1])]);
	                          }(_CueList.CueList.FromFB(fb.CueLists(_arg13[0])).Fields[0]);
	                        }(m.Fields[0]);
	                      }));
	                    }(_Either.EitherUtils.either);
	                  }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                    return x.CompareTo(y);
	                  }))]]), arr).Fields[0]));
	                }
	              }().Fields[0]);
	            }(function () {
	              var arr = new Array(fb.CuesLength());
	
	              if (_fableCore.Seq.fold(function (m, _arg6_1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                      return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                        return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                      }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg6_1) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                        return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                          return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                        }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (m, _arg6_1) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg10) {
	                        return _Cue.Cue.FromFB(fb.Cues(_arg10[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]]) : function (_arg11) {
	                          return builder__1.Return([_arg10[0] + 1, _fableCore.Map.add(_arg11.Id, _arg11, _arg10[1])]);
	                        }(_Cue.Cue.FromFB(fb.Cues(_arg10[0])).Fields[0]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                  return x.CompareTo(y);
	                }))]]), arr).Fields[0]));
	              }
	            }().Fields[0]);
	          }(function () {
	            var arr = new Array(fb.IOBoxesLength());
	
	            if (_fableCore.Seq.fold(function (m, _arg5) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                    return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                      return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                    }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg5) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                      return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                        return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                      }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (m, _arg5) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg7) {
	                      return _IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]]) : function (_arg8) {
	                        return builder__1.Return([_arg7[0] + 1, _fableCore.Map.add(_arg8.Id, _arg8, _arg7[1])]);
	                      }(_IOBox.IOBox.FromFB(fb.IOBoxes(_arg7[0])).Fields[0]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	                return x.CompareTo(y);
	              }))]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }(function () {
	          var arr = new Array(fb.PatchesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg4) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                  return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                    return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                  }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	            return x.CompareTo(y);
	          }))]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg4) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                    return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                    }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg4) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4_1) {
	                    return _Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Case === "Left" ? new _Either.Either("Left", [_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4_1[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4_1[1])]);
	                    }(_Patch.Patch.FromFB(fb.Patches(_arg4_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  State.FromBytes = function FromBytes(bytes) {
	    return State.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.StateFB.getRootAsStateFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  _createClass(State, null, [{
	    key: "Empty",
	    get: function get() {
	      var Patches = _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	        return x.CompareTo(y);
	      }));
	
	      var IOBoxes = _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	        return x.CompareTo(y);
	      }));
	
	      var Cues = _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	        return x.CompareTo(y);
	      }));
	
	      var Nodes = _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	        return x.CompareTo(y);
	      }));
	
	      var CueLists = _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	        return x.CompareTo(y);
	      }));
	
	      var Users = _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	        return x.CompareTo(y);
	      }));
	
	      return new State(Patches, IOBoxes, Cues, CueLists, Nodes, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	        return x.CompareTo(y);
	      })), Users);
	    }
	  }]);
	
	  return State;
	}();
	
	_fableCore.Util.setInterfaces(State.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.State");
	
	var StoreAction = exports.StoreAction = function () {
	  function StoreAction(event, state) {
	    _classCallCheck(this, StoreAction);
	
	    this.Event = event;
	    this.State = state;
	  }
	
	  StoreAction.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  StoreAction.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  StoreAction.prototype.ToString = function ToString() {
	    return _fableCore.String.fsFormat("%s %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Event))(_fableCore.Util.toString(this.State));
	  };
	
	  return StoreAction;
	}();
	
	_fableCore.Util.setInterfaces(StoreAction.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.StoreAction");
	
	var History = exports.History = function () {
	  function History(action) {
	    _classCallCheck(this, History);
	
	    this.depth = 10;
	    this.debug = false;
	    this.head = 1;
	    this.values = _fableCore.List.ofArray([action]);
	  }
	
	  History.prototype.Append = function Append(value) {
	    this.head = 0;
	    var newvalues = new _fableCore.List(value, this.values);
	
	    if (!this.debug ? newvalues.length > this.depth : false) {
	      this.values = _fableCore.Seq.toList(_fableCore.Seq.take(this.depth, newvalues));
	    } else {
	      this.values = newvalues;
	    }
	  };
	
	  History.prototype.Undo = function Undo() {
	    var head_ = this.head - 1 > this.values.length ? this.values.length : this.head + 1;
	
	    if (this.head !== head_) {
	      this.head = head_;
	    }
	
	    return _fableCore.Seq.tryItem(this.head, this.values);
	  };
	
	  History.prototype.Redo = function Redo() {
	    var head_ = this.head - 1 < 0 ? 0 : this.head - 1;
	
	    if (this.head !== head_) {
	      this.head = head_;
	    }
	
	    return _fableCore.Seq.tryItem(this.head, this.values);
	  };
	
	  _createClass(History, [{
	    key: "Debug",
	    get: function get() {
	      return this.debug;
	    },
	    set: function set(b) {
	      this.debug = b;
	
	      if (!this.debug) {
	        this.values = _fableCore.Seq.toList(_fableCore.Seq.take(this.depth, this.values));
	      }
	    }
	  }, {
	    key: "Depth",
	    get: function get() {
	      return this.depth;
	    },
	    set: function set(n) {
	      this.depth = n;
	    }
	  }, {
	    key: "Values",
	    get: function get() {
	      return this.values;
	    }
	  }, {
	    key: "Length",
	    get: function get() {
	      return this.values.length;
	    }
	  }]);
	
	  return History;
	}();
	
	_fableCore.Util.setInterfaces(History.prototype, [], "Iris.Core.History");
	
	var Store = exports.Store = function () {
	  function Store(state) {
	    var _this10 = this;
	
	    _classCallCheck(this, Store);
	
	    this["state@726"] = state;
	    this.history = new History(function () {
	      var State_1 = _this10["state@726"];
	      return new StoreAction(new StateMachine("Command", [new AppCommand("Reset", [])]), State_1);
	    }());
	    this.listeners = new _fableCore.List();
	  }
	
	  Store.prototype.Notify = function Notify(ev) {
	    var _this11 = this;
	
	    _fableCore.Seq.iterate(function (f) {
	      f(_this11)(ev);
	    }, this.listeners);
	  };
	
	  Store.prototype.Dispatch = function Dispatch(ev) {
	    var _this12 = this;
	
	    var andRender = function andRender(newstate) {
	      _this12["state@726"] = newstate;
	
	      _this12.Notify(ev);
	
	      _this12.history.Append(new StoreAction(ev, _this12["state@726"]));
	    };
	
	    var addSession = function addSession(session) {
	      return function (state) {
	        var sessions = state.Sessions.has(session.Id) ? state.Sessions : _fableCore.Map.add(session.Id, session, state.Sessions);
	        return new State(state.Patches, state.IOBoxes, state.Cues, state.CueLists, state.Nodes, sessions, state.Users);
	      };
	    };
	
	    var $target24 = function $target24() {};
	
	    if (ev.Case === "Command") {
	      if (ev.Fields[0].Case === "Redo") {
	        this.Redo();
	      } else {
	        if (ev.Fields[0].Case === "Undo") {
	          this.Undo();
	        } else {
	          if (ev.Fields[0].Case === "Reset") {} else {
	            $target24();
	          }
	        }
	      }
	    } else {
	      if (ev.Case === "AddCue") {
	        var cue = ev.Fields[0];
	        andRender(this["state@726"].AddCue(cue));
	      } else {
	        if (ev.Case === "UpdateCue") {
	          var _cue = ev.Fields[0];
	          andRender(this["state@726"].UpdateCue(_cue));
	        } else {
	          if (ev.Case === "RemoveCue") {
	            var _cue2 = ev.Fields[0];
	            andRender(this["state@726"].RemoveCue(_cue2));
	          } else {
	            if (ev.Case === "AddCueList") {
	              var cuelist = ev.Fields[0];
	              andRender(this["state@726"].AddCueList(cuelist));
	            } else {
	              if (ev.Case === "UpdateCueList") {
	                var _cuelist = ev.Fields[0];
	                andRender(this["state@726"].UpdateCueList(_cuelist));
	              } else {
	                if (ev.Case === "RemoveCueList") {
	                  var _cuelist2 = ev.Fields[0];
	                  andRender(this["state@726"].RemoveCueList(_cuelist2));
	                } else {
	                  if (ev.Case === "AddPatch") {
	                    var patch = ev.Fields[0];
	                    andRender(this["state@726"].AddPatch(patch));
	                  } else {
	                    if (ev.Case === "UpdatePatch") {
	                      var _patch = ev.Fields[0];
	                      andRender(this["state@726"].UpdatePatch(_patch));
	                    } else {
	                      if (ev.Case === "RemovePatch") {
	                        var _patch2 = ev.Fields[0];
	                        andRender(this["state@726"].RemovePatch(_patch2));
	                      } else {
	                        if (ev.Case === "AddIOBox") {
	                          var iobox = ev.Fields[0];
	                          andRender(this["state@726"].AddIOBox(iobox));
	                        } else {
	                          if (ev.Case === "UpdateIOBox") {
	                            var _iobox = ev.Fields[0];
	                            andRender(this["state@726"].UpdateIOBox(_iobox));
	                          } else {
	                            if (ev.Case === "RemoveIOBox") {
	                              var _iobox2 = ev.Fields[0];
	                              andRender(this["state@726"].RemoveIOBox(_iobox2));
	                            } else {
	                              if (ev.Case === "AddNode") {
	                                var node = ev.Fields[0];
	                                andRender(this["state@726"].AddNode(node));
	                              } else {
	                                if (ev.Case === "UpdateNode") {
	                                  var _node = ev.Fields[0];
	                                  andRender(this["state@726"].UpdateNode(_node));
	                                } else {
	                                  if (ev.Case === "RemoveNode") {
	                                    var _node2 = ev.Fields[0];
	                                    andRender(this["state@726"].RemoveNode(_node2));
	                                  } else {
	                                    if (ev.Case === "AddSession") {
	                                      var session = ev.Fields[0];
	                                      andRender(addSession(session)(this["state@726"]));
	                                    } else {
	                                      if (ev.Case === "UpdateSession") {
	                                        var _session = ev.Fields[0];
	                                        andRender(this["state@726"].UpdateSession(_session));
	                                      } else {
	                                        if (ev.Case === "RemoveSession") {
	                                          var _session2 = ev.Fields[0];
	                                          andRender(this["state@726"].RemoveSession(_session2));
	                                        } else {
	                                          if (ev.Case === "AddUser") {
	                                            var user = ev.Fields[0];
	                                            andRender(this["state@726"].AddUser(user));
	                                          } else {
	                                            if (ev.Case === "UpdateUser") {
	                                              var _user = ev.Fields[0];
	                                              andRender(this["state@726"].UpdateUser(_user));
	                                            } else {
	                                              if (ev.Case === "RemoveUser") {
	                                                var _user2 = ev.Fields[0];
	                                                andRender(this["state@726"].RemoveUser(_user2));
	                                              } else {
	                                                $target24();
	                                              }
	                                            }
	                                          }
	                                        }
	                                      }
	                                    }
	                                  }
	                                }
	                              }
	                            }
	                          }
	                        }
	                      }
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  Store.prototype.Subscribe = function Subscribe(listener) {
	    this.listeners = new _fableCore.List(listener, this.listeners);
	  };
	
	  Store.prototype.Redo = function Redo() {
	    var matchValue = this.history.Redo();
	
	    if (matchValue != null) {
	      this["state@726"] = matchValue.State;
	      this.Notify(matchValue.Event);
	    }
	  };
	
	  Store.prototype.Undo = function Undo() {
	    var matchValue = this.history.Undo();
	
	    if (matchValue != null) {
	      this["state@726"] = matchValue.State;
	      this.Notify(matchValue.Event);
	    }
	  };
	
	  _createClass(Store, [{
	    key: "Debug",
	    get: function get() {
	      return this.history.Debug;
	    },
	    set: function set(dbg) {
	      this.history.Debug = dbg;
	    }
	  }, {
	    key: "UndoSteps",
	    get: function get() {
	      return this.history.Depth;
	    },
	    set: function set(n) {
	      this.history.Depth = n;
	    }
	  }, {
	    key: "State",
	    get: function get() {
	      return this["state@726"];
	    }
	  }, {
	    key: "History",
	    get: function get() {
	      return this.history;
	    }
	  }]);
	
	  return Store;
	}();
	
	_fableCore.Util.setInterfaces(Store.prototype, [], "Iris.Core.Store");
	
	var StateMachine = exports.StateMachine = function () {
	  function StateMachine(caseName, fields) {
	    _classCallCheck(this, StateMachine);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  StateMachine.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  StateMachine.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  StateMachine.prototype.ToString = function ToString() {
	    return this.Case === "UpdateNode" ? _fableCore.String.fsFormat("UpdateNode %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "RemoveNode" ? _fableCore.String.fsFormat("RemoveNode %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "AddPatch" ? _fableCore.String.fsFormat("AddPatch %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "UpdatePatch" ? _fableCore.String.fsFormat("UpdatePatch %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "RemovePatch" ? _fableCore.String.fsFormat("RemovePatch %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "AddIOBox" ? _fableCore.String.fsFormat("AddIOBox %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "UpdateIOBox" ? _fableCore.String.fsFormat("UpdateIOBox %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "RemoveIOBox" ? _fableCore.String.fsFormat("RemoveIOBox %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "AddCue" ? _fableCore.String.fsFormat("AddCue %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "UpdateCue" ? _fableCore.String.fsFormat("UpdateCue %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "RemoveCue" ? _fableCore.String.fsFormat("RemoveCue %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "AddCueList" ? _fableCore.String.fsFormat("AddCueList %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "UpdateCueList" ? _fableCore.String.fsFormat("UpdateCueList %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "RemoveCueList" ? _fableCore.String.fsFormat("RemoveCueList %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "AddUser" ? _fableCore.String.fsFormat("AddUser %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "UpdateUser" ? _fableCore.String.fsFormat("UpdateUser %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "RemoveUser" ? _fableCore.String.fsFormat("RemoveUser %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "AddSession" ? _fableCore.String.fsFormat("AddSession %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "UpdateSession" ? _fableCore.String.fsFormat("UpdateSession %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "RemoveSession" ? _fableCore.String.fsFormat("RemoveSession %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "Command" ? _fableCore.String.fsFormat("Command: %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0])) : this.Case === "DataSnapshot" ? _fableCore.String.fsFormat("DataSnapshot: %A")(function (x) {
	      return x;
	    })(this.Fields[0]) : this.Case === "LogMsg" ? _fableCore.String.fsFormat("LogMsg: [%A] %s")(function (x) {
	      return x;
	    })(this.Fields[0])(this.Fields[1]) : _fableCore.String.fsFormat("AddNode %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0]));
	  };
	
	  StateMachine.FromFB = function FromFB(fb) {
	    var matchValue = fb.PayloadType();
	
	    if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.NodeFB) {
	      var node = _Node.RaftNode.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.NodeFB()));
	
	      var matchValue_1 = fb.Action();
	
	      if (matchValue_1 === _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB) {
	        if (node.Case === "Left") {
	          return new _Either.Either("Left", [node.Fields[0]]);
	        } else {
	          return _Either.EitherModule.succeed(function (arg0) {
	            return new StateMachine("AddNode", [arg0]);
	          }(node.Fields[0]));
	        }
	      } else {
	        if (matchValue_1 === _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB) {
	          if (node.Case === "Left") {
	            return new _Either.Either("Left", [node.Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (arg0) {
	              return new StateMachine("UpdateNode", [arg0]);
	            }(node.Fields[0]));
	          }
	        } else {
	          if (matchValue_1 === _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB) {
	            if (node.Case === "Left") {
	              return new _Either.Either("Left", [node.Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (arg0) {
	                return new StateMachine("RemoveNode", [arg0]);
	              }(node.Fields[0]));
	            }
	          } else {
	            return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ActionTypeFB %A")(function (x) {
	              return x;
	            })(matchValue_1)]));
	          }
	        }
	      }
	    } else {
	      if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.PatchFB) {
	        var patch = _Patch.Patch.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.PatchFB()));
	
	        var _matchValue_ = fb.Action();
	
	        if (_matchValue_ === _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB) {
	          if (patch.Case === "Left") {
	            return new _Either.Either("Left", [patch.Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (arg0) {
	              return new StateMachine("AddPatch", [arg0]);
	            }(patch.Fields[0]));
	          }
	        } else {
	          if (_matchValue_ === _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB) {
	            if (patch.Case === "Left") {
	              return new _Either.Either("Left", [patch.Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (arg0) {
	                return new StateMachine("UpdatePatch", [arg0]);
	              }(patch.Fields[0]));
	            }
	          } else {
	            if (_matchValue_ === _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB) {
	              if (patch.Case === "Left") {
	                return new _Either.Either("Left", [patch.Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (arg0) {
	                  return new StateMachine("RemovePatch", [arg0]);
	                }(patch.Fields[0]));
	              }
	            } else {
	              return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ActionTypeFB %A")(function (x) {
	                return x;
	              })(_matchValue_)]));
	            }
	          }
	        }
	      } else {
	        if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.IOBoxFB) {
	          var iobox = _IOBox.IOBox.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.IOBoxFB()));
	
	          var _matchValue_2 = fb.Action();
	
	          if (_matchValue_2 === _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB) {
	            if (iobox.Case === "Left") {
	              return new _Either.Either("Left", [iobox.Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (arg0) {
	                return new StateMachine("AddIOBox", [arg0]);
	              }(iobox.Fields[0]));
	            }
	          } else {
	            if (_matchValue_2 === _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB) {
	              if (iobox.Case === "Left") {
	                return new _Either.Either("Left", [iobox.Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (arg0) {
	                  return new StateMachine("UpdateIOBox", [arg0]);
	                }(iobox.Fields[0]));
	              }
	            } else {
	              if (_matchValue_2 === _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB) {
	                if (iobox.Case === "Left") {
	                  return new _Either.Either("Left", [iobox.Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (arg0) {
	                    return new StateMachine("RemoveIOBox", [arg0]);
	                  }(iobox.Fields[0]));
	                }
	              } else {
	                return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ActionTypeFB %A")(function (x) {
	                  return x;
	                })(_matchValue_2)]));
	              }
	            }
	          }
	        } else {
	          if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.CueFB) {
	            var cue = _Cue.Cue.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.CueFB()));
	
	            var _matchValue_3 = fb.Action();
	
	            if (_matchValue_3 === _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB) {
	              if (cue.Case === "Left") {
	                return new _Either.Either("Left", [cue.Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (arg0) {
	                  return new StateMachine("AddCue", [arg0]);
	                }(cue.Fields[0]));
	              }
	            } else {
	              if (_matchValue_3 === _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB) {
	                if (cue.Case === "Left") {
	                  return new _Either.Either("Left", [cue.Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (arg0) {
	                    return new StateMachine("UpdateCue", [arg0]);
	                  }(cue.Fields[0]));
	                }
	              } else {
	                if (_matchValue_3 === _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB) {
	                  if (cue.Case === "Left") {
	                    return new _Either.Either("Left", [cue.Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (arg0) {
	                      return new StateMachine("RemoveCue", [arg0]);
	                    }(cue.Fields[0]));
	                  }
	                } else {
	                  return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ActionTypeFB %A")(function (x) {
	                    return x;
	                  })(_matchValue_3)]));
	                }
	              }
	            }
	          } else {
	            if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.CueListFB) {
	              var cuelist = _CueList.CueList.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.CueListFB()));
	
	              var _matchValue_4 = fb.Action();
	
	              if (_matchValue_4 === _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB) {
	                if (cuelist.Case === "Left") {
	                  return new _Either.Either("Left", [cuelist.Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (arg0) {
	                    return new StateMachine("AddCueList", [arg0]);
	                  }(cuelist.Fields[0]));
	                }
	              } else {
	                if (_matchValue_4 === _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB) {
	                  if (cuelist.Case === "Left") {
	                    return new _Either.Either("Left", [cuelist.Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (arg0) {
	                      return new StateMachine("UpdateCueList", [arg0]);
	                    }(cuelist.Fields[0]));
	                  }
	                } else {
	                  if (_matchValue_4 === _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB) {
	                    if (cuelist.Case === "Left") {
	                      return new _Either.Either("Left", [cuelist.Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (arg0) {
	                        return new StateMachine("RemoveCueList", [arg0]);
	                      }(cuelist.Fields[0]));
	                    }
	                  } else {
	                    return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ActionTypeFB %A")(function (x) {
	                      return x;
	                    })(_matchValue_4)]));
	                  }
	                }
	              }
	            } else {
	              if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.UserFB) {
	                var user = _User.User.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.UserFB()));
	
	                var _matchValue_5 = fb.Action();
	
	                if (_matchValue_5 === _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB) {
	                  if (user.Case === "Left") {
	                    return new _Either.Either("Left", [user.Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (arg0) {
	                      return new StateMachine("AddUser", [arg0]);
	                    }(user.Fields[0]));
	                  }
	                } else {
	                  if (_matchValue_5 === _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB) {
	                    if (user.Case === "Left") {
	                      return new _Either.Either("Left", [user.Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (arg0) {
	                        return new StateMachine("UpdateUser", [arg0]);
	                      }(user.Fields[0]));
	                    }
	                  } else {
	                    if (_matchValue_5 === _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB) {
	                      if (user.Case === "Left") {
	                        return new _Either.Either("Left", [user.Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (arg0) {
	                          return new StateMachine("RemoveUser", [arg0]);
	                        }(user.Fields[0]));
	                      }
	                    } else {
	                      return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ActionTypeFB %A")(function (x) {
	                        return x;
	                      })(_matchValue_5)]));
	                    }
	                  }
	                }
	              } else {
	                if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.SessionFB) {
	                  var session = _Session.Session.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.SessionFB()));
	
	                  var _matchValue_6 = fb.Action();
	
	                  if (_matchValue_6 === _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB) {
	                    if (session.Case === "Left") {
	                      return new _Either.Either("Left", [session.Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (arg0) {
	                        return new StateMachine("AddSession", [arg0]);
	                      }(session.Fields[0]));
	                    }
	                  } else {
	                    if (_matchValue_6 === _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB) {
	                      if (session.Case === "Left") {
	                        return new _Either.Either("Left", [session.Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (arg0) {
	                          return new StateMachine("UpdateSession", [arg0]);
	                        }(session.Fields[0]));
	                      }
	                    } else {
	                      if (_matchValue_6 === _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB) {
	                        if (session.Case === "Left") {
	                          return new _Either.Either("Left", [session.Fields[0]]);
	                        } else {
	                          return _Either.EitherModule.succeed(function (arg0) {
	                            return new StateMachine("RemoveSession", [arg0]);
	                          }(session.Fields[0]));
	                        }
	                      } else {
	                        return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ActionTypeFB %A")(function (x) {
	                          return x;
	                        })(_matchValue_6)]));
	                      }
	                    }
	                  }
	                } else {
	                  if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.StateFB ? fb.Action() === _buffers.Iris.Serialization.Raft.ActionTypeFB.DataSnapshotFB : false) {
	                    if (State.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.StateFB())).Case === "Left") {
	                      return new _Either.Either("Left", [State.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.StateFB())).Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (arg0) {
	                        return new StateMachine("DataSnapshot", [arg0]);
	                      }(State.FromFB(fb.Payload(new _buffers.Iris.Serialization.Raft.StateFB())).Fields[0]));
	                    }
	                  } else {
	                    if (matchValue === _buffers.Iris.Serialization.Raft.PayloadFB.LogMsgFB) {
	                      var msg = fb.Payload(new _buffers.Iris.Serialization.Raft.LogMsgFB());
	
	                      if (_LogLevel.LogLevel.TryParse(msg.LogLevel()).Case === "Left") {
	                        return new _Either.Either("Left", [_LogLevel.LogLevel.TryParse(msg.LogLevel()).Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (level) {
	                          return new StateMachine("LogMsg", [level, msg.Msg()]);
	                        }(_LogLevel.LogLevel.TryParse(msg.LogLevel()).Fields[0]));
	                      }
	                    } else {
	                      if (AppCommand.FromFB(fb.Action()).Case === "Left") {
	                        return new _Either.Either("Left", [AppCommand.FromFB(fb.Action()).Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (arg0) {
	                          return new StateMachine("Command", [arg0]);
	                        }(AppCommand.FromFB(fb.Action()).Fields[0]));
	                      }
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  StateMachine.prototype.ToOffset = function ToOffset(builder) {
	    var _this13 = this;
	
	    return this.Case === "UpdateNode" ? function () {
	      var node = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.NodeFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, node);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "RemoveNode" ? function () {
	      var node = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.NodeFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, node);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "AddPatch" ? function () {
	      var patch = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.PatchFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, patch);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "UpdatePatch" ? function () {
	      var patch = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.PatchFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, patch);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "RemovePatch" ? function () {
	      var patch = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.PatchFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, patch);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "AddIOBox" ? function () {
	      var iobox = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.IOBoxFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, iobox);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "UpdateIOBox" ? function () {
	      var iobox = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.IOBoxFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, iobox);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "RemoveIOBox" ? function () {
	      var iobox = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.IOBoxFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, iobox);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "AddCue" ? function () {
	      var cue = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.CueFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, cue);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "UpdateCue" ? function () {
	      var cue = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.CueFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, cue);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "RemoveCue" ? function () {
	      var cue = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.CueFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, cue);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "AddCueList" ? function () {
	      var cuelist = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.CueListFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, cuelist);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "UpdateCueList" ? function () {
	      var cuelist = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.CueListFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, cuelist);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "RemoveCueList" ? function () {
	      var cuelist = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.CueListFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, cuelist);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "AddUser" ? function () {
	      var user = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.UserFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, user);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "UpdateUser" ? function () {
	      var user = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.UserFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, user);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "RemoveUser" ? function () {
	      var user = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.UserFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, user);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "AddSession" ? function () {
	      var session = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.SessionFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, session);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "UpdateSession" ? function () {
	      var session = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.UpdateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.SessionFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, session);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "RemoveSession" ? function () {
	      var session = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.RemoveFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.SessionFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, session);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "Command" ? function () {
	      var cmd = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, cmd);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "DataSnapshot" ? function () {
	      var data = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.DataSnapshotFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.StateFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, data);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : this.Case === "LogMsg" ? function () {
	      var level = function (arg00) {
	        return builder.createString(arg00);
	      }(_fableCore.Util.toString(_this13.Fields[0]));
	
	      var msg = function (arg00) {
	        return builder.createString(arg00);
	      }(_this13.Fields[1]);
	
	      _buffers.Iris.Serialization.Raft.LogMsgFB.startLogMsgFB(builder);
	
	      _buffers.Iris.Serialization.Raft.LogMsgFB.addLogLevel(builder, level);
	
	      _buffers.Iris.Serialization.Raft.LogMsgFB.addMsg(builder, msg);
	
	      var offset = _buffers.Iris.Serialization.Raft.LogMsgFB.endLogMsgFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.LogMsgFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.LogMsgFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, offset);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }() : function () {
	      var node = _this13.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.startApiActionFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addAction(builder, _buffers.Iris.Serialization.Raft.ActionTypeFB.AddFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayloadType(builder, _buffers.Iris.Serialization.Raft.PayloadFB.NodeFB);
	
	      _buffers.Iris.Serialization.Raft.ApiActionFB.addPayload(builder, node);
	
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.endApiActionFB(builder);
	    }();
	  };
	
	  StateMachine.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  StateMachine.FromBytes = function FromBytes(bytes) {
	    return StateMachine.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ApiActionFB.getRootAsApiActionFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return StateMachine;
	}();

	_fableCore.Util.setInterfaces(StateMachine.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.StateMachine");
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	/// @file
	/// @addtogroup flatbuffers_javascript_api
	/// @{
	/// @cond FLATBUFFERS_INTERNAL
	/**
	 * @const
	 * @namespace
	 */
	var flatbuffers = {};
	
	/**
	 * @typedef {number}
	 */
	flatbuffers.Offset;
	
	/**
	 * @typedef {{
	 *   bb: flatbuffers.ByteBuffer,
	 *   bb_pos: number
	 * }}
	 */
	flatbuffers.Table;
	
	/**
	 * @type {number}
	 * @const
	 */
	flatbuffers.SIZEOF_SHORT = 2;
	
	/**
	 * @type {number}
	 * @const
	 */
	flatbuffers.SIZEOF_INT = 4;
	
	/**
	 * @type {number}
	 * @const
	 */
	flatbuffers.FILE_IDENTIFIER_LENGTH = 4;
	
	/**
	 * @enum {number}
	 */
	flatbuffers.Encoding = {
	  UTF8_BYTES: 1,
	  UTF16_STRING: 2
	};
	
	/**
	 * @type {Int32Array}
	 * @const
	 */
	flatbuffers.int32 = new Int32Array(2);
	
	/**
	 * @type {Float32Array}
	 * @const
	 */
	flatbuffers.float32 = new Float32Array(flatbuffers.int32.buffer);
	
	/**
	 * @type {Float64Array}
	 * @const
	 */
	flatbuffers.float64 = new Float64Array(flatbuffers.int32.buffer);
	
	/**
	 * @type {boolean}
	 * @const
	 */
	flatbuffers.isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
	
	////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * @constructor
	 * @param {number} high
	 * @param {number} low
	 */
	flatbuffers.Long = function(low, high) {
	  /**
	   * @type {number}
	   * @const
	   */
	  this.low = low | 0;
	
	  /**
	   * @type {number}
	   * @const
	   */
	  this.high = high | 0;
	};
	
	/**
	 * @param {number} high
	 * @param {number} low
	 * @returns {flatbuffers.Long}
	 */
	flatbuffers.Long.create = function(low, high) {
	  // Special-case zero to avoid GC overhead for default values
	  return low == 0 && high == 0 ? flatbuffers.Long.ZERO : new flatbuffers.Long(low, high);
	};
	
	/**
	 * @returns {number}
	 */
	flatbuffers.Long.prototype.toFloat64 = function() {
	  return this.low + this.high * 0x100000000;
	};
	
	/**
	 * @param {flatbuffers.Long} other
	 * @returns {boolean}
	 */
	flatbuffers.Long.prototype.equals = function(other) {
	  return this.low == other.low && this.high == other.high;
	};
	
	/**
	 * @type {flatbuffers.Long}
	 * @const
	 */
	flatbuffers.Long.ZERO = new flatbuffers.Long(0, 0);
	
	/// @endcond
	////////////////////////////////////////////////////////////////////////////////
	/**
	 * Create a FlatBufferBuilder.
	 *
	 * @constructor
	 * @param {number=} initial_size
	 */
	flatbuffers.Builder = function(initial_size) {
	  if (!initial_size) {
	    initial_size = 1024;
	  }
	
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   * @private
	   */
	  this.bb = flatbuffers.ByteBuffer.allocate(initial_size);
	
	  /**
	   * Remaining space in the ByteBuffer.
	   *
	   * @type {number}
	   * @private
	   */
	  this.space = initial_size;
	
	  /**
	   * Minimum alignment encountered so far.
	   *
	   * @type {number}
	   * @private
	   */
	  this.minalign = 1;
	
	  /**
	   * The vtable for the current table.
	   *
	   * @type {Array.<number>}
	   * @private
	   */
	  this.vtable = null;
	
	  /**
	   * The amount of fields we're actually using.
	   *
	   * @type {number}
	   * @private
	   */
	  this.vtable_in_use = 0;
	
	  /**
	   * Whether we are currently serializing a table.
	   *
	   * @type {boolean}
	   * @private
	   */
	  this.isNested = false;
	
	  /**
	   * Starting offset of the current struct/table.
	   *
	   * @type {number}
	   * @private
	   */
	  this.object_start = 0;
	
	  /**
	   * List of offsets of all vtables.
	   *
	   * @type {Array.<number>}
	   * @private
	   */
	  this.vtables = [];
	
	  /**
	   * For the current vector being built.
	   *
	   * @type {number}
	   * @private
	   */
	  this.vector_num_elems = 0;
	
	  /**
	   * False omits default values from the serialized data
	   *
	   * @type {boolean}
	   * @private
	   */
	  this.force_defaults = false;
	};
	
	/**
	 * In order to save space, fields that are set to their default value
	 * don't get serialized into the buffer. Forcing defaults provides a
	 * way to manually disable this optimization.
	 *
	 * @param {boolean} forceDefaults true always serializes default values
	 */
	flatbuffers.Builder.prototype.forceDefaults = function(forceDefaults) {
	  this.force_defaults = forceDefaults;
	};
	
	/**
	 * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
	 * called finish(). The actual data starts at the ByteBuffer's current position,
	 * not necessarily at 0.
	 *
	 * @returns {flatbuffers.ByteBuffer}
	 */
	flatbuffers.Builder.prototype.dataBuffer = function() {
	  return this.bb;
	};
	
	/**
	 * Get the bytes representing the FlatBuffer. Only call this after you've
	 * called finish().
	 *
	 * @returns {Uint8Array}
	 */
	flatbuffers.Builder.prototype.asUint8Array = function() {
	  return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
	};
	
	/// @cond FLATBUFFERS_INTERNAL
	/**
	 * Prepare to write an element of `size` after `additional_bytes` have been
	 * written, e.g. if you write a string, you need to align such the int length
	 * field is aligned to 4 bytes, and the string data follows it directly. If all
	 * you need to do is alignment, `additional_bytes` will be 0.
	 *
	 * @param {number} size This is the of the new element to write
	 * @param {number} additional_bytes The padding size
	 */
	flatbuffers.Builder.prototype.prep = function(size, additional_bytes) {
	  // Track the biggest thing we've ever aligned to.
	  if (size > this.minalign) {
	    this.minalign = size;
	  }
	
	  // Find the amount of alignment needed such that `size` is properly
	  // aligned after `additional_bytes`
	  var align_size = ((~(this.bb.capacity() - this.space + additional_bytes)) + 1) & (size - 1);
	
	  // Reallocate the buffer if needed.
	  while (this.space < align_size + size + additional_bytes) {
	    var old_buf_size = this.bb.capacity();
	    this.bb = flatbuffers.Builder.growByteBuffer(this.bb);
	    this.space += this.bb.capacity() - old_buf_size;
	  }
	
	  this.pad(align_size);
	};
	
	/**
	 * @param {number} byte_size
	 */
	flatbuffers.Builder.prototype.pad = function(byte_size) {
	  for (var i = 0; i < byte_size; i++) {
	    this.bb.writeInt8(--this.space, 0);
	  }
	};
	
	/**
	 * @param {number} value
	 */
	flatbuffers.Builder.prototype.writeInt8 = function(value) {
	  this.bb.writeInt8(this.space -= 1, value);
	};
	
	/**
	 * @param {number} value
	 */
	flatbuffers.Builder.prototype.writeInt16 = function(value) {
	  this.bb.writeInt16(this.space -= 2, value);
	};
	
	/**
	 * @param {number} value
	 */
	flatbuffers.Builder.prototype.writeInt32 = function(value) {
	  this.bb.writeInt32(this.space -= 4, value);
	};
	
	/**
	 * @param {flatbuffers.Long} value
	 */
	flatbuffers.Builder.prototype.writeInt64 = function(value) {
	  this.bb.writeInt64(this.space -= 8, value);
	};
	
	/**
	 * @param {number} value
	 */
	flatbuffers.Builder.prototype.writeFloat32 = function(value) {
	  this.bb.writeFloat32(this.space -= 4, value);
	};
	
	/**
	 * @param {number} value
	 */
	flatbuffers.Builder.prototype.writeFloat64 = function(value) {
	  this.bb.writeFloat64(this.space -= 8, value);
	};
	/// @endcond
	
	/**
	 * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
	 * @param {number} value The `int8` to add the the buffer.
	 */
	flatbuffers.Builder.prototype.addInt8 = function(value) {
	  this.prep(1, 0);
	  this.writeInt8(value);
	};
	
	/**
	 * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
	 * @param {number} value The `int16` to add the the buffer.
	 */
	flatbuffers.Builder.prototype.addInt16 = function(value) {
	  this.prep(2, 0);
	  this.writeInt16(value);
	};
	
	/**
	 * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
	 * @param {number} value The `int32` to add the the buffer.
	 */
	flatbuffers.Builder.prototype.addInt32 = function(value) {
	  this.prep(4, 0);
	  this.writeInt32(value);
	};
	
	/**
	 * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
	 * @param {flatbuffers.Long} value The `int64` to add the the buffer.
	 */
	flatbuffers.Builder.prototype.addInt64 = function(value) {
	  this.prep(8, 0);
	  this.writeInt64(value);
	};
	
	/**
	 * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
	 * @param {number} value The `float32` to add the the buffer.
	 */
	flatbuffers.Builder.prototype.addFloat32 = function(value) {
	  this.prep(4, 0);
	  this.writeFloat32(value);
	};
	
	/**
	 * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
	 * @param {number} value The `float64` to add the the buffer.
	 */
	flatbuffers.Builder.prototype.addFloat64 = function(value) {
	  this.prep(8, 0);
	  this.writeFloat64(value);
	};
	
	/// @cond FLATBUFFERS_INTERNAL
	/**
	 * @param {number} voffset
	 * @param {number} value
	 * @param {number} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldInt8 = function(voffset, value, defaultValue) {
	  if (this.force_defaults || value != defaultValue) {
	    this.addInt8(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * @param {number} voffset
	 * @param {number} value
	 * @param {number} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldInt16 = function(voffset, value, defaultValue) {
	  if (this.force_defaults || value != defaultValue) {
	    this.addInt16(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * @param {number} voffset
	 * @param {number} value
	 * @param {number} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldInt32 = function(voffset, value, defaultValue) {
	  if (this.force_defaults || value != defaultValue) {
	    this.addInt32(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * @param {number} voffset
	 * @param {flatbuffers.Long} value
	 * @param {flatbuffers.Long} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldInt64 = function(voffset, value, defaultValue) {
	  if (this.force_defaults || !value.equals(defaultValue)) {
	    this.addInt64(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * @param {number} voffset
	 * @param {number} value
	 * @param {number} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldFloat32 = function(voffset, value, defaultValue) {
	  if (this.force_defaults || value != defaultValue) {
	    this.addFloat32(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * @param {number} voffset
	 * @param {number} value
	 * @param {number} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldFloat64 = function(voffset, value, defaultValue) {
	  if (this.force_defaults || value != defaultValue) {
	    this.addFloat64(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * @param {number} voffset
	 * @param {flatbuffers.Offset} value
	 * @param {flatbuffers.Offset} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldOffset = function(voffset, value, defaultValue) {
	  if (this.force_defaults || value != defaultValue) {
	    this.addOffset(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * Structs are stored inline, so nothing additional is being added. `d` is always 0.
	 *
	 * @param {number} voffset
	 * @param {flatbuffers.Offset} value
	 * @param {flatbuffers.Offset} defaultValue
	 */
	flatbuffers.Builder.prototype.addFieldStruct = function(voffset, value, defaultValue) {
	  if (value != defaultValue) {
	    this.nested(value);
	    this.slot(voffset);
	  }
	};
	
	/**
	 * Structures are always stored inline, they need to be created right
	 * where they're used.  You'll get this assertion failure if you
	 * created it elsewhere.
	 *
	 * @param {flatbuffers.Offset} obj The offset of the created object
	 */
	flatbuffers.Builder.prototype.nested = function(obj) {
	  if (obj != this.offset()) {
	    throw new Error('FlatBuffers: struct must be serialized inline.');
	  }
	};
	
	/**
	 * Should not be creating any other object, string or vector
	 * while an object is being constructed
	 */
	flatbuffers.Builder.prototype.notNested = function() {
	  if (this.isNested) {
	    throw new Error('FlatBuffers: object serialization must not be nested.');
	  }
	};
	
	/**
	 * Set the current vtable at `voffset` to the current location in the buffer.
	 *
	 * @param {number} voffset
	 */
	flatbuffers.Builder.prototype.slot = function(voffset) {
	  this.vtable[voffset] = this.offset();
	};
	
	/**
	 * @returns {flatbuffers.Offset} Offset relative to the end of the buffer.
	 */
	flatbuffers.Builder.prototype.offset = function() {
	  return this.bb.capacity() - this.space;
	};
	
	/**
	 * Doubles the size of the backing ByteBuffer and copies the old data towards
	 * the end of the new buffer (since we build the buffer backwards).
	 *
	 * @param {flatbuffers.ByteBuffer} bb The current buffer with the existing data
	 * @returns {flatbuffers.ByteBuffer} A new byte buffer with the old data copied
	 * to it. The data is located at the end of the buffer.
	 */
	flatbuffers.Builder.growByteBuffer = function(bb) {
	  var old_buf_size = bb.capacity();
	
	  // Ensure we don't grow beyond what fits in an int.
	  if (old_buf_size & 0xC0000000) {
	    throw new Error('FlatBuffers: cannot grow buffer beyond 2 gigabytes.');
	  }
	
	  var new_buf_size = old_buf_size << 1;
	  var nbb = flatbuffers.ByteBuffer.allocate(new_buf_size);
	  nbb.setPosition(new_buf_size - old_buf_size);
	  nbb.bytes().set(bb.bytes(), new_buf_size - old_buf_size);
	  return nbb;
	};
	/// @endcond
	
	/**
	 * Adds on offset, relative to where it will be written.
	 *
	 * @param {flatbuffers.Offset} offset The offset to add.
	 */
	flatbuffers.Builder.prototype.addOffset = function(offset) {
	  this.prep(flatbuffers.SIZEOF_INT, 0); // Ensure alignment is already done.
	  this.writeInt32(this.offset() - offset + flatbuffers.SIZEOF_INT);
	};
	
	/// @cond FLATBUFFERS_INTERNAL
	/**
	 * Start encoding a new object in the buffer.  Users will not usually need to
	 * call this directly. The FlatBuffers compiler will generate helper methods
	 * that call this method internally.
	 *
	 * @param {number} numfields
	 */
	flatbuffers.Builder.prototype.startObject = function(numfields) {
	  this.notNested();
	  if (this.vtable == null) {
	    this.vtable = [];
	  }
	  this.vtable_in_use = numfields;
	  for (var i = 0; i < numfields; i++) {
	    this.vtable[i] = 0; // This will push additional elements as needed
	  }
	  this.isNested = true;
	  this.object_start = this.offset();
	};
	
	/**
	 * Finish off writing the object that is under construction.
	 *
	 * @returns {flatbuffers.Offset} The offset to the object inside `dataBuffer`
	 */
	flatbuffers.Builder.prototype.endObject = function() {
	  if (this.vtable == null || !this.isNested) {
	    throw new Error('FlatBuffers: endObject called without startObject');
	  }
	
	  this.addInt32(0);
	  var vtableloc = this.offset();
	
	  // Write out the current vtable.
	  for (var i = this.vtable_in_use - 1; i >= 0; i--) {
	    // Offset relative to the start of the table.
	    this.addInt16(this.vtable[i] != 0 ? vtableloc - this.vtable[i] : 0);
	  }
	
	  var standard_fields = 2; // The fields below:
	  this.addInt16(vtableloc - this.object_start);
	  this.addInt16((this.vtable_in_use + standard_fields) * flatbuffers.SIZEOF_SHORT);
	
	  // Search for an existing vtable that matches the current one.
	  var existing_vtable = 0;
	outer_loop:
	  for (var i = 0; i < this.vtables.length; i++) {
	    var vt1 = this.bb.capacity() - this.vtables[i];
	    var vt2 = this.space;
	    var len = this.bb.readInt16(vt1);
	    if (len == this.bb.readInt16(vt2)) {
	      for (var j = flatbuffers.SIZEOF_SHORT; j < len; j += flatbuffers.SIZEOF_SHORT) {
	        if (this.bb.readInt16(vt1 + j) != this.bb.readInt16(vt2 + j)) {
	          continue outer_loop;
	        }
	      }
	      existing_vtable = this.vtables[i];
	      break;
	    }
	  }
	
	  if (existing_vtable) {
	    // Found a match:
	    // Remove the current vtable.
	    this.space = this.bb.capacity() - vtableloc;
	
	    // Point table to existing vtable.
	    this.bb.writeInt32(this.space, existing_vtable - vtableloc);
	  } else {
	    // No match:
	    // Add the location of the current vtable to the list of vtables.
	    this.vtables.push(this.offset());
	
	    // Point table to current vtable.
	    this.bb.writeInt32(this.bb.capacity() - vtableloc, this.offset() - vtableloc);
	  }
	
	  this.isNested = false;
	  return vtableloc;
	};
	/// @endcond
	
	/**
	 * Finalize a buffer, poiting to the given `root_table`.
	 *
	 * @param {flatbuffers.Offset} root_table
	 * @param {string=} file_identifier
	 */
	flatbuffers.Builder.prototype.finish = function(root_table, file_identifier) {
	  if (file_identifier) {
	    this.prep(this.minalign, flatbuffers.SIZEOF_INT +
	      flatbuffers.FILE_IDENTIFIER_LENGTH);
	    if (file_identifier.length != flatbuffers.FILE_IDENTIFIER_LENGTH) {
	      throw new Error('FlatBuffers: file identifier must be length ' +
	        flatbuffers.FILE_IDENTIFIER_LENGTH);
	    }
	    for (var i = flatbuffers.FILE_IDENTIFIER_LENGTH - 1; i >= 0; i--) {
	      this.writeInt8(file_identifier.charCodeAt(i));
	    }
	  }
	  this.prep(this.minalign, flatbuffers.SIZEOF_INT);
	  this.addOffset(root_table);
	  this.bb.setPosition(this.space);
	};
	
	/// @cond FLATBUFFERS_INTERNAL
	/**
	 * This checks a required field has been set in a given table that has
	 * just been constructed.
	 *
	 * @param {flatbuffers.Offset} table
	 * @param {number} field
	 */
	flatbuffers.Builder.prototype.requiredField = function(table, field) {
	  var table_start = this.bb.capacity() - table;
	  var vtable_start = table_start - this.bb.readInt32(table_start);
	  var ok = this.bb.readInt16(vtable_start + field) != 0;
	
	  // If this fails, the caller will show what field needs to be set.
	  if (!ok) {
	    throw new Error('FlatBuffers: field ' + field + ' must be set');
	  }
	};
	
	/**
	 * Start a new array/vector of objects.  Users usually will not call
	 * this directly. The FlatBuffers compiler will create a start/end
	 * method for vector types in generated code.
	 *
	 * @param {number} elem_size The size of each element in the array
	 * @param {number} num_elems The number of elements in the array
	 * @param {number} alignment The alignment of the array
	 */
	flatbuffers.Builder.prototype.startVector = function(elem_size, num_elems, alignment) {
	  this.notNested();
	  this.vector_num_elems = num_elems;
	  this.prep(flatbuffers.SIZEOF_INT, elem_size * num_elems);
	  this.prep(alignment, elem_size * num_elems); // Just in case alignment > int.
	};
	
	/**
	 * Finish off the creation of an array and all its elements. The array must be
	 * created with `startVector`.
	 *
	 * @returns {flatbuffers.Offset} The offset at which the newly created array
	 * starts.
	 */
	flatbuffers.Builder.prototype.endVector = function() {
	  this.writeInt32(this.vector_num_elems);
	  return this.offset();
	};
	/// @endcond
	
	/**
	 * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
	 * instead of a string, it is assumed to contain valid UTF-8 encoded data.
	 *
	 * @param {string|Uint8Array} s The string to encode
	 * @return {flatbuffers.Offset} The offset in the buffer where the encoded string starts
	 */
	flatbuffers.Builder.prototype.createString = function(s) {
	  if (s instanceof Uint8Array) {
	    var utf8 = s;
	  } else {
	    var utf8 = [];
	    var i = 0;
	
	    while (i < s.length) {
	      var codePoint;
	
	      // Decode UTF-16
	      var a = s.charCodeAt(i++);
	      if (a < 0xD800 || a >= 0xDC00) {
	        codePoint = a;
	      } else {
	        var b = s.charCodeAt(i++);
	        codePoint = (a << 10) + b + (0x10000 - (0xD800 << 10) - 0xDC00);
	      }
	
	      // Encode UTF-8
	      if (codePoint < 0x80) {
	        utf8.push(codePoint);
	      } else {
	        if (codePoint < 0x800) {
	          utf8.push(((codePoint >> 6) & 0x1F) | 0xC0);
	        } else {
	          if (codePoint < 0x10000) {
	            utf8.push(((codePoint >> 12) & 0x0F) | 0xE0);
	          } else {
	            utf8.push(
	              ((codePoint >> 18) & 0x07) | 0xF0,
	              ((codePoint >> 12) & 0x3F) | 0x80);
	          }
	          utf8.push(((codePoint >> 6) & 0x3F) | 0x80);
	        }
	        utf8.push((codePoint & 0x3F) | 0x80);
	      }
	    }
	  }
	
	  this.addInt8(0);
	  this.startVector(1, utf8.length, 1);
	  this.bb.setPosition(this.space -= utf8.length);
	  for (var i = 0, offset = this.space, bytes = this.bb.bytes(); i < utf8.length; i++) {
	    bytes[offset++] = utf8[i];
	  }
	  return this.endVector();
	};
	
	/**
	 * A helper function to avoid generated code depending on this file directly.
	 *
	 * @param {number} low
	 * @param {number} high
	 * @returns {flatbuffers.Long}
	 */
	flatbuffers.Builder.prototype.createLong = function(low, high) {
	  return flatbuffers.Long.create(low, high);
	};
	////////////////////////////////////////////////////////////////////////////////
	/// @cond FLATBUFFERS_INTERNAL
	/**
	 * Create a new ByteBuffer with a given array of bytes (`Uint8Array`).
	 *
	 * @constructor
	 * @param {Uint8Array} bytes
	 */
	flatbuffers.ByteBuffer = function(bytes) {
	  /**
	   * @type {Uint8Array}
	   * @private
	   */
	  this.bytes_ = bytes;
	
	  /**
	   * @type {number}
	   * @private
	   */
	  this.position_ = 0;
	};
	
	/**
	 * Create and allocate a new ByteBuffer with a given size.
	 *
	 * @param {number} byte_size
	 * @returns {flatbuffers.ByteBuffer}
	 */
	flatbuffers.ByteBuffer.allocate = function(byte_size) {
	  return new flatbuffers.ByteBuffer(new Uint8Array(byte_size));
	};
	
	/**
	 * Get the underlying `Uint8Array`.
	 *
	 * @returns {Uint8Array}
	 */
	flatbuffers.ByteBuffer.prototype.bytes = function() {
	  return this.bytes_;
	};
	
	/**
	 * Get the buffer's position.
	 *
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.position = function() {
	  return this.position_;
	};
	
	/**
	 * Set the buffer's position.
	 *
	 * @param {number} position
	 */
	flatbuffers.ByteBuffer.prototype.setPosition = function(position) {
	  this.position_ = position;
	};
	
	/**
	 * Get the buffer's capacity.
	 *
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.capacity = function() {
	  return this.bytes_.length;
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readInt8 = function(offset) {
	  return this.readUint8(offset) << 24 >> 24;
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readUint8 = function(offset) {
	  return this.bytes_[offset];
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readInt16 = function(offset) {
	  return this.readUint16(offset) << 16 >> 16;
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readUint16 = function(offset) {
	  return this.bytes_[offset] | this.bytes_[offset + 1] << 8;
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readInt32 = function(offset) {
	  return this.bytes_[offset] | this.bytes_[offset + 1] << 8 | this.bytes_[offset + 2] << 16 | this.bytes_[offset + 3] << 24;
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readUint32 = function(offset) {
	  return this.readInt32(offset) >>> 0;
	};
	
	/**
	 * @param {number} offset
	 * @returns {flatbuffers.Long}
	 */
	flatbuffers.ByteBuffer.prototype.readInt64 = function(offset) {
	  return new flatbuffers.Long(this.readInt32(offset), this.readInt32(offset + 4));
	};
	
	/**
	 * @param {number} offset
	 * @returns {flatbuffers.Long}
	 */
	flatbuffers.ByteBuffer.prototype.readUint64 = function(offset) {
	  return new flatbuffers.Long(this.readUint32(offset), this.readUint32(offset + 4));
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readFloat32 = function(offset) {
	  flatbuffers.int32[0] = this.readInt32(offset);
	  return flatbuffers.float32[0];
	};
	
	/**
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.readFloat64 = function(offset) {
	  flatbuffers.int32[flatbuffers.isLittleEndian ? 0 : 1] = this.readInt32(offset);
	  flatbuffers.int32[flatbuffers.isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
	  return flatbuffers.float64[0];
	};
	
	/**
	 * @param {number} offset
	 * @param {number} value
	 */
	flatbuffers.ByteBuffer.prototype.writeInt8 = function(offset, value) {
	  this.bytes_[offset] = value;
	};
	
	/**
	 * @param {number} offset
	 * @param {number} value
	 */
	flatbuffers.ByteBuffer.prototype.writeInt16 = function(offset, value) {
	  this.bytes_[offset] = value;
	  this.bytes_[offset + 1] = value >> 8;
	};
	
	/**
	 * @param {number} offset
	 * @param {number} value
	 */
	flatbuffers.ByteBuffer.prototype.writeInt32 = function(offset, value) {
	  this.bytes_[offset] = value;
	  this.bytes_[offset + 1] = value >> 8;
	  this.bytes_[offset + 2] = value >> 16;
	  this.bytes_[offset + 3] = value >> 24;
	};
	
	/**
	 * @param {number} offset
	 * @param {flatbuffers.Long} value
	 */
	flatbuffers.ByteBuffer.prototype.writeInt64 = function(offset, value) {
	  this.writeInt32(offset, value.low);
	  this.writeInt32(offset + 4, value.high);
	};
	
	/**
	 * @param {number} offset
	 * @param {number} value
	 */
	flatbuffers.ByteBuffer.prototype.writeFloat32 = function(offset, value) {
	  flatbuffers.float32[0] = value;
	  this.writeInt32(offset, flatbuffers.int32[0]);
	};
	
	/**
	 * @param {number} offset
	 * @param {number} value
	 */
	flatbuffers.ByteBuffer.prototype.writeFloat64 = function(offset, value) {
	  flatbuffers.float64[0] = value;
	  this.writeInt32(offset, flatbuffers.int32[flatbuffers.isLittleEndian ? 0 : 1]);
	  this.writeInt32(offset + 4, flatbuffers.int32[flatbuffers.isLittleEndian ? 1 : 0]);
	};
	
	/**
	 * Look up a field in the vtable, return an offset into the object, or 0 if the
	 * field is not present.
	 *
	 * @param {number} bb_pos
	 * @param {number} vtable_offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.__offset = function(bb_pos, vtable_offset) {
	  var vtable = bb_pos - this.readInt32(bb_pos);
	  return vtable_offset < this.readInt16(vtable) ? this.readInt16(vtable + vtable_offset) : 0;
	};
	
	/**
	 * Initialize any Table-derived type to point to the union at the given offset.
	 *
	 * @param {flatbuffers.Table} t
	 * @param {number} offset
	 * @returns {flatbuffers.Table}
	 */
	flatbuffers.ByteBuffer.prototype.__union = function(t, offset) {
	  t.bb_pos = offset + this.readInt32(offset);
	  t.bb = this;
	  return t;
	};
	
	/**
	 * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
	 * This allocates a new string and converts to wide chars upon each access.
	 *
	 * To avoid the conversion to UTF-16, pass flatbuffers.Encoding.UTF8_BYTES as
	 * the "optionalEncoding" argument. This is useful for avoiding conversion to
	 * and from UTF-16 when the data will just be packaged back up in another
	 * FlatBuffer later on.
	 *
	 * @param {number} offset
	 * @param {flatbuffers.Encoding=} optionalEncoding Defaults to UTF16_STRING
	 * @returns {string|Uint8Array}
	 */
	flatbuffers.ByteBuffer.prototype.__string = function(offset, optionalEncoding) {
	  offset += this.readInt32(offset);
	
	  var length = this.readInt32(offset);
	  var result = '';
	  var i = 0;
	
	  offset += flatbuffers.SIZEOF_INT;
	
	  if (optionalEncoding === flatbuffers.Encoding.UTF8_BYTES) {
	    return this.bytes_.subarray(offset, offset + length);
	  }
	
	  while (i < length) {
	    var codePoint;
	
	    // Decode UTF-8
	    var a = this.readUint8(offset + i++);
	    if (a < 0xC0) {
	      codePoint = a;
	    } else {
	      var b = this.readUint8(offset + i++);
	      if (a < 0xE0) {
	        codePoint =
	          ((a & 0x1F) << 6) |
	          (b & 0x3F);
	      } else {
	        var c = this.readUint8(offset + i++);
	        if (a < 0xF0) {
	          codePoint =
	            ((a & 0x0F) << 12) |
	            ((b & 0x3F) << 6) |
	            (c & 0x3F);
	        } else {
	          var d = this.readUint8(offset + i++);
	          codePoint =
	            ((a & 0x07) << 18) |
	            ((b & 0x3F) << 12) |
	            ((c & 0x3F) << 6) |
	            (d & 0x3F);
	        }
	      }
	    }
	
	    // Encode UTF-16
	    if (codePoint < 0x10000) {
	      result += String.fromCharCode(codePoint);
	    } else {
	      codePoint -= 0x10000;
	      result += String.fromCharCode(
	        (codePoint >> 10) + 0xD800,
	        (codePoint & ((1 << 10) - 1)) + 0xDC00);
	    }
	  }
	
	  return result;
	};
	
	/**
	 * Retrieve the relative offset stored at "offset"
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.__indirect = function(offset) {
	  return offset + this.readInt32(offset);
	};
	
	/**
	 * Get the start of data of a vector whose offset is stored at "offset" in this object.
	 *
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.__vector = function(offset) {
	  return offset + this.readInt32(offset) + flatbuffers.SIZEOF_INT; // data starts after the length
	};
	
	/**
	 * Get the length of a vector whose offset is stored at "offset" in this object.
	 *
	 * @param {number} offset
	 * @returns {number}
	 */
	flatbuffers.ByteBuffer.prototype.__vector_len = function(offset) {
	  return this.readInt32(offset + this.readInt32(offset));
	};
	
	/**
	 * @param {string} ident
	 * @returns {boolean}
	 */
	flatbuffers.ByteBuffer.prototype.__has_identifier = function(ident) {
	  if (ident.length != flatbuffers.FILE_IDENTIFIER_LENGTH) {
	    throw new Error('FlatBuffers: file identifier must be length ' +
	                    flatbuffers.FILE_IDENTIFIER_LENGTH);
	  }
	  for (var i = 0; i < flatbuffers.FILE_IDENTIFIER_LENGTH; i++) {
	    if (ident.charCodeAt(i) != this.readInt8(this.position_ + flatbuffers.SIZEOF_INT + i)) {
	      return false;
	    }
	  }
	  return true;
	};
	
	/**
	 * A helper function to avoid generated code depending on this file directly.
	 *
	 * @param {number} low
	 * @param {number} high
	 * @returns {flatbuffers.Long}
	 */
	flatbuffers.ByteBuffer.prototype.createLong = function(low, high) {
	  return flatbuffers.Long.create(low, high);
	};
	
	// Exports for Node.js and RequireJS
	this.flatbuffers = flatbuffers;
	
	/// @endcond
	/// @}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {(function (global, factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== "undefined") {
	        factory(exports);
	    } else {
	        var mod = {
	            exports: {}
	        };
	        factory(mod.exports);
	        global.fableCore = mod.exports;
	    }
	})(this, function (exports) {
	    "use strict";
	
	    Object.defineProperty(exports, "__esModule", {
	        value: true
	    });
	    exports.Tuple = Tuple;
	    exports.Tuple3 = Tuple3;
	
	    var _slicedToArray = function () {
	        function sliceIterator(arr, i) {
	            var _arr = [];
	            var _n = true;
	            var _d = false;
	            var _e = undefined;
	
	            try {
	                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	                    _arr.push(_s.value);
	
	                    if (i && _arr.length === i) break;
	                }
	            } catch (err) {
	                _d = true;
	                _e = err;
	            } finally {
	                try {
	                    if (!_n && _i["return"]) _i["return"]();
	                } finally {
	                    if (_d) throw _e;
	                }
	            }
	
	            return _arr;
	        }
	
	        return function (arr, i) {
	            if (Array.isArray(arr)) {
	                return arr;
	            } else if (Symbol.iterator in Object(arr)) {
	                return sliceIterator(arr, i);
	            } else {
	                throw new TypeError("Invalid attempt to destructure non-iterable instance");
	            }
	        };
	    }();
	
	    function _defineProperty(obj, key, value) {
	        if (key in obj) {
	            Object.defineProperty(obj, key, {
	                value: value,
	                enumerable: true,
	                configurable: true,
	                writable: true
	            });
	        } else {
	            obj[key] = value;
	        }
	
	        return obj;
	    }
	
	    function _possibleConstructorReturn(self, call) {
	        if (!self) {
	            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	        }
	
	        return call && (typeof call === "object" || typeof call === "function") ? call : self;
	    }
	
	    function _inherits(subClass, superClass) {
	        if (typeof superClass !== "function" && superClass !== null) {
	            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	        }
	
	        subClass.prototype = Object.create(superClass && superClass.prototype, {
	            constructor: {
	                value: subClass,
	                enumerable: false,
	                writable: true,
	                configurable: true
	            }
	        });
	        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	    }
	
	    var _createClass = function () {
	        function defineProperties(target, props) {
	            for (var i = 0; i < props.length; i++) {
	                var descriptor = props[i];
	                descriptor.enumerable = descriptor.enumerable || false;
	                descriptor.configurable = true;
	                if ("value" in descriptor) descriptor.writable = true;
	                Object.defineProperty(target, descriptor.key, descriptor);
	            }
	        }
	
	        return function (Constructor, protoProps, staticProps) {
	            if (protoProps) defineProperties(Constructor.prototype, protoProps);
	            if (staticProps) defineProperties(Constructor, staticProps);
	            return Constructor;
	        };
	    }();
	
	    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	        return typeof obj;
	    } : function (obj) {
	        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	    };
	
	    function _classCallCheck(instance, Constructor) {
	        if (!(instance instanceof Constructor)) {
	            throw new TypeError("Cannot call a class as a function");
	        }
	    }
	
	    var fableGlobal = function () {
	        var globalObj = typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : null;
	        if (typeof globalObj.__FABLE_CORE__ == "undefined") {
	            globalObj.__FABLE_CORE__ = {
	                types: new Map(),
	                symbols: {
	                    interfaces: Symbol("interfaces"),
	                    typeName: Symbol("typeName")
	                }
	            };
	        }
	        return globalObj.__FABLE_CORE__;
	    }();
	    var FSymbol = fableGlobal.symbols;
	    exports.Symbol = FSymbol;
	    function Tuple(x, y) {
	        return [x, y];
	    }
	    function Tuple3(x, y, z) {
	        return [x, y, z];
	    }
	
	    var Util = exports.Util = function () {
	        function Util() {
	            _classCallCheck(this, Util);
	        }
	
	        // For legacy reasons the name is kept, but this method also adds
	        // the type name to a cache. Use it after declaration:
	        // Util.setInterfaces(Foo.prototype, ["IFoo", "IBar"], "MyModule.Foo");
	        Util.setInterfaces = function setInterfaces(proto, interfaces, typeName) {
	            if (Array.isArray(interfaces) && interfaces.length > 0) {
	                var currentInterfaces = proto[FSymbol.interfaces];
	                if (Array.isArray(currentInterfaces)) {
	                    for (var i = 0; i < interfaces.length; i++) {
	                        if (currentInterfaces.indexOf(interfaces[i]) == -1) currentInterfaces.push(interfaces[i]);
	                    }
	                } else proto[FSymbol.interfaces] = interfaces;
	            }
	            if (typeName) {
	                proto[FSymbol.typeName] = typeName;
	                fableGlobal.types.set(typeName, proto.constructor);
	            }
	        };
	
	        Util.hasInterface = function hasInterface(obj) {
	            for (var _len2 = arguments.length, interfaceNames = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	                interfaceNames[_key2 - 1] = arguments[_key2];
	            }
	
	            return Array.isArray(obj[FSymbol.interfaces]) && obj[FSymbol.interfaces].some(function (x) {
	                return interfaceNames.indexOf(x) >= 0;
	            });
	        };
	
	        Util.getTypeFullName = function getTypeFullName(cons) {
	            if (cons.prototype && cons.prototype[FSymbol.typeName]) {
	                return cons.prototype[FSymbol.typeName];
	            } else {
	                return cons.name || "unknown";
	            }
	        };
	
	        Util.getTypeNamespace = function getTypeNamespace(cons) {
	            var fullName = Util.getTypeFullName(cons);
	            var i = fullName.lastIndexOf('.');
	            return i > -1 ? fullName.substr(0, i) : "";
	        };
	
	        Util.getTypeName = function getTypeName(cons) {
	            var fullName = Util.getTypeFullName(cons);
	            var i = fullName.lastIndexOf('.');
	            return fullName.substr(i + 1);
	        };
	
	        Util.getRestParams = function getRestParams(args, idx) {
	            for (var _len = args.length, restArgs = Array(_len > idx ? _len - idx : 0), _key = idx; _key < _len; _key++) {
	                restArgs[_key - idx] = args[_key];
	            }return restArgs;
	        };
	
	        Util.toString = function toString(o) {
	            return o != null && typeof o.ToString == "function" ? o.ToString() : String(o);
	        };
	
	        Util.equals = function equals(x, y) {
	            if (x == null) return y == null;else if (y == null) return false;else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;else if (Array.isArray(x) || ArrayBuffer.isView(x)) return x.length != y.length ? false : Seq.fold2(function (prev, v1, v2) {
	                return !prev ? prev : Util.equals(v1, v2);
	            }, true, x, y);else if (x instanceof Date) return FDate.equals(x, y);else if (Util.hasInterface(x, "System.IEquatable")) return x.Equals(y);else return x === y;
	        };
	
	        Util.compare = function compare(x, y) {
	            if (x == null) return y == null ? 0 : -1;else if (y == null) return -1;else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return -1;else if (Array.isArray(x) || ArrayBuffer.isView(x)) return x.length != y.length ? x.length < y.length ? -1 : 1 : Seq.fold2(function (prev, v1, v2) {
	                return prev !== 0 ? prev : Util.compare(v1, v2);
	            }, 0, x, y);else if (Util.hasInterface(x, "System.IComparable")) return x.CompareTo(y);else return x < y ? -1 : x > y ? 1 : 0;
	        };
	
	        Util.equalsRecords = function equalsRecords(x, y) {
	            var keys = Object.getOwnPropertyNames(x);
	            for (var i = 0; i < keys.length; i++) {
	                if (!Util.equals(x[keys[i]], y[keys[i]])) return false;
	            }
	            return true;
	        };
	
	        Util.compareRecords = function compareRecords(x, y) {
	            var keys = Object.getOwnPropertyNames(x);
	            for (var i = 0; i < keys.length; i++) {
	                var res = Util.compare(x[keys[i]], y[keys[i]]);
	                if (res !== 0) return res;
	            }
	            return 0;
	        };
	
	        Util.equalsUnions = function equalsUnions(x, y) {
	            if (x.Case !== y.Case) return false;
	            for (var i = 0; i < x.Fields.length; i++) {
	                if (!Util.equals(x.Fields[i], y.Fields[i])) return false;
	            }
	            return true;
	        };
	
	        Util.compareUnions = function compareUnions(x, y) {
	            var res = Util.compare(x.Case, y.Case);
	            if (res !== 0) return res;
	            for (var i = 0; i < x.Fields.length; i++) {
	                res = Util.compare(x.Fields[i], y.Fields[i]);
	                if (res !== 0) return res;
	            }
	            return 0;
	        };
	
	        Util.createDisposable = function createDisposable(f) {
	            var disp = { Dispose: f };
	            disp[FSymbol.interfaces] = ["System.IDisposable"];
	            return disp;
	        };
	
	        Util.createObj = function createObj(fields) {
	            return Seq.fold(function (acc, kv) {
	                acc[kv[0]] = kv[1];return acc;
	            }, {}, fields);
	        };
	
	        return Util;
	    }();
	
	    Util.toPlainJsObj = function (source) {
	        if (source != null && source.constructor != Object) {
	            var target = {};
	            var props = Object.getOwnPropertyNames(source);
	            for (var i = 0; i < props.length; i++) {
	                target[props[i]] = source[props[i]];
	            }
	            // Copy also properties from prototype, see #192
	            var proto = Object.getPrototypeOf(source);
	            if (proto != null) {
	                props = Object.getOwnPropertyNames(proto);
	                for (var _i = 0; _i < props.length; _i++) {
	                    var prop = Object.getOwnPropertyDescriptor(proto, props[_i]);
	                    if (prop.value) {
	                        target[props[_i]] = prop.value;
	                    } else if (prop.get) {
	                        target[props[_i]] = prop.get.apply(source);
	                    }
	                }
	            }
	            return target;
	        } else {
	            return source;
	        }
	    };
	
	    var Serialize = exports.Serialize = function () {
	        function Serialize() {
	            _classCallCheck(this, Serialize);
	        }
	
	        Serialize.toJson = function toJson(o) {
	            return JSON.stringify(o, function (k, v) {
	                if (ArrayBuffer.isView(v)) {
	                    return Array.from(v);
	                } else if (v != null && (typeof v === "undefined" ? "undefined" : _typeof(v)) === "object") {
	                    if (v instanceof List || v instanceof FSet || v instanceof Set) {
	                        return {
	                            $type: v[FSymbol.typeName] || "System.Collections.Generic.HashSet",
	                            $values: Array.from(v) };
	                    } else if (v instanceof FMap || v instanceof Map) {
	                        return Seq.fold(function (o, kv) {
	                            o[kv[0]] = kv[1];return o;
	                        }, { $type: v[FSymbol.typeName] || "System.Collections.Generic.Dictionary" }, v);
	                    } else if (v[FSymbol.typeName]) {
	                        if (Util.hasInterface(v, "FSharpUnion", "FSharpRecord", "FSharpException")) {
	                            return Object.assign({ $type: v[FSymbol.typeName] }, v);
	                        } else {
	                            var proto = Object.getPrototypeOf(v),
	                                props = Object.getOwnPropertyNames(proto),
	                                _o = { $type: v[FSymbol.typeName] };
	                            for (var i = 0; i < props.length; i++) {
	                                var prop = Object.getOwnPropertyDescriptor(proto, props[i]);
	                                if (prop.get) _o[props[i]] = prop.get.apply(v);
	                            }
	                            return _o;
	                        }
	                    }
	                }
	                return v;
	            });
	        };
	
	        Serialize.ofJson = function ofJson(json, expected) {
	            var parsed = JSON.parse(json, function (k, v) {
	                if (v == null) return v;else if ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" && typeof v.$type === "string") {
	                    // Remove generic args and assembly info added by Newtonsoft.Json
	                    var type = v.$type.replace('+', '.'),
	                        i = type.indexOf('`');
	                    if (i > -1) {
	                        type = type.substr(0, i);
	                    } else {
	                        i = type.indexOf(',');
	                        type = i > -1 ? type.substr(0, i) : type;
	                    }
	                    if (type === "System.Collections.Generic.List" || type.indexOf("[]") === type.length - 2) {
	                        return v.$values;
	                    }
	                    if (type === "Microsoft.FSharp.Collections.FSharpList") {
	                        return List.ofArray(v.$values);
	                    } else if (type == "Microsoft.FSharp.Collections.FSharpSet") {
	                        return FSet.create(v.$values);
	                    } else if (type == "System.Collections.Generic.HashSet") {
	                        return new Set(v.$values);
	                    } else if (type == "Microsoft.FSharp.Collections.FSharpMap") {
	                        delete v.$type;
	                        return FMap.create(Object.getOwnPropertyNames(v).map(function (k) {
	                            return [k, v[k]];
	                        }));
	                    } else if (type == "System.Collections.Generic.Dictionary") {
	                        delete v.$type;
	                        return new Map(Object.getOwnPropertyNames(v).map(function (k) {
	                            return [k, v[k]];
	                        }));
	                    } else {
	                        var T = fableGlobal.types.get(type);
	                        if (T) {
	                            delete v.$type;
	                            return Object.assign(new T(), v);
	                        }
	                    }
	                } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2}|Z)$/.test(v)) return FDate.parse(v);else return v;
	            });
	            if (parsed != null && typeof expected == "function" && !(parsed instanceof expected)) {
	                throw "JSON is not of type " + expected.name + ": " + json;
	            }
	            return parsed;
	        };
	
	        return Serialize;
	    }();
	
	    var GenericComparer = exports.GenericComparer = function GenericComparer(f) {
	        _classCallCheck(this, GenericComparer);
	
	        this.Compare = f || Util.compare;
	    };
	
	    Util.setInterfaces(GenericComparer.prototype, ["System.IComparer"], "Fable.Core.GenericComparer");
	
	    var Choice = exports.Choice = function () {
	        function Choice(t, d) {
	            _classCallCheck(this, Choice);
	
	            this.Case = t;
	            this.Fields = d;
	        }
	
	        Choice.Choice1Of2 = function Choice1Of2(v) {
	            return new Choice("Choice1Of2", [v]);
	        };
	
	        Choice.Choice2Of2 = function Choice2Of2(v) {
	            return new Choice("Choice2Of2", [v]);
	        };
	
	        Choice.prototype.Equals = function Equals(other) {
	            return Util.equalsUnions(this, other);
	        };
	
	        Choice.prototype.CompareTo = function CompareTo(other) {
	            return Util.compareUnions(this, other);
	        };
	
	        _createClass(Choice, [{
	            key: "valueIfChoice1",
	            get: function get() {
	                return this.Case === "Choice1Of2" ? this.Fields[0] : null;
	            }
	        }, {
	            key: "valueIfChoice2",
	            get: function get() {
	                return this.Case === "Choice2Of2" ? this.Fields[0] : null;
	            }
	        }]);
	
	        return Choice;
	    }();
	
	    Util.setInterfaces(Choice.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Core.FSharpChoice");
	
	    var TimeSpan = exports.TimeSpan = function (_Number) {
	        _inherits(TimeSpan, _Number);
	
	        function TimeSpan() {
	            _classCallCheck(this, TimeSpan);
	
	            return _possibleConstructorReturn(this, _Number.apply(this, arguments));
	        }
	
	        TimeSpan.create = function create() {
	            var d = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	            var h = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	            var m = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	            var s = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
	            var ms = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
	
	            switch (arguments.length) {
	                case 1:
	                    // ticks
	                    return this.fromTicks(arguments[0]);
	                case 3:
	                    // h,m,s
	                    d = 0, h = arguments[0], m = arguments[1], s = arguments[2], ms = 0;
	                    break;
	                default:
	                    // d,h,m,s,ms
	                    d = arguments[0], h = arguments[1], m = arguments[2], s = arguments[3], ms = arguments[4] || 0;
	                    break;
	            }
	            return d * 86400000 + h * 3600000 + m * 60000 + s * 1000 + ms;
	        };
	
	        TimeSpan.fromTicks = function fromTicks(ticks) {
	            return ticks / 10000;
	        };
	
	        TimeSpan.fromDays = function fromDays(d) {
	            return TimeSpan.create(d, 0, 0, 0);
	        };
	
	        TimeSpan.fromHours = function fromHours(h) {
	            return TimeSpan.create(h, 0, 0);
	        };
	
	        TimeSpan.fromMinutes = function fromMinutes(m) {
	            return TimeSpan.create(0, m, 0);
	        };
	
	        TimeSpan.fromSeconds = function fromSeconds(s) {
	            return TimeSpan.create(0, 0, s);
	        };
	
	        TimeSpan.days = function days(ts) {
	            return Math.floor(ts / 86400000);
	        };
	
	        TimeSpan.hours = function hours(ts) {
	            return Math.floor(ts % 86400000 / 3600000);
	        };
	
	        TimeSpan.minutes = function minutes(ts) {
	            return Math.floor(ts % 3600000 / 60000);
	        };
	
	        TimeSpan.seconds = function seconds(ts) {
	            return Math.floor(ts % 60000 / 1000);
	        };
	
	        TimeSpan.milliseconds = function milliseconds(ts) {
	            return Math.floor(ts % 1000);
	        };
	
	        TimeSpan.ticks = function ticks(ts) {
	            return ts * 10000;
	        };
	
	        TimeSpan.totalDays = function totalDays(ts) {
	            return ts / 86400000;
	        };
	
	        TimeSpan.totalHours = function totalHours(ts) {
	            return ts / 3600000;
	        };
	
	        TimeSpan.totalMinutes = function totalMinutes(ts) {
	            return ts / 60000;
	        };
	
	        TimeSpan.totalSeconds = function totalSeconds(ts) {
	            return ts / 1000;
	        };
	
	        TimeSpan.negate = function negate(ts) {
	            return ts * -1;
	        };
	
	        TimeSpan.add = function add(ts1, ts2) {
	            return ts1 + ts2;
	        };
	
	        TimeSpan.subtract = function subtract(ts1, ts2) {
	            return ts1 - ts2;
	        };
	
	        return TimeSpan;
	    }(Number);
	
	    TimeSpan.compare = Util.compare;
	    TimeSpan.compareTo = Util.compare;
	    TimeSpan.duration = Math.abs;
	    var DateKind = exports.DateKind = undefined;
	    (function (DateKind) {
	        DateKind[DateKind["UTC"] = 1] = "UTC";
	        DateKind[DateKind["Local"] = 2] = "Local";
	    })(DateKind || (exports.DateKind = DateKind = {}));
	
	    var FDate = function (_Date) {
	        _inherits(FDate, _Date);
	
	        function FDate() {
	            _classCallCheck(this, FDate);
	
	            return _possibleConstructorReturn(this, _Date.apply(this, arguments));
	        }
	
	        FDate.__changeKind = function __changeKind(d, kind) {
	            var d2 = void 0;
	            return d.kind == kind ? d : (d2 = new Date(d.getTime()), d2.kind = kind, d2);
	        };
	
	        FDate.__getValue = function __getValue(d, key) {
	            return d[(d.kind == DateKind.UTC ? "getUTC" : "get") + key]();
	        };
	
	        FDate.minValue = function minValue() {
	            return FDate.parse(-8640000000000000, 1);
	        };
	
	        FDate.maxValue = function maxValue() {
	            return FDate.parse(8640000000000000, 1);
	        };
	
	        FDate.parse = function parse(v, kind) {
	            var date = v == null ? new Date() : new Date(v);
	            if (isNaN(date.getTime())) throw "The string is not a valid Date.";
	            date.kind = kind || (typeof v == "string" && v.slice(-1) == "Z" ? DateKind.UTC : DateKind.Local);
	            return date;
	        };
	
	        FDate.create = function create(year, month, day) {
	            var h = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
	            var m = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
	            var s = arguments.length <= 5 || arguments[5] === undefined ? 0 : arguments[5];
	            var ms = arguments.length <= 6 || arguments[6] === undefined ? 0 : arguments[6];
	            var kind = arguments.length <= 7 || arguments[7] === undefined ? DateKind.Local : arguments[7];
	
	            var date = kind === DateKind.UTC ? new Date(Date.UTC(year, month - 1, day, h, m, s, ms)) : new Date(year, month - 1, day, h, m, s, ms);
	            if (isNaN(date.getTime())) throw "The parameters describe an unrepresentable Date.";
	            date.kind = kind;
	            return date;
	        };
	
	        FDate.utcNow = function utcNow() {
	            return FDate.parse(null, 1);
	        };
	
	        FDate.today = function today() {
	            return FDate.date(FDate.now());
	        };
	
	        FDate.isLeapYear = function isLeapYear(year) {
	            return year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
	        };
	
	        FDate.daysInMonth = function daysInMonth(year, month) {
	            return month == 2 ? FDate.isLeapYear(year) ? 29 : 28 : month >= 8 ? month % 2 == 0 ? 31 : 30 : month % 2 == 0 ? 30 : 31;
	        };
	
	        FDate.toUniversalTime = function toUniversalTime(d) {
	            return FDate.__changeKind(d, 1);
	        };
	
	        FDate.toLocalTime = function toLocalTime(d) {
	            return FDate.__changeKind(d, 2);
	        };
	
	        FDate.timeOfDay = function timeOfDay(d) {
	            return TimeSpan.create(0, FDate.hour(d), FDate.minute(d), FDate.second(d), FDate.millisecond(d));
	        };
	
	        FDate.date = function date(d) {
	            return FDate.create(FDate.year(d), FDate.month(d), FDate.day(d), 0, 0, 0, 0, d.kind);
	        };
	
	        FDate.day = function day(d) {
	            return FDate.__getValue(d, "Date");
	        };
	
	        FDate.hour = function hour(d) {
	            return FDate.__getValue(d, "Hours");
	        };
	
	        FDate.millisecond = function millisecond(d) {
	            return FDate.__getValue(d, "Milliseconds");
	        };
	
	        FDate.minute = function minute(d) {
	            return FDate.__getValue(d, "Minutes");
	        };
	
	        FDate.month = function month(d) {
	            return FDate.__getValue(d, "Month") + 1;
	        };
	
	        FDate.second = function second(d) {
	            return FDate.__getValue(d, "Seconds");
	        };
	
	        FDate.year = function year(d) {
	            return FDate.__getValue(d, "FullYear");
	        };
	
	        FDate.ticks = function ticks(d) {
	            return (d.getTime() + 6.2135604e+13 /* millisecondsJSOffset */) * 10000;
	        };
	
	        FDate.dayOfWeek = function dayOfWeek(d) {
	            return FDate.__getValue(d, "Day");
	        };
	
	        FDate.dayOfYear = function dayOfYear(d) {
	            var year = FDate.year(d);
	            var month = FDate.month(d);
	            var day = FDate.day(d);
	            for (var i = 1; i < month; i++) {
	                day += FDate.daysInMonth(year, i);
	            }return day;
	        };
	
	        FDate.add = function add(d, ts) {
	            return FDate.parse(d.getTime() + ts, d.kind);
	        };
	
	        FDate.addDays = function addDays(d, v) {
	            return FDate.parse(d.getTime() + v * 86400000, d.kind);
	        };
	
	        FDate.addHours = function addHours(d, v) {
	            return FDate.parse(d.getTime() + v * 3600000, d.kind);
	        };
	
	        FDate.addMinutes = function addMinutes(d, v) {
	            return FDate.parse(d.getTime() + v * 60000, d.kind);
	        };
	
	        FDate.addSeconds = function addSeconds(d, v) {
	            return FDate.parse(d.getTime() + v * 1000, d.kind);
	        };
	
	        FDate.addMilliseconds = function addMilliseconds(d, v) {
	            return FDate.parse(d.getTime() + v, d.kind);
	        };
	
	        FDate.addTicks = function addTicks(d, v) {
	            return FDate.parse(d.getTime() + v / 10000, d.kind);
	        };
	
	        FDate.addYears = function addYears(d, v) {
	            var newMonth = FDate.month(d);
	            var newYear = FDate.year(d) + v;
	            var daysInMonth = FDate.daysInMonth(newYear, newMonth);
	            var newDay = Math.min(daysInMonth, FDate.day(d));
	            return FDate.create(newYear, newMonth, newDay, FDate.hour(d), FDate.minute(d), FDate.second(d), FDate.millisecond(d), d.kind);
	        };
	
	        FDate.addMonths = function addMonths(d, v) {
	            var newMonth = FDate.month(d) + v;
	            var newMonth_ = 0;
	            var yearOffset = 0;
	            if (newMonth > 12) {
	                newMonth_ = newMonth % 12;
	                yearOffset = Math.floor(newMonth / 12);
	                newMonth = newMonth_;
	            } else if (newMonth < 1) {
	                newMonth_ = 12 + newMonth % 12;
	                yearOffset = Math.floor(newMonth / 12) + (newMonth_ == 12 ? -1 : 0);
	                newMonth = newMonth_;
	            }
	            var newYear = FDate.year(d) + yearOffset;
	            var daysInMonth = FDate.daysInMonth(newYear, newMonth);
	            var newDay = Math.min(daysInMonth, FDate.day(d));
	            return FDate.create(newYear, newMonth, newDay, FDate.hour(d), FDate.minute(d), FDate.second(d), FDate.millisecond(d), d.kind);
	        };
	
	        FDate.subtract = function subtract(d, that) {
	            return typeof that == "number" ? FDate.parse(d.getTime() - that, d.kind) : d.getTime() - that.getTime();
	        };
	
	        FDate.toLongDateString = function toLongDateString(d) {
	            return d.toDateString();
	        };
	
	        FDate.toShortDateString = function toShortDateString(d) {
	            return d.toLocaleDateString();
	        };
	
	        FDate.toLongTimeString = function toLongTimeString(d) {
	            return d.toLocaleTimeString();
	        };
	
	        FDate.toShortTimeString = function toShortTimeString(d) {
	            return d.toLocaleTimeString().replace(/:\d\d(?!:)/, "");
	        };
	
	        FDate.equals = function equals(d1, d2) {
	            return d1.getTime() == d2.getTime();
	        };
	
	        return FDate;
	    }(Date);
	
	    FDate.now = FDate.parse;
	    FDate.toBinary = FDate.ticks;
	    FDate.compareTo = Util.compare;
	    FDate.compare = Util.compare;
	    FDate.op_Addition = FDate.add;
	    FDate.op_Subtraction = FDate.subtract;
	    exports.Date = FDate;
	
	    var Timer = exports.Timer = function () {
	        function Timer(interval) {
	            _classCallCheck(this, Timer);
	
	            this.Interval = interval > 0 ? interval : 100;
	            this.AutoReset = true;
	            this._elapsed = new Event();
	        }
	
	        Timer.prototype.Dispose = function Dispose() {
	            this.Enabled = false;
	            this._isDisposed = true;
	        };
	
	        Timer.prototype.Close = function Close() {
	            this.Dispose();
	        };
	
	        Timer.prototype.Start = function Start() {
	            this.Enabled = true;
	        };
	
	        Timer.prototype.Stop = function Stop() {
	            this.Enabled = false;
	        };
	
	        _createClass(Timer, [{
	            key: "Elapsed",
	            get: function get() {
	                return this._elapsed;
	            }
	        }, {
	            key: "Enabled",
	            get: function get() {
	                return this._enabled;
	            },
	            set: function set(x) {
	                var _this3 = this;
	
	                if (!this._isDisposed && this._enabled != x) {
	                    if (this._enabled = x) {
	                        if (this.AutoReset) {
	                            this._intervalId = setInterval(function () {
	                                if (!_this3.AutoReset) _this3.Enabled = false;
	                                _this3._elapsed.Trigger(new Date());
	                            }, this.Interval);
	                        } else {
	                            this._timeoutId = setTimeout(function () {
	                                _this3.Enabled = false;
	                                _this3._timeoutId = 0;
	                                if (_this3.AutoReset) _this3.Enabled = true;
	                                _this3._elapsed.Trigger(new Date());
	                            }, this.Interval);
	                        }
	                    } else {
	                        if (this._timeoutId) {
	                            clearTimeout(this._timeoutId);
	                            this._timeoutId = 0;
	                        }
	                        if (this._intervalId) {
	                            clearInterval(this._intervalId);
	                            this._intervalId = 0;
	                        }
	                    }
	                }
	            }
	        }]);
	
	        return Timer;
	    }();
	
	    Util.setInterfaces(Timer.prototype, ["System.IDisposable"]);
	
	    var FString = function () {
	        function FString() {
	            _classCallCheck(this, FString);
	        }
	
	        FString.fsFormat = function fsFormat(str) {
	            function isObject(x) {
	                return x !== null && (typeof x === "undefined" ? "undefined" : _typeof(x)) === "object" && !(x instanceof Number) && !(x instanceof String) && !(x instanceof Boolean);
	            }
	            function formatOnce(str, rep) {
	                return str.replace(FString.fsFormatRegExp, function (_, prefix, flags, pad, precision, format) {
	                    switch (format) {
	                        case "f":
	                        case "F":
	                            rep = rep.toFixed(precision || 6);
	                            break;
	                        case "g":
	                        case "G":
	                            rep = rep.toPrecision(precision);
	                            break;
	                        case "e":
	                        case "E":
	                            rep = rep.toExponential(precision);
	                            break;
	                        case "O":
	                            rep = Util.toString(rep);
	                            break;
	                        case "A":
	                            try {
	                                rep = JSON.stringify(rep, function (k, v) {
	                                    return v && v[Symbol.iterator] && !Array.isArray(v) && isObject(v) ? Array.from(v) : v;
	                                });
	                            } catch (err) {
	                                // Fallback for objects with circular references
	                                rep = "{" + Object.getOwnPropertyNames(rep).map(function (k) {
	                                    return k + ": " + String(rep[k]);
	                                }).join(", ") + "}";
	                            }
	                            break;
	                    }
	                    var plusPrefix = flags.indexOf("+") >= 0 && parseInt(rep) >= 0;
	                    if (!isNaN(pad = parseInt(pad))) {
	                        var ch = pad >= 0 && flags.indexOf("0") >= 0 ? "0" : " ";
	                        rep = FString.padLeft(rep, Math.abs(pad) - (plusPrefix ? 1 : 0), ch, pad < 0);
	                    }
	                    var once = prefix + (plusPrefix ? "+" + rep : rep);
	                    return once.replace(/%/g, "%%");
	                });
	            }
	            function makeFn(str) {
	                return function (rep) {
	                    var str2 = formatOnce(str, rep);
	                    return FString.fsFormatRegExp.test(str2) ? makeFn(str2) : _cont(str2.replace(/%%/g, "%"));
	                };
	            }
	            var _cont = void 0;
	            return function (cont) {
	                _cont = cont;
	                return FString.fsFormatRegExp.test(str) ? makeFn(str) : _cont(str);
	            };
	        };
	
	        FString.format = function format(str) {
	            for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	                args[_key3 - 1] = arguments[_key3];
	            }
	
	            return str.replace(FString.formatRegExp, function (match, idx, pad, format) {
	                var rep = args[idx],
	                    padSymbol = " ";
	                if (typeof rep === "number") {
	                    switch ((format || "").substring(0, 1)) {
	                        case "f":
	                        case "F":
	                            rep = format.length > 1 ? rep.toFixed(format.substring(1)) : rep.toFixed(2);
	                            break;
	                        case "g":
	                        case "G":
	                            rep = format.length > 1 ? rep.toPrecision(format.substring(1)) : rep.toPrecision();
	                            break;
	                        case "e":
	                        case "E":
	                            rep = format.length > 1 ? rep.toExponential(format.substring(1)) : rep.toExponential();
	                            break;
	                        case "p":
	                        case "P":
	                            rep = (format.length > 1 ? (rep * 100).toFixed(format.substring(1)) : (rep * 100).toFixed(2)) + " %";
	                            break;
	                        default:
	                            var m = /^(0+)(\.0+)?$/.exec(format);
	                            if (m != null) {
	                                var decs = 0;
	                                if (m[2] != null) rep = rep.toFixed(decs = m[2].length - 1);
	                                pad = "," + (m[1].length + (decs ? decs + 1 : 0)).toString();
	                                padSymbol = "0";
	                            } else if (format) {
	                                rep = format;
	                            }
	                    }
	                } else if (rep instanceof Date) {
	                    if (format.length === 1) {
	                        switch (format) {
	                            case "D":
	                                rep = rep.toDateString();
	                                break;
	                            case "T":
	                                rep = rep.toLocaleTimeString();
	                                break;
	                            case "d":
	                                rep = rep.toLocaleDateString();
	                                break;
	                            case "t":
	                                rep = rep.toLocaleTimeString().replace(/:\d\d(?!:)/, "");
	                                break;
	                            case "o":
	                            case "O":
	                                if (rep.kind === DateKind.Local) {
	                                    var offset = rep.getTimezoneOffset() * -1;
	                                    rep = FString.format("{0:yyyy-MM-dd}T{0:HH:mm}:{1:00.000}{2}{3:00}:{4:00}", rep, FDate.second(rep), offset >= 0 ? "+" : "-", ~~(offset / 60), offset % 60);
	                                } else {
	                                    rep = rep.toISOString();
	                                }
	                        }
	                    } else {
	                        rep = format.replace(/\w+/g, function (match2) {
	                            var rep2 = match2;
	                            switch (match2.substring(0, 1)) {
	                                case "y":
	                                    rep2 = match2.length < 4 ? FDate.year(rep) % 100 : FDate.year(rep);
	                                    break;
	                                case "h":
	                                    rep2 = rep.getHours() > 12 ? FDate.hour(rep) % 12 : FDate.hour(rep);
	                                    break;
	                                case "M":
	                                    rep2 = FDate.month(rep);
	                                    break;
	                                case "d":
	                                    rep2 = FDate.day(rep);
	                                    break;
	                                case "H":
	                                    rep2 = FDate.hour(rep);
	                                    break;
	                                case "m":
	                                    rep2 = FDate.minute(rep);
	                                    break;
	                                case "s":
	                                    rep2 = FDate.second(rep);
	                                    break;
	                            }
	                            if (rep2 !== match2 && rep2 < 10 && match2.length > 1) {
	                                rep2 = "0" + rep2;
	                            }
	                            return rep2;
	                        });
	                    }
	                }
	                if (!isNaN(pad = parseInt((pad || "").substring(1)))) {
	                    rep = FString.padLeft(rep, Math.abs(pad), padSymbol, pad < 0);
	                }
	                return rep;
	            });
	        };
	
	        FString.endsWith = function endsWith(str, search) {
	            var idx = str.lastIndexOf(search);
	            return idx >= 0 && idx == str.length - search.length;
	        };
	
	        FString.initialize = function initialize(n, f) {
	            if (n < 0) throw "String length must be non-negative";
	            var xs = new Array(n);
	            for (var i = 0; i < n; i++) {
	                xs[i] = f(i);
	            }return xs.join("");
	        };
	
	        FString.isNullOrEmpty = function isNullOrEmpty(str) {
	            return typeof str !== "string" || str.length == 0;
	        };
	
	        FString.isNullOrWhiteSpace = function isNullOrWhiteSpace(str) {
	            return typeof str !== "string" || /^\s*$/.test(str);
	        };
	
	        FString.join = function join(delimiter, xs) {
	            xs = typeof xs == "string" ? Util.getRestParams(arguments, 1) : xs;
	            return (Array.isArray(xs) ? xs : Array.from(xs)).join(delimiter);
	        };
	
	        FString.newGuid = function newGuid() {
	            var uuid = "";
	            for (var i = 0; i < 32; i++) {
	                var random = Math.random() * 16 | 0;
	                if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";
	                uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16);
	            }
	            return uuid;
	        };
	
	        FString.padLeft = function padLeft(str, len, ch, isRight) {
	            ch = ch || " ";
	            str = String(str);
	            len = len - str.length;
	            for (var i = -1; ++i < len;) {
	                str = isRight ? str + ch : ch + str;
	            }return str;
	        };
	
	        FString.padRight = function padRight(str, len, ch) {
	            return FString.padLeft(str, len, ch, true);
	        };
	
	        FString.remove = function remove(str, startIndex, count) {
	            if (startIndex >= str.length) {
	                throw "startIndex must be less than length of string";
	            }
	            if (typeof count === "number" && startIndex + count > str.length) {
	                throw "Index and count must refer to a location within the string.";
	            }
	            return str.slice(0, startIndex) + (typeof count === "number" ? str.substr(startIndex + count) : "");
	        };
	
	        FString.replace = function replace(str, search, _replace) {
	            return str.replace(new RegExp(FRegExp.escape(search), "g"), _replace);
	        };
	
	        FString.replicate = function replicate(n, x) {
	            return FString.initialize(n, function () {
	                return x;
	            });
	        };
	
	        FString.split = function split(str, splitters, count, removeEmpty) {
	            count = typeof count == "number" ? count : null;
	            removeEmpty = typeof removeEmpty == "number" ? removeEmpty : null;
	            if (count < 0) throw "Count cannot be less than zero";
	            if (count === 0) return [];
	            splitters = Array.isArray(splitters) ? splitters : Util.getRestParams(arguments, 1);
	            splitters = splitters.map(function (x) {
	                return FRegExp.escape(x);
	            });
	            splitters = splitters.length > 0 ? splitters : [" "];
	            var m = void 0;
	            var i = 0;
	            var splits = [];
	            var reg = new RegExp(splitters.join("|"), "g");
	            while ((count == null || count > 1) && (m = reg.exec(str)) !== null) {
	                if (!removeEmpty || m.index - i > 0) {
	                    count = count != null ? count - 1 : count;
	                    splits.push(str.substring(i, m.index));
	                }
	                i = reg.lastIndex;
	            }
	            if (!removeEmpty || str.length - i > 0) splits.push(str.substring(i));
	            return splits;
	        };
	
	        FString.trim = function trim(str, side) {
	            for (var _len4 = arguments.length, chars = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
	                chars[_key4 - 2] = arguments[_key4];
	            }
	
	            if (side == "both" && chars.length == 0) return str.trim();
	            if (side == "start" || side == "both") {
	                var reg = chars.length == 0 ? /^\s+/ : new RegExp("^[" + FRegExp.escape(chars.join("")) + "]+");
	                str = str.replace(reg, "");
	            }
	            if (side == "end" || side == "both") {
	                var _reg = chars.length == 0 ? /\s+$/ : new RegExp("[" + FRegExp.escape(chars.join("")) + "]+$");
	                str = str.replace(_reg, "");
	            }
	            return str;
	        };
	
	        return FString;
	    }();
	
	    FString.fsFormatRegExp = /(^|[^%])%([0+ ]*)(-?\d+)?(?:\.(\d+))?(\w)/;
	    FString.formatRegExp = /\{(\d+)(,-?\d+)?(?:\:(.+?))?\}/g;
	    exports.String = FString;
	
	    var FRegExp = function () {
	        function FRegExp() {
	            _classCallCheck(this, FRegExp);
	        }
	
	        FRegExp.create = function create(pattern, options) {
	            var flags = "g";
	            flags += options & 1 ? "i" : "";
	            flags += options & 2 ? "m" : "";
	            return new RegExp(pattern, flags);
	        };
	
	        FRegExp.escape = function escape(str) {
	            return str.replace(/[\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	        };
	
	        FRegExp.unescape = function unescape(str) {
	            return str.replace(/\\([\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|])/g, "$1");
	        };
	
	        FRegExp.isMatch = function isMatch(str, pattern) {
	            var options = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	            var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = FRegExp.create(pattern, options);
	            return reg.test(str);
	        };
	
	        FRegExp.match = function match(str, pattern) {
	            var options = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	            var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = FRegExp.create(pattern, options);
	            return reg.exec(str);
	        };
	
	        FRegExp.matches = function matches(str, pattern) {
	            var options = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	
	            var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = FRegExp.create(pattern, options);
	            if (!reg.global) throw "Non-global RegExp"; // Prevent infinite loop
	            var m = void 0;
	            var matches = [];
	            while ((m = reg.exec(str)) !== null) {
	                matches.push(m);
	            }return matches;
	        };
	
	        FRegExp.options = function options(reg) {
	            var options = 256; // ECMAScript
	            options |= reg.ignoreCase ? 1 : 0;
	            options |= reg.multiline ? 2 : 0;
	            return options;
	        };
	
	        FRegExp.replace = function replace(reg, input, replacement, limit) {
	            var offset = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
	
	            function replacer() {
	                var res = arguments[0];
	                if (limit !== 0) {
	                    limit--;
	                    var match = [];
	                    var len = arguments.length;
	                    for (var i = 0; i < len - 2; i++) {
	                        match.push(arguments[i]);
	                    }match.index = arguments[len - 2];
	                    match.input = arguments[len - 1];
	                    res = replacement(match);
	                }
	                return res;
	            }
	            if (typeof reg == "string") {
	                var tmp = reg;
	                reg = FRegExp.create(input, limit);
	                input = tmp;
	                limit = undefined;
	            }
	            if (typeof replacement == "function") {
	                limit = limit == null ? -1 : limit;
	                return input.substring(0, offset) + input.substring(offset).replace(reg, replacer);
	            } else {
	                if (limit != null) {
	                    var m = void 0;
	                    var sub1 = input.substring(offset);
	                    var matches = FRegExp.matches(reg, sub1);
	                    var sub2 = matches.length > limit ? (m = matches[limit - 1], sub1.substring(0, m.index + m[0].length)) : sub1;
	                    return input.substring(0, offset) + sub2.replace(reg, replacement) + input.substring(offset + sub2.length);
	                } else {
	                    return input.replace(reg, replacement);
	                }
	            }
	        };
	
	        FRegExp.split = function split(reg, input, limit) {
	            var offset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
	
	            if (typeof reg == "string") {
	                var tmp = reg;
	                reg = FRegExp.create(input, limit);
	                input = tmp;
	                limit = undefined;
	            }
	            input = input.substring(offset);
	            return input.split(reg, limit);
	        };
	
	        return FRegExp;
	    }();
	
	    exports.RegExp = FRegExp;
	
	    var FArray = function () {
	        function FArray() {
	            _classCallCheck(this, FArray);
	        }
	
	        FArray.addRangeInPlace = function addRangeInPlace(range, xs) {
	            Seq.iterate(function (x) {
	                return xs.push(x);
	            }, range);
	        };
	
	        FArray.copyTo = function copyTo(source, sourceIndex, target, targetIndex, count) {
	            while (count--) {
	                target[targetIndex++] = source[sourceIndex++];
	            }
	        };
	
	        FArray.partition = function partition(f, xs) {
	            var ys = [],
	                zs = [],
	                j = 0,
	                k = 0;
	            for (var i = 0; i < xs.length; i++) {
	                if (f(xs[i])) ys[j++] = xs[i];else zs[k++] = xs[i];
	            }return Tuple(ys, zs);
	        };
	
	        FArray.permute = function permute(f, xs) {
	            // Keep the type of the array
	            var ys = xs.map(function () {
	                return null;
	            });
	            var checkFlags = new Array(xs.length);
	            for (var i = 0; i < xs.length; i++) {
	                var j = f(i);
	                if (j < 0 || j >= xs.length) throw "Not a valid permutation";
	                ys[j] = xs[i];
	                checkFlags[j] = 1;
	            }
	            for (var _i2 = 0; _i2 < xs.length; _i2++) {
	                if (checkFlags[_i2] != 1) throw "Not a valid permutation";
	            }return ys;
	        };
	
	        FArray.removeInPlace = function removeInPlace(item, xs) {
	            var i = xs.indexOf(item);
	            if (i > -1) {
	                xs.splice(i, 1);
	                return true;
	            }
	            return false;
	        };
	
	        FArray.setSlice = function setSlice(target, lower, upper, source) {
	            var length = (upper || target.length - 1) - lower;
	            if (ArrayBuffer.isView(target) && source.length <= length) target.set(source, lower);else for (var i = lower | 0, j = 0; j <= length; i++, j++) {
	                target[i] = source[j];
	            }
	        };
	
	        FArray.sortInPlaceBy = function sortInPlaceBy(f, xs) {
	            var dir = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
	
	            return xs.sort(function (x, y) {
	                x = f(x);
	                y = f(y);
	                return (x < y ? -1 : x == y ? 0 : 1) * dir;
	            });
	        };
	
	        FArray.unzip = function unzip(xs) {
	            var bs = new Array(xs.length),
	                cs = new Array(xs.length);
	            for (var i = 0; i < xs.length; i++) {
	                bs[i] = xs[i][0];
	                cs[i] = xs[i][1];
	            }
	            return Tuple(bs, cs);
	        };
	
	        FArray.unzip3 = function unzip3(xs) {
	            var bs = new Array(xs.length),
	                cs = new Array(xs.length),
	                ds = new Array(xs.length);
	            for (var i = 0; i < xs.length; i++) {
	                bs[i] = xs[i][0];
	                cs[i] = xs[i][1];
	                ds[i] = xs[i][2];
	            }
	            return Tuple3(bs, cs, ds);
	        };
	
	        return FArray;
	    }();
	
	    exports.Array = FArray;
	
	    var List = exports.List = function () {
	        function List(head, tail) {
	            _classCallCheck(this, List);
	
	            this.head = head;
	            this.tail = tail;
	        }
	
	        List.prototype.ToString = function ToString() {
	            return "[" + Array.from(this).map(Util.toString).join("; ") + "]";
	        };
	
	        List.prototype.Equals = function Equals(x) {
	            var iter1 = this[Symbol.iterator](),
	                iter2 = x[Symbol.iterator]();
	            for (var i = 0;; i++) {
	                var cur1 = iter1.next(),
	                    cur2 = iter2.next();
	                if (cur1.done) return cur2.done ? true : false;else if (cur2.done) return false;else if (!Util.equals(cur1.value, cur2.value)) return false;
	            }
	        };
	
	        List.prototype.CompareTo = function CompareTo(x) {
	            var acc = 0;
	            var iter1 = this[Symbol.iterator](),
	                iter2 = x[Symbol.iterator]();
	            for (var i = 0;; i++) {
	                var cur1 = iter1.next(),
	                    cur2 = iter2.next();
	                if (cur1.done) return cur2.done ? acc : -1;else if (cur2.done) return 1;else {
	                    acc = Util.compare(cur1.value, cur2.value);
	                    if (acc != 0) return acc;
	                }
	            }
	        };
	
	        List.ofArray = function ofArray(args, base) {
	            var acc = base || new List();
	            for (var i = args.length - 1; i >= 0; i--) {
	                acc = new List(args[i], acc);
	            }
	            return acc;
	        };
	
	        List.prototype[Symbol.iterator] = function () {
	            var cur = this;
	            return {
	                next: function next() {
	                    var tmp = cur;
	                    cur = cur.tail;
	                    return { done: tmp.tail == null, value: tmp.head };
	                }
	            };
	        };
	
	        List.prototype.append = function append(ys) {
	            return List.append(this, ys);
	        };
	
	        List.append = function append(xs, ys) {
	            return Seq.fold(function (acc, x) {
	                return new List(x, acc);
	            }, ys, List.reverse(xs));
	        };
	
	        List.prototype.choose = function choose(f, xs) {
	            return List.choose(f, this);
	        };
	
	        List.choose = function choose(f, xs) {
	            var r = Seq.fold(function (acc, x) {
	                var y = f(x);
	                return y != null ? new List(y, acc) : acc;
	            }, new List(), xs);
	            return List.reverse(r);
	        };
	
	        List.prototype.collect = function collect(f) {
	            return List.collect(f, this);
	        };
	
	        List.collect = function collect(f, xs) {
	            return Seq.fold(function (acc, x) {
	                return acc.append(f(x));
	            }, new List(), xs);
	        };
	        // TODO: should be xs: Iterable<List<T>>
	
	
	        List.concat = function concat(xs) {
	            return List.collect(function (x) {
	                return x;
	            }, xs);
	        };
	
	        List.prototype.filter = function filter(f) {
	            return List.filter(f, this);
	        };
	
	        List.filter = function filter(f, xs) {
	            return List.reverse(Seq.fold(function (acc, x) {
	                return f(x) ? new List(x, acc) : acc;
	            }, new List(), xs));
	        };
	
	        List.prototype.where = function where(f) {
	            return List.filter(f, this);
	        };
	
	        List.where = function where(f, xs) {
	            return List.filter(f, xs);
	        };
	
	        List.initialize = function initialize(n, f) {
	            if (n < 0) {
	                throw "List length must be non-negative";
	            }
	            var xs = new List();
	            for (var i = 1; i <= n; i++) {
	                xs = new List(f(n - i), xs);
	            }
	            return xs;
	        };
	
	        List.prototype.map = function map(f) {
	            return List.map(f, this);
	        };
	
	        List.map = function map(f, xs) {
	            return List.reverse(Seq.fold(function (acc, x) {
	                return new List(f(x), acc);
	            }, new List(), xs));
	        };
	
	        List.prototype.mapIndexed = function mapIndexed(f) {
	            return List.mapIndexed(f, this);
	        };
	
	        List.mapIndexed = function mapIndexed(f, xs) {
	            return List.reverse(Seq.fold(function (acc, x, i) {
	                return new List(f(i, x), acc);
	            }, new List(), xs));
	        };
	
	        List.prototype.partition = function partition(f) {
	            return List.partition(f, this);
	        };
	
	        List.partition = function partition(f, xs) {
	            return Seq.fold(function (acc, x) {
	                var lacc = acc[0],
	                    racc = acc[1];
	                return f(x) ? Tuple(new List(x, lacc), racc) : Tuple(lacc, new List(x, racc));
	            }, Tuple(new List(), new List()), List.reverse(xs));
	        };
	
	        List.replicate = function replicate(n, x) {
	            return List.initialize(n, function () {
	                return x;
	            });
	        };
	
	        List.prototype.reverse = function reverse() {
	            return List.reverse(this);
	        };
	
	        List.reverse = function reverse(xs) {
	            return Seq.fold(function (acc, x) {
	                return new List(x, acc);
	            }, new List(), xs);
	        };
	
	        List.singleton = function singleton(x) {
	            return new List(x, new List());
	        };
	
	        List.prototype.slice = function slice(lower, upper) {
	            return List.slice(lower, upper, this);
	        };
	
	        List.slice = function slice(lower, upper, xs) {
	            var noLower = lower == null;
	            var noUpper = upper == null;
	            return List.reverse(Seq.fold(function (acc, x, i) {
	                return (noLower || lower <= i) && (noUpper || i <= upper) ? new List(x, acc) : acc;
	            }, new List(), xs));
	        };
	        /* ToDo: instance unzip() */
	
	
	        List.unzip = function unzip(xs) {
	            return Seq.foldBack(function (xy, acc) {
	                return Tuple(new List(xy[0], acc[0]), new List(xy[1], acc[1]));
	            }, xs, Tuple(new List(), new List()));
	        };
	        /* ToDo: instance unzip3() */
	
	
	        List.unzip3 = function unzip3(xs) {
	            return Seq.foldBack(function (xyz, acc) {
	                return Tuple3(new List(xyz[0], acc[0]), new List(xyz[1], acc[1]), new List(xyz[2], acc[2]));
	            }, xs, Tuple3(new List(), new List(), new List()));
	        };
	
	        List.groupBy = function groupBy(f, xs) {
	            return Seq.toList(Seq.map(function (k) {
	                return Tuple(k[0], Seq.toList(k[1]));
	            }, Seq.groupBy(f, xs)));
	        };
	
	        _createClass(List, [{
	            key: "length",
	            get: function get() {
	                return Seq.fold(function (acc, x) {
	                    return acc + 1;
	                }, 0, this);
	            }
	        }]);
	
	        return List;
	    }();
	
	    Util.setInterfaces(List.prototype, ["System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Collections.FSharpList");
	
	    var Seq = exports.Seq = function () {
	        function Seq() {
	            _classCallCheck(this, Seq);
	        }
	
	        Seq.__failIfNone = function __failIfNone(res) {
	            if (res == null) throw "Seq did not contain any matching element";
	            return res;
	        };
	
	        Seq.toList = function toList(xs) {
	            return Seq.foldBack(function (x, acc) {
	                return new List(x, acc);
	            }, xs, new List());
	        };
	
	        Seq.ofList = function ofList(xs) {
	            return Seq.delay(function () {
	                return Seq.unfold(function (x) {
	                    return x.tail != null ? [x.head, x.tail] : null;
	                }, xs);
	            });
	        };
	
	        Seq.ofArray = function ofArray(xs) {
	            return Seq.delay(function () {
	                return Seq.unfold(function (i) {
	                    return i < xs.length ? [xs[i], i + 1] : null;
	                }, 0);
	            });
	        };
	
	        Seq.append = function append(xs, ys) {
	            return Seq.delay(function () {
	                var firstDone = false;
	                var i = xs[Symbol.iterator]();
	                var iters = Tuple(i, null);
	                return Seq.unfold(function () {
	                    var cur = void 0;
	                    if (!firstDone) {
	                        cur = iters[0].next();
	                        if (!cur.done) {
	                            return [cur.value, iters];
	                        } else {
	                            firstDone = true;
	                            iters = [null, ys[Symbol.iterator]()];
	                        }
	                    }
	                    cur = iters[1].next();
	                    return !cur.done ? [cur.value, iters] : null;
	                }, iters);
	            });
	        };
	
	        Seq.average = function average(xs) {
	            var count = 1;
	            var sum = Seq.reduce(function (acc, x) {
	                count++;
	                return acc + x;
	            }, xs);
	            return sum / count;
	        };
	
	        Seq.averageBy = function averageBy(f, xs) {
	            var count = 1;
	            var sum = Seq.reduce(function (acc, x) {
	                count++;
	                return (count === 2 ? f(acc) : acc) + f(x);
	            }, xs);
	            return sum / count;
	        };
	
	        Seq.countBy = function countBy(f, xs) {
	            return Seq.map(function (kv) {
	                return Tuple(kv[0], Seq.count(kv[1]));
	            }, Seq.groupBy(f, xs));
	        };
	
	        Seq.concat = function concat(xs) {
	            return Seq.delay(function () {
	                var iter = xs[Symbol.iterator]();
	                var output = null;
	                return Seq.unfold(function (innerIter) {
	                    var hasFinished = false;
	                    while (!hasFinished) {
	                        if (innerIter == null) {
	                            var cur = iter.next();
	                            if (!cur.done) {
	                                innerIter = cur.value[Symbol.iterator]();
	                            } else {
	                                hasFinished = true;
	                            }
	                        } else {
	                            var _cur = innerIter.next();
	                            if (!_cur.done) {
	                                output = _cur.value;
	                                hasFinished = true;
	                            } else {
	                                innerIter = null;
	                            }
	                        }
	                    }
	                    return innerIter != null && output != null ? [output, innerIter] : null;
	                }, null);
	            });
	        };
	
	        Seq.collect = function collect(f, xs) {
	            return Seq.concat(Seq.map(f, xs));
	        };
	
	        Seq.choose = function choose(f, xs) {
	            var trySkipToNext = function trySkipToNext(iter) {
	                var cur = iter.next();
	                if (!cur.done) {
	                    var y = f(cur.value);
	                    return y != null ? Tuple(y, iter) : trySkipToNext(iter);
	                }
	                return void 0;
	            };
	            return Seq.delay(function () {
	                return Seq.unfold(function (iter) {
	                    return trySkipToNext(iter);
	                }, xs[Symbol.iterator]());
	            });
	        };
	
	        Seq.compareWith = function compareWith(f, xs, ys) {
	            var nonZero = Seq.tryFind(function (i) {
	                return i != 0;
	            }, Seq.map2(function (x, y) {
	                return f(x, y);
	            }, xs, ys));
	            return nonZero != null ? nonZero : Seq.count(xs) - Seq.count(ys);
	        };
	
	        Seq.delay = function delay(f) {
	            return _defineProperty({}, Symbol.iterator, function () {
	                return f()[Symbol.iterator]();
	            });
	        };
	
	        Seq.distinctBy = function distinctBy(f, xs) {
	            return Seq.choose(function (tup) {
	                return tup[0];
	            }, Seq.scan(function (tup, x) {
	                var acc = tup[1];
	                var k = f(x);
	                return acc.has(k) ? Tuple(null, acc) : Tuple(x, FSet.add(k, acc));
	            }, Tuple(null, FSet.create()), xs));
	        };
	
	        Seq.distinct = function distinct(xs) {
	            return Seq.distinctBy(function (x) {
	                return x;
	            }, xs);
	        };
	
	        Seq.empty = function empty() {
	            return Seq.unfold(function () {
	                return void 0;
	            });
	        };
	
	        Seq.enumerateWhile = function enumerateWhile(cond, xs) {
	            return Seq.concat(Seq.unfold(function () {
	                return cond() ? [xs, true] : null;
	            }));
	        };
	
	        Seq.enumerateThenFinally = function enumerateThenFinally(xs, finalFn) {
	            return Seq.delay(function () {
	                var iter = void 0;
	                try {
	                    iter = xs[Symbol.iterator]();
	                } finally {
	                    finalFn();
	                }
	                return Seq.unfold(function (iter) {
	                    try {
	                        var cur = iter.next();
	                        return !cur.done ? [cur.value, iter] : null;
	                    } finally {
	                        finalFn();
	                    }
	                    return void 0;
	                }, iter);
	            });
	        };
	
	        Seq.enumerateUsing = function enumerateUsing(disp, work) {
	            var isDisposed = false;
	            var disposeOnce = function disposeOnce() {
	                if (!isDisposed) {
	                    isDisposed = true;
	                    disp.Dispose();
	                }
	            };
	            try {
	                return Seq.enumerateThenFinally(work(disp), disposeOnce);
	            } finally {
	                disposeOnce();
	            }
	            return void 0;
	        };
	
	        Seq.exactlyOne = function exactlyOne(xs) {
	            var iter = xs[Symbol.iterator]();
	            var fst = iter.next();
	            if (fst.done) throw "Seq was empty";
	            var snd = iter.next();
	            if (!snd.done) throw "Seq had multiple items";
	            return fst.value;
	        };
	
	        Seq.except = function except(itemsToExclude, source) {
	            var exclusionItems = Array.from(itemsToExclude);
	            var testIsNotInExclusionItems = function testIsNotInExclusionItems(element) {
	                return !exclusionItems.some(function (excludedItem) {
	                    return Util.equals(excludedItem, element);
	                });
	            };
	            return Seq.filter(testIsNotInExclusionItems, source);
	        };
	
	        Seq.exists = function exists(f, xs) {
	            function aux(iter) {
	                var cur = iter.next();
	                return !cur.done && (f(cur.value) || aux(iter));
	            }
	            return aux(xs[Symbol.iterator]());
	        };
	
	        Seq.exists2 = function exists2(f, xs, ys) {
	            function aux(iter1, iter2) {
	                var cur1 = iter1.next(),
	                    cur2 = iter2.next();
	                return !cur1.done && !cur2.done && (f(cur1.value, cur2.value) || aux(iter1, iter2));
	            }
	            return aux(xs[Symbol.iterator](), ys[Symbol.iterator]());
	        };
	
	        Seq.filter = function filter(f, xs) {
	            function trySkipToNext(iter) {
	                var cur = iter.next();
	                while (!cur.done) {
	                    if (f(cur.value)) {
	                        return [cur.value, iter];
	                    }
	                    cur = iter.next();
	                }
	                return void 0;
	            }
	            return Seq.delay(function () {
	                return Seq.unfold(trySkipToNext, xs[Symbol.iterator]());
	            });
	        };
	
	        Seq.where = function where(f, xs) {
	            return Seq.filter(f, xs);
	        };
	
	        Seq.fold = function fold(f, acc, xs) {
	            if (Array.isArray(xs) || ArrayBuffer.isView(xs)) {
	                return xs.reduce(f, acc);
	            } else {
	                var cur = void 0;
	                for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
	                    cur = iter.next();
	                    if (cur.done) break;
	                    acc = f(acc, cur.value, i);
	                }
	                return acc;
	            }
	        };
	
	        Seq.foldBack = function foldBack(f, xs, acc) {
	            var arr = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
	            for (var i = arr.length - 1; i >= 0; i--) {
	                acc = f(arr[i], acc, i);
	            }
	            return acc;
	        };
	
	        Seq.fold2 = function fold2(f, acc, xs, ys) {
	            var iter1 = xs[Symbol.iterator](),
	                iter2 = ys[Symbol.iterator]();
	            var cur1 = void 0,
	                cur2 = void 0;
	            for (var i = 0;; i++) {
	                cur1 = iter1.next();
	                cur2 = iter2.next();
	                if (cur1.done || cur2.done) {
	                    break;
	                }
	                acc = f(acc, cur1.value, cur2.value, i);
	            }
	            return acc;
	        };
	
	        Seq.foldBack2 = function foldBack2(f, xs, ys, acc) {
	            var ar1 = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
	            var ar2 = Array.isArray(ys) || ArrayBuffer.isView(ys) ? ys : Array.from(ys);
	            for (var i = ar1.length - 1; i >= 0; i--) {
	                acc = f(ar1[i], ar2[i], acc, i);
	            }
	            return acc;
	        };
	
	        Seq.forAll = function forAll(f, xs) {
	            return Seq.fold(function (acc, x) {
	                return acc && f(x);
	            }, true, xs);
	        };
	
	        Seq.forAll2 = function forAll2(f, xs, ys) {
	            return Seq.fold2(function (acc, x, y) {
	                return acc && f(x, y);
	            }, true, xs, ys);
	        };
	        // TODO: Should return a Iterable<Tuple<K, Iterable<T>>> instead of a Map<K, Iterable<T>>
	        // Seq.groupBy : ('T -> 'Key) -> seq<'T> -> seq<'Key * seq<'T>>
	
	
	        Seq.groupBy = function groupBy(f, xs) {
	            var keys = [];
	            var map = Seq.fold(function (acc, x) {
	                var k = f(x),
	                    vs = FMap.tryFind(k, acc);
	                if (vs == null) {
	                    keys.push(k);
	                    return FMap.add(k, [x], acc);
	                } else {
	                    vs.push(x);
	                    return acc;
	                }
	            }, FMap.create(), xs);
	            return keys.map(function (k) {
	                return [k, map.get(k)];
	            });
	        };
	
	        Seq.tryHead = function tryHead(xs) {
	            var iter = xs[Symbol.iterator]();
	            var cur = iter.next();
	            return cur.done ? null : cur.value;
	        };
	
	        Seq.head = function head(xs) {
	            return Seq.__failIfNone(Seq.tryHead(xs));
	        };
	
	        Seq.initialize = function initialize(n, f) {
	            return Seq.delay(function () {
	                return Seq.unfold(function (i) {
	                    return i < n ? [f(i), i + 1] : null;
	                }, 0);
	            });
	        };
	
	        Seq.initializeInfinite = function initializeInfinite(f) {
	            return Seq.delay(function () {
	                return Seq.unfold(function (i) {
	                    return [f(i), i + 1];
	                }, 0);
	            });
	        };
	
	        Seq.tryItem = function tryItem(i, xs) {
	            if (i < 0) return null;
	            if (Array.isArray(xs) || ArrayBuffer.isView(xs)) return i < xs.length ? xs[i] : null;
	            for (var j = 0, iter = xs[Symbol.iterator]();; j++) {
	                var cur = iter.next();
	                if (cur.done) return null;
	                if (j === i) return cur.value;
	            }
	        };
	
	        Seq.item = function item(i, xs) {
	            return Seq.__failIfNone(Seq.tryItem(i, xs));
	        };
	
	        Seq.iterate = function iterate(f, xs) {
	            Seq.fold(function (_, x) {
	                return f(x);
	            }, null, xs);
	        };
	
	        Seq.iterate2 = function iterate2(f, xs, ys) {
	            Seq.fold2(function (_, x, y) {
	                return f(x, y);
	            }, null, xs, ys);
	        };
	
	        Seq.iterateIndexed = function iterateIndexed(f, xs) {
	            Seq.fold(function (_, x, i) {
	                return f(i, x);
	            }, null, xs);
	        };
	
	        Seq.iterateIndexed2 = function iterateIndexed2(f, xs, ys) {
	            Seq.fold2(function (_, x, y, i) {
	                return f(i, x, y);
	            }, null, xs, ys);
	        };
	
	        Seq.isEmpty = function isEmpty(xs) {
	            var i = xs[Symbol.iterator]();
	            return i.next().done;
	        };
	
	        Seq.tryLast = function tryLast(xs) {
	            try {
	                return Seq.reduce(function (_, x) {
	                    return x;
	                }, xs);
	            } catch (err) {
	                return null;
	            }
	        };
	
	        Seq.last = function last(xs) {
	            return Seq.__failIfNone(Seq.tryLast(xs));
	        };
	        // A static 'length' method causes problems in JavaScript -- https://github.com/Microsoft/TypeScript/issues/442
	
	
	        Seq.count = function count(xs) {
	            return Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs.length : Seq.fold(function (acc, x) {
	                return acc + 1;
	            }, 0, xs);
	        };
	
	        Seq.map = function map(f, xs) {
	            return Seq.delay(function () {
	                return Seq.unfold(function (iter) {
	                    var cur = iter.next();
	                    return !cur.done ? [f(cur.value), iter] : null;
	                }, xs[Symbol.iterator]());
	            });
	        };
	
	        Seq.mapIndexed = function mapIndexed(f, xs) {
	            return Seq.delay(function () {
	                var i = 0;
	                return Seq.unfold(function (iter) {
	                    var cur = iter.next();
	                    return !cur.done ? [f(i++, cur.value), iter] : null;
	                }, xs[Symbol.iterator]());
	            });
	        };
	
	        Seq.map2 = function map2(f, xs, ys) {
	            return Seq.delay(function () {
	                var iter1 = xs[Symbol.iterator]();
	                var iter2 = ys[Symbol.iterator]();
	                return Seq.unfold(function () {
	                    var cur1 = iter1.next(),
	                        cur2 = iter2.next();
	                    return !cur1.done && !cur2.done ? [f(cur1.value, cur2.value), null] : null;
	                });
	            });
	        };
	
	        Seq.mapIndexed2 = function mapIndexed2(f, xs, ys) {
	            return Seq.delay(function () {
	                var i = 0;
	                var iter1 = xs[Symbol.iterator]();
	                var iter2 = ys[Symbol.iterator]();
	                return Seq.unfold(function () {
	                    var cur1 = iter1.next(),
	                        cur2 = iter2.next();
	                    return !cur1.done && !cur2.done ? [f(i++, cur1.value, cur2.value), null] : null;
	                });
	            });
	        };
	
	        Seq.map3 = function map3(f, xs, ys, zs) {
	            return Seq.delay(function () {
	                var iter1 = xs[Symbol.iterator]();
	                var iter2 = ys[Symbol.iterator]();
	                var iter3 = zs[Symbol.iterator]();
	                return Seq.unfold(function () {
	                    var cur1 = iter1.next(),
	                        cur2 = iter2.next(),
	                        cur3 = iter3.next();
	                    return !cur1.done && !cur2.done && !cur3.done ? [f(cur1.value, cur2.value, cur3.value), null] : null;
	                });
	            });
	        };
	
	        Seq.mapFold = function mapFold(f, acc, xs) {
	            var result = [];
	            var r = void 0;
	            var cur = void 0;
	            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
	                cur = iter.next();
	                if (cur.done) break;
	
	                var _f = f(acc, cur.value);
	
	                var _f2 = _slicedToArray(_f, 2);
	
	                r = _f2[0];
	                acc = _f2[1];
	
	                result.push(r);
	            }
	            return Tuple(result, acc);
	        };
	
	        Seq.mapFoldBack = function mapFoldBack(f, xs, acc) {
	            var arr = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
	            var result = [];
	            var r = void 0;
	            for (var i = arr.length - 1; i >= 0; i--) {
	                var _f3 = f(arr[i], acc);
	
	                var _f4 = _slicedToArray(_f3, 2);
	
	                r = _f4[0];
	                acc = _f4[1];
	
	                result.push(r);
	            }
	            return Tuple(result, acc);
	        };
	
	        Seq.max = function max(xs) {
	            return Seq.reduce(function (acc, x) {
	                return Util.compare(acc, x) === 1 ? acc : x;
	            }, xs);
	        };
	
	        Seq.maxBy = function maxBy(f, xs) {
	            return Seq.reduce(function (acc, x) {
	                return Util.compare(f(acc), f(x)) === 1 ? acc : x;
	            }, xs);
	        };
	
	        Seq.min = function min(xs) {
	            return Seq.reduce(function (acc, x) {
	                return Util.compare(acc, x) === -1 ? acc : x;
	            }, xs);
	        };
	
	        Seq.minBy = function minBy(f, xs) {
	            return Seq.reduce(function (acc, x) {
	                return Util.compare(f(acc), f(x)) === -1 ? acc : x;
	            }, xs);
	        };
	
	        Seq.pairwise = function pairwise(xs) {
	            return Seq.skip(2, Seq.scan(function (last, next) {
	                return Tuple(last[1], next);
	            }, Tuple(0, 0), xs));
	        };
	
	        Seq.permute = function permute(f, xs) {
	            return Seq.ofArray(FArray.permute(f, Array.from(xs)));
	        };
	
	        Seq.rangeStep = function rangeStep(first, step, last) {
	            if (step === 0) throw "Step cannot be 0";
	            return Seq.delay(function () {
	                return Seq.unfold(function (x) {
	                    return step > 0 && x <= last || step < 0 && x >= last ? [x, x + step] : null;
	                }, first);
	            });
	        };
	
	        Seq.rangeChar = function rangeChar(first, last) {
	            return Seq.delay(function () {
	                return Seq.unfold(function (x) {
	                    return x <= last ? [x, String.fromCharCode(x.charCodeAt(0) + 1)] : null;
	                }, first);
	            });
	        };
	
	        Seq.range = function range(first, last) {
	            return Seq.rangeStep(first, 1, last);
	        };
	
	        Seq.readOnly = function readOnly(xs) {
	            return Seq.map(function (x) {
	                return x;
	            }, xs);
	        };
	
	        Seq.reduce = function reduce(f, xs) {
	            if (Array.isArray(xs) || ArrayBuffer.isView(xs)) return xs.reduce(f);
	            var iter = xs[Symbol.iterator]();
	            var cur = iter.next();
	            if (cur.done) throw "Seq was empty";
	            var acc = cur.value;
	            for (;;) {
	                cur = iter.next();
	                if (cur.done) break;
	                acc = f(acc, cur.value);
	            }
	            return acc;
	        };
	
	        Seq.reduceBack = function reduceBack(f, xs) {
	            var ar = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
	            if (ar.length === 0) throw "Seq was empty";
	            var acc = ar[ar.length - 1];
	            for (var i = ar.length - 2; i >= 0; i--) {
	                acc = f(ar[i], acc, i);
	            }return acc;
	        };
	
	        Seq.replicate = function replicate(n, x) {
	            return Seq.initialize(n, function () {
	                return x;
	            });
	        };
	
	        Seq.reverse = function reverse(xs) {
	            var ar = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs.slice(0) : Array.from(xs);
	            return Seq.ofArray(ar.reverse());
	        };
	
	        Seq.scan = function scan(f, seed, xs) {
	            return Seq.delay(function () {
	                var iter = xs[Symbol.iterator]();
	                return Seq.unfold(function (acc) {
	                    if (acc == null) return [seed, seed];
	                    var cur = iter.next();
	                    if (!cur.done) {
	                        acc = f(acc, cur.value);
	                        return [acc, acc];
	                    }
	                    return void 0;
	                }, null);
	            });
	        };
	
	        Seq.scanBack = function scanBack(f, xs, seed) {
	            return Seq.reverse(Seq.scan(function (acc, x) {
	                return f(x, acc);
	            }, seed, Seq.reverse(xs)));
	        };
	
	        Seq.singleton = function singleton(x) {
	            return Seq.unfold(function (x) {
	                return x != null ? [x, null] : null;
	            }, x);
	        };
	
	        Seq.skip = function skip(n, xs) {
	            return _defineProperty({}, Symbol.iterator, function () {
	                var iter = xs[Symbol.iterator]();
	                for (var i = 1; i <= n; i++) {
	                    if (iter.next().done) throw "Seq has not enough elements";
	                }return iter;
	            });
	        };
	
	        Seq.skipWhile = function skipWhile(f, xs) {
	            return Seq.delay(function () {
	                var hasPassed = false;
	                return Seq.filter(function (x) {
	                    return hasPassed || (hasPassed = !f(x));
	                }, xs);
	            });
	        };
	
	        Seq.sortWith = function sortWith(f, xs) {
	            var ys = Array.from(xs);
	            return Seq.ofArray(ys.sort(f));
	        };
	
	        Seq.sum = function sum(xs) {
	            return Seq.fold(function (acc, x) {
	                return acc + x;
	            }, 0, xs);
	        };
	
	        Seq.sumBy = function sumBy(f, xs) {
	            return Seq.fold(function (acc, x) {
	                return acc + f(x);
	            }, 0, xs);
	        };
	
	        Seq.tail = function tail(xs) {
	            var iter = xs[Symbol.iterator]();
	            var cur = iter.next();
	            if (cur.done) throw "Seq was empty";
	            return _defineProperty({}, Symbol.iterator, function () {
	                return iter;
	            });
	        };
	
	        Seq.take = function take(n, xs) {
	            var truncate = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	
	            return Seq.delay(function () {
	                var iter = xs[Symbol.iterator]();
	                return Seq.unfold(function (i) {
	                    if (i < n) {
	                        var cur = iter.next();
	                        if (!cur.done) return [cur.value, i + 1];
	                        if (!truncate) throw "Seq has not enough elements";
	                    }
	                    return void 0;
	                }, 0);
	            });
	        };
	
	        Seq.truncate = function truncate(n, xs) {
	            return Seq.take(n, xs, true);
	        };
	
	        Seq.takeWhile = function takeWhile(f, xs) {
	            return Seq.delay(function () {
	                var iter = xs[Symbol.iterator]();
	                return Seq.unfold(function (i) {
	                    var cur = iter.next();
	                    if (!cur.done && f(cur.value)) return [cur.value, null];
	                    return void 0;
	                }, 0);
	            });
	        };
	
	        Seq.tryFind = function tryFind(f, xs, defaultValue) {
	            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
	                var cur = iter.next();
	                if (cur.done) return defaultValue === void 0 ? null : defaultValue;
	                if (f(cur.value, i)) return cur.value;
	            }
	        };
	
	        Seq.find = function find(f, xs) {
	            return Seq.__failIfNone(Seq.tryFind(f, xs));
	        };
	
	        Seq.tryFindBack = function tryFindBack(f, xs, defaultValue) {
	            var match = null;
	            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
	                var cur = iter.next();
	                if (cur.done) return match === null ? defaultValue === void 0 ? null : defaultValue : match;
	                if (f(cur.value, i)) match = cur.value;
	            }
	        };
	
	        Seq.findBack = function findBack(f, xs) {
	            return Seq.__failIfNone(Seq.tryFindBack(f, xs));
	        };
	
	        Seq.tryFindIndex = function tryFindIndex(f, xs) {
	            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
	                var cur = iter.next();
	                if (cur.done) return null;
	                if (f(cur.value, i)) return i;
	            }
	        };
	
	        Seq.findIndex = function findIndex(f, xs) {
	            return Seq.__failIfNone(Seq.tryFindIndex(f, xs));
	        };
	
	        Seq.tryFindIndexBack = function tryFindIndexBack(f, xs) {
	            var match = -1;
	            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
	                var cur = iter.next();
	                if (cur.done) return match === -1 ? null : match;
	                if (f(cur.value, i)) match = i;
	            }
	        };
	
	        Seq.findIndexBack = function findIndexBack(f, xs) {
	            return Seq.__failIfNone(Seq.tryFindIndexBack(f, xs));
	        };
	
	        Seq.tryPick = function tryPick(f, xs) {
	            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
	                var cur = iter.next();
	                if (cur.done) break;
	                var y = f(cur.value, i);
	                if (y != null) return y;
	            }
	            return void 0;
	        };
	
	        Seq.pick = function pick(f, xs) {
	            return Seq.__failIfNone(Seq.tryPick(f, xs));
	        };
	
	        Seq.unfold = function unfold(f, acc) {
	            return _defineProperty({}, Symbol.iterator, function () {
	                return {
	                    next: function next() {
	                        var res = f(acc);
	                        if (res != null) {
	                            acc = res[1];
	                            return { done: false, value: res[0] };
	                        }
	                        return { done: true };
	                    }
	                };
	            });
	        };
	
	        Seq.zip = function zip(xs, ys) {
	            return Seq.map2(function (x, y) {
	                return [x, y];
	            }, xs, ys);
	        };
	
	        Seq.zip3 = function zip3(xs, ys, zs) {
	            return Seq.map3(function (x, y, z) {
	                return [x, y, z];
	            }, xs, ys, zs);
	        };
	
	        return Seq;
	    }();
	
	    var SetTree = function () {
	        function SetTree(caseName, fields) {
	            _classCallCheck(this, SetTree);
	
	            this.Case = caseName;
	            this.Fields = fields;
	        }
	
	        SetTree.countAux = function countAux(s, acc) {
	            return s.Case === "SetOne" ? acc + 1 : s.Case === "SetEmpty" ? acc : SetTree.countAux(s.Fields[1], SetTree.countAux(s.Fields[2], acc + 1));
	        };
	
	        SetTree.count = function count(s) {
	            return SetTree.countAux(s, 0);
	        };
	
	        SetTree.SetOne = function SetOne(n) {
	            return new SetTree("SetOne", [n]);
	        };
	
	        SetTree.SetNode = function SetNode(x, l, r, h) {
	            return new SetTree("SetNode", [x, l, r, h]);
	        };
	
	        SetTree.height = function height(t) {
	            return t.Case === "SetOne" ? 1 : t.Case === "SetNode" ? t.Fields[3] : 0;
	        };
	
	        SetTree.mk = function mk(l, k, r) {
	            var matchValue = [l, r];
	            var $target1 = function $target1() {
	                var hl = SetTree.height(l);
	                var hr = SetTree.height(r);
	                var m = hl < hr ? hr : hl;
	                return SetTree.SetNode(k, l, r, m + 1);
	            };
	            if (matchValue[0].Case === "SetEmpty") {
	                if (matchValue[1].Case === "SetEmpty") {
	                    return SetTree.SetOne(k);
	                } else {
	                    return $target1();
	                }
	            } else {
	                return $target1();
	            }
	        };
	
	        SetTree.rebalance = function rebalance(t1, k, t2) {
	            var t1h = SetTree.height(t1);
	            var t2h = SetTree.height(t2);
	            if (t2h > t1h + SetTree.tolerance) {
	                if (t2.Case === "SetNode") {
	                    if (SetTree.height(t2.Fields[1]) > t1h + 1) {
	                        if (t2.Fields[1].Case === "SetNode") {
	                            return SetTree.mk(SetTree.mk(t1, k, t2.Fields[1].Fields[1]), t2.Fields[1].Fields[0], SetTree.mk(t2.Fields[1].Fields[2], t2.Fields[0], t2.Fields[2]));
	                        } else {
	                            throw "rebalance";
	                        }
	                    } else {
	                        return SetTree.mk(SetTree.mk(t1, k, t2.Fields[1]), t2.Fields[0], t2.Fields[2]);
	                    }
	                } else {
	                    throw "rebalance";
	                }
	            } else {
	                if (t1h > t2h + SetTree.tolerance) {
	                    if (t1.Case === "SetNode") {
	                        if (SetTree.height(t1.Fields[2]) > t2h + 1) {
	                            if (t1.Fields[2].Case === "SetNode") {
	                                return SetTree.mk(SetTree.mk(t1.Fields[1], t1.Fields[0], t1.Fields[2].Fields[1]), t1.Fields[2].Fields[0], SetTree.mk(t1.Fields[2].Fields[2], k, t2));
	                            } else {
	                                throw "rebalance";
	                            }
	                        } else {
	                            return SetTree.mk(t1.Fields[1], t1.Fields[0], SetTree.mk(t1.Fields[2], k, t2));
	                        }
	                    } else {
	                        throw "rebalance";
	                    }
	                } else {
	                    return SetTree.mk(t1, k, t2);
	                }
	            }
	        };
	
	        SetTree.add = function add(comparer, k, t) {
	            return t.Case === "SetOne" ? function () {
	                var c = comparer.Compare(k, t.Fields[0]);
	                if (c < 0) {
	                    return SetTree.SetNode(k, new SetTree("SetEmpty", []), t, 2);
	                } else {
	                    if (c === 0) {
	                        return t;
	                    } else {
	                        return SetTree.SetNode(k, t, new SetTree("SetEmpty", []), 2);
	                    }
	                }
	            }() : t.Case === "SetEmpty" ? SetTree.SetOne(k) : function () {
	                var c = comparer.Compare(k, t.Fields[0]);
	                if (c < 0) {
	                    return SetTree.rebalance(SetTree.add(comparer, k, t.Fields[1]), t.Fields[0], t.Fields[2]);
	                } else {
	                    if (c === 0) {
	                        return t;
	                    } else {
	                        return SetTree.rebalance(t.Fields[1], t.Fields[0], SetTree.add(comparer, k, t.Fields[2]));
	                    }
	                }
	            }();
	        };
	
	        SetTree.balance = function balance(comparer, t1, k, t2) {
	            var matchValue = [t1, t2];
	            var $target1 = function $target1(t1_1) {
	                return SetTree.add(comparer, k, t1_1);
	            };
	            var $target2 = function $target2(k1, t2_1) {
	                return SetTree.add(comparer, k, SetTree.add(comparer, k1, t2_1));
	            };
	            if (matchValue[0].Case === "SetOne") {
	                if (matchValue[1].Case === "SetEmpty") {
	                    return $target1(matchValue[0]);
	                } else {
	                    if (matchValue[1].Case === "SetOne") {
	                        return $target2(matchValue[0].Fields[0], matchValue[1]);
	                    } else {
	                        return $target2(matchValue[0].Fields[0], matchValue[1]);
	                    }
	                }
	            } else {
	                if (matchValue[0].Case === "SetNode") {
	                    if (matchValue[1].Case === "SetOne") {
	                        var k2 = matchValue[1].Fields[0];
	                        var t1_1 = matchValue[0];
	                        return SetTree.add(comparer, k, SetTree.add(comparer, k2, t1_1));
	                    } else {
	                        if (matchValue[1].Case === "SetNode") {
	                            var h1 = matchValue[0].Fields[3];
	                            var h2 = matchValue[1].Fields[3];
	                            var k1 = matchValue[0].Fields[0];
	                            var k2 = matchValue[1].Fields[0];
	                            var t11 = matchValue[0].Fields[1];
	                            var t12 = matchValue[0].Fields[2];
	                            var t21 = matchValue[1].Fields[1];
	                            var t22 = matchValue[1].Fields[2];
	                            if (h1 + SetTree.tolerance < h2) {
	                                return SetTree.rebalance(SetTree.balance(comparer, t1, k, t21), k2, t22);
	                            } else {
	                                if (h2 + SetTree.tolerance < h1) {
	                                    return SetTree.rebalance(t11, k1, SetTree.balance(comparer, t12, k, t2));
	                                } else {
	                                    return SetTree.mk(t1, k, t2);
	                                }
	                            }
	                        } else {
	                            return $target1(matchValue[0]);
	                        }
	                    }
	                } else {
	                    var t2_1 = matchValue[1];
	                    return SetTree.add(comparer, k, t2_1);
	                }
	            }
	        };
	
	        SetTree.split = function split(comparer, pivot, t) {
	            return t.Case === "SetOne" ? function () {
	                var c = comparer.Compare(t.Fields[0], pivot);
	                if (c < 0) {
	                    return [t, false, new SetTree("SetEmpty", [])];
	                } else {
	                    if (c === 0) {
	                        return [new SetTree("SetEmpty", []), true, new SetTree("SetEmpty", [])];
	                    } else {
	                        return [new SetTree("SetEmpty", []), false, t];
	                    }
	                }
	            }() : t.Case === "SetEmpty" ? [new SetTree("SetEmpty", []), false, new SetTree("SetEmpty", [])] : function () {
	                var c = comparer.Compare(pivot, t.Fields[0]);
	                if (c < 0) {
	                    var patternInput = SetTree.split(comparer, pivot, t.Fields[1]);
	                    var t11Lo = patternInput[0];
	                    var t11Hi = patternInput[2];
	                    var havePivot = patternInput[1];
	                    return [t11Lo, havePivot, SetTree.balance(comparer, t11Hi, t.Fields[0], t.Fields[2])];
	                } else {
	                    if (c === 0) {
	                        return [t.Fields[1], true, t.Fields[2]];
	                    } else {
	                        var patternInput = SetTree.split(comparer, pivot, t.Fields[2]);
	                        var t12Lo = patternInput[0];
	                        var t12Hi = patternInput[2];
	                        var havePivot = patternInput[1];
	                        return [SetTree.balance(comparer, t.Fields[1], t.Fields[0], t12Lo), havePivot, t12Hi];
	                    }
	                }
	            }();
	        };
	
	        SetTree.spliceOutSuccessor = function spliceOutSuccessor(t) {
	            return t.Case === "SetOne" ? [t.Fields[0], new SetTree("SetEmpty", [])] : t.Case === "SetNode" ? t.Fields[1].Case === "SetEmpty" ? [t.Fields[0], t.Fields[2]] : function () {
	                var patternInput = SetTree.spliceOutSuccessor(t.Fields[1]);
	                var l_ = patternInput[1];
	                var k3 = patternInput[0];
	                return [k3, SetTree.mk(l_, t.Fields[0], t.Fields[2])];
	            }() : function () {
	                throw "internal error: Map.spliceOutSuccessor";
	            }();
	        };
	
	        SetTree.remove = function remove(comparer, k, t) {
	            return t.Case === "SetOne" ? function () {
	                var c = comparer.Compare(k, t.Fields[0]);
	                if (c === 0) {
	                    return new SetTree("SetEmpty", []);
	                } else {
	                    return t;
	                }
	            }() : t.Case === "SetNode" ? function () {
	                var c = comparer.Compare(k, t.Fields[0]);
	                if (c < 0) {
	                    return SetTree.rebalance(SetTree.remove(comparer, k, t.Fields[1]), t.Fields[0], t.Fields[2]);
	                } else {
	                    if (c === 0) {
	                        var matchValue = [t.Fields[1], t.Fields[2]];
	                        if (matchValue[0].Case === "SetEmpty") {
	                            return t.Fields[2];
	                        } else {
	                            if (matchValue[1].Case === "SetEmpty") {
	                                return t.Fields[1];
	                            } else {
	                                var patternInput = SetTree.spliceOutSuccessor(t.Fields[2]);
	                                var sk = patternInput[0];
	                                var r_ = patternInput[1];
	                                return SetTree.mk(t.Fields[1], sk, r_);
	                            }
	                        }
	                    } else {
	                        return SetTree.rebalance(t.Fields[1], t.Fields[0], SetTree.remove(comparer, k, t.Fields[2]));
	                    }
	                }
	            }() : t;
	        };
	
	        SetTree.mem = function mem(comparer, k, t) {
	            return t.Case === "SetOne" ? comparer.Compare(k, t.Fields[0]) === 0 : t.Case === "SetEmpty" ? false : function () {
	                var c = comparer.Compare(k, t.Fields[0]);
	                if (c < 0) {
	                    return SetTree.mem(comparer, k, t.Fields[1]);
	                } else {
	                    if (c === 0) {
	                        return true;
	                    } else {
	                        return SetTree.mem(comparer, k, t.Fields[2]);
	                    }
	                }
	            }();
	        };
	
	        SetTree.iter = function iter(f, t) {
	            if (t.Case === "SetOne") {
	                f(t.Fields[0]);
	            } else {
	                if (t.Case === "SetEmpty") {} else {
	                    SetTree.iter(f, t.Fields[1]);
	                    f(t.Fields[0]);
	                    SetTree.iter(f, t.Fields[2]);
	                }
	            }
	        };
	
	        SetTree.foldBack = function foldBack(f, m, x) {
	            return m.Case === "SetOne" ? f(m.Fields[0], x) : m.Case === "SetEmpty" ? x : SetTree.foldBack(f, m.Fields[1], f(m.Fields[0], SetTree.foldBack(f, m.Fields[2], x)));
	        };
	
	        SetTree.fold = function fold(f, x, m) {
	            return m.Case === "SetOne" ? f(x, m.Fields[0]) : m.Case === "SetEmpty" ? x : function () {
	                var x_1 = SetTree.fold(f, x, m.Fields[1]);
	                var x_2 = f(x_1, m.Fields[0]);
	                return SetTree.fold(f, x_2, m.Fields[2]);
	            }();
	        };
	
	        SetTree.forall = function forall(f, m) {
	            return m.Case === "SetOne" ? f(m.Fields[0]) : m.Case === "SetEmpty" ? true : (f(m.Fields[0]) ? SetTree.forall(f, m.Fields[1]) : false) ? SetTree.forall(f, m.Fields[2]) : false;
	        };
	
	        SetTree.exists = function exists(f, m) {
	            return m.Case === "SetOne" ? f(m.Fields[0]) : m.Case === "SetEmpty" ? false : (f(m.Fields[0]) ? true : SetTree.exists(f, m.Fields[1])) ? true : SetTree.exists(f, m.Fields[2]);
	        };
	
	        SetTree.isEmpty = function isEmpty(m) {
	            return m.Case === "SetEmpty" ? true : false;
	        };
	
	        SetTree.subset = function subset(comparer, a, b) {
	            return SetTree.forall(function (x) {
	                return SetTree.mem(comparer, x, b);
	            }, a);
	        };
	
	        SetTree.psubset = function psubset(comparer, a, b) {
	            return SetTree.forall(function (x) {
	                return SetTree.mem(comparer, x, b);
	            }, a) ? SetTree.exists(function (x) {
	                return !SetTree.mem(comparer, x, a);
	            }, b) : false;
	        };
	
	        SetTree.filterAux = function filterAux(comparer, f, s, acc) {
	            return s.Case === "SetOne" ? f(s.Fields[0]) ? SetTree.add(comparer, s.Fields[0], acc) : acc : s.Case === "SetEmpty" ? acc : function () {
	                var acc_1 = f(s.Fields[0]) ? SetTree.add(comparer, s.Fields[0], acc) : acc;
	                return SetTree.filterAux(comparer, f, s.Fields[1], SetTree.filterAux(comparer, f, s.Fields[2], acc_1));
	            }();
	        };
	
	        SetTree.filter = function filter(comparer, f, s) {
	            return SetTree.filterAux(comparer, f, s, new SetTree("SetEmpty", []));
	        };
	
	        SetTree.diffAux = function diffAux(comparer, m, acc) {
	            return m.Case === "SetOne" ? SetTree.remove(comparer, m.Fields[0], acc) : m.Case === "SetEmpty" ? acc : SetTree.diffAux(comparer, m.Fields[1], SetTree.diffAux(comparer, m.Fields[2], SetTree.remove(comparer, m.Fields[0], acc)));
	        };
	
	        SetTree.diff = function diff(comparer, a, b) {
	            return SetTree.diffAux(comparer, b, a);
	        };
	
	        SetTree.union = function union(comparer, t1, t2) {
	            var matchValue = [t1, t2];
	            var $target2 = function $target2(t) {
	                return t;
	            };
	            var $target3 = function $target3(k1, t2_1) {
	                return SetTree.add(comparer, k1, t2_1);
	            };
	            if (matchValue[0].Case === "SetEmpty") {
	                var t = matchValue[1];
	                return t;
	            } else {
	                if (matchValue[0].Case === "SetOne") {
	                    if (matchValue[1].Case === "SetEmpty") {
	                        return $target2(matchValue[0]);
	                    } else {
	                        if (matchValue[1].Case === "SetOne") {
	                            return $target3(matchValue[0].Fields[0], matchValue[1]);
	                        } else {
	                            return $target3(matchValue[0].Fields[0], matchValue[1]);
	                        }
	                    }
	                } else {
	                    if (matchValue[1].Case === "SetEmpty") {
	                        return $target2(matchValue[0]);
	                    } else {
	                        if (matchValue[1].Case === "SetOne") {
	                            var k2 = matchValue[1].Fields[0];
	                            var t1_1 = matchValue[0];
	                            return SetTree.add(comparer, k2, t1_1);
	                        } else {
	                            var h1 = matchValue[0].Fields[3];
	                            var h2 = matchValue[1].Fields[3];
	                            var k1 = matchValue[0].Fields[0];
	                            var k2 = matchValue[1].Fields[0];
	                            var t11 = matchValue[0].Fields[1];
	                            var t12 = matchValue[0].Fields[2];
	                            var t21 = matchValue[1].Fields[1];
	                            var t22 = matchValue[1].Fields[2];
	                            if (h1 > h2) {
	                                var patternInput = SetTree.split(comparer, k1, t2);
	                                var lo = patternInput[0];
	                                var hi = patternInput[2];
	                                return SetTree.balance(comparer, SetTree.union(comparer, t11, lo), k1, SetTree.union(comparer, t12, hi));
	                            } else {
	                                var patternInput = SetTree.split(comparer, k2, t1);
	                                var lo = patternInput[0];
	                                var hi = patternInput[2];
	                                return SetTree.balance(comparer, SetTree.union(comparer, t21, lo), k2, SetTree.union(comparer, t22, hi));
	                            }
	                        }
	                    }
	                }
	            }
	        };
	
	        SetTree.intersectionAux = function intersectionAux(comparer, b, m, acc) {
	            return m.Case === "SetOne" ? SetTree.mem(comparer, m.Fields[0], b) ? SetTree.add(comparer, m.Fields[0], acc) : acc : m.Case === "SetEmpty" ? acc : function () {
	                var acc_1 = SetTree.intersectionAux(comparer, b, m.Fields[2], acc);
	                var acc_2 = SetTree.mem(comparer, m.Fields[0], b) ? SetTree.add(comparer, m.Fields[0], acc_1) : acc_1;
	                return SetTree.intersectionAux(comparer, b, m.Fields[1], acc_2);
	            }();
	        };
	
	        SetTree.intersection = function intersection(comparer, a, b) {
	            return SetTree.intersectionAux(comparer, b, a, new SetTree("SetEmpty", []));
	        };
	
	        SetTree.partition1 = function partition1(comparer, f, k, acc1, acc2) {
	            return f(k) ? [SetTree.add(comparer, k, acc1), acc2] : [acc1, SetTree.add(comparer, k, acc2)];
	        };
	
	        SetTree.partitionAux = function partitionAux(comparer, f, s, acc_0, acc_1) {
	            var acc = [acc_0, acc_1];
	            if (s.Case === "SetOne") {
	                var acc1 = acc[0];
	                var acc2 = acc[1];
	                return SetTree.partition1(comparer, f, s.Fields[0], acc1, acc2);
	            } else {
	                if (s.Case === "SetEmpty") {
	                    return acc;
	                } else {
	                    var acc_2 = function () {
	                        var arg30_ = acc[0];
	                        var arg31_ = acc[1];
	                        return SetTree.partitionAux(comparer, f, s.Fields[2], arg30_, arg31_);
	                    }();
	                    var acc_3 = function () {
	                        var acc1 = acc_2[0];
	                        var acc2 = acc_2[1];
	                        return SetTree.partition1(comparer, f, s.Fields[0], acc1, acc2);
	                    }();
	                    var arg30_ = acc_3[0];
	                    var arg31_ = acc_3[1];
	                    return SetTree.partitionAux(comparer, f, s.Fields[1], arg30_, arg31_);
	                }
	            }
	        };
	
	        SetTree.partition = function partition(comparer, f, s) {
	            var seed = [new SetTree("SetEmpty", []), new SetTree("SetEmpty", [])];
	            var arg30_ = seed[0];
	            var arg31_ = seed[1];
	            return SetTree.partitionAux(comparer, f, s, arg30_, arg31_);
	        };
	
	        SetTree.minimumElementAux = function minimumElementAux(s, n) {
	            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? n : SetTree.minimumElementAux(s.Fields[1], s.Fields[0]);
	        };
	
	        SetTree.minimumElementOpt = function minimumElementOpt(s) {
	            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? null : SetTree.minimumElementAux(s.Fields[1], s.Fields[0]);
	        };
	
	        SetTree.maximumElementAux = function maximumElementAux(s, n) {
	            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? n : SetTree.maximumElementAux(s.Fields[2], s.Fields[0]);
	        };
	
	        SetTree.maximumElementOpt = function maximumElementOpt(s) {
	            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? null : SetTree.maximumElementAux(s.Fields[2], s.Fields[0]);
	        };
	
	        SetTree.minimumElement = function minimumElement(s) {
	            var matchValue = SetTree.minimumElementOpt(s);
	            if (matchValue == null) {
	                throw "Set contains no elements";
	            } else {
	                return matchValue;
	            }
	        };
	
	        SetTree.maximumElement = function maximumElement(s) {
	            var matchValue = SetTree.maximumElementOpt(s);
	            if (matchValue == null) {
	                throw "Set contains no elements";
	            } else {
	                return matchValue;
	            }
	        };
	
	        SetTree.collapseLHS = function collapseLHS(stack) {
	            return stack.tail != null ? stack.head.Case === "SetOne" ? stack : stack.head.Case === "SetNode" ? SetTree.collapseLHS(List.ofArray([stack.head.Fields[1], SetTree.SetOne(stack.head.Fields[0]), stack.head.Fields[2]], stack.tail)) : SetTree.collapseLHS(stack.tail) : new List();
	        };
	
	        SetTree.mkIterator = function mkIterator(s) {
	            return { stack: SetTree.collapseLHS(new List(s, new List())), started: false };
	        };
	
	        SetTree.moveNext = function moveNext(i) {
	            function current(i) {
	                if (i.stack.tail == null) {
	                    return null;
	                } else if (i.stack.head.Case === "SetOne") {
	                    return i.stack.head.Fields[0];
	                }
	                throw "Please report error: Set iterator, unexpected stack for current";
	            }
	            if (i.started) {
	                if (i.stack.tail == null) {
	                    return { done: true };
	                } else {
	                    if (i.stack.head.Case === "SetOne") {
	                        i.stack = SetTree.collapseLHS(i.stack.tail);
	                        return {
	                            done: i.stack.tail == null,
	                            value: current(i)
	                        };
	                    } else {
	                        throw "Please report error: Set iterator, unexpected stack for moveNext";
	                    }
	                }
	            } else {
	                i.started = true;
	                return {
	                    done: i.stack.tail == null,
	                    value: current(i)
	                };
	            }
	            ;
	        };
	
	        SetTree.compareStacks = function compareStacks(comparer, l1, l2) {
	            var $target8 = function $target8(n1k, t1) {
	                return SetTree.compareStacks(comparer, List.ofArray([new SetTree("SetEmpty", []), SetTree.SetOne(n1k)], t1), l2);
	            };
	            var $target9 = function $target9(n1k, n1l, n1r, t1) {
	                return SetTree.compareStacks(comparer, List.ofArray([n1l, SetTree.SetNode(n1k, new SetTree("SetEmpty", []), n1r, 0)], t1), l2);
	            };
	            var $target11 = function $target11(n2k, n2l, n2r, t2) {
	                return SetTree.compareStacks(comparer, l1, List.ofArray([n2l, SetTree.SetNode(n2k, new SetTree("SetEmpty", []), n2r, 0)], t2));
	            };
	            if (l1.tail != null) {
	                if (l2.tail != null) {
	                    if (l2.head.Case === "SetOne") {
	                        if (l1.head.Case === "SetOne") {
	                            var n1k = l1.head.Fields[0],
	                                n2k = l2.head.Fields[0],
	                                t1 = l1.tail,
	                                t2 = l2.tail,
	                                c = comparer.Compare(n1k, n2k);
	                            if (c !== 0) {
	                                return c;
	                            } else {
	                                return SetTree.compareStacks(comparer, t1, t2);
	                            }
	                        } else {
	                            if (l1.head.Case === "SetNode") {
	                                if (l1.head.Fields[1].Case === "SetEmpty") {
	                                    var emp = l1.head.Fields[1],
	                                        _n1k = l1.head.Fields[0],
	                                        n1r = l1.head.Fields[2],
	                                        _n2k = l2.head.Fields[0],
	                                        _t = l1.tail,
	                                        _t2 = l2.tail,
	                                        _c = comparer.Compare(_n1k, _n2k);
	                                    if (_c !== 0) {
	                                        return _c;
	                                    } else {
	                                        return SetTree.compareStacks(comparer, List.ofArray([n1r], _t), List.ofArray([emp], _t2));
	                                    }
	                                } else {
	                                    return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
	                                }
	                            } else {
	                                var _n2k2 = l2.head.Fields[0],
	                                    _t3 = l2.tail;
	                                return SetTree.compareStacks(comparer, l1, List.ofArray([new SetTree("SetEmpty", []), SetTree.SetOne(_n2k2)], _t3));
	                            }
	                        }
	                    } else {
	                        if (l2.head.Case === "SetNode") {
	                            if (l2.head.Fields[1].Case === "SetEmpty") {
	                                if (l1.head.Case === "SetOne") {
	                                    var _n1k2 = l1.head.Fields[0],
	                                        _n2k3 = l2.head.Fields[0],
	                                        n2r = l2.head.Fields[2],
	                                        _t4 = l1.tail,
	                                        _t5 = l2.tail,
	                                        _c2 = comparer.Compare(_n1k2, _n2k3);
	                                    if (_c2 !== 0) {
	                                        return _c2;
	                                    } else {
	                                        return SetTree.compareStacks(comparer, List.ofArray([new SetTree("SetEmpty", [])], _t4), List.ofArray([n2r], _t5));
	                                    }
	                                } else {
	                                    if (l1.head.Case === "SetNode") {
	                                        if (l1.head.Fields[1].Case === "SetEmpty") {
	                                            var _n1k3 = l1.head.Fields[0],
	                                                _n1r = l1.head.Fields[2],
	                                                _n2k4 = l2.head.Fields[0],
	                                                _n2r = l2.head.Fields[2],
	                                                _t6 = l1.tail,
	                                                _t7 = l2.tail,
	                                                _c3 = comparer.Compare(_n1k3, _n2k4);
	                                            if (_c3 !== 0) {
	                                                return _c3;
	                                            } else {
	                                                return SetTree.compareStacks(comparer, List.ofArray([_n1r], _t6), List.ofArray([_n2r], _t7));
	                                            }
	                                        } else {
	                                            return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
	                                        }
	                                    } else {
	                                        return $target11(l2.head.Fields[0], l2.head.Fields[1], l2.head.Fields[2], l2.tail);
	                                    }
	                                }
	                            } else {
	                                if (l1.head.Case === "SetOne") {
	                                    return $target8(l1.head.Fields[0], l1.tail);
	                                } else {
	                                    if (l1.head.Case === "SetNode") {
	                                        return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
	                                    } else {
	                                        return $target11(l2.head.Fields[0], l2.head.Fields[1], l2.head.Fields[2], l2.tail);
	                                    }
	                                }
	                            }
	                        } else {
	                            if (l1.head.Case === "SetOne") {
	                                return $target8(l1.head.Fields[0], l1.tail);
	                            } else {
	                                if (l1.head.Case === "SetNode") {
	                                    return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
	                                } else {
	                                    return SetTree.compareStacks(comparer, l1.tail, l2.tail);
	                                }
	                            }
	                        }
	                    }
	                } else {
	                    return 1;
	                }
	            } else {
	                if (l2.tail != null) {
	                    return -1;
	                } else {
	                    return 0;
	                }
	            }
	        };
	
	        SetTree.compare = function compare(comparer, s1, s2) {
	            if (s1.Case === "SetEmpty") {
	                if (s2.Case === "SetEmpty") {
	                    return 0;
	                } else {
	                    return -1;
	                }
	            } else {
	                if (s2.Case === "SetEmpty") {
	                    return 1;
	                } else {
	                    return SetTree.compareStacks(comparer, List.ofArray([s1]), List.ofArray([s2]));
	                }
	            }
	        };
	
	        SetTree.mkFromEnumerator = function mkFromEnumerator(comparer, acc, e) {
	            var cur = e.next();
	            while (!cur.done) {
	                acc = SetTree.add(comparer, cur.value, acc);
	                cur = e.next();
	            }
	            return acc;
	        };
	
	        SetTree.ofSeq = function ofSeq(comparer, c) {
	            var ie = c[Symbol.iterator]();
	            return SetTree.mkFromEnumerator(comparer, new SetTree("SetEmpty", []), ie);
	        };
	
	        return SetTree;
	    }();
	
	    SetTree.tolerance = 2;
	
	    var FSet = function () {
	        /** Do not call, use Set.create instead. */
	        function FSet() {
	            _classCallCheck(this, FSet);
	        }
	
	        FSet.from = function from(comparer, tree) {
	            var s = new FSet();
	            s.tree = tree;
	            s.comparer = comparer || new GenericComparer();
	            return s;
	        };
	
	        FSet.create = function create(ie, comparer) {
	            comparer = comparer || new GenericComparer();
	            return FSet.from(comparer, ie ? SetTree.ofSeq(comparer, ie) : new SetTree("SetEmpty", []));
	        };
	
	        FSet.prototype.ToString = function ToString() {
	            return "set [" + Array.from(this).map(Util.toString).join("; ") + "]";
	        };
	
	        FSet.prototype.Equals = function Equals(s2) {
	            return this.CompareTo(s2) === 0;
	        };
	
	        FSet.prototype.CompareTo = function CompareTo(s2) {
	            return SetTree.compare(this.comparer, this.tree, s2.tree);
	        };
	
	        FSet.prototype[Symbol.iterator] = function () {
	            var i = SetTree.mkIterator(this.tree);
	            return {
	                next: function next() {
	                    return SetTree.moveNext(i);
	                }
	            };
	        };
	
	        FSet.prototype.values = function values() {
	            return this[Symbol.iterator]();
	        };
	
	        FSet.prototype.has = function has(v) {
	            return SetTree.mem(this.comparer, v, this.tree);
	        };
	
	        FSet.prototype.add = function add(v) {
	            throw "not supported";
	        };
	
	        FSet.prototype.delete = function _delete(v) {
	            throw "not supported";
	        };
	
	        FSet.prototype.clear = function clear() {
	            throw "not supported";
	        };
	
	        FSet.isEmpty = function isEmpty(s) {
	            return SetTree.isEmpty(s.tree);
	        };
	
	        FSet.add = function add(item, s) {
	            return FSet.from(s.comparer, SetTree.add(s.comparer, item, s.tree));
	        };
	
	        FSet.addInPlace = function addInPlace(item, s) {
	            return s.has(item) ? false : (s.add(item), true);
	        };
	
	        FSet.remove = function remove(item, s) {
	            return FSet.from(s.comparer, SetTree.remove(s.comparer, item, s.tree));
	        };
	
	        FSet.union = function union(set1, set2) {
	            return set2.tree.Case === "SetEmpty" ? set1 : set1.tree.Case === "SetEmpty" ? set2 : FSet.from(set1.comparer, SetTree.union(set1.comparer, set1.tree, set2.tree));
	        };
	
	        FSet.unionInPlace = function unionInPlace(set1, set2) {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;
	
	            try {
	                for (var _iterator = set2[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var x = _step.value;
	
	                    set1.add(x);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        };
	
	        FSet.unionMany = function unionMany(sets) {
	            // Pass args as FSet.union(s, acc) instead of FSet.union(acc, s)
	            // to discard the comparer of the first empty set 
	            return Seq.fold(function (acc, s) {
	                return FSet.union(s, acc);
	            }, FSet.create(), sets);
	        };
	
	        FSet.difference = function difference(set1, set2) {
	            return set1.tree.Case === "SetEmpty" ? set1 : set2.tree.Case === "SetEmpty" ? set1 : FSet.from(set1.comparer, SetTree.diff(set1.comparer, set1.tree, set2.tree));
	        };
	
	        FSet.differenceInPlace = function differenceInPlace(set1, set2) {
	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;
	
	            try {
	                for (var _iterator2 = set2[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var x = _step2.value;
	
	                    set1.delete(x);
	                }
	            } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                        _iterator2.return();
	                    }
	                } finally {
	                    if (_didIteratorError2) {
	                        throw _iteratorError2;
	                    }
	                }
	            }
	        };
	
	        FSet.intersect = function intersect(set1, set2) {
	            return set2.tree.Case === "SetEmpty" ? set2 : set1.tree.Case === "SetEmpty" ? set1 : FSet.from(set1.comparer, SetTree.intersection(set1.comparer, set1.tree, set2.tree));
	        };
	
	        FSet.intersectInPlace = function intersectInPlace(set1, set2) {
	            var set2_ = set2 instanceof Set ? set2 : new Set(set2);
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;
	
	            try {
	                for (var _iterator3 = set1[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var x = _step3.value;
	
	                    if (!set2_.has(x)) {
	                        set1.delete(x);
	                    }
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                        _iterator3.return();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
	                    }
	                }
	            }
	        };
	
	        FSet.intersectMany = function intersectMany(sets) {
	            return Seq.reduce(function (s1, s2) {
	                return FSet.intersect(s1, s2);
	            }, sets);
	        };
	
	        FSet.isProperSubsetOf = function isProperSubsetOf(set1, set2) {
	            if (set1 instanceof FSet && set2 instanceof FSet) {
	                return SetTree.psubset(set1.comparer, set1.tree, set2.tree);
	            } else {
	                set2 = set2 instanceof Set ? set2 : new Set(set2);
	                return Seq.forAll(function (x) {
	                    return set2.has(x);
	                }, set1) && Seq.exists(function (x) {
	                    return !set1.has(x);
	                }, set2);
	            }
	        };
	
	        FSet.isSubsetOf = function isSubsetOf(set1, set2) {
	            if (set1 instanceof FSet && set2 instanceof FSet) {
	                return SetTree.subset(set1.comparer, set1.tree, set2.tree);
	            } else {
	                set2 = set2 instanceof Set ? set2 : new Set(set2);
	                return Seq.forAll(function (x) {
	                    return set2.has(x);
	                }, set1);
	            }
	        };
	
	        FSet.isProperSupersetOf = function isProperSupersetOf(set1, set2) {
	            if (set1 instanceof FSet && set2 instanceof FSet) {
	                return SetTree.psubset(set1.comparer, set2.tree, set1.tree);
	            } else {
	                return FSet.isProperSubset(set2 instanceof Set ? set2 : new Set(set2), set1);
	            }
	        };
	
	        FSet.isSupersetOf = function isSupersetOf(set1, set2) {
	            if (set1 instanceof FSet && set2 instanceof FSet) {
	                return SetTree.subset(set1.comparer, set2.tree, set1.tree);
	            } else {
	                return FSet.isSubset(set2 instanceof Set ? set2 : new Set(set2), set1);
	            }
	        };
	
	        FSet.copyTo = function copyTo(xs, arr, arrayIndex, count) {
	            if (!Array.isArray(arr) && !ArrayBuffer.isView(arr)) throw "Array is invalid";
	            count = count || arr.length;
	            var i = arrayIndex || 0;
	            var iter = xs[Symbol.iterator]();
	            while (count--) {
	                var el = iter.next();
	                if (el.done) break;
	                arr[i++] = el.value;
	            }
	        };
	
	        FSet.partition = function partition(f, s) {
	            if (s.tree.Case === "SetEmpty") {
	                return [s, s];
	            } else {
	                var tuple = SetTree.partition(s.comparer, f, s.tree);
	                return [FSet.from(s.comparer, tuple[0]), FSet.from(s.comparer, tuple[1])];
	            }
	        };
	
	        FSet.filter = function filter(f, s) {
	            if (s.tree.Case === "SetEmpty") {
	                return s;
	            } else {
	                return FSet.from(s.comparer, SetTree.filter(s.comparer, f, s.tree));
	            }
	        };
	
	        FSet.map = function map(f, s) {
	            var comparer = new GenericComparer();
	            return FSet.from(comparer, SetTree.fold(function (acc, k) {
	                return SetTree.add(comparer, f(k), acc);
	            }, new SetTree("SetEmpty", []), s.tree));
	        };
	
	        FSet.exists = function exists(f, s) {
	            return SetTree.exists(f, s.tree);
	        };
	
	        FSet.forAll = function forAll(f, s) {
	            return SetTree.forall(f, s.tree);
	        };
	
	        FSet.fold = function fold(f, seed, s) {
	            return SetTree.fold(f, seed, s.tree);
	        };
	
	        FSet.foldBack = function foldBack(f, s, seed) {
	            return SetTree.foldBack(f, s.tree, seed);
	        };
	
	        FSet.iterate = function iterate(f, s) {
	            SetTree.iter(f, s.tree);
	        };
	
	        FSet.minimumElement = function minimumElement(s) {
	            return SetTree.minimumElement(s.tree);
	        };
	
	        FSet.maximumElement = function maximumElement(s) {
	            return SetTree.maximumElement(s.tree);
	        };
	
	        _createClass(FSet, [{
	            key: "size",
	            get: function get() {
	                return SetTree.count(this.tree);
	            }
	        }]);
	
	        return FSet;
	    }();
	
	    FSet.op_Addition = FSet.union;
	    FSet.op_Subtraction = FSet.difference;
	    FSet.isProperSubset = FSet.isProperSubsetOf;
	    FSet.isSubset = FSet.isSubsetOf;
	    FSet.isProperSuperset = FSet.isProperSupersetOf;
	    FSet.isSuperset = FSet.isSupersetOf;
	    FSet.minElement = FSet.minimumElement;
	    FSet.maxElement = FSet.maximumElement;
	    Util.setInterfaces(FSet.prototype, ["System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Collections.FSharpSet");
	    exports.Set = FSet;
	
	    var MapTree = function () {
	        function MapTree(caseName, fields) {
	            _classCallCheck(this, MapTree);
	
	            this.Case = caseName;
	            this.Fields = fields;
	        }
	
	        MapTree.sizeAux = function sizeAux(acc, m) {
	            return m.Case === "MapOne" ? acc + 1 : m.Case === "MapNode" ? MapTree.sizeAux(MapTree.sizeAux(acc + 1, m.Fields[2]), m.Fields[3]) : acc;
	        };
	
	        MapTree.size = function size(x) {
	            return MapTree.sizeAux(0, x);
	        };
	
	        MapTree.empty = function empty() {
	            return new MapTree("MapEmpty", []);
	        };
	
	        MapTree.height = function height(_arg1) {
	            return _arg1.Case === "MapOne" ? 1 : _arg1.Case === "MapNode" ? _arg1.Fields[4] : 0;
	        };
	
	        MapTree.isEmpty = function isEmpty(m) {
	            return m.Case === "MapEmpty" ? true : false;
	        };
	
	        MapTree.mk = function mk(l, k, v, r) {
	            var matchValue = [l, r];
	            var $target1 = function $target1() {
	                var hl = MapTree.height(l);
	                var hr = MapTree.height(r);
	                var m = hl < hr ? hr : hl;
	                return new MapTree("MapNode", [k, v, l, r, m + 1]);
	            };
	            if (matchValue[0].Case === "MapEmpty") {
	                if (matchValue[1].Case === "MapEmpty") {
	                    return new MapTree("MapOne", [k, v]);
	                } else {
	                    return $target1();
	                }
	            } else {
	                return $target1();
	            }
	        };
	
	        MapTree.rebalance = function rebalance(t1, k, v, t2) {
	            var t1h = MapTree.height(t1);
	            var t2h = MapTree.height(t2);
	            if (t2h > t1h + 2) {
	                if (t2.Case === "MapNode") {
	                    if (MapTree.height(t2.Fields[2]) > t1h + 1) {
	                        if (t2.Fields[2].Case === "MapNode") {
	                            return MapTree.mk(MapTree.mk(t1, k, v, t2.Fields[2].Fields[2]), t2.Fields[2].Fields[0], t2.Fields[2].Fields[1], MapTree.mk(t2.Fields[2].Fields[3], t2.Fields[0], t2.Fields[1], t2.Fields[3]));
	                        } else {
	                            throw "rebalance";
	                        }
	                    } else {
	                        return MapTree.mk(MapTree.mk(t1, k, v, t2.Fields[2]), t2.Fields[0], t2.Fields[1], t2.Fields[3]);
	                    }
	                } else {
	                    throw "rebalance";
	                }
	            } else {
	                if (t1h > t2h + 2) {
	                    if (t1.Case === "MapNode") {
	                        if (MapTree.height(t1.Fields[3]) > t2h + 1) {
	                            if (t1.Fields[3].Case === "MapNode") {
	                                return MapTree.mk(MapTree.mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], t1.Fields[3].Fields[2]), t1.Fields[3].Fields[0], t1.Fields[3].Fields[1], MapTree.mk(t1.Fields[3].Fields[3], k, v, t2));
	                            } else {
	                                throw "rebalance";
	                            }
	                        } else {
	                            return MapTree.mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], MapTree.mk(t1.Fields[3], k, v, t2));
	                        }
	                    } else {
	                        throw "rebalance";
	                    }
	                } else {
	                    return MapTree.mk(t1, k, v, t2);
	                }
	            }
	        };
	
	        MapTree.add = function add(comparer, k, v, m) {
	            if (m.Case === "MapOne") {
	                var c = comparer.Compare(k, m.Fields[0]);
	                if (c < 0) {
	                    return new MapTree("MapNode", [k, v, new MapTree("MapEmpty", []), m, 2]);
	                } else if (c === 0) {
	                    return new MapTree("MapOne", [k, v]);
	                }
	                return new MapTree("MapNode", [k, v, m, new MapTree("MapEmpty", []), 2]);
	            } else if (m.Case === "MapNode") {
	                var c = comparer.Compare(k, m.Fields[0]);
	                if (c < 0) {
	                    return MapTree.rebalance(MapTree.add(comparer, k, v, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
	                } else if (c === 0) {
	                    return new MapTree("MapNode", [k, v, m.Fields[2], m.Fields[3], m.Fields[4]]);
	                }
	                return MapTree.rebalance(m.Fields[2], m.Fields[0], m.Fields[1], MapTree.add(comparer, k, v, m.Fields[3]));
	            }
	            return new MapTree("MapOne", [k, v]);
	        };
	
	        MapTree.find = function find(comparer, k, m) {
	            var res = MapTree.tryFind(comparer, k, m);
	            if (res != null) return res;
	            throw "key not found";
	        };
	
	        MapTree.tryFind = function tryFind(comparer, k, m) {
	            if (m.Case === "MapOne") {
	                var c = comparer.Compare(k, m.Fields[0]);
	                return c === 0 ? m.Fields[1] : null;
	            } else if (m.Case === "MapNode") {
	                var c = comparer.Compare(k, m.Fields[0]);
	                if (c < 0) {
	                    return MapTree.tryFind(comparer, k, m.Fields[2]);
	                } else {
	                    if (c === 0) {
	                        return m.Fields[1];
	                    } else {
	                        return MapTree.tryFind(comparer, k, m.Fields[3]);
	                    }
	                }
	            }
	            return null;
	        };
	
	        MapTree.partition1 = function partition1(comparer, f, k, v, acc1, acc2) {
	            return f(k, v) ? [MapTree.add(comparer, k, v, acc1), acc2] : [acc1, MapTree.add(comparer, k, v, acc2)];
	        };
	
	        MapTree.partitionAux = function partitionAux(comparer, f, s, acc_0, acc_1) {
	            var acc = [acc_0, acc_1];
	            if (s.Case === "MapOne") {
	                return MapTree.partition1(comparer, f, s.Fields[0], s.Fields[1], acc[0], acc[1]);
	            } else if (s.Case === "MapNode") {
	                var acc_2 = MapTree.partitionAux(comparer, f, s.Fields[3], acc[0], acc[1]);
	                var acc_3 = MapTree.partition1(comparer, f, s.Fields[0], s.Fields[1], acc_2[0], acc_2[1]);
	                return MapTree.partitionAux(comparer, f, s.Fields[2], acc_3[0], acc_3[1]);
	            }
	            return acc;
	        };
	
	        MapTree.partition = function partition(comparer, f, s) {
	            return MapTree.partitionAux(comparer, f, s, MapTree.empty(), MapTree.empty());
	        };
	
	        MapTree.filter1 = function filter1(comparer, f, k, v, acc) {
	            return f(k, v) ? MapTree.add(comparer, k, v, acc) : acc;
	        };
	
	        MapTree.filterAux = function filterAux(comparer, f, s, acc) {
	            return s.Case === "MapOne" ? MapTree.filter1(comparer, f, s.Fields[0], s.Fields[1], acc) : s.Case === "MapNode" ? function () {
	                var acc_1 = MapTree.filterAux(comparer, f, s.Fields[2], acc);
	                var acc_2 = MapTree.filter1(comparer, f, s.Fields[0], s.Fields[1], acc_1);
	                return MapTree.filterAux(comparer, f, s.Fields[3], acc_2);
	            }() : acc;
	        };
	
	        MapTree.filter = function filter(comparer, f, s) {
	            return MapTree.filterAux(comparer, f, s, MapTree.empty());
	        };
	
	        MapTree.spliceOutSuccessor = function spliceOutSuccessor(m) {
	            if (m.Case === "MapOne") {
	                return [m.Fields[0], m.Fields[1], new MapTree("MapEmpty", [])];
	            } else if (m.Case === "MapNode") {
	                if (m.Fields[2].Case === "MapEmpty") {
	                    return [m.Fields[0], m.Fields[1], m.Fields[3]];
	                } else {
	                    var kvl = MapTree.spliceOutSuccessor(m.Fields[2]);
	                    return [kvl[0], kvl[1], MapTree.mk(kvl[2], m.Fields[0], m.Fields[1], m.Fields[3])];
	                }
	            }
	            throw "internal error: Map.spliceOutSuccessor";
	        };
	
	        MapTree.remove = function remove(comparer, k, m) {
	            if (m.Case === "MapOne") {
	                var c = comparer.Compare(k, m.Fields[0]);
	                if (c === 0) {
	                    return new MapTree("MapEmpty", []);
	                } else {
	                    return m;
	                }
	            } else if (m.Case === "MapNode") {
	                var c = comparer.Compare(k, m.Fields[0]);
	                if (c < 0) {
	                    return MapTree.rebalance(MapTree.remove(comparer, k, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
	                } else {
	                    if (c === 0) {
	                        var matchValue = [m.Fields[2], m.Fields[3]];
	                        if (matchValue[0].Case === "MapEmpty") {
	                            return m.Fields[3];
	                        } else {
	                            if (matchValue[1].Case === "MapEmpty") {
	                                return m.Fields[2];
	                            } else {
	                                var patternInput = MapTree.spliceOutSuccessor(m.Fields[3]);
	                                var sv = patternInput[1];
	                                var sk = patternInput[0];
	                                var r_ = patternInput[2];
	                                return MapTree.mk(m.Fields[2], sk, sv, r_);
	                            }
	                        }
	                    } else {
	                        return MapTree.rebalance(m.Fields[2], m.Fields[0], m.Fields[1], MapTree.remove(comparer, k, m.Fields[3]));
	                    }
	                }
	            } else {
	                return MapTree.empty();
	            }
	        };
	
	        MapTree.mem = function mem(comparer, k, m) {
	            return m.Case === "MapOne" ? comparer.Compare(k, m.Fields[0]) === 0 : m.Case === "MapNode" ? function () {
	                var c = comparer.Compare(k, m.Fields[0]);
	                if (c < 0) {
	                    return MapTree.mem(comparer, k, m.Fields[2]);
	                } else {
	                    if (c === 0) {
	                        return true;
	                    } else {
	                        return MapTree.mem(comparer, k, m.Fields[3]);
	                    }
	                }
	            }() : false;
	        };
	
	        MapTree.iter = function iter(f, m) {
	            if (m.Case === "MapOne") {
	                f(m.Fields[0], m.Fields[1]);
	            } else if (m.Case === "MapNode") {
	                MapTree.iter(f, m.Fields[2]);
	                f(m.Fields[0], m.Fields[1]);
	                MapTree.iter(f, m.Fields[3]);
	            }
	        };
	
	        MapTree.tryPick = function tryPick(f, m) {
	            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? function () {
	                var matchValue = MapTree.tryPick(f, m.Fields[2]);
	                if (matchValue == null) {
	                    var matchValue_1 = f(m.Fields[0], m.Fields[1]);
	                    if (matchValue_1 == null) {
	                        return MapTree.tryPick(f, m.Fields[3]);
	                    } else {
	                        var res = matchValue_1;
	                        return res;
	                    }
	                } else {
	                    var res = matchValue;
	                    return res;
	                }
	            }() : null;
	        };
	
	        MapTree.exists = function exists(f, m) {
	            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? (MapTree.exists(f, m.Fields[2]) ? true : f(m.Fields[0], m.Fields[1])) ? true : MapTree.exists(f, m.Fields[3]) : false;
	        };
	
	        MapTree.forall = function forall(f, m) {
	            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? (MapTree.forall(f, m.Fields[2]) ? f(m.Fields[0], m.Fields[1]) : false) ? MapTree.forall(f, m.Fields[3]) : false : true;
	        };
	
	        MapTree.mapi = function mapi(f, m) {
	            return m.Case === "MapOne" ? new MapTree("MapOne", [m.Fields[0], f(m.Fields[0], m.Fields[1])]) : m.Case === "MapNode" ? function () {
	                var l2 = MapTree.mapi(f, m.Fields[2]);
	                var v2 = f(m.Fields[0], m.Fields[1]);
	                var r2 = MapTree.mapi(f, m.Fields[3]);
	                return new MapTree("MapNode", [m.Fields[0], v2, l2, r2, m.Fields[4]]);
	            }() : MapTree.empty();
	        };
	
	        MapTree.foldBack = function foldBack(f, m, x) {
	            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1], x) : m.Case === "MapNode" ? function () {
	                var x_1 = MapTree.foldBack(f, m.Fields[3], x);
	                var x_2 = f(m.Fields[0], m.Fields[1], x_1);
	                return MapTree.foldBack(f, m.Fields[2], x_2);
	            }() : x;
	        };
	
	        MapTree.fold = function fold(f, x, m) {
	            return m.Case === "MapOne" ? f(x, m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? function () {
	                var x_1 = MapTree.fold(f, x, m.Fields[2]);
	                var x_2 = f(x_1, m.Fields[0], m.Fields[1]);
	                return MapTree.fold(f, x_2, m.Fields[3]);
	            }() : x;
	        };
	
	        MapTree.mkFromEnumerator = function mkFromEnumerator(comparer, acc, e) {
	            var cur = e.next();
	            while (!cur.done) {
	                acc = MapTree.add(comparer, cur.value[0], cur.value[1], acc);
	                cur = e.next();
	            }
	            return acc;
	        };
	
	        MapTree.ofSeq = function ofSeq(comparer, c) {
	            var ie = c[Symbol.iterator]();
	            return MapTree.mkFromEnumerator(comparer, MapTree.empty(), ie);
	        };
	
	        MapTree.collapseLHS = function collapseLHS(stack) {
	            if (stack.tail != null) {
	                if (stack.head.Case === "MapOne") {
	                    return stack;
	                } else if (stack.head.Case === "MapNode") {
	                    return MapTree.collapseLHS(List.ofArray([stack.head.Fields[2], new MapTree("MapOne", [stack.head.Fields[0], stack.head.Fields[1]]), stack.head.Fields[3]], stack.tail));
	                } else {
	                    return MapTree.collapseLHS(stack.tail);
	                }
	            } else {
	                return new List();
	            }
	        };
	
	        MapTree.mkIterator = function mkIterator(s) {
	            return { stack: MapTree.collapseLHS(new List(s, new List())), started: false };
	        };
	
	        MapTree.moveNext = function moveNext(i) {
	            function current(i) {
	                if (i.stack.tail == null) {
	                    return null;
	                } else if (i.stack.head.Case === "MapOne") {
	                    return [i.stack.head.Fields[0], i.stack.head.Fields[1]];
	                }
	                throw "Please report error: Map iterator, unexpected stack for current";
	            }
	            if (i.started) {
	                if (i.stack.tail == null) {
	                    return { done: true };
	                } else {
	                    if (i.stack.head.Case === "MapOne") {
	                        i.stack = MapTree.collapseLHS(i.stack.tail);
	                        return {
	                            done: i.stack.tail == null,
	                            value: current(i)
	                        };
	                    } else {
	                        throw "Please report error: Map iterator, unexpected stack for moveNext";
	                    }
	                }
	            } else {
	                i.started = true;
	                return {
	                    done: i.stack.tail == null,
	                    value: current(i)
	                };
	            }
	            ;
	        };
	
	        return MapTree;
	    }();
	
	    var FMap = function () {
	        /** Do not call, use Map.create instead. */
	        function FMap() {
	            _classCallCheck(this, FMap);
	        }
	
	        FMap.from = function from(comparer, tree) {
	            var map = new FMap();
	            map.tree = tree;
	            map.comparer = comparer || new GenericComparer();
	            return map;
	        };
	
	        FMap.create = function create(ie, comparer) {
	            comparer = comparer || new GenericComparer();
	            return FMap.from(comparer, ie ? MapTree.ofSeq(comparer, ie) : MapTree.empty());
	        };
	
	        FMap.prototype.ToString = function ToString() {
	            return "map [" + Array.from(this).map(Util.toString).join("; ") + "]";
	        };
	
	        FMap.prototype.Equals = function Equals(m2) {
	            return this.CompareTo(m2) === 0;
	        };
	
	        FMap.prototype.CompareTo = function CompareTo(m2) {
	            var _this4 = this;
	
	            return Seq.compareWith(function (kvp1, kvp2) {
	                var c = _this4.comparer.Compare(kvp1[0], kvp2[0]);
	                return c !== 0 ? c : Util.compare(kvp1[1], kvp2[1]);
	            }, this, m2);
	        };
	
	        FMap.prototype[Symbol.iterator] = function () {
	            var i = MapTree.mkIterator(this.tree);
	            return {
	                next: function next() {
	                    return MapTree.moveNext(i);
	                }
	            };
	        };
	
	        FMap.prototype.entries = function entries() {
	            return this[Symbol.iterator]();
	        };
	
	        FMap.prototype.keys = function keys() {
	            return Seq.map(function (kv) {
	                return kv[0];
	            }, this);
	        };
	
	        FMap.prototype.values = function values() {
	            return Seq.map(function (kv) {
	                return kv[1];
	            }, this);
	        };
	
	        FMap.prototype.get = function get(k) {
	            return MapTree.find(this.comparer, k, this.tree);
	        };
	
	        FMap.prototype.has = function has(k) {
	            return MapTree.mem(this.comparer, k, this.tree);
	        };
	
	        FMap.prototype.set = function set(k, v) {
	            throw "not supported";
	        };
	
	        FMap.prototype.delete = function _delete(k) {
	            throw "not supported";
	        };
	
	        FMap.prototype.clear = function clear() {
	            throw "not supported";
	        };
	
	        FMap.add = function add(k, v, map) {
	            return FMap.from(map.comparer, MapTree.add(map.comparer, k, v, map.tree));
	        };
	
	        FMap.remove = function remove(item, map) {
	            return FMap.from(map.comparer, MapTree.remove(map.comparer, item, map.tree));
	        };
	
	        FMap.containsValue = function containsValue(v, map) {
	            return Seq.fold(function (acc, k) {
	                return acc || Util.equals(map.get(k), v);
	            }, false, map.keys());
	        };
	
	        FMap.exists = function exists(f, map) {
	            return MapTree.exists(f, map.tree);
	        };
	
	        FMap.find = function find(k, map) {
	            return MapTree.find(map.comparer, k, map.tree);
	        };
	
	        FMap.tryFind = function tryFind(k, map) {
	            return MapTree.tryFind(map.comparer, k, map.tree);
	        };
	
	        FMap.filter = function filter(f, map) {
	            return FMap.from(map.comparer, MapTree.filter(map.comparer, f, map.tree));
	        };
	
	        FMap.fold = function fold(f, seed, map) {
	            return MapTree.fold(f, seed, map.tree);
	        };
	
	        FMap.foldBack = function foldBack(f, map, seed) {
	            return MapTree.foldBack(f, map.tree, seed);
	        };
	
	        FMap.forAll = function forAll(f, map) {
	            return MapTree.forall(f, map.tree);
	        };
	
	        FMap.isEmpty = function isEmpty(map) {
	            return MapTree.isEmpty(map.tree);
	        };
	
	        FMap.iterate = function iterate(f, map) {
	            MapTree.iter(f, map.tree);
	        };
	
	        FMap.map = function map(f, _map) {
	            return FMap.from(_map.comparer, MapTree.mapi(f, _map.tree));
	        };
	
	        FMap.partition = function partition(f, map) {
	            var rs = MapTree.partition(map.comparer, f, map.tree);
	            return [FMap.from(map.comparer, rs[0]), FMap.from(map.comparer, rs[1])];
	        };
	
	        FMap.findKey = function findKey(f, map) {
	            return Seq.pick(function (kv) {
	                return f(kv[0], kv[1]) ? kv[0] : null;
	            }, map);
	        };
	
	        FMap.tryFindKey = function tryFindKey(f, map) {
	            return Seq.tryPick(function (kv) {
	                return f(kv[0], kv[1]) ? kv[0] : null;
	            }, map);
	        };
	
	        FMap.pick = function pick(f, map) {
	            var res = FMap.tryPick(f, map);
	            if (res != null) return res;
	            throw "key not found";
	        };
	
	        FMap.tryPick = function tryPick(f, map) {
	            return MapTree.tryPick(f, map.tree);
	        };
	
	        _createClass(FMap, [{
	            key: "size",
	            get: function get() {
	                return MapTree.size(this.tree);
	            }
	        }]);
	
	        return FMap;
	    }();
	
	    Util.setInterfaces(FMap.prototype, ["System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Collections.FSharpMap");
	    exports.Map = FMap;
	    var Nothing = exports.Nothing = void 0;
	    var maxTrampolineCallCount = 2000;
	
	    var Trampoline = exports.Trampoline = function () {
	        function Trampoline() {
	            _classCallCheck(this, Trampoline);
	
	            this.callCount = 0;
	        }
	
	        Trampoline.prototype.incrementAndCheck = function incrementAndCheck() {
	            return this.callCount++ > maxTrampolineCallCount;
	        };
	
	        Trampoline.prototype.hijack = function hijack(f) {
	            this.callCount = 0;
	            setTimeout(f, 0);
	        };
	
	        return Trampoline;
	    }();
	
	    var AsyncImpl = {
	        protectedCont: function protectedCont(f) {
	            return function (ctx) {
	                if (ctx.cancelToken.isCancelled) ctx.onCancel("cancelled");else if (ctx.trampoline.incrementAndCheck()) ctx.trampoline.hijack(function () {
	                    try {
	                        f(ctx);
	                    } catch (err) {
	                        ctx.onError(err);
	                    }
	                });else try {
	                    f(ctx);
	                } catch (err) {
	                    ctx.onError(err);
	                }
	            };
	        },
	        bind: function bind(computation, binder) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                computation({
	                    onSuccess: function onSuccess(x) {
	                        return binder(x)(ctx);
	                    },
	                    onError: ctx.onError,
	                    onCancel: ctx.onCancel,
	                    cancelToken: ctx.cancelToken,
	                    trampoline: ctx.trampoline
	                });
	            });
	        },
	        return: function _return(value) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                return ctx.onSuccess(value);
	            });
	        }
	    };
	
	    var AsyncBuilder = exports.AsyncBuilder = function () {
	        function AsyncBuilder() {
	            _classCallCheck(this, AsyncBuilder);
	        }
	
	        AsyncBuilder.prototype.Bind = function Bind(computation, binder) {
	            return AsyncImpl.bind(computation, binder);
	        };
	
	        AsyncBuilder.prototype.Combine = function Combine(computation1, computation2) {
	            return this.Bind(computation1, function () {
	                return computation2;
	            });
	        };
	
	        AsyncBuilder.prototype.Delay = function Delay(generator) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                return generator()(ctx);
	            });
	        };
	
	        AsyncBuilder.prototype.For = function For(sequence, body) {
	            var iter = sequence[Symbol.iterator]();
	            var cur = iter.next();
	            return this.While(function () {
	                return !cur.done;
	            }, this.Delay(function () {
	                var res = body(cur.value);
	                cur = iter.next();
	                return res;
	            }));
	        };
	
	        AsyncBuilder.prototype.Return = function Return(value) {
	            return AsyncImpl.return(value);
	        };
	
	        AsyncBuilder.prototype.ReturnFrom = function ReturnFrom(computation) {
	            return computation;
	        };
	
	        AsyncBuilder.prototype.TryFinally = function TryFinally(computation, compensation) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                computation({
	                    onSuccess: function onSuccess(x) {
	                        compensation();
	                        ctx.onSuccess(x);
	                    },
	                    onError: function onError(x) {
	                        compensation();
	                        ctx.onError(x);
	                    },
	                    onCancel: function onCancel(x) {
	                        compensation();
	                        ctx.onCancel(x);
	                    },
	                    cancelToken: ctx.cancelToken,
	                    trampoline: ctx.trampoline
	                });
	            });
	        };
	
	        AsyncBuilder.prototype.TryWith = function TryWith(computation, catchHandler) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                computation({
	                    onSuccess: ctx.onSuccess,
	                    onCancel: ctx.onCancel,
	                    cancelToken: ctx.cancelToken,
	                    trampoline: ctx.trampoline,
	                    onError: function onError(ex) {
	                        try {
	                            catchHandler(ex)(ctx);
	                        } catch (ex2) {
	                            ctx.onError(ex2);
	                        }
	                    }
	                });
	            });
	        };
	
	        AsyncBuilder.prototype.Using = function Using(resource, binder) {
	            return this.TryFinally(binder(resource), function () {
	                return resource.Dispose();
	            });
	        };
	
	        AsyncBuilder.prototype.While = function While(guard, computation) {
	            var _this5 = this;
	
	            if (guard()) return this.Bind(computation, function () {
	                return _this5.While(guard, computation);
	            });else return this.Return(Nothing);
	        };
	
	        AsyncBuilder.prototype.Zero = function Zero() {
	            return AsyncImpl.protectedCont(function (ctx) {
	                return ctx.onSuccess(Nothing);
	            });
	        };
	
	        return AsyncBuilder;
	    }();
	
	    AsyncBuilder.singleton = new AsyncBuilder();
	
	    var Async = exports.Async = function () {
	        function Async() {
	            _classCallCheck(this, Async);
	        }
	
	        Async.awaitPromise = function awaitPromise(p) {
	            return Async.fromContinuations(function (conts) {
	                return p.then(conts[0]).catch(function (err) {
	                    return (err == "cancelled" ? conts[2] : conts[1])(err);
	                });
	            });
	        };
	
	        Async.catch = function _catch(work) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                work({
	                    onSuccess: function onSuccess(x) {
	                        return ctx.onSuccess(Choice.Choice1Of2(x));
	                    },
	                    onError: function onError(ex) {
	                        return ctx.onSuccess(Choice.Choice2Of2(ex));
	                    },
	                    onCancel: ctx.onCancel,
	                    cancelToken: ctx.cancelToken,
	                    trampoline: ctx.trampoline
	                });
	            });
	        };
	
	        Async.fromContinuations = function fromContinuations(f) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                return f([ctx.onSuccess, ctx.onError, ctx.onCancel]);
	            });
	        };
	
	        Async.ignore = function ignore(computation) {
	            return AsyncImpl.bind(computation, function (x) {
	                return AsyncImpl.return(Nothing);
	            });
	        };
	
	        Async.parallel = function parallel(computations) {
	            return Async.awaitPromise(Promise.all(Seq.map(function (w) {
	                return Async.startAsPromise(w);
	            }, computations)));
	        };
	
	        Async.sleep = function sleep(millisecondsDueTime) {
	            return AsyncImpl.protectedCont(function (ctx) {
	                setTimeout(function () {
	                    return ctx.cancelToken.isCancelled ? ctx.onCancel("cancelled") : ctx.onSuccess(Nothing);
	                }, millisecondsDueTime);
	            });
	        };
	
	        Async.start = function start(computation, cancellationToken) {
	            return Async.startWithContinuations(computation, cancellationToken);
	        };
	
	        Async.emptyContinuation = function emptyContinuation(x) {
	            // NOP
	        };
	
	        Async.startWithContinuations = function startWithContinuations(computation, continuation, exceptionContinuation, cancellationContinuation, cancelToken) {
	            if (typeof continuation !== "function") {
	                cancelToken = continuation;
	                continuation = null;
	            }
	            var trampoline = new Trampoline();
	            computation({
	                onSuccess: continuation ? continuation : Async.emptyContinuation,
	                onError: exceptionContinuation ? exceptionContinuation : Async.emptyContinuation,
	                onCancel: cancellationContinuation ? cancellationContinuation : Async.emptyContinuation,
	                cancelToken: cancelToken ? cancelToken : Async.defaultCancellationToken,
	                trampoline: trampoline
	            });
	        };
	
	        Async.startAsPromise = function startAsPromise(computation, cancellationToken) {
	            return new Promise(function (resolve, reject) {
	                return Async.startWithContinuations(computation, resolve, reject, reject, cancellationToken ? cancellationToken : Async.defaultCancellationToken);
	            });
	        };
	
	        _createClass(Async, null, [{
	            key: "cancellationToken",
	            get: function get() {
	                return AsyncImpl.protectedCont(function (ctx) {
	                    return ctx.onSuccess(ctx.cancelToken);
	                });
	            }
	        }]);
	
	        return Async;
	    }();
	
	    Async.defaultCancellationToken = {
	        isCancelled: false
	    };
	    Async.startImmediate = Async.start;
	
	    var QueueCell = function QueueCell(message) {
	        _classCallCheck(this, QueueCell);
	
	        this.value = message;
	    };
	
	    var MailboxQueue = function () {
	        function MailboxQueue() {
	            _classCallCheck(this, MailboxQueue);
	        }
	
	        MailboxQueue.prototype.add = function add(message) {
	            var itCell = new QueueCell(message);
	            if (this.firstAndLast) {
	                this.firstAndLast[1].next = itCell;
	                this.firstAndLast = [this.firstAndLast[0], itCell];
	            } else this.firstAndLast = [itCell, itCell];
	        };
	
	        MailboxQueue.prototype.tryGet = function tryGet() {
	            if (this.firstAndLast) {
	                var value = this.firstAndLast[0].value;
	                if (this.firstAndLast[0].next) this.firstAndLast = [this.firstAndLast[0].next, this.firstAndLast[1]];else delete this.firstAndLast;
	                return value;
	            }
	            return void 0;
	        };
	
	        return MailboxQueue;
	    }();
	
	    var MailboxProcessor = exports.MailboxProcessor = function () {
	        function MailboxProcessor(body, cancellationToken) {
	            _classCallCheck(this, MailboxProcessor);
	
	            this.body = body;
	            this.cancellationToken = cancellationToken || Async.defaultCancellationToken;
	            this.messages = new MailboxQueue();
	        }
	
	        MailboxProcessor.start = function start(body, cancellationToken) {
	            var mbox = new MailboxProcessor(body, cancellationToken);
	            mbox.start();
	            return mbox;
	        };
	
	        MailboxProcessor.prototype.__processEvents = function __processEvents() {
	            if (this.continuation) {
	                var value = this.messages.tryGet();
	                if (value) {
	                    var cont = this.continuation;
	                    delete this.continuation;
	                    cont(value);
	                }
	            }
	        };
	
	        MailboxProcessor.prototype.start = function start() {
	            Async.startImmediate(this.body(this), this.cancellationToken);
	        };
	
	        MailboxProcessor.prototype.receive = function receive() {
	            var _this6 = this;
	
	            return Async.fromContinuations(function (conts) {
	                if (_this6.continuation) throw "Receive can only be called once!";
	                _this6.continuation = conts[0];
	                _this6.__processEvents();
	            });
	        };
	
	        MailboxProcessor.prototype.post = function post(message) {
	            this.messages.add(message);
	            this.__processEvents();
	        };
	
	        MailboxProcessor.prototype.postAndAsyncReply = function postAndAsyncReply(buildMessage) {
	            var result = void 0;
	            var continuation = void 0;
	            function checkCompletion() {
	                if (result && continuation) continuation(result);
	            }
	            var reply = {
	                reply: function reply(res) {
	                    result = res;
	                    checkCompletion();
	                }
	            };
	            this.messages.add(buildMessage(reply));
	            this.__processEvents();
	            return Async.fromContinuations(function (conts) {
	                continuation = conts[0];
	                checkCompletion();
	            });
	        };
	
	        return MailboxProcessor;
	    }();
	
	    var Observer = function Observer(onNext, onError, onCompleted) {
	        _classCallCheck(this, Observer);
	
	        this.OnNext = onNext;
	        this.OnError = onError || function (e) {};
	        this.OnCompleted = onCompleted || function () {};
	    };
	
	    Util.setInterfaces(Observer.prototype, ["System.IObserver"]);
	
	    var Observable = function Observable(subscribe) {
	        _classCallCheck(this, Observable);
	
	        this.Subscribe = subscribe;
	    };
	
	    Util.setInterfaces(Observable.prototype, ["System.IObservable"]);
	
	    var FObservable = function () {
	        function FObservable() {
	            _classCallCheck(this, FObservable);
	        }
	
	        FObservable.__protect = function __protect(f, succeed, fail) {
	            try {
	                return succeed(f());
	            } catch (e) {
	                fail(e);
	            }
	        };
	
	        FObservable.add = function add(callback, source) {
	            source.Subscribe(new Observer(callback));
	        };
	
	        FObservable.choose = function choose(chooser, source) {
	            return new Observable(function (observer) {
	                return source.Subscribe(new Observer(function (t) {
	                    return FObservable.__protect(function () {
	                        return chooser(t);
	                    }, function (u) {
	                        if (u != null) observer.OnNext(u);
	                    }, observer.OnError);
	                }, observer.OnError, observer.OnCompleted));
	            });
	        };
	
	        FObservable.filter = function filter(predicate, source) {
	            return FObservable.choose(function (x) {
	                return predicate(x) ? x : null;
	            }, source);
	        };
	
	        FObservable.map = function map(mapping, source) {
	            return new Observable(function (observer) {
	                return source.Subscribe(new Observer(function (t) {
	                    FObservable.__protect(function () {
	                        return mapping(t);
	                    }, observer.OnNext, observer.OnError);
	                }, observer.OnError, observer.OnCompleted));
	            });
	        };
	
	        FObservable.merge = function merge(source1, source2) {
	            return new Observable(function (observer) {
	                var stopped = false,
	                    completed1 = false,
	                    completed2 = false;
	                var h1 = source1.Subscribe(new Observer(function (v) {
	                    if (!stopped) observer.OnNext(v);
	                }, function (e) {
	                    if (!stopped) {
	                        stopped = true;
	                        observer.OnError(e);
	                    }
	                }, function () {
	                    if (!stopped) {
	                        completed1 = true;
	                        if (completed2) {
	                            stopped = true;
	                            observer.OnCompleted();
	                        }
	                    }
	                }));
	                var h2 = source2.Subscribe(new Observer(function (v) {
	                    if (!stopped) {
	                        observer.OnNext(v);
	                    }
	                }, function (e) {
	                    if (!stopped) {
	                        stopped = true;
	                        observer.OnError(e);
	                    }
	                }, function () {
	                    if (!stopped) {
	                        completed2 = true;
	                        if (completed1) {
	                            stopped = true;
	                            observer.OnCompleted();
	                        }
	                    }
	                }));
	                return Util.createDisposable(function () {
	                    h1.Dispose();
	                    h2.Dispose();
	                });
	            });
	        };
	
	        FObservable.pairwise = function pairwise(source) {
	            return new Observable(function (observer) {
	                var last = null;
	                return source.Subscribe(new Observer(function (next) {
	                    if (last != null) observer.OnNext([last, next]);
	                    last = next;
	                }, observer.OnError, observer.OnCompleted));
	            });
	        };
	
	        FObservable.partition = function partition(predicate, source) {
	            return Tuple(FObservable.filter(predicate, source), FObservable.filter(function (x) {
	                return !predicate(x);
	            }, source));
	        };
	
	        FObservable.scan = function scan(collector, state, source) {
	            return new Observable(function (observer) {
	                return source.Subscribe(new Observer(function (t) {
	                    FObservable.__protect(function () {
	                        return collector(state, t);
	                    }, function (u) {
	                        state = u;observer.OnNext(u);
	                    }, observer.OnError);
	                }, observer.OnError, observer.OnCompleted));
	            });
	        };
	
	        FObservable.split = function split(splitter, source) {
	            return Tuple(FObservable.choose(function (v) {
	                return splitter(v).valueIfChoice1;
	            }, source), FObservable.choose(function (v) {
	                return splitter(v).valueIfChoice2;
	            }, source));
	        };
	
	        FObservable.subscribe = function subscribe(callback, source) {
	            return source.Subscribe(new Observer(callback));
	        };
	
	        return FObservable;
	    }();
	
	    exports.Observable = FObservable;
	
	    var Event = exports.Event = function () {
	        function Event(_subscriber, delegates) {
	            _classCallCheck(this, Event);
	
	            this._subscriber = _subscriber;
	            this.delegates = delegates || new Array();
	        }
	
	        Event.prototype.Add = function Add(f) {
	            this._addHandler(f);
	        };
	        // IEvent<T> methods
	
	
	        Event.prototype.Trigger = function Trigger(value) {
	            Seq.iterate(function (f) {
	                return f(value);
	            }, this.delegates);
	        };
	        // IDelegateEvent<T> methods
	
	
	        Event.prototype._addHandler = function _addHandler(f) {
	            this.delegates.push(f);
	        };
	
	        Event.prototype._removeHandler = function _removeHandler(f) {
	            var index = this.delegates.findIndex(function (el) {
	                return "" + el == "" + f;
	            }); // Special dedication to Chet Husk.
	            if (index > -1) this.delegates.splice(index, 1);
	        };
	
	        Event.prototype.AddHandler = function AddHandler(handler) {
	            this._addHandler(function (x) {
	                return handler(undefined, x);
	            });
	        };
	
	        Event.prototype.RemoveHandler = function RemoveHandler(handler) {
	            this._removeHandler(function (x) {
	                return handler(undefined, x);
	            });
	        };
	        // IObservable<T> methods
	
	
	        Event.prototype._subscribeFromObserver = function _subscribeFromObserver(observer) {
	            var _this7 = this;
	
	            if (this._subscriber) return this._subscriber(observer);
	            var callback = observer.OnNext;
	            this._addHandler(callback);
	            return Util.createDisposable(function () {
	                return _this7._removeHandler(callback);
	            });
	        };
	
	        Event.prototype._subscribeFromCallback = function _subscribeFromCallback(callback) {
	            var _this8 = this;
	
	            this._addHandler(callback);
	            return Util.createDisposable(function () {
	                return _this8._removeHandler(callback);
	            });
	        };
	
	        Event.prototype.Subscribe = function Subscribe(arg) {
	            return typeof arg == "function" ? this._subscribeFromCallback(arg) : this._subscribeFromObserver(arg);
	        };
	
	        Event.add = function add(callback, sourceEvent) {
	            sourceEvent.Subscribe(new Observer(callback));
	        };
	
	        Event.choose = function choose(chooser, sourceEvent) {
	            var source = sourceEvent;
	            return new Event(function (observer) {
	                return source.Subscribe(new Observer(function (t) {
	                    return FObservable.__protect(function () {
	                        return chooser(t);
	                    }, function (u) {
	                        if (u != null) observer.OnNext(u);
	                    }, observer.OnError);
	                }, observer.OnError, observer.OnCompleted));
	            }, source.delegates);
	        };
	
	        Event.filter = function filter(predicate, sourceEvent) {
	            return Event.choose(function (x) {
	                return predicate(x) ? x : null;
	            }, sourceEvent);
	        };
	
	        Event.map = function map(mapping, sourceEvent) {
	            var source = sourceEvent;
	            return new Event(function (observer) {
	                return source.Subscribe(new Observer(function (t) {
	                    return FObservable.__protect(function () {
	                        return mapping(t);
	                    }, observer.OnNext, observer.OnError);
	                }, observer.OnError, observer.OnCompleted));
	            }, source.delegates);
	        };
	
	        Event.merge = function merge(event1, event2) {
	            var source1 = event1;
	            var source2 = event2;
	            return new Event(function (observer) {
	                var stopped = false,
	                    completed1 = false,
	                    completed2 = false;
	                var h1 = source1.Subscribe(new Observer(function (v) {
	                    if (!stopped) observer.OnNext(v);
	                }, function (e) {
	                    if (!stopped) {
	                        stopped = true;
	                        observer.OnError(e);
	                    }
	                }, function () {
	                    if (!stopped) {
	                        completed1 = true;
	                        if (completed2) {
	                            stopped = true;
	                            observer.OnCompleted();
	                        }
	                    }
	                }));
	                var h2 = source2.Subscribe(new Observer(function (v) {
	                    if (!stopped) observer.OnNext(v);
	                }, function (e) {
	                    if (!stopped) {
	                        stopped = true;
	                        observer.OnError(e);
	                    }
	                }, function () {
	                    if (!stopped) {
	                        completed2 = true;
	                        if (completed1) {
	                            stopped = true;
	                            observer.OnCompleted();
	                        }
	                    }
	                }));
	                return Util.createDisposable(function () {
	                    h1.Dispose();
	                    h2.Dispose();
	                });
	            }, source1.delegates.concat(source2.delegates));
	        };
	
	        Event.pairwise = function pairwise(sourceEvent) {
	            var source = sourceEvent;
	            return new Event(function (observer) {
	                var last = null;
	                return source.Subscribe(new Observer(function (next) {
	                    if (last != null) observer.OnNext([last, next]);
	                    last = next;
	                }, observer.OnError, observer.OnCompleted));
	            }, source.delegates);
	        };
	
	        Event.partition = function partition(predicate, sourceEvent) {
	            return Tuple(Event.filter(predicate, sourceEvent), Event.filter(function (x) {
	                return !predicate(x);
	            }, sourceEvent));
	        };
	
	        Event.scan = function scan(collector, state, sourceEvent) {
	            var source = sourceEvent;
	            return new Event(function (observer) {
	                return source.Subscribe(new Observer(function (t) {
	                    FObservable.__protect(function () {
	                        return collector(state, t);
	                    }, function (u) {
	                        state = u;observer.OnNext(u);
	                    }, observer.OnError);
	                }, observer.OnError, observer.OnCompleted));
	            }, source.delegates);
	        };
	
	        Event.split = function split(splitter, sourceEvent) {
	            return Tuple(Event.choose(function (v) {
	                return splitter(v).valueIfChoice1;
	            }, sourceEvent), Event.choose(function (v) {
	                return splitter(v).valueIfChoice2;
	            }, sourceEvent));
	        };
	
	        _createClass(Event, [{
	            key: "Publish",
	            get: function get() {
	                return this;
	            }
	        }]);
	
	        return Event;
	    }();
	
	    var Lazy = exports.Lazy = function () {
	        function Lazy(factory) {
	            _classCallCheck(this, Lazy);
	
	            this.factory = factory;
	            this.isValueCreated = false;
	        }
	
	        Lazy.createFromValue = function createFromValue(v) {
	            return new Lazy(function () {
	                return v;
	            });
	        };
	
	        _createClass(Lazy, [{
	            key: "value",
	            get: function get() {
	                if (!this.isValueCreated) {
	                    this.createdValue = this.factory();
	                    this.isValueCreated = true;
	                }
	                return this.createdValue;
	            }
	        }]);
	
	        return Lazy;
	    }();
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.OptionUtils = exports.EitherUtils = exports.EitherModule = exports.Either = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Either = exports.Either = function () {
	  function Either(caseName, fields) {
	    _classCallCheck(this, Either);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  Either.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  Either.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  return Either;
	}();
	
	_fableCore.Util.setInterfaces(Either.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.Either");
	
	var EitherModule = exports.EitherModule = function ($exports) {
	  var succeed = $exports.succeed = function succeed(v) {
	    return new Either("Right", [v]);
	  };
	
	  var fail = $exports.fail = function fail(v) {
	    return new Either("Left", [v]);
	  };
	
	  var isFail = $exports.isFail = function isFail(_arg1) {
	    return _arg1.Case === "Left" ? true : false;
	  };
	
	  var isSuccess = $exports.isSuccess = function isSuccess(_arg1) {
	    return _arg1.Case === "Right" ? true : false;
	  };
	
	  var get = $exports.get = function get(_arg1) {
	    return _arg1.Case === "Left" ? _fableCore.String.fsFormat("Either: cannot get result from failure: %A")(function (x) {
	      throw x;
	    })(_arg1.Fields[0]) : _arg1.Fields[0];
	  };
	
	  var error = $exports.error = function error(_arg1) {
	    return _arg1.Case === "Right" ? function () {
	      throw "Either: cannot get error from regular result";
	    }() : _arg1.Fields[0];
	  };
	
	  return $exports;
	}({});
	
	var EitherUtils = exports.EitherUtils = function ($exports) {
	  var EitherBuilder = $exports.EitherBuilder = function () {
	    function EitherBuilder() {
	      _classCallCheck(this, EitherBuilder);
	    }
	
	    EitherBuilder.prototype.Return = function Return(v) {
	      return new Either("Right", [v]);
	    };
	
	    EitherBuilder.prototype.ReturnFrom = function ReturnFrom(v) {
	      return v;
	    };
	
	    EitherBuilder.prototype.Zero = function Zero() {
	      return new Either("Right", [null]);
	    };
	
	    EitherBuilder.prototype.Delay = function Delay(f) {
	      return function () {
	        return f();
	      };
	    };
	
	    EitherBuilder.prototype.Run = function Run(f) {
	      return f();
	    };
	
	    EitherBuilder.prototype.While = function While(guard, body) {
	      var _this = this;
	
	      return guard() ? function () {
	        var cont = function cont() {
	          return _this.While(guard, body);
	        };
	
	        if (body().Case === "Left") {
	          return new Either("Left", [body().Fields[0]]);
	        } else {
	          return cont();
	        }
	      }() : this.Zero();
	    };
	
	    EitherBuilder.prototype.Combine = function Combine(a, b) {
	      return a.Case === "Left" ? b : a;
	    };
	
	    EitherBuilder.prototype.TryWith = function TryWith(body, handler) {
	      var _this2 = this;
	
	      try {
	        return function (arg00) {
	          return _this2.ReturnFrom(arg00);
	        }(body());
	      } catch (e) {
	        return handler(e);
	      }
	    };
	
	    return EitherBuilder;
	  }();
	
	  _fableCore.Util.setInterfaces(EitherBuilder.prototype, [], "Iris.Core.EitherUtils.EitherBuilder");
	
	  var either = $exports.either = new EitherBuilder();
	  return $exports;
	}({});
	
	var OptionUtils = exports.OptionUtils = function ($exports) {
	  var MaybeBuilder = $exports.MaybeBuilder = function () {
	    function MaybeBuilder() {
	      _classCallCheck(this, MaybeBuilder);
	    }
	
	    MaybeBuilder.prototype.Return = function Return(v) {
	      return v;
	    };
	
	    MaybeBuilder.prototype.ReturnFrom = function ReturnFrom(v) {
	      return v;
	    };
	
	    MaybeBuilder.prototype.Bind = function Bind(m, f) {
	      var $var1 = m;
	
	      if ($var1 != null) {
	        return f($var1);
	      } else {
	        return $var1;
	      }
	    };
	
	    MaybeBuilder.prototype.Zero = function Zero() {
	      return null;
	    };
	
	    MaybeBuilder.prototype.Delay = function Delay(f) {
	      return function () {
	        return f();
	      };
	    };
	
	    MaybeBuilder.prototype.Run = function Run(f) {
	      return f();
	    };
	
	    return MaybeBuilder;
	  }();
	
	  _fableCore.Util.setInterfaces(MaybeBuilder.prototype, [], "Iris.Core.OptionUtils.MaybeBuilder");
	
	  var maybe = $exports.maybe = new MaybeBuilder();
	  return $exports;
	}({});


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.Error = exports.IrisError = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _buffers = __webpack_require__(8);
	
	var _Either = __webpack_require__(6);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var IrisError = exports.IrisError = function () {
	  function IrisError(caseName, fields) {
	    _classCallCheck(this, IrisError);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  IrisError.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  IrisError.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  IrisError.FromFB = function FromFB(fb) {
	    var matchValue = fb.Type();
	
	    if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.OKFB) {
	      return new _Either.Either("Right", [new IrisError("OK", [])]);
	    } else {
	      if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.BranchNotFoundFB) {
	        return new _Either.Either("Right", [new IrisError("BranchNotFound", [fb.Message()])]);
	      } else {
	        if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.BranchDetailsNotFoundFB) {
	          return new _Either.Either("Right", [new IrisError("BranchDetailsNotFound", [fb.Message()])]);
	        } else {
	          if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.RepositoryNotFoundFB) {
	            return new _Either.Either("Right", [new IrisError("RepositoryNotFound", [fb.Message()])]);
	          } else {
	            if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.RepositoryInitFailedFB) {
	              return new _Either.Either("Right", [new IrisError("RepositoryInitFailed", [fb.Message()])]);
	            } else {
	              if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.CommitErrorFB) {
	                return new _Either.Either("Right", [new IrisError("CommitError", [fb.Message()])]);
	              } else {
	                if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.GitErrorFB) {
	                  return new _Either.Either("Right", [new IrisError("GitError", [fb.Message()])]);
	                } else {
	                  if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectNotFoundFB) {
	                    return new _Either.Either("Right", [new IrisError("ProjectNotFound", [fb.Message()])]);
	                  } else {
	                    if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectParseErrorFB) {
	                      return new _Either.Either("Right", [new IrisError("ProjectParseError", [fb.Message()])]);
	                    } else {
	                      if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectPathErrorFB) {
	                        return new _Either.Either("Right", [new IrisError("ProjectPathError", [])]);
	                      } else {
	                        if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectSaveErrorFB) {
	                          return new _Either.Either("Right", [new IrisError("ProjectSaveError", [fb.Message()])]);
	                        } else {
	                          if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectInitErrorFB) {
	                            return new _Either.Either("Right", [new IrisError("ProjectInitError", [fb.Message()])]);
	                          } else {
	                            if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.MetaDataNotFoundFB) {
	                              return new _Either.Either("Right", [new IrisError("MetaDataNotFound", [])]);
	                            } else {
	                              if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.MissingStartupDirFB) {
	                                return new _Either.Either("Right", [new IrisError("MissingStartupDir", [])]);
	                              } else {
	                                if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.CliParseErrorFB) {
	                                  return new _Either.Either("Right", [new IrisError("CliParseError", [])]);
	                                } else {
	                                  if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.MissingNodeIdFB) {
	                                    return new _Either.Either("Right", [new IrisError("MissingNodeId", [])]);
	                                  } else {
	                                    if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.MissingNodeFB) {
	                                      return new _Either.Either("Right", [new IrisError("MissingNode", [fb.Message()])]);
	                                    } else {
	                                      if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetNotFoundErrorFB) {
	                                        return new _Either.Either("Right", [new IrisError("AssetNotFoundError", [fb.Message()])]);
	                                      } else {
	                                        if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetLoadErrorFB) {
	                                          return new _Either.Either("Right", [new IrisError("AssetLoadError", [fb.Message()])]);
	                                        } else {
	                                          if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetSaveErrorFB) {
	                                            return new _Either.Either("Right", [new IrisError("AssetSaveError", [fb.Message()])]);
	                                          } else {
	                                            if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetDeleteErrorFB) {
	                                              return new _Either.Either("Right", [new IrisError("AssetDeleteError", [fb.Message()])]);
	                                            } else {
	                                              if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.OtherFB) {
	                                                return new _Either.Either("Right", [new IrisError("Other", [fb.Message()])]);
	                                              } else {
	                                                if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.AlreadyVotedFB) {
	                                                  return new _Either.Either("Right", [new IrisError("AlreadyVoted", [])]);
	                                                } else {
	                                                  if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.AppendEntryFailedFB) {
	                                                    return new _Either.Either("Right", [new IrisError("AppendEntryFailed", [])]);
	                                                  } else {
	                                                    if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.CandidateUnknownFB) {
	                                                      return new _Either.Either("Right", [new IrisError("CandidateUnknown", [])]);
	                                                    } else {
	                                                      if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.EntryInvalidatedFB) {
	                                                        return new _Either.Either("Right", [new IrisError("EntryInvalidated", [])]);
	                                                      } else {
	                                                        if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidCurrentIndexFB) {
	                                                          return new _Either.Either("Right", [new IrisError("InvalidCurrentIndex", [])]);
	                                                        } else {
	                                                          if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidLastLogFB) {
	                                                            return new _Either.Either("Right", [new IrisError("InvalidLastLog", [])]);
	                                                          } else {
	                                                            if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidLastLogTermFB) {
	                                                              return new _Either.Either("Right", [new IrisError("InvalidLastLogTerm", [])]);
	                                                            } else {
	                                                              if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidTermFB) {
	                                                                return new _Either.Either("Right", [new IrisError("InvalidTerm", [])]);
	                                                              } else {
	                                                                if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.LogFormatErrorFB) {
	                                                                  return new _Either.Either("Right", [new IrisError("LogFormatError", [])]);
	                                                                } else {
	                                                                  if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.LogIncompleteFB) {
	                                                                    return new _Either.Either("Right", [new IrisError("LogIncomplete", [])]);
	                                                                  } else {
	                                                                    if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.NoErrorFB) {
	                                                                      return new _Either.Either("Right", [new IrisError("NoError", [])]);
	                                                                    } else {
	                                                                      if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.NoNodeFB) {
	                                                                        return new _Either.Either("Right", [new IrisError("NoNode", [])]);
	                                                                      } else {
	                                                                        if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.NotCandidateFB) {
	                                                                          return new _Either.Either("Right", [new IrisError("NotCandidate", [])]);
	                                                                        } else {
	                                                                          if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.NotLeaderFB) {
	                                                                            return new _Either.Either("Right", [new IrisError("NotLeader", [])]);
	                                                                          } else {
	                                                                            if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.NotVotingStateFB) {
	                                                                              return new _Either.Either("Right", [new IrisError("NotVotingState", [])]);
	                                                                            } else {
	                                                                              if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.ResponseTimeoutFB) {
	                                                                                return new _Either.Either("Right", [new IrisError("ResponseTimeout", [])]);
	                                                                              } else {
	                                                                                if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.SnapshotFormatErrorFB) {
	                                                                                  return new _Either.Either("Right", [new IrisError("SnapshotFormatError", [])]);
	                                                                                } else {
	                                                                                  if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.StaleResponseFB) {
	                                                                                    return new _Either.Either("Right", [new IrisError("StaleResponse", [])]);
	                                                                                  } else {
	                                                                                    if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.UnexpectedVotingChangeFB) {
	                                                                                      return new _Either.Either("Right", [new IrisError("UnexpectedVotingChange", [])]);
	                                                                                    } else {
	                                                                                      if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.VoteTermMismatchFB) {
	                                                                                        return new _Either.Either("Right", [new IrisError("VoteTermMismatch", [])]);
	                                                                                      } else {
	                                                                                        if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.ParseErrorFB) {
	                                                                                          return new _Either.Either("Right", [new IrisError("ParseError", [fb.Message()])]);
	                                                                                        } else {
	                                                                                          if (matchValue === _buffers.Iris.Serialization.Raft.ErrorTypeFB.SocketErrorFB) {
	                                                                                            return new _Either.Either("Right", [new IrisError("SocketError", [fb.Message()])]);
	                                                                                          } else {
	                                                                                            return _Either.EitherModule.fail(new IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse unknown ErrotTypeFB: %A")(function (x) {
	                                                                                              return x;
	                                                                                            })(matchValue)]));
	                                                                                          }
	                                                                                        }
	                                                                                      }
	                                                                                    }
	                                                                                  }
	                                                                                }
	                                                                              }
	                                                                            }
	                                                                          }
	                                                                        }
	                                                                      }
	                                                                    }
	                                                                  }
	                                                                }
	                                                              }
	                                                            }
	                                                          }
	                                                        }
	                                                      }
	                                                    }
	                                                  }
	                                                }
	                                              }
	                                            }
	                                          }
	                                        }
	                                      }
	                                    }
	                                  }
	                                }
	                              }
	                            }
	                          }
	                        }
	                      }
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  IrisError.prototype.ToOffset = function ToOffset(builder) {
	    var tipe = this.Case === "BranchNotFound" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.BranchNotFoundFB : this.Case === "BranchDetailsNotFound" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.BranchDetailsNotFoundFB : this.Case === "RepositoryNotFound" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.RepositoryNotFoundFB : this.Case === "RepositoryInitFailed" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.RepositoryInitFailedFB : this.Case === "CommitError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.CommitErrorFB : this.Case === "GitError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.GitErrorFB : this.Case === "ProjectNotFound" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectNotFoundFB : this.Case === "ProjectParseError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectParseErrorFB : this.Case === "ProjectPathError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectPathErrorFB : this.Case === "ProjectSaveError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectSaveErrorFB : this.Case === "ProjectInitError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.ProjectInitErrorFB : this.Case === "MetaDataNotFound" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.MetaDataNotFoundFB : this.Case === "MissingStartupDir" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.MissingStartupDirFB : this.Case === "CliParseError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.CliParseErrorFB : this.Case === "MissingNodeId" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.MissingNodeIdFB : this.Case === "MissingNode" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.MissingNodeFB : this.Case === "AssetNotFoundError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetNotFoundErrorFB : this.Case === "AssetLoadError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetLoadErrorFB : this.Case === "AssetSaveError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetSaveErrorFB : this.Case === "AssetDeleteError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.AssetDeleteErrorFB : this.Case === "ParseError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.ParseErrorFB : this.Case === "SocketError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.SocketErrorFB : this.Case === "Other" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.OtherFB : this.Case === "AlreadyVoted" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.AlreadyVotedFB : this.Case === "AppendEntryFailed" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.AppendEntryFailedFB : this.Case === "CandidateUnknown" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.CandidateUnknownFB : this.Case === "EntryInvalidated" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.EntryInvalidatedFB : this.Case === "InvalidCurrentIndex" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidCurrentIndexFB : this.Case === "InvalidLastLog" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidLastLogFB : this.Case === "InvalidLastLogTerm" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidLastLogTermFB : this.Case === "InvalidTerm" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.InvalidTermFB : this.Case === "LogFormatError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.LogFormatErrorFB : this.Case === "LogIncomplete" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.LogIncompleteFB : this.Case === "NoError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.NoErrorFB : this.Case === "NoNode" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.NoNodeFB : this.Case === "NotCandidate" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.NotCandidateFB : this.Case === "NotLeader" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.NotLeaderFB : this.Case === "NotVotingState" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.NotVotingStateFB : this.Case === "ResponseTimeout" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.ResponseTimeoutFB : this.Case === "SnapshotFormatError" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.SnapshotFormatErrorFB : this.Case === "StaleResponse" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.StaleResponseFB : this.Case === "UnexpectedVotingChange" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.UnexpectedVotingChangeFB : this.Case === "VoteTermMismatch" ? _buffers.Iris.Serialization.Raft.ErrorTypeFB.VoteTermMismatchFB : _buffers.Iris.Serialization.Raft.ErrorTypeFB.OKFB;
	    var str = this.Case === "BranchNotFound" ? builder.createString(this.Fields[0]) : this.Case === "BranchDetailsNotFound" ? builder.createString(this.Fields[0]) : this.Case === "RepositoryNotFound" ? builder.createString(this.Fields[0]) : this.Case === "RepositoryInitFailed" ? builder.createString(this.Fields[0]) : this.Case === "CommitError" ? builder.createString(this.Fields[0]) : this.Case === "GitError" ? builder.createString(this.Fields[0]) : this.Case === "ProjectNotFound" ? builder.createString(this.Fields[0]) : this.Case === "ProjectParseError" ? builder.createString(this.Fields[0]) : this.Case === "ProjectSaveError" ? builder.createString(this.Fields[0]) : this.Case === "ProjectInitError" ? builder.createString(this.Fields[0]) : this.Case === "MissingNode" ? builder.createString(this.Fields[0]) : this.Case === "AssetNotFoundError" ? builder.createString(this.Fields[0]) : this.Case === "AssetSaveError" ? builder.createString(this.Fields[0]) : this.Case === "AssetLoadError" ? builder.createString(this.Fields[0]) : this.Case === "AssetDeleteError" ? builder.createString(this.Fields[0]) : this.Case === "ParseError" ? builder.createString(this.Fields[0]) : this.Case === "SocketError" ? builder.createString(this.Fields[0]) : this.Case === "Other" ? builder.createString(this.Fields[0]) : null;
	
	    _buffers.Iris.Serialization.Raft.ErrorFB.startErrorFB(builder);
	
	    _buffers.Iris.Serialization.Raft.ErrorFB.addType(builder, tipe);
	
	    if (str != null) {
	      _buffers.Iris.Serialization.Raft.ErrorFB.addMessage(builder, str);
	    }
	
	    return _buffers.Iris.Serialization.Raft.ErrorFB.endErrorFB(builder);
	  };
	
	  IrisError.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  IrisError.FromBytes = function FromBytes(bytes) {
	    return IrisError.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ErrorFB.getRootAsErrorFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return IrisError;
	}();
	
	_fableCore.Util.setInterfaces(IrisError.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.IrisError");
	
	var Error = exports.Error = function ($exports) {
	  var _throw = $exports.throw = function _throw(error) {
	    return _fableCore.String.fsFormat("ERROR: %A")(function (x) {
	      throw x;
	    })(error);
	  };
	
	  return $exports;
	}({});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 8 */
/***/ function(module, exports) {

	// automatically generated by the FlatBuffers compiler, do not modify
	
	/**
	 * @const
	 * @namespace
	 */
	var Iris = Iris || {};
	
	/**
	 * @const
	 * @namespace
	 */
	Iris.Serialization = Iris.Serialization || {};
	
	/**
	 * @const
	 * @namespace
	 */
	Iris.Serialization.Raft = Iris.Serialization.Raft || {};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.BehaviorFB = {
	  ToggleFB: 0,
	  BangFB: 1
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.StringTypeFB = {
	  SimpleFB: 0,
	  MultiLineFB: 1,
	  FileNameFB: 2,
	  DirectoryFB: 3,
	  UrlFB: 4,
	  IPFB: 5
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.ColorSpaceTypeFB = {
	  NONE: 0,
	  RGBAValueFB: 1,
	  HSLAValueFB: 2
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.SliceTypeFB = {
	  NONE: 0,
	  StringSliceFB: 1,
	  IntSliceFB: 2,
	  FloatSliceFB: 3,
	  DoubleSliceFB: 4,
	  BoolSliceFB: 5,
	  ByteSliceFB: 6,
	  EnumSliceFB: 7,
	  ColorSliceFB: 8,
	  CompoundSliceFB: 9
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.IOBoxTypeFB = {
	  NONE: 0,
	  StringBoxFB: 1,
	  IntBoxFB: 2,
	  FloatBoxFB: 3,
	  DoubleBoxFB: 4,
	  BoolBoxFB: 5,
	  ByteBoxFB: 6,
	  EnumBoxFB: 7,
	  ColorBoxFB: 8,
	  CompoundBoxFB: 9
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.PayloadFB = {
	  NONE: 0,
	  CueFB: 1,
	  CueListFB: 2,
	  IOBoxFB: 3,
	  PatchFB: 4,
	  NodeFB: 5,
	  UserFB: 6,
	  SessionFB: 7,
	  LogMsgFB: 8,
	  StateFB: 9
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.ActionTypeFB = {
	  AddFB: 0,
	  UpdateFB: 1,
	  RemoveFB: 2,
	  LogMsgFB: 3,
	  DataSnapshotFB: 4,
	  UndoFB: 5,
	  RedoFB: 6,
	  ResetFB: 7,
	  SaveProjectFB: 8
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.ErrorTypeFB = {
	  BranchNotFoundFB: 0,
	  BranchDetailsNotFoundFB: 1,
	  RepositoryNotFoundFB: 2,
	  RepositoryInitFailedFB: 3,
	  CommitErrorFB: 4,
	  GitErrorFB: 5,
	  ProjectNotFoundFB: 6,
	  ProjectParseErrorFB: 7,
	  ProjectPathErrorFB: 8,
	  ProjectSaveErrorFB: 9,
	  ProjectInitErrorFB: 10,
	  MetaDataNotFoundFB: 11,
	  MissingStartupDirFB: 12,
	  CliParseErrorFB: 13,
	  MissingNodeIdFB: 14,
	  MissingNodeFB: 15,
	  AssetNotFoundErrorFB: 16,
	  AssetLoadErrorFB: 17,
	  AssetSaveErrorFB: 18,
	  AssetDeleteErrorFB: 19,
	  ParseErrorFB: 20,
	  SocketErrorFB: 21,
	  OKFB: 22,
	  AlreadyVotedFB: 23,
	  AppendEntryFailedFB: 24,
	  CandidateUnknownFB: 25,
	  EntryInvalidatedFB: 26,
	  InvalidCurrentIndexFB: 27,
	  InvalidLastLogFB: 28,
	  InvalidLastLogTermFB: 29,
	  InvalidTermFB: 30,
	  LogFormatErrorFB: 31,
	  LogIncompleteFB: 32,
	  NoErrorFB: 33,
	  NoNodeFB: 34,
	  NotCandidateFB: 35,
	  NotLeaderFB: 36,
	  NotVotingStateFB: 37,
	  ResponseTimeoutFB: 38,
	  SnapshotFormatErrorFB: 39,
	  StaleResponseFB: 40,
	  UnexpectedVotingChangeFB: 41,
	  VoteTermMismatchFB: 42,
	  OtherFB: 43
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.NodeStateFB = {
	  JoiningFB: 0,
	  RunningFB: 1,
	  FailedFB: 2
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.ConfigChangeTypeFB = {
	  NodeAdded: 0,
	  NodeRemoved: 1
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.LogTypeFB = {
	  NONE: 0,
	  ConfigurationFB: 1,
	  JointConsensusFB: 2,
	  LogEntryFB: 3,
	  SnapshotFB: 4
	};
	
	/**
	 * @enum
	 */
	Iris.Serialization.Raft.RaftMsgTypeFB = {
	  NONE: 0,
	  RequestVoteFB: 1,
	  RequestVoteResponseFB: 2,
	  RequestAppendEntriesFB: 3,
	  RequestAppendResponseFB: 4,
	  RequestInstallSnapshotFB: 5,
	  RequestSnapshotResponseFB: 6,
	  HandShakeFB: 7,
	  HandWaiveFB: 8,
	  RedirectFB: 9,
	  WelcomeFB: 10,
	  ArrivederciFB: 11,
	  ErrorResponseFB: 12,
	  EmptyResponseFB: 13
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.StringSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.StringSliceFB}
	 */
	Iris.Serialization.Raft.StringSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.StringSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.StringSliceFB}
	 */
	Iris.Serialization.Raft.StringSliceFB.getRootAsStringSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.StringSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StringSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.StringSliceFB.prototype.Value = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.StringSliceFB.startStringSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.StringSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ValueOffset
	 */
	Iris.Serialization.Raft.StringSliceFB.addValue = function(builder, ValueOffset) {
	  builder.addFieldOffset(1, ValueOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StringSliceFB.endStringSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.IntSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.IntSliceFB}
	 */
	Iris.Serialization.Raft.IntSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.IntSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.IntSliceFB}
	 */
	Iris.Serialization.Raft.IntSliceFB.getRootAsIntSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.IntSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.IntSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.IntSliceFB.prototype.Value = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.IntSliceFB.startIntSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.IntSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Value
	 */
	Iris.Serialization.Raft.IntSliceFB.addValue = function(builder, Value) {
	  builder.addFieldInt32(1, Value, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.IntSliceFB.endIntSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.FloatSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.FloatSliceFB}
	 */
	Iris.Serialization.Raft.FloatSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.FloatSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.FloatSliceFB}
	 */
	Iris.Serialization.Raft.FloatSliceFB.getRootAsFloatSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.FloatSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatSliceFB.prototype.Value = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.FloatSliceFB.startFloatSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.FloatSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Value
	 */
	Iris.Serialization.Raft.FloatSliceFB.addValue = function(builder, Value) {
	  builder.addFieldFloat32(1, Value, 0.0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.FloatSliceFB.endFloatSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.DoubleSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.DoubleSliceFB}
	 */
	Iris.Serialization.Raft.DoubleSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.DoubleSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.DoubleSliceFB}
	 */
	Iris.Serialization.Raft.DoubleSliceFB.getRootAsDoubleSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.DoubleSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleSliceFB.prototype.Value = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readFloat64(this.bb_pos + offset) : 0.0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.DoubleSliceFB.startDoubleSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.DoubleSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Value
	 */
	Iris.Serialization.Raft.DoubleSliceFB.addValue = function(builder, Value) {
	  builder.addFieldFloat64(1, Value, 0.0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.DoubleSliceFB.endDoubleSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.BoolSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.BoolSliceFB}
	 */
	Iris.Serialization.Raft.BoolSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.BoolSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.BoolSliceFB}
	 */
	Iris.Serialization.Raft.BoolSliceFB.getRootAsBoolSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.BoolSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.BoolSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {boolean}
	 */
	Iris.Serialization.Raft.BoolSliceFB.prototype.Value = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.BoolSliceFB.startBoolSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.BoolSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {boolean} Value
	 */
	Iris.Serialization.Raft.BoolSliceFB.addValue = function(builder, Value) {
	  builder.addFieldInt8(1, +Value, +false);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.BoolSliceFB.endBoolSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ByteSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ByteSliceFB}
	 */
	Iris.Serialization.Raft.ByteSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ByteSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.ByteSliceFB}
	 */
	Iris.Serialization.Raft.ByteSliceFB.getRootAsByteSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ByteSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ByteSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ByteSliceFB.prototype.Value = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ByteSliceFB.startByteSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.ByteSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ValueOffset
	 */
	Iris.Serialization.Raft.ByteSliceFB.addValue = function(builder, ValueOffset) {
	  builder.addFieldOffset(1, ValueOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ByteSliceFB.endByteSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.EnumPropertyFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.EnumPropertyFB}
	 */
	Iris.Serialization.Raft.EnumPropertyFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.EnumPropertyFB=} obj
	 * @returns {Iris.Serialization.Raft.EnumPropertyFB}
	 */
	Iris.Serialization.Raft.EnumPropertyFB.getRootAsEnumPropertyFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.EnumPropertyFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.EnumPropertyFB.prototype.Key = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.EnumPropertyFB.prototype.Value = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.EnumPropertyFB.startEnumPropertyFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} KeyOffset
	 */
	Iris.Serialization.Raft.EnumPropertyFB.addKey = function(builder, KeyOffset) {
	  builder.addFieldOffset(0, KeyOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ValueOffset
	 */
	Iris.Serialization.Raft.EnumPropertyFB.addValue = function(builder, ValueOffset) {
	  builder.addFieldOffset(1, ValueOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.EnumPropertyFB.endEnumPropertyFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.EnumSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.EnumSliceFB}
	 */
	Iris.Serialization.Raft.EnumSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.EnumSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.EnumSliceFB}
	 */
	Iris.Serialization.Raft.EnumSliceFB.getRootAsEnumSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.EnumSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.EnumSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.EnumPropertyFB=} obj
	 * @returns {Iris.Serialization.Raft.EnumPropertyFB}
	 */
	Iris.Serialization.Raft.EnumSliceFB.prototype.Value = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.EnumPropertyFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.EnumSliceFB.startEnumSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.EnumSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ValueOffset
	 */
	Iris.Serialization.Raft.EnumSliceFB.addValue = function(builder, ValueOffset) {
	  builder.addFieldOffset(1, ValueOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.EnumSliceFB.endEnumSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RGBAValueFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RGBAValueFB}
	 */
	Iris.Serialization.Raft.RGBAValueFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RGBAValueFB=} obj
	 * @returns {Iris.Serialization.Raft.RGBAValueFB}
	 */
	Iris.Serialization.Raft.RGBAValueFB.getRootAsRGBAValueFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RGBAValueFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.RGBAValueFB.prototype.Red = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.RGBAValueFB.prototype.Green = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.RGBAValueFB.prototype.Blue = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.RGBAValueFB.prototype.Alpha = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RGBAValueFB.startRGBAValueFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Red
	 */
	Iris.Serialization.Raft.RGBAValueFB.addRed = function(builder, Red) {
	  builder.addFieldInt8(0, Red, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Green
	 */
	Iris.Serialization.Raft.RGBAValueFB.addGreen = function(builder, Green) {
	  builder.addFieldInt8(1, Green, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Blue
	 */
	Iris.Serialization.Raft.RGBAValueFB.addBlue = function(builder, Blue) {
	  builder.addFieldInt8(2, Blue, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Alpha
	 */
	Iris.Serialization.Raft.RGBAValueFB.addAlpha = function(builder, Alpha) {
	  builder.addFieldInt8(3, Alpha, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RGBAValueFB.endRGBAValueFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.HSLAValueFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.HSLAValueFB}
	 */
	Iris.Serialization.Raft.HSLAValueFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.HSLAValueFB=} obj
	 * @returns {Iris.Serialization.Raft.HSLAValueFB}
	 */
	Iris.Serialization.Raft.HSLAValueFB.getRootAsHSLAValueFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.HSLAValueFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.HSLAValueFB.prototype.Hue = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.HSLAValueFB.prototype.Saturation = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.HSLAValueFB.prototype.Lightness = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.HSLAValueFB.prototype.Alpha = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.HSLAValueFB.startHSLAValueFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Hue
	 */
	Iris.Serialization.Raft.HSLAValueFB.addHue = function(builder, Hue) {
	  builder.addFieldInt8(0, Hue, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Saturation
	 */
	Iris.Serialization.Raft.HSLAValueFB.addSaturation = function(builder, Saturation) {
	  builder.addFieldInt8(1, Saturation, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Lightness
	 */
	Iris.Serialization.Raft.HSLAValueFB.addLightness = function(builder, Lightness) {
	  builder.addFieldInt8(2, Lightness, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Alpha
	 */
	Iris.Serialization.Raft.HSLAValueFB.addAlpha = function(builder, Alpha) {
	  builder.addFieldInt8(3, Alpha, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.HSLAValueFB.endHSLAValueFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ColorSpaceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ColorSpaceFB}
	 */
	Iris.Serialization.Raft.ColorSpaceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ColorSpaceFB=} obj
	 * @returns {Iris.Serialization.Raft.ColorSpaceFB}
	 */
	Iris.Serialization.Raft.ColorSpaceFB.getRootAsColorSpaceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ColorSpaceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.ColorSpaceTypeFB}
	 */
	Iris.Serialization.Raft.ColorSpaceFB.prototype.ValueType = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.ColorSpaceTypeFB} */ (this.bb.readUint8(this.bb_pos + offset)) : Iris.Serialization.Raft.ColorSpaceTypeFB.NONE;
	};
	
	/**
	 * @param {flatbuffers.Table} obj
	 * @returns {?flatbuffers.Table}
	 */
	Iris.Serialization.Raft.ColorSpaceFB.prototype.Value = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ColorSpaceFB.startColorSpaceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.ColorSpaceTypeFB} ValueType
	 */
	Iris.Serialization.Raft.ColorSpaceFB.addValueType = function(builder, ValueType) {
	  builder.addFieldInt8(0, ValueType, Iris.Serialization.Raft.ColorSpaceTypeFB.NONE);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ValueOffset
	 */
	Iris.Serialization.Raft.ColorSpaceFB.addValue = function(builder, ValueOffset) {
	  builder.addFieldOffset(1, ValueOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ColorSpaceFB.endColorSpaceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ColorSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ColorSliceFB}
	 */
	Iris.Serialization.Raft.ColorSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ColorSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.ColorSliceFB}
	 */
	Iris.Serialization.Raft.ColorSliceFB.getRootAsColorSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ColorSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ColorSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.ColorSpaceFB=} obj
	 * @returns {Iris.Serialization.Raft.ColorSpaceFB}
	 */
	Iris.Serialization.Raft.ColorSliceFB.prototype.Value = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.ColorSpaceFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ColorSliceFB.startColorSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.ColorSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ValueOffset
	 */
	Iris.Serialization.Raft.ColorSliceFB.addValue = function(builder, ValueOffset) {
	  builder.addFieldOffset(1, ValueOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ColorSliceFB.endColorSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.CompoundSliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.CompoundSliceFB}
	 */
	Iris.Serialization.Raft.CompoundSliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.CompoundSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.CompoundSliceFB}
	 */
	Iris.Serialization.Raft.CompoundSliceFB.getRootAsCompoundSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.CompoundSliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.CompoundSliceFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.IOBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.IOBoxFB}
	 */
	Iris.Serialization.Raft.CompoundSliceFB.prototype.Value = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.IOBoxFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.CompoundSliceFB.prototype.ValueLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.CompoundSliceFB.startCompoundSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.CompoundSliceFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(0, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ValueOffset
	 */
	Iris.Serialization.Raft.CompoundSliceFB.addValue = function(builder, ValueOffset) {
	  builder.addFieldOffset(1, ValueOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CompoundSliceFB.createValueVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.CompoundSliceFB.startValueVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CompoundSliceFB.endCompoundSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.SliceFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.SliceFB}
	 */
	Iris.Serialization.Raft.SliceFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.SliceFB=} obj
	 * @returns {Iris.Serialization.Raft.SliceFB}
	 */
	Iris.Serialization.Raft.SliceFB.getRootAsSliceFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.SliceFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.SliceTypeFB}
	 */
	Iris.Serialization.Raft.SliceFB.prototype.SliceType = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.SliceTypeFB} */ (this.bb.readUint8(this.bb_pos + offset)) : Iris.Serialization.Raft.SliceTypeFB.NONE;
	};
	
	/**
	 * @param {flatbuffers.Table} obj
	 * @returns {?flatbuffers.Table}
	 */
	Iris.Serialization.Raft.SliceFB.prototype.Slice = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.SliceFB.startSliceFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.SliceTypeFB} SliceType
	 */
	Iris.Serialization.Raft.SliceFB.addSliceType = function(builder, SliceType) {
	  builder.addFieldInt8(0, SliceType, Iris.Serialization.Raft.SliceTypeFB.NONE);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SliceOffset
	 */
	Iris.Serialization.Raft.SliceFB.addSlice = function(builder, SliceOffset) {
	  builder.addFieldOffset(1, SliceOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.SliceFB.endSliceFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.StringBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.StringBoxFB}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.StringBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.StringBoxFB}
	 */
	Iris.Serialization.Raft.StringBoxFB.getRootAsStringBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.StringBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.StringTypeFB}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.StringType = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? /** @type {Iris.Serialization.Raft.StringTypeFB} */ (this.bb.readUint16(this.bb_pos + offset)) : Iris.Serialization.Raft.StringTypeFB.SimpleFB;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.FileMask = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.MaxChars = function() {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.StringSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.StringSliceFB}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 18);
	  return offset ? (obj || new Iris.Serialization.Raft.StringSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StringBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 18);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.StringBoxFB.startStringBoxFB = function(builder) {
	  builder.startObject(8);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.StringBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.StringBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.StringBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.StringBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StringBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StringBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.StringTypeFB} StringType
	 */
	Iris.Serialization.Raft.StringBoxFB.addStringType = function(builder, StringType) {
	  builder.addFieldInt16(4, StringType, Iris.Serialization.Raft.StringTypeFB.SimpleFB);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} FileMaskOffset
	 */
	Iris.Serialization.Raft.StringBoxFB.addFileMask = function(builder, FileMaskOffset) {
	  builder.addFieldOffset(5, FileMaskOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} MaxChars
	 */
	Iris.Serialization.Raft.StringBoxFB.addMaxChars = function(builder, MaxChars) {
	  builder.addFieldInt32(6, MaxChars, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.StringBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(7, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StringBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StringBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StringBoxFB.endStringBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.IntBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.IntBoxFB}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.IntBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.IntBoxFB}
	 */
	Iris.Serialization.Raft.IntBoxFB.getRootAsIntBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.IntBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.VecSize = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Min = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Max = function() {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Unit = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 18);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.IntSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.IntSliceFB}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 20);
	  return offset ? (obj || new Iris.Serialization.Raft.IntSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.IntBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 20);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.IntBoxFB.startIntBoxFB = function(builder) {
	  builder.startObject(9);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.IntBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.IntBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.IntBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.IntBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.IntBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.IntBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} VecSize
	 */
	Iris.Serialization.Raft.IntBoxFB.addVecSize = function(builder, VecSize) {
	  builder.addFieldInt32(4, VecSize, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Min
	 */
	Iris.Serialization.Raft.IntBoxFB.addMin = function(builder, Min) {
	  builder.addFieldInt32(5, Min, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Max
	 */
	Iris.Serialization.Raft.IntBoxFB.addMax = function(builder, Max) {
	  builder.addFieldInt32(6, Max, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} UnitOffset
	 */
	Iris.Serialization.Raft.IntBoxFB.addUnit = function(builder, UnitOffset) {
	  builder.addFieldOffset(7, UnitOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.IntBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(8, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.IntBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.IntBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.IntBoxFB.endIntBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.FloatBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.FloatBoxFB}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.FloatBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.FloatBoxFB}
	 */
	Iris.Serialization.Raft.FloatBoxFB.getRootAsFloatBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.FloatBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.VecSize = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Min = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Max = function() {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Unit = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 18);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Precision = function() {
	  var offset = this.bb.__offset(this.bb_pos, 20);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.FloatSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.FloatSliceFB}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 22);
	  return offset ? (obj || new Iris.Serialization.Raft.FloatSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.FloatBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 22);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.FloatBoxFB.startFloatBoxFB = function(builder) {
	  builder.startObject(10);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.FloatBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.FloatBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.FloatBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.FloatBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.FloatBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.FloatBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} VecSize
	 */
	Iris.Serialization.Raft.FloatBoxFB.addVecSize = function(builder, VecSize) {
	  builder.addFieldInt32(4, VecSize, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Min
	 */
	Iris.Serialization.Raft.FloatBoxFB.addMin = function(builder, Min) {
	  builder.addFieldInt32(5, Min, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Max
	 */
	Iris.Serialization.Raft.FloatBoxFB.addMax = function(builder, Max) {
	  builder.addFieldInt32(6, Max, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} UnitOffset
	 */
	Iris.Serialization.Raft.FloatBoxFB.addUnit = function(builder, UnitOffset) {
	  builder.addFieldOffset(7, UnitOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Precision
	 */
	Iris.Serialization.Raft.FloatBoxFB.addPrecision = function(builder, Precision) {
	  builder.addFieldInt32(8, Precision, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.FloatBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(9, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.FloatBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.FloatBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.FloatBoxFB.endFloatBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.DoubleBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.DoubleBoxFB}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.DoubleBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.DoubleBoxFB}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.getRootAsDoubleBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.DoubleBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.VecSize = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Min = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Max = function() {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Unit = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 18);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Precision = function() {
	  var offset = this.bb.__offset(this.bb_pos, 20);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.DoubleSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.DoubleSliceFB}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 22);
	  return offset ? (obj || new Iris.Serialization.Raft.DoubleSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 22);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.DoubleBoxFB.startDoubleBoxFB = function(builder) {
	  builder.startObject(10);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.DoubleBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} VecSize
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addVecSize = function(builder, VecSize) {
	  builder.addFieldInt32(4, VecSize, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Min
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addMin = function(builder, Min) {
	  builder.addFieldInt32(5, Min, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Max
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addMax = function(builder, Max) {
	  builder.addFieldInt32(6, Max, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} UnitOffset
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addUnit = function(builder, UnitOffset) {
	  builder.addFieldOffset(7, UnitOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Precision
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addPrecision = function(builder, Precision) {
	  builder.addFieldInt32(8, Precision, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.DoubleBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(9, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.DoubleBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.DoubleBoxFB.endDoubleBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.BoolBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.BoolBoxFB}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.BoolBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.BoolBoxFB}
	 */
	Iris.Serialization.Raft.BoolBoxFB.getRootAsBoolBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.BoolBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.BehaviorFB}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.Behavior = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? /** @type {Iris.Serialization.Raft.BehaviorFB} */ (this.bb.readUint16(this.bb_pos + offset)) : Iris.Serialization.Raft.BehaviorFB.ToggleFB;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.BoolSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.BoolSliceFB}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? (obj || new Iris.Serialization.Raft.BoolSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.BoolBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.BoolBoxFB.startBoolBoxFB = function(builder) {
	  builder.startObject(6);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.BoolBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.BoolBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.BoolBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.BoolBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.BoolBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.BoolBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.BehaviorFB} Behavior
	 */
	Iris.Serialization.Raft.BoolBoxFB.addBehavior = function(builder, Behavior) {
	  builder.addFieldInt16(4, Behavior, Iris.Serialization.Raft.BehaviorFB.ToggleFB);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.BoolBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(5, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.BoolBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.BoolBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.BoolBoxFB.endBoolBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ByteBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ByteBoxFB}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ByteBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.ByteBoxFB}
	 */
	Iris.Serialization.Raft.ByteBoxFB.getRootAsByteBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ByteBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.ByteSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.ByteSliceFB}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? (obj || new Iris.Serialization.Raft.ByteSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ByteBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ByteBoxFB.startByteBoxFB = function(builder) {
	  builder.startObject(5);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.ByteBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.ByteBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.ByteBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.ByteBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ByteBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.ByteBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.ByteBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(4, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ByteBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.ByteBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ByteBoxFB.endByteBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.EnumBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.EnumBoxFB}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.EnumBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.EnumBoxFB}
	 */
	Iris.Serialization.Raft.EnumBoxFB.getRootAsEnumBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.EnumBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.EnumPropertyFB=} obj
	 * @returns {Iris.Serialization.Raft.EnumPropertyFB}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.Properties = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? (obj || new Iris.Serialization.Raft.EnumPropertyFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.PropertiesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.EnumSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.EnumSliceFB}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? (obj || new Iris.Serialization.Raft.EnumSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.EnumBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.EnumBoxFB.startEnumBoxFB = function(builder) {
	  builder.startObject(6);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.EnumBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.EnumBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.EnumBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.EnumBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.EnumBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.EnumBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PropertiesOffset
	 */
	Iris.Serialization.Raft.EnumBoxFB.addProperties = function(builder, PropertiesOffset) {
	  builder.addFieldOffset(4, PropertiesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.EnumBoxFB.createPropertiesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.EnumBoxFB.startPropertiesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.EnumBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(5, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.EnumBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.EnumBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.EnumBoxFB.endEnumBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ColorBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ColorBoxFB}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ColorBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.ColorBoxFB}
	 */
	Iris.Serialization.Raft.ColorBoxFB.getRootAsColorBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ColorBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.ColorSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.ColorSliceFB}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? (obj || new Iris.Serialization.Raft.ColorSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ColorBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ColorBoxFB.startColorBoxFB = function(builder) {
	  builder.startObject(5);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.ColorBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.ColorBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.ColorBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.ColorBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ColorBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.ColorBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.ColorBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(4, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ColorBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.ColorBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ColorBoxFB.endColorBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.CompoundBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.CompoundBoxFB}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.CompoundBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.CompoundBoxFB}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.getRootAsCompoundBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.CompoundBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.Patch = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.Tags = function(index, optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.TagsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.CompoundSliceFB=} obj
	 * @returns {Iris.Serialization.Raft.CompoundSliceFB}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.Slices = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? (obj || new Iris.Serialization.Raft.CompoundSliceFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.prototype.SlicesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.CompoundBoxFB.startCompoundBoxFB = function(builder) {
	  builder.startObject(5);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.CompoundBoxFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.CompoundBoxFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchOffset
	 */
	Iris.Serialization.Raft.CompoundBoxFB.addPatch = function(builder, PatchOffset) {
	  builder.addFieldOffset(2, PatchOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} TagsOffset
	 */
	Iris.Serialization.Raft.CompoundBoxFB.addTags = function(builder, TagsOffset) {
	  builder.addFieldOffset(3, TagsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.createTagsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.CompoundBoxFB.startTagsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SlicesOffset
	 */
	Iris.Serialization.Raft.CompoundBoxFB.addSlices = function(builder, SlicesOffset) {
	  builder.addFieldOffset(4, SlicesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.createSlicesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.CompoundBoxFB.startSlicesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CompoundBoxFB.endCompoundBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.IOBoxFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.IOBoxFB}
	 */
	Iris.Serialization.Raft.IOBoxFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.IOBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.IOBoxFB}
	 */
	Iris.Serialization.Raft.IOBoxFB.getRootAsIOBoxFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.IOBoxFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.IOBoxTypeFB}
	 */
	Iris.Serialization.Raft.IOBoxFB.prototype.IOBoxType = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.IOBoxTypeFB} */ (this.bb.readUint8(this.bb_pos + offset)) : Iris.Serialization.Raft.IOBoxTypeFB.NONE;
	};
	
	/**
	 * @param {flatbuffers.Table} obj
	 * @returns {?flatbuffers.Table}
	 */
	Iris.Serialization.Raft.IOBoxFB.prototype.IOBox = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.IOBoxFB.startIOBoxFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.IOBoxTypeFB} IOBoxType
	 */
	Iris.Serialization.Raft.IOBoxFB.addIOBoxType = function(builder, IOBoxType) {
	  builder.addFieldInt8(0, IOBoxType, Iris.Serialization.Raft.IOBoxTypeFB.NONE);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IOBoxOffset
	 */
	Iris.Serialization.Raft.IOBoxFB.addIOBox = function(builder, IOBoxOffset) {
	  builder.addFieldOffset(1, IOBoxOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.IOBoxFB.endIOBoxFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.PatchFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.PatchFB}
	 */
	Iris.Serialization.Raft.PatchFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.PatchFB=} obj
	 * @returns {Iris.Serialization.Raft.PatchFB}
	 */
	Iris.Serialization.Raft.PatchFB.getRootAsPatchFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.PatchFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.PatchFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.PatchFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.IOBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.IOBoxFB}
	 */
	Iris.Serialization.Raft.PatchFB.prototype.IOBoxes = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? (obj || new Iris.Serialization.Raft.IOBoxFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.PatchFB.prototype.IOBoxesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.PatchFB.startPatchFB = function(builder) {
	  builder.startObject(3);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.PatchFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.PatchFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IOBoxesOffset
	 */
	Iris.Serialization.Raft.PatchFB.addIOBoxes = function(builder, IOBoxesOffset) {
	  builder.addFieldOffset(2, IOBoxesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.PatchFB.createIOBoxesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.PatchFB.startIOBoxesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.PatchFB.endPatchFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.CueFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.CueFB}
	 */
	Iris.Serialization.Raft.CueFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.CueFB=} obj
	 * @returns {Iris.Serialization.Raft.CueFB}
	 */
	Iris.Serialization.Raft.CueFB.getRootAsCueFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.CueFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CueFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CueFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.IOBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.IOBoxFB}
	 */
	Iris.Serialization.Raft.CueFB.prototype.IOBoxes = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? (obj || new Iris.Serialization.Raft.IOBoxFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.CueFB.prototype.IOBoxesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.CueFB.startCueFB = function(builder) {
	  builder.startObject(3);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.CueFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.CueFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IOBoxesOffset
	 */
	Iris.Serialization.Raft.CueFB.addIOBoxes = function(builder, IOBoxesOffset) {
	  builder.addFieldOffset(2, IOBoxesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CueFB.createIOBoxesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.CueFB.startIOBoxesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CueFB.endCueFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} offset
	 */
	Iris.Serialization.Raft.CueFB.finishCueFBBuffer = function(builder, offset) {
	  builder.finish(offset);
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.CueListFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.CueListFB}
	 */
	Iris.Serialization.Raft.CueListFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.CueListFB=} obj
	 * @returns {Iris.Serialization.Raft.CueListFB}
	 */
	Iris.Serialization.Raft.CueListFB.getRootAsCueListFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.CueListFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CueListFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.CueListFB.prototype.Name = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.CueFB=} obj
	 * @returns {Iris.Serialization.Raft.CueFB}
	 */
	Iris.Serialization.Raft.CueListFB.prototype.Cues = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? (obj || new Iris.Serialization.Raft.CueFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.CueListFB.prototype.CuesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.CueListFB.startCueListFB = function(builder) {
	  builder.startObject(3);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.CueListFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NameOffset
	 */
	Iris.Serialization.Raft.CueListFB.addName = function(builder, NameOffset) {
	  builder.addFieldOffset(1, NameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} CuesOffset
	 */
	Iris.Serialization.Raft.CueListFB.addCues = function(builder, CuesOffset) {
	  builder.addFieldOffset(2, CuesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CueListFB.createCuesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.CueListFB.startCuesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.CueListFB.endCueListFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.UserFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.UserFB}
	 */
	Iris.Serialization.Raft.UserFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.UserFB=} obj
	 * @returns {Iris.Serialization.Raft.UserFB}
	 */
	Iris.Serialization.Raft.UserFB.getRootAsUserFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.UserFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.UserFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.UserFB.prototype.UserName = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.UserFB.prototype.FirstName = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.UserFB.prototype.LastName = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.UserFB.prototype.Email = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.UserFB.prototype.Joined = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.UserFB.prototype.Created = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.UserFB.startUserFB = function(builder) {
	  builder.startObject(7);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.UserFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} UserNameOffset
	 */
	Iris.Serialization.Raft.UserFB.addUserName = function(builder, UserNameOffset) {
	  builder.addFieldOffset(1, UserNameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} FirstNameOffset
	 */
	Iris.Serialization.Raft.UserFB.addFirstName = function(builder, FirstNameOffset) {
	  builder.addFieldOffset(2, FirstNameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} LastNameOffset
	 */
	Iris.Serialization.Raft.UserFB.addLastName = function(builder, LastNameOffset) {
	  builder.addFieldOffset(3, LastNameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} EmailOffset
	 */
	Iris.Serialization.Raft.UserFB.addEmail = function(builder, EmailOffset) {
	  builder.addFieldOffset(4, EmailOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} JoinedOffset
	 */
	Iris.Serialization.Raft.UserFB.addJoined = function(builder, JoinedOffset) {
	  builder.addFieldOffset(5, JoinedOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} CreatedOffset
	 */
	Iris.Serialization.Raft.UserFB.addCreated = function(builder, CreatedOffset) {
	  builder.addFieldOffset(6, CreatedOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.UserFB.endUserFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.SessionFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.SessionFB}
	 */
	Iris.Serialization.Raft.SessionFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.SessionFB=} obj
	 * @returns {Iris.Serialization.Raft.SessionFB}
	 */
	Iris.Serialization.Raft.SessionFB.getRootAsSessionFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.SessionFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.SessionFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.SessionFB.prototype.UserName = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.SessionFB.prototype.IpAddress = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.SessionFB.prototype.UserAgent = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.SessionFB.startSessionFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.SessionFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} UserNameOffset
	 */
	Iris.Serialization.Raft.SessionFB.addUserName = function(builder, UserNameOffset) {
	  builder.addFieldOffset(1, UserNameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IpAddressOffset
	 */
	Iris.Serialization.Raft.SessionFB.addIpAddress = function(builder, IpAddressOffset) {
	  builder.addFieldOffset(2, IpAddressOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} UserAgentOffset
	 */
	Iris.Serialization.Raft.SessionFB.addUserAgent = function(builder, UserAgentOffset) {
	  builder.addFieldOffset(3, UserAgentOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.SessionFB.endSessionFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.StateFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.StateFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.StateFB=} obj
	 * @returns {Iris.Serialization.Raft.StateFB}
	 */
	Iris.Serialization.Raft.StateFB.getRootAsStateFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.StateFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.PatchFB=} obj
	 * @returns {Iris.Serialization.Raft.PatchFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.Patches = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? (obj || new Iris.Serialization.Raft.PatchFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StateFB.prototype.PatchesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.IOBoxFB=} obj
	 * @returns {Iris.Serialization.Raft.IOBoxFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.IOBoxes = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.IOBoxFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StateFB.prototype.IOBoxesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.CueFB=} obj
	 * @returns {Iris.Serialization.Raft.CueFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.Cues = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? (obj || new Iris.Serialization.Raft.CueFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StateFB.prototype.CuesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.CueListFB=} obj
	 * @returns {Iris.Serialization.Raft.CueListFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.CueLists = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? (obj || new Iris.Serialization.Raft.CueListFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StateFB.prototype.CueListsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.Nodes = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StateFB.prototype.NodesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.SessionFB=} obj
	 * @returns {Iris.Serialization.Raft.SessionFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.Sessions = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? (obj || new Iris.Serialization.Raft.SessionFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StateFB.prototype.SessionsLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.UserFB=} obj
	 * @returns {Iris.Serialization.Raft.UserFB}
	 */
	Iris.Serialization.Raft.StateFB.prototype.Users = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? (obj || new Iris.Serialization.Raft.UserFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.StateFB.prototype.UsersLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.StateFB.startStateFB = function(builder) {
	  builder.startObject(7);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PatchesOffset
	 */
	Iris.Serialization.Raft.StateFB.addPatches = function(builder, PatchesOffset) {
	  builder.addFieldOffset(0, PatchesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.createPatchesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StateFB.startPatchesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IOBoxesOffset
	 */
	Iris.Serialization.Raft.StateFB.addIOBoxes = function(builder, IOBoxesOffset) {
	  builder.addFieldOffset(1, IOBoxesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.createIOBoxesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StateFB.startIOBoxesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} CuesOffset
	 */
	Iris.Serialization.Raft.StateFB.addCues = function(builder, CuesOffset) {
	  builder.addFieldOffset(2, CuesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.createCuesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StateFB.startCuesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} CueListsOffset
	 */
	Iris.Serialization.Raft.StateFB.addCueLists = function(builder, CueListsOffset) {
	  builder.addFieldOffset(3, CueListsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.createCueListsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StateFB.startCueListsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodesOffset
	 */
	Iris.Serialization.Raft.StateFB.addNodes = function(builder, NodesOffset) {
	  builder.addFieldOffset(4, NodesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.createNodesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StateFB.startNodesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} SessionsOffset
	 */
	Iris.Serialization.Raft.StateFB.addSessions = function(builder, SessionsOffset) {
	  builder.addFieldOffset(5, SessionsOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.createSessionsVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StateFB.startSessionsVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} UsersOffset
	 */
	Iris.Serialization.Raft.StateFB.addUsers = function(builder, UsersOffset) {
	  builder.addFieldOffset(6, UsersOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.createUsersVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.StateFB.startUsersVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.StateFB.endStateFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.LogMsgFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.LogMsgFB}
	 */
	Iris.Serialization.Raft.LogMsgFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.LogMsgFB=} obj
	 * @returns {Iris.Serialization.Raft.LogMsgFB}
	 */
	Iris.Serialization.Raft.LogMsgFB.getRootAsLogMsgFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.LogMsgFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.LogMsgFB.prototype.LogLevel = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.LogMsgFB.prototype.Msg = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.LogMsgFB.startLogMsgFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} LogLevelOffset
	 */
	Iris.Serialization.Raft.LogMsgFB.addLogLevel = function(builder, LogLevelOffset) {
	  builder.addFieldOffset(0, LogLevelOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} MsgOffset
	 */
	Iris.Serialization.Raft.LogMsgFB.addMsg = function(builder, MsgOffset) {
	  builder.addFieldOffset(1, MsgOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.LogMsgFB.endLogMsgFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ApiActionFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ApiActionFB}
	 */
	Iris.Serialization.Raft.ApiActionFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ApiActionFB=} obj
	 * @returns {Iris.Serialization.Raft.ApiActionFB}
	 */
	Iris.Serialization.Raft.ApiActionFB.getRootAsApiActionFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ApiActionFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.ActionTypeFB}
	 */
	Iris.Serialization.Raft.ApiActionFB.prototype.Action = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.ActionTypeFB} */ (this.bb.readUint16(this.bb_pos + offset)) : Iris.Serialization.Raft.ActionTypeFB.AddFB;
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.PayloadFB}
	 */
	Iris.Serialization.Raft.ApiActionFB.prototype.PayloadType = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? /** @type {Iris.Serialization.Raft.PayloadFB} */ (this.bb.readUint8(this.bb_pos + offset)) : Iris.Serialization.Raft.PayloadFB.NONE;
	};
	
	/**
	 * @param {flatbuffers.Table} obj
	 * @returns {?flatbuffers.Table}
	 */
	Iris.Serialization.Raft.ApiActionFB.prototype.Payload = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ApiActionFB.startApiActionFB = function(builder) {
	  builder.startObject(3);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.ActionTypeFB} Action
	 */
	Iris.Serialization.Raft.ApiActionFB.addAction = function(builder, Action) {
	  builder.addFieldInt16(0, Action, Iris.Serialization.Raft.ActionTypeFB.AddFB);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.PayloadFB} PayloadType
	 */
	Iris.Serialization.Raft.ApiActionFB.addPayloadType = function(builder, PayloadType) {
	  builder.addFieldInt8(1, PayloadType, Iris.Serialization.Raft.PayloadFB.NONE);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} PayloadOffset
	 */
	Iris.Serialization.Raft.ApiActionFB.addPayload = function(builder, PayloadOffset) {
	  builder.addFieldOffset(2, PayloadOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ApiActionFB.endApiActionFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ErrorFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ErrorFB}
	 */
	Iris.Serialization.Raft.ErrorFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ErrorFB=} obj
	 * @returns {Iris.Serialization.Raft.ErrorFB}
	 */
	Iris.Serialization.Raft.ErrorFB.getRootAsErrorFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ErrorFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.ErrorTypeFB}
	 */
	Iris.Serialization.Raft.ErrorFB.prototype.Type = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.ErrorTypeFB} */ (this.bb.readUint16(this.bb_pos + offset)) : Iris.Serialization.Raft.ErrorTypeFB.BranchNotFoundFB;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ErrorFB.prototype.Message = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ErrorFB.startErrorFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.ErrorTypeFB} Type
	 */
	Iris.Serialization.Raft.ErrorFB.addType = function(builder, Type) {
	  builder.addFieldInt16(0, Type, Iris.Serialization.Raft.ErrorTypeFB.BranchNotFoundFB);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} MessageOffset
	 */
	Iris.Serialization.Raft.ErrorFB.addMessage = function(builder, MessageOffset) {
	  builder.addFieldOffset(1, MessageOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ErrorFB.endErrorFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.NodeFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.NodeFB.getRootAsNodeFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.NodeFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.HostName = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.IpAddr = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.Port = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.WebPort = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.WsPort = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.GitPort = function() {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {boolean}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.Voting = function() {
	  var offset = this.bb.__offset(this.bb_pos, 18);
	  return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
	};
	
	/**
	 * @returns {boolean}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.VotedForMe = function() {
	  var offset = this.bb.__offset(this.bb_pos, 20);
	  return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.NodeStateFB}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.State = function() {
	  var offset = this.bb.__offset(this.bb_pos, 22);
	  return offset ? /** @type {Iris.Serialization.Raft.NodeStateFB} */ (this.bb.readUint8(this.bb_pos + offset)) : Iris.Serialization.Raft.NodeStateFB.JoiningFB;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.NextIndex = function() {
	  var offset = this.bb.__offset(this.bb_pos, 24);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.NodeFB.prototype.MatchIndex = function() {
	  var offset = this.bb.__offset(this.bb_pos, 26);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.NodeFB.startNodeFB = function(builder) {
	  builder.startObject(12);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.NodeFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} HostNameOffset
	 */
	Iris.Serialization.Raft.NodeFB.addHostName = function(builder, HostNameOffset) {
	  builder.addFieldOffset(1, HostNameOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IpAddrOffset
	 */
	Iris.Serialization.Raft.NodeFB.addIpAddr = function(builder, IpAddrOffset) {
	  builder.addFieldOffset(2, IpAddrOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Port
	 */
	Iris.Serialization.Raft.NodeFB.addPort = function(builder, Port) {
	  builder.addFieldInt32(3, Port, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} WebPort
	 */
	Iris.Serialization.Raft.NodeFB.addWebPort = function(builder, WebPort) {
	  builder.addFieldInt32(4, WebPort, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} WsPort
	 */
	Iris.Serialization.Raft.NodeFB.addWsPort = function(builder, WsPort) {
	  builder.addFieldInt32(5, WsPort, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} GitPort
	 */
	Iris.Serialization.Raft.NodeFB.addGitPort = function(builder, GitPort) {
	  builder.addFieldInt32(6, GitPort, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {boolean} Voting
	 */
	Iris.Serialization.Raft.NodeFB.addVoting = function(builder, Voting) {
	  builder.addFieldInt8(7, +Voting, +false);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {boolean} VotedForMe
	 */
	Iris.Serialization.Raft.NodeFB.addVotedForMe = function(builder, VotedForMe) {
	  builder.addFieldInt8(8, +VotedForMe, +false);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.NodeStateFB} State
	 */
	Iris.Serialization.Raft.NodeFB.addState = function(builder, State) {
	  builder.addFieldInt8(9, State, Iris.Serialization.Raft.NodeStateFB.JoiningFB);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} NextIndex
	 */
	Iris.Serialization.Raft.NodeFB.addNextIndex = function(builder, NextIndex) {
	  builder.addFieldInt32(10, NextIndex, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} MatchIndex
	 */
	Iris.Serialization.Raft.NodeFB.addMatchIndex = function(builder, MatchIndex) {
	  builder.addFieldInt32(11, MatchIndex, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.NodeFB.endNodeFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ConfigChangeFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ConfigChangeFB}
	 */
	Iris.Serialization.Raft.ConfigChangeFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ConfigChangeFB=} obj
	 * @returns {Iris.Serialization.Raft.ConfigChangeFB}
	 */
	Iris.Serialization.Raft.ConfigChangeFB.getRootAsConfigChangeFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ConfigChangeFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.ConfigChangeTypeFB}
	 */
	Iris.Serialization.Raft.ConfigChangeFB.prototype.Type = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.ConfigChangeTypeFB} */ (this.bb.readUint16(this.bb_pos + offset)) : Iris.Serialization.Raft.ConfigChangeTypeFB.NodeAdded;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.ConfigChangeFB.prototype.Node = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ConfigChangeFB.startConfigChangeFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.ConfigChangeTypeFB} Type
	 */
	Iris.Serialization.Raft.ConfigChangeFB.addType = function(builder, Type) {
	  builder.addFieldInt16(0, Type, Iris.Serialization.Raft.ConfigChangeTypeFB.NodeAdded);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeOffset
	 */
	Iris.Serialization.Raft.ConfigChangeFB.addNode = function(builder, NodeOffset) {
	  builder.addFieldOffset(1, NodeOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ConfigChangeFB.endConfigChangeFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ConfigurationFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ConfigurationFB}
	 */
	Iris.Serialization.Raft.ConfigurationFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ConfigurationFB=} obj
	 * @returns {Iris.Serialization.Raft.ConfigurationFB}
	 */
	Iris.Serialization.Raft.ConfigurationFB.getRootAsConfigurationFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ConfigurationFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.ConfigurationFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ConfigurationFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ConfigurationFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.ConfigurationFB.prototype.Nodes = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.ConfigurationFB.prototype.NodesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ConfigurationFB.startConfigurationFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.ConfigurationFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.ConfigurationFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(1, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.ConfigurationFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(2, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodesOffset
	 */
	Iris.Serialization.Raft.ConfigurationFB.addNodes = function(builder, NodesOffset) {
	  builder.addFieldOffset(3, NodesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ConfigurationFB.createNodesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.ConfigurationFB.startNodesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ConfigurationFB.endConfigurationFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.JointConsensusFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.JointConsensusFB}
	 */
	Iris.Serialization.Raft.JointConsensusFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.JointConsensusFB=} obj
	 * @returns {Iris.Serialization.Raft.JointConsensusFB}
	 */
	Iris.Serialization.Raft.JointConsensusFB.getRootAsJointConsensusFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.JointConsensusFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.JointConsensusFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.JointConsensusFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.JointConsensusFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.ConfigChangeFB=} obj
	 * @returns {Iris.Serialization.Raft.ConfigChangeFB}
	 */
	Iris.Serialization.Raft.JointConsensusFB.prototype.Changes = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? (obj || new Iris.Serialization.Raft.ConfigChangeFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.JointConsensusFB.prototype.ChangesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.JointConsensusFB.startJointConsensusFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.JointConsensusFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.JointConsensusFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(1, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.JointConsensusFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(2, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ChangesOffset
	 */
	Iris.Serialization.Raft.JointConsensusFB.addChanges = function(builder, ChangesOffset) {
	  builder.addFieldOffset(3, ChangesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.JointConsensusFB.createChangesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.JointConsensusFB.startChangesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.JointConsensusFB.endJointConsensusFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.LogEntryFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.LogEntryFB}
	 */
	Iris.Serialization.Raft.LogEntryFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.LogEntryFB=} obj
	 * @returns {Iris.Serialization.Raft.LogEntryFB}
	 */
	Iris.Serialization.Raft.LogEntryFB.getRootAsLogEntryFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.LogEntryFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.LogEntryFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.LogEntryFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.LogEntryFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.ApiActionFB=} obj
	 * @returns {Iris.Serialization.Raft.ApiActionFB}
	 */
	Iris.Serialization.Raft.LogEntryFB.prototype.Data = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? (obj || new Iris.Serialization.Raft.ApiActionFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.LogEntryFB.startLogEntryFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.LogEntryFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.LogEntryFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(1, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.LogEntryFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(2, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} DataOffset
	 */
	Iris.Serialization.Raft.LogEntryFB.addData = function(builder, DataOffset) {
	  builder.addFieldOffset(3, DataOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.LogEntryFB.endLogEntryFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.SnapshotFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.SnapshotFB}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.SnapshotFB=} obj
	 * @returns {Iris.Serialization.Raft.SnapshotFB}
	 */
	Iris.Serialization.Raft.SnapshotFB.getRootAsSnapshotFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.SnapshotFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.Id = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.Index = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.LastIndex = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.LastTerm = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.Nodes = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.NodesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 14);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.ApiActionFB=} obj
	 * @returns {Iris.Serialization.Raft.ApiActionFB}
	 */
	Iris.Serialization.Raft.SnapshotFB.prototype.Data = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 16);
	  return offset ? (obj || new Iris.Serialization.Raft.ApiActionFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.SnapshotFB.startSnapshotFB = function(builder) {
	  builder.startObject(7);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} IdOffset
	 */
	Iris.Serialization.Raft.SnapshotFB.addId = function(builder, IdOffset) {
	  builder.addFieldOffset(0, IdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Index
	 */
	Iris.Serialization.Raft.SnapshotFB.addIndex = function(builder, Index) {
	  builder.addFieldInt32(1, Index, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.SnapshotFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(2, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} LastIndex
	 */
	Iris.Serialization.Raft.SnapshotFB.addLastIndex = function(builder, LastIndex) {
	  builder.addFieldInt32(3, LastIndex, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} LastTerm
	 */
	Iris.Serialization.Raft.SnapshotFB.addLastTerm = function(builder, LastTerm) {
	  builder.addFieldInt32(4, LastTerm, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodesOffset
	 */
	Iris.Serialization.Raft.SnapshotFB.addNodes = function(builder, NodesOffset) {
	  builder.addFieldOffset(5, NodesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.SnapshotFB.createNodesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.SnapshotFB.startNodesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} DataOffset
	 */
	Iris.Serialization.Raft.SnapshotFB.addData = function(builder, DataOffset) {
	  builder.addFieldOffset(6, DataOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.SnapshotFB.endSnapshotFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.LogFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.LogFB}
	 */
	Iris.Serialization.Raft.LogFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.LogFB=} obj
	 * @returns {Iris.Serialization.Raft.LogFB}
	 */
	Iris.Serialization.Raft.LogFB.getRootAsLogFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.LogFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.LogTypeFB}
	 */
	Iris.Serialization.Raft.LogFB.prototype.EntryType = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.LogTypeFB} */ (this.bb.readUint8(this.bb_pos + offset)) : Iris.Serialization.Raft.LogTypeFB.NONE;
	};
	
	/**
	 * @param {flatbuffers.Table} obj
	 * @returns {?flatbuffers.Table}
	 */
	Iris.Serialization.Raft.LogFB.prototype.Entry = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.LogFB.startLogFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.LogTypeFB} EntryType
	 */
	Iris.Serialization.Raft.LogFB.addEntryType = function(builder, EntryType) {
	  builder.addFieldInt8(0, EntryType, Iris.Serialization.Raft.LogTypeFB.NONE);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} EntryOffset
	 */
	Iris.Serialization.Raft.LogFB.addEntry = function(builder, EntryOffset) {
	  builder.addFieldOffset(1, EntryOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.LogFB.endLogFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.VoteRequestFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.VoteRequestFB}
	 */
	Iris.Serialization.Raft.VoteRequestFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.VoteRequestFB=} obj
	 * @returns {Iris.Serialization.Raft.VoteRequestFB}
	 */
	Iris.Serialization.Raft.VoteRequestFB.getRootAsVoteRequestFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.VoteRequestFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.VoteRequestFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.VoteRequestFB.prototype.Candidate = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.VoteRequestFB.prototype.LastLogIndex = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.VoteRequestFB.prototype.LastLogTerm = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.VoteRequestFB.startVoteRequestFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.VoteRequestFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(0, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} CandidateOffset
	 */
	Iris.Serialization.Raft.VoteRequestFB.addCandidate = function(builder, CandidateOffset) {
	  builder.addFieldOffset(1, CandidateOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} LastLogIndex
	 */
	Iris.Serialization.Raft.VoteRequestFB.addLastLogIndex = function(builder, LastLogIndex) {
	  builder.addFieldInt32(2, LastLogIndex, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} LastLogTerm
	 */
	Iris.Serialization.Raft.VoteRequestFB.addLastLogTerm = function(builder, LastLogTerm) {
	  builder.addFieldInt32(3, LastLogTerm, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.VoteRequestFB.endVoteRequestFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.VoteResponseFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.VoteResponseFB}
	 */
	Iris.Serialization.Raft.VoteResponseFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.VoteResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.VoteResponseFB}
	 */
	Iris.Serialization.Raft.VoteResponseFB.getRootAsVoteResponseFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.VoteResponseFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.VoteResponseFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {boolean}
	 */
	Iris.Serialization.Raft.VoteResponseFB.prototype.Granted = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.ErrorFB=} obj
	 * @returns {Iris.Serialization.Raft.ErrorFB}
	 */
	Iris.Serialization.Raft.VoteResponseFB.prototype.Reason = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? (obj || new Iris.Serialization.Raft.ErrorFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.VoteResponseFB.startVoteResponseFB = function(builder) {
	  builder.startObject(3);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.VoteResponseFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(0, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {boolean} Granted
	 */
	Iris.Serialization.Raft.VoteResponseFB.addGranted = function(builder, Granted) {
	  builder.addFieldInt8(1, +Granted, +false);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ReasonOffset
	 */
	Iris.Serialization.Raft.VoteResponseFB.addReason = function(builder, ReasonOffset) {
	  builder.addFieldOffset(2, ReasonOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.VoteResponseFB.endVoteResponseFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.AppendEntriesFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.AppendEntriesFB}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.AppendEntriesFB=} obj
	 * @returns {Iris.Serialization.Raft.AppendEntriesFB}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.getRootAsAppendEntriesFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.AppendEntriesFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.prototype.PrevLogIdx = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.prototype.PrevLogTerm = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.prototype.LeaderCommit = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.LogFB=} obj
	 * @returns {Iris.Serialization.Raft.LogFB}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.prototype.Entries = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? (obj || new Iris.Serialization.Raft.LogFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.prototype.EntriesLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.AppendEntriesFB.startAppendEntriesFB = function(builder) {
	  builder.startObject(5);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.AppendEntriesFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(0, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} PrevLogIdx
	 */
	Iris.Serialization.Raft.AppendEntriesFB.addPrevLogIdx = function(builder, PrevLogIdx) {
	  builder.addFieldInt32(1, PrevLogIdx, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} PrevLogTerm
	 */
	Iris.Serialization.Raft.AppendEntriesFB.addPrevLogTerm = function(builder, PrevLogTerm) {
	  builder.addFieldInt32(2, PrevLogTerm, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} LeaderCommit
	 */
	Iris.Serialization.Raft.AppendEntriesFB.addLeaderCommit = function(builder, LeaderCommit) {
	  builder.addFieldInt32(3, LeaderCommit, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} EntriesOffset
	 */
	Iris.Serialization.Raft.AppendEntriesFB.addEntries = function(builder, EntriesOffset) {
	  builder.addFieldOffset(4, EntriesOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.createEntriesVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.AppendEntriesFB.startEntriesVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.AppendEntriesFB.endAppendEntriesFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.AppendResponseFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.AppendResponseFB}
	 */
	Iris.Serialization.Raft.AppendResponseFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.AppendResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.AppendResponseFB}
	 */
	Iris.Serialization.Raft.AppendResponseFB.getRootAsAppendResponseFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.AppendResponseFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendResponseFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {boolean}
	 */
	Iris.Serialization.Raft.AppendResponseFB.prototype.Success = function() {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendResponseFB.prototype.CurrentIndex = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.AppendResponseFB.prototype.FirstIndex = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.AppendResponseFB.startAppendResponseFB = function(builder) {
	  builder.startObject(4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.AppendResponseFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(0, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {boolean} Success
	 */
	Iris.Serialization.Raft.AppendResponseFB.addSuccess = function(builder, Success) {
	  builder.addFieldInt8(1, +Success, +false);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} CurrentIndex
	 */
	Iris.Serialization.Raft.AppendResponseFB.addCurrentIndex = function(builder, CurrentIndex) {
	  builder.addFieldInt32(2, CurrentIndex, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} FirstIndex
	 */
	Iris.Serialization.Raft.AppendResponseFB.addFirstIndex = function(builder, FirstIndex) {
	  builder.addFieldInt32(3, FirstIndex, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.AppendResponseFB.endAppendResponseFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.InstallSnapshotFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.InstallSnapshotFB}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.InstallSnapshotFB=} obj
	 * @returns {Iris.Serialization.Raft.InstallSnapshotFB}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.getRootAsInstallSnapshotFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.InstallSnapshotFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.prototype.Term = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.prototype.LeaderId = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.prototype.LastIndex = function() {
	  var offset = this.bb.__offset(this.bb_pos, 8);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.prototype.LastTerm = function() {
	  var offset = this.bb.__offset(this.bb_pos, 10);
	  return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {number} index
	 * @param {Iris.Serialization.Raft.LogFB=} obj
	 * @returns {Iris.Serialization.Raft.LogFB}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.prototype.Data = function(index, obj) {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? (obj || new Iris.Serialization.Raft.LogFB).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	};
	
	/**
	 * @returns {number}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.prototype.DataLength = function() {
	  var offset = this.bb.__offset(this.bb_pos, 12);
	  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.startInstallSnapshotFB = function(builder) {
	  builder.startObject(5);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} Term
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.addTerm = function(builder, Term) {
	  builder.addFieldInt32(0, Term, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} LeaderIdOffset
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.addLeaderId = function(builder, LeaderIdOffset) {
	  builder.addFieldOffset(1, LeaderIdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} LastIndex
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.addLastIndex = function(builder, LastIndex) {
	  builder.addFieldInt32(2, LastIndex, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} LastTerm
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.addLastTerm = function(builder, LastTerm) {
	  builder.addFieldInt32(3, LastTerm, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} DataOffset
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.addData = function(builder, DataOffset) {
	  builder.addFieldOffset(4, DataOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Array.<flatbuffers.Offset>} data
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.createDataVector = function(builder, data) {
	  builder.startVector(4, data.length, 4);
	  for (var i = data.length - 1; i >= 0; i--) {
	    builder.addOffset(data[i]);
	  }
	  return builder.endVector();
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {number} numElems
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.startDataVector = function(builder, numElems) {
	  builder.startVector(4, numElems, 4);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.InstallSnapshotFB.endInstallSnapshotFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RequestVoteFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RequestVoteFB}
	 */
	Iris.Serialization.Raft.RequestVoteFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RequestVoteFB=} obj
	 * @returns {Iris.Serialization.Raft.RequestVoteFB}
	 */
	Iris.Serialization.Raft.RequestVoteFB.getRootAsRequestVoteFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RequestVoteFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.RequestVoteFB.prototype.NodeId = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.VoteRequestFB=} obj
	 * @returns {Iris.Serialization.Raft.VoteRequestFB}
	 */
	Iris.Serialization.Raft.RequestVoteFB.prototype.Request = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.VoteRequestFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RequestVoteFB.startRequestVoteFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeIdOffset
	 */
	Iris.Serialization.Raft.RequestVoteFB.addNodeId = function(builder, NodeIdOffset) {
	  builder.addFieldOffset(0, NodeIdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} RequestOffset
	 */
	Iris.Serialization.Raft.RequestVoteFB.addRequest = function(builder, RequestOffset) {
	  builder.addFieldOffset(1, RequestOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RequestVoteFB.endRequestVoteFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RequestVoteResponseFB}
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RequestVoteResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.RequestVoteResponseFB}
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.getRootAsRequestVoteResponseFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RequestVoteResponseFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.prototype.NodeId = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.VoteResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.VoteResponseFB}
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.prototype.Response = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.VoteResponseFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.startRequestVoteResponseFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeIdOffset
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.addNodeId = function(builder, NodeIdOffset) {
	  builder.addFieldOffset(0, NodeIdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ResponseOffset
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.addResponse = function(builder, ResponseOffset) {
	  builder.addFieldOffset(1, ResponseOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RequestVoteResponseFB.endRequestVoteResponseFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RequestAppendEntriesFB}
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RequestAppendEntriesFB=} obj
	 * @returns {Iris.Serialization.Raft.RequestAppendEntriesFB}
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.getRootAsRequestAppendEntriesFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RequestAppendEntriesFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.prototype.NodeId = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.AppendEntriesFB=} obj
	 * @returns {Iris.Serialization.Raft.AppendEntriesFB}
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.prototype.Request = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.AppendEntriesFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.startRequestAppendEntriesFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeIdOffset
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.addNodeId = function(builder, NodeIdOffset) {
	  builder.addFieldOffset(0, NodeIdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} RequestOffset
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.addRequest = function(builder, RequestOffset) {
	  builder.addFieldOffset(1, RequestOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RequestAppendEntriesFB.endRequestAppendEntriesFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RequestAppendResponseFB}
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RequestAppendResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.RequestAppendResponseFB}
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.getRootAsRequestAppendResponseFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RequestAppendResponseFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.prototype.NodeId = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.AppendResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.AppendResponseFB}
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.prototype.Response = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.AppendResponseFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.startRequestAppendResponseFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeIdOffset
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.addNodeId = function(builder, NodeIdOffset) {
	  builder.addFieldOffset(0, NodeIdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ResponseOffset
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.addResponse = function(builder, ResponseOffset) {
	  builder.addFieldOffset(1, ResponseOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RequestAppendResponseFB.endRequestAppendResponseFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RequestInstallSnapshotFB}
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RequestInstallSnapshotFB=} obj
	 * @returns {Iris.Serialization.Raft.RequestInstallSnapshotFB}
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.getRootAsRequestInstallSnapshotFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RequestInstallSnapshotFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.prototype.NodeId = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.InstallSnapshotFB=} obj
	 * @returns {Iris.Serialization.Raft.InstallSnapshotFB}
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.prototype.Request = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.InstallSnapshotFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.startRequestInstallSnapshotFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeIdOffset
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.addNodeId = function(builder, NodeIdOffset) {
	  builder.addFieldOffset(0, NodeIdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} RequestOffset
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.addRequest = function(builder, RequestOffset) {
	  builder.addFieldOffset(1, RequestOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RequestInstallSnapshotFB.endRequestInstallSnapshotFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RequestSnapshotResponseFB}
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RequestSnapshotResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.RequestSnapshotResponseFB}
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.getRootAsRequestSnapshotResponseFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RequestSnapshotResponseFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Encoding=} optionalEncoding
	 * @returns {string|Uint8Array}
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.prototype.NodeId = function(optionalEncoding) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	};
	
	/**
	 * @param {Iris.Serialization.Raft.AppendResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.AppendResponseFB}
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.prototype.Response = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? (obj || new Iris.Serialization.Raft.AppendResponseFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.startRequestSnapshotResponseFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeIdOffset
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.addNodeId = function(builder, NodeIdOffset) {
	  builder.addFieldOffset(0, NodeIdOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ResponseOffset
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.addResponse = function(builder, ResponseOffset) {
	  builder.addFieldOffset(1, ResponseOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RequestSnapshotResponseFB.endRequestSnapshotResponseFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.HandShakeFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.HandShakeFB}
	 */
	Iris.Serialization.Raft.HandShakeFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.HandShakeFB=} obj
	 * @returns {Iris.Serialization.Raft.HandShakeFB}
	 */
	Iris.Serialization.Raft.HandShakeFB.getRootAsHandShakeFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.HandShakeFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.HandShakeFB.prototype.Node = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.HandShakeFB.startHandShakeFB = function(builder) {
	  builder.startObject(1);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeOffset
	 */
	Iris.Serialization.Raft.HandShakeFB.addNode = function(builder, NodeOffset) {
	  builder.addFieldOffset(0, NodeOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.HandShakeFB.endHandShakeFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.HandWaiveFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.HandWaiveFB}
	 */
	Iris.Serialization.Raft.HandWaiveFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.HandWaiveFB=} obj
	 * @returns {Iris.Serialization.Raft.HandWaiveFB}
	 */
	Iris.Serialization.Raft.HandWaiveFB.getRootAsHandWaiveFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.HandWaiveFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.HandWaiveFB.prototype.Node = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.HandWaiveFB.startHandWaiveFB = function(builder) {
	  builder.startObject(1);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeOffset
	 */
	Iris.Serialization.Raft.HandWaiveFB.addNode = function(builder, NodeOffset) {
	  builder.addFieldOffset(0, NodeOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.HandWaiveFB.endHandWaiveFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RedirectFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RedirectFB}
	 */
	Iris.Serialization.Raft.RedirectFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RedirectFB=} obj
	 * @returns {Iris.Serialization.Raft.RedirectFB}
	 */
	Iris.Serialization.Raft.RedirectFB.getRootAsRedirectFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RedirectFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.RedirectFB.prototype.Node = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RedirectFB.startRedirectFB = function(builder) {
	  builder.startObject(1);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeOffset
	 */
	Iris.Serialization.Raft.RedirectFB.addNode = function(builder, NodeOffset) {
	  builder.addFieldOffset(0, NodeOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RedirectFB.endRedirectFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.WelcomeFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.WelcomeFB}
	 */
	Iris.Serialization.Raft.WelcomeFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.WelcomeFB=} obj
	 * @returns {Iris.Serialization.Raft.WelcomeFB}
	 */
	Iris.Serialization.Raft.WelcomeFB.getRootAsWelcomeFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.WelcomeFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {Iris.Serialization.Raft.NodeFB=} obj
	 * @returns {Iris.Serialization.Raft.NodeFB}
	 */
	Iris.Serialization.Raft.WelcomeFB.prototype.Node = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? (obj || new Iris.Serialization.Raft.NodeFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.WelcomeFB.startWelcomeFB = function(builder) {
	  builder.startObject(1);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} NodeOffset
	 */
	Iris.Serialization.Raft.WelcomeFB.addNode = function(builder, NodeOffset) {
	  builder.addFieldOffset(0, NodeOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.WelcomeFB.endWelcomeFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ArrivederciFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ArrivederciFB}
	 */
	Iris.Serialization.Raft.ArrivederciFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ArrivederciFB=} obj
	 * @returns {Iris.Serialization.Raft.ArrivederciFB}
	 */
	Iris.Serialization.Raft.ArrivederciFB.getRootAsArrivederciFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ArrivederciFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ArrivederciFB.startArrivederciFB = function(builder) {
	  builder.startObject(0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ArrivederciFB.endArrivederciFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.ErrorResponseFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.ErrorResponseFB}
	 */
	Iris.Serialization.Raft.ErrorResponseFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.ErrorResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.ErrorResponseFB}
	 */
	Iris.Serialization.Raft.ErrorResponseFB.getRootAsErrorResponseFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.ErrorResponseFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {Iris.Serialization.Raft.ErrorFB=} obj
	 * @returns {Iris.Serialization.Raft.ErrorFB}
	 */
	Iris.Serialization.Raft.ErrorResponseFB.prototype.Error = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? (obj || new Iris.Serialization.Raft.ErrorFB).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.ErrorResponseFB.startErrorResponseFB = function(builder) {
	  builder.startObject(1);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} ErrorOffset
	 */
	Iris.Serialization.Raft.ErrorResponseFB.addError = function(builder, ErrorOffset) {
	  builder.addFieldOffset(0, ErrorOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.ErrorResponseFB.endErrorResponseFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.EmptyResponseFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.EmptyResponseFB}
	 */
	Iris.Serialization.Raft.EmptyResponseFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.EmptyResponseFB=} obj
	 * @returns {Iris.Serialization.Raft.EmptyResponseFB}
	 */
	Iris.Serialization.Raft.EmptyResponseFB.getRootAsEmptyResponseFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.EmptyResponseFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.EmptyResponseFB.startEmptyResponseFB = function(builder) {
	  builder.startObject(0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.EmptyResponseFB.endEmptyResponseFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	/**
	 * @constructor
	 */
	Iris.Serialization.Raft.RaftMsgFB = function() {
	  /**
	   * @type {flatbuffers.ByteBuffer}
	   */
	  this.bb = null;
	
	  /**
	   * @type {number}
	   */
	  this.bb_pos = 0;
	};
	
	/**
	 * @param {number} i
	 * @param {flatbuffers.ByteBuffer} bb
	 * @returns {Iris.Serialization.Raft.RaftMsgFB}
	 */
	Iris.Serialization.Raft.RaftMsgFB.prototype.__init = function(i, bb) {
	  this.bb_pos = i;
	  this.bb = bb;
	  return this;
	};
	
	/**
	 * @param {flatbuffers.ByteBuffer} bb
	 * @param {Iris.Serialization.Raft.RaftMsgFB=} obj
	 * @returns {Iris.Serialization.Raft.RaftMsgFB}
	 */
	Iris.Serialization.Raft.RaftMsgFB.getRootAsRaftMsgFB = function(bb, obj) {
	  return (obj || new Iris.Serialization.Raft.RaftMsgFB).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	};
	
	/**
	 * @returns {Iris.Serialization.Raft.RaftMsgTypeFB}
	 */
	Iris.Serialization.Raft.RaftMsgFB.prototype.MsgType = function() {
	  var offset = this.bb.__offset(this.bb_pos, 4);
	  return offset ? /** @type {Iris.Serialization.Raft.RaftMsgTypeFB} */ (this.bb.readUint8(this.bb_pos + offset)) : Iris.Serialization.Raft.RaftMsgTypeFB.NONE;
	};
	
	/**
	 * @param {flatbuffers.Table} obj
	 * @returns {?flatbuffers.Table}
	 */
	Iris.Serialization.Raft.RaftMsgFB.prototype.Msg = function(obj) {
	  var offset = this.bb.__offset(this.bb_pos, 6);
	  return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 */
	Iris.Serialization.Raft.RaftMsgFB.startRaftMsgFB = function(builder) {
	  builder.startObject(2);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {Iris.Serialization.Raft.RaftMsgTypeFB} MsgType
	 */
	Iris.Serialization.Raft.RaftMsgFB.addMsgType = function(builder, MsgType) {
	  builder.addFieldInt8(0, MsgType, Iris.Serialization.Raft.RaftMsgTypeFB.NONE);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @param {flatbuffers.Offset} MsgOffset
	 */
	Iris.Serialization.Raft.RaftMsgFB.addMsg = function(builder, MsgOffset) {
	  builder.addFieldOffset(1, MsgOffset, 0);
	};
	
	/**
	 * @param {flatbuffers.Builder} builder
	 * @returns {flatbuffers.Offset}
	 */
	Iris.Serialization.Raft.RaftMsgFB.endRaftMsgFB = function(builder) {
	  var offset = builder.endObject();
	  return offset;
	};
	
	// Exports for Node.js and RequireJS
	this.Iris = Iris;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.createBuffer = createBuffer;
	
	function createBuffer(bytes) {
	  return new flatbuffers.flatbuffers.ByteBuffer(new Uint8Array(bytes));
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.Patch = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _IOBox = __webpack_require__(11);
	
	var _Id = __webpack_require__(12);
	
	var _buffers = __webpack_require__(8);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Patch = exports.Patch = function () {
	  function Patch(id, name, iOBoxes) {
	    _classCallCheck(this, Patch);
	
	    this.Id = id;
	    this.Name = name;
	    this.IOBoxes = iOBoxes;
	  }
	
	  Patch.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  Patch.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  Patch.HasIOBox = function HasIOBox(patch, id) {
	    return patch.IOBoxes.has(id);
	  };
	
	  Patch.FindIOBox = function FindIOBox(patches, id) {
	    var folder = function folder(m) {
	      return function (_arg1) {
	        return function (patch) {
	          return m != null ? m : _fableCore.Map.tryFind(id, patch.IOBoxes);
	        };
	      };
	    };
	
	    return _fableCore.Map.fold(function ($var18, $var19, $var20) {
	      return folder($var18)($var19)($var20);
	    }, null, patches);
	  };
	
	  Patch.ContainsIOBox = function ContainsIOBox(patches, id) {
	    var folder = function folder(m) {
	      return function (_arg2) {
	        return function (p) {
	          return m ? m : function (arg00) {
	            return function (arg10) {
	              return Patch.HasIOBox(arg00, arg10);
	            };
	          }(p)(id) ? true : m;
	        };
	      };
	    };
	
	    return _fableCore.Map.fold(function ($var21, $var22, $var23) {
	      return folder($var21)($var22)($var23);
	    }, false, patches);
	  };
	
	  Patch.AddIOBox = function AddIOBox(patch, iobox) {
	    return function (arg00) {
	      return function (arg10) {
	        return Patch.HasIOBox(arg00, arg10);
	      };
	    }(patch)(iobox.Id) ? patch : function () {
	      var IOBoxes = _fableCore.Map.add(iobox.Id, iobox, patch.IOBoxes);
	
	      return new Patch(patch.Id, patch.Name, IOBoxes);
	    }();
	  };
	
	  Patch.UpdateIOBox = function UpdateIOBox(patch, iobox) {
	    return function (arg00) {
	      return function (arg10) {
	        return Patch.HasIOBox(arg00, arg10);
	      };
	    }(patch)(iobox.Id) ? function () {
	      var mapper = function mapper(_arg3) {
	        return function (other) {
	          return other.Id.Equals(iobox.Id) ? iobox : other;
	        };
	      };
	
	      var IOBoxes = _fableCore.Map.map(function ($var24, $var25) {
	        return mapper($var24)($var25);
	      }, patch.IOBoxes);
	
	      return new Patch(patch.Id, patch.Name, IOBoxes);
	    }() : patch;
	  };
	
	  Patch.RemoveIOBox = function RemoveIOBox(patch, iobox) {
	    var IOBoxes = _fableCore.Map.remove(iobox.Id, patch.IOBoxes);
	
	    return new Patch(patch.Id, patch.Name, IOBoxes);
	  };
	
	  Patch.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var arr = new Array(fb.IOBoxesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                  return _IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                    return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                  }(_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	            return x.CompareTo(y);
	          }))]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var arr = new Array(fb.IOBoxesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                  return _IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                    return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                  }(_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	            return x.CompareTo(y);
	          }))]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg6) {
	          return builder_.Return(new Patch(new _Id.Id("Id", [fb.Id()]), fb.Name(), _arg6));
	        }(function () {
	          var arr = new Array(fb.IOBoxesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                  return _IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                    return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                  }(_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg4[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	            return x.CompareTo(y);
	          }))]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg4) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]]) : function (_arg5) {
	                      return builder__1.Return([_arg4[0] + 1, _fableCore.Map.add(_arg5.Id, _arg5, _arg4[1])]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg4[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, _fableCore.Map.create(null, new _fableCore.GenericComparer(function (x, y) {
	              return x.CompareTo(y);
	            }))]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  Patch.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var ioboxoffsets = Array.from(this.IOBoxes).map(function (tupledArg) {
	      return tupledArg[1].ToOffset(builder);
	    });
	
	    var ioboxes = _buffers.Iris.Serialization.Raft.PatchFB.createIOBoxesVector(builder, ioboxoffsets);
	
	    _buffers.Iris.Serialization.Raft.PatchFB.startPatchFB(builder);
	
	    _buffers.Iris.Serialization.Raft.PatchFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.PatchFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.PatchFB.addIOBoxes(builder, ioboxes);
	
	    return _buffers.Iris.Serialization.Raft.PatchFB.endPatchFB(builder);
	  };
	
	  Patch.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  Patch.FromBytes = function FromBytes(bytes) {
	    return Patch.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.PatchFB.getRootAsPatchFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return Patch;
	}();

	_fableCore.Util.setInterfaces(Patch.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.Patch");
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.IOBoxUtils = exports.PinType = exports.Slices = exports.Slice = exports.CompoundSliceD = exports.CompoundBoxD = exports.StringSliceD = exports.StringBoxD = exports.ColorSliceD = exports.ColorBoxD = exports.EnumSliceD = exports.EnumBoxD = exports.ByteSliceD = exports.ByteBoxD = exports.DoubleSliceD = exports.DoubleBoxD = exports.FloatSliceD = exports.FloatBoxD = exports.IntSliceD = exports.IntBoxD = exports.BoolSliceD = exports.BoolBoxD = exports.IOBox = exports.StringType = exports.Behavior = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	var _buffers = __webpack_require__(8);
	
	var _Serialization = __webpack_require__(9);
	
	var _Id = __webpack_require__(12);
	
	var _Aliases = __webpack_require__(13);
	
	var _Color = __webpack_require__(14);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Behavior = exports.Behavior = function () {
	  function Behavior(caseName, fields) {
	    _classCallCheck(this, Behavior);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  Behavior.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  Behavior.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  Behavior.TryParse = function TryParse(str) {
	    var matchValue = str.toLowerCase();
	    var $var5 = null;
	
	    switch (matchValue) {
	      case "toggle":
	        $var5 = new _Either.Either("Right", [new Behavior("Toggle", [])]);
	        break;
	
	      case "bang":
	        $var5 = new _Either.Either("Right", [new Behavior("Bang", [])]);
	        break;
	
	      default:
	        $var5 = _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Invalid Behavior value: %s")(function (x) {
	          return x;
	        })(str)]));
	    }
	
	    return $var5;
	  };
	
	  Behavior.prototype.ToString = function ToString() {
	    return this.Case === "Bang" ? "Bang" : "Toggle";
	  };
	
	  Behavior.FromFB = function FromFB(fb) {
	    return fb === _buffers.Iris.Serialization.Raft.BehaviorFB.ToggleFB ? new _Either.Either("Right", [new Behavior("Toggle", [])]) : fb === _buffers.Iris.Serialization.Raft.BehaviorFB.BangFB ? new _Either.Either("Right", [new Behavior("Bang", [])]) : _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse Behavior: %A")(function (x) {
	      return x;
	    })(fb)]));
	  };
	
	  Behavior.prototype.ToOffset = function ToOffset(_arg1) {
	    return this.Case === "Bang" ? _buffers.Iris.Serialization.Raft.BehaviorFB.BangFB : _buffers.Iris.Serialization.Raft.BehaviorFB.ToggleFB;
	  };
	
	  return Behavior;
	}();
	
	_fableCore.Util.setInterfaces(Behavior.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.Behavior");
	
	var StringType = exports.StringType = function () {
	  function StringType(caseName, fields) {
	    _classCallCheck(this, StringType);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  StringType.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  StringType.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  StringType.TryParse = function TryParse(str) {
	    var matchValue = str.toLowerCase();
	    var $var6 = null;
	
	    switch (matchValue) {
	      case "simple":
	        $var6 = new _Either.Either("Right", [new StringType("Simple", [])]);
	        break;
	
	      case "multiline":
	        $var6 = new _Either.Either("Right", [new StringType("MultiLine", [])]);
	        break;
	
	      case "filename":
	        $var6 = new _Either.Either("Right", [new StringType("FileName", [])]);
	        break;
	
	      case "directory":
	        $var6 = new _Either.Either("Right", [new StringType("Directory", [])]);
	        break;
	
	      case "url":
	        $var6 = new _Either.Either("Right", [new StringType("Url", [])]);
	        break;
	
	      case "ip":
	        $var6 = new _Either.Either("Right", [new StringType("IP", [])]);
	        break;
	
	      default:
	        $var6 = _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Invalid StringType value: %s")(function (x) {
	          return x;
	        })(str)]));
	    }
	
	    return $var6;
	  };
	
	  StringType.prototype.ToString = function ToString() {
	    return this.Case === "MultiLine" ? "MultiLine" : this.Case === "FileName" ? "FileName" : this.Case === "Directory" ? "Directory" : this.Case === "Url" ? "Url" : this.Case === "IP" ? "IP" : "Simple";
	  };
	
	  StringType.FromFB = function FromFB(fb) {
	    return fb === _buffers.Iris.Serialization.Raft.StringTypeFB.SimpleFB ? new _Either.Either("Right", [new StringType("Simple", [])]) : fb === _buffers.Iris.Serialization.Raft.StringTypeFB.MultiLineFB ? new _Either.Either("Right", [new StringType("MultiLine", [])]) : fb === _buffers.Iris.Serialization.Raft.StringTypeFB.FileNameFB ? new _Either.Either("Right", [new StringType("FileName", [])]) : fb === _buffers.Iris.Serialization.Raft.StringTypeFB.DirectoryFB ? new _Either.Either("Right", [new StringType("Directory", [])]) : fb === _buffers.Iris.Serialization.Raft.StringTypeFB.UrlFB ? new _Either.Either("Right", [new StringType("Url", [])]) : fb === _buffers.Iris.Serialization.Raft.StringTypeFB.IPFB ? new _Either.Either("Right", [new StringType("IP", [])]) : _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Cannot parse StringType. Unknown type: %A")(function (x) {
	      return x;
	    })(fb)]));
	  };
	
	  StringType.prototype.ToOffset = function ToOffset(_arg1) {
	    return this.Case === "MultiLine" ? _buffers.Iris.Serialization.Raft.StringTypeFB.MultiLineFB : this.Case === "FileName" ? _buffers.Iris.Serialization.Raft.StringTypeFB.FileNameFB : this.Case === "Directory" ? _buffers.Iris.Serialization.Raft.StringTypeFB.DirectoryFB : this.Case === "Url" ? _buffers.Iris.Serialization.Raft.StringTypeFB.UrlFB : this.Case === "IP" ? _buffers.Iris.Serialization.Raft.StringTypeFB.IPFB : _buffers.Iris.Serialization.Raft.StringTypeFB.SimpleFB;
	  };
	
	  return StringType;
	}();
	
	_fableCore.Util.setInterfaces(StringType.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.StringType");
	
	var IOBox = exports.IOBox = function () {
	  function IOBox(caseName, fields) {
	    _classCallCheck(this, IOBox);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  IOBox.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  IOBox.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  IOBox.prototype.SetName = function SetName(name) {
	    return this.Case === "IntBox" ? new IOBox("IntBox", [new IntBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].VecSize, this.Fields[0].Min, this.Fields[0].Max, this.Fields[0].Unit, this.Fields[0].Slices)]) : this.Case === "FloatBox" ? new IOBox("FloatBox", [new FloatBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].VecSize, this.Fields[0].Min, this.Fields[0].Max, this.Fields[0].Unit, this.Fields[0].Precision, this.Fields[0].Slices)]) : this.Case === "DoubleBox" ? new IOBox("DoubleBox", [new DoubleBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].VecSize, this.Fields[0].Min, this.Fields[0].Max, this.Fields[0].Unit, this.Fields[0].Precision, this.Fields[0].Slices)]) : this.Case === "BoolBox" ? new IOBox("BoolBox", [new BoolBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].Behavior, this.Fields[0].Slices)]) : this.Case === "ByteBox" ? new IOBox("ByteBox", [new ByteBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].Slices)]) : this.Case === "EnumBox" ? new IOBox("EnumBox", [new EnumBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].Properties, this.Fields[0].Slices)]) : this.Case === "ColorBox" ? new IOBox("ColorBox", [new ColorBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].Slices)]) : this.Case === "Compound" ? new IOBox("Compound", [new CompoundBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].Slices)]) : new IOBox("StringBox", [new StringBoxD(this.Fields[0].Id, name, this.Fields[0].Patch, this.Fields[0].Tags, this.Fields[0].StringType, this.Fields[0].FileMask, this.Fields[0].MaxChars, this.Fields[0].Slices)]);
	  };
	
	  IOBox.prototype.SetSlice = function SetSlice(value) {
	    var _this = this;
	
	    var update = function update(arr) {
	      return function (data) {
	        return (value.Index + 0x80000000 >>> 0) - 0x80000000 > arr.length ? function () {
	          var newarr = arr.slice();
	          newarr[(value.Index + 0x80000000 >>> 0) - 0x80000000] = data;
	          return newarr;
	        }() : Array.from(_fableCore.Seq.mapIndexed(function (i, d) {
	          return i === (value.Index + 0x80000000 >>> 0) - 0x80000000 ? data : d;
	        }, arr));
	      };
	    };
	
	    if (this.Case === "IntBox") {
	      var current = this;
	
	      if (value.Case === "IntSlice") {
	        return new IOBox("IntBox", [function () {
	          var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	          return new IntBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, _this.Fields[0].VecSize, _this.Fields[0].Min, _this.Fields[0].Max, _this.Fields[0].Unit, Slices_1);
	        }()]);
	      } else {
	        return current;
	      }
	    } else {
	      if (this.Case === "FloatBox") {
	        var _current = this;
	
	        if (value.Case === "FloatSlice") {
	          return new IOBox("FloatBox", [function () {
	            var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	            return new FloatBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, _this.Fields[0].VecSize, _this.Fields[0].Min, _this.Fields[0].Max, _this.Fields[0].Unit, _this.Fields[0].Precision, Slices_1);
	          }()]);
	        } else {
	          return _current;
	        }
	      } else {
	        if (this.Case === "DoubleBox") {
	          var _current2 = this;
	
	          if (value.Case === "DoubleSlice") {
	            return new IOBox("DoubleBox", [function () {
	              var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	              return new DoubleBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, _this.Fields[0].VecSize, _this.Fields[0].Min, _this.Fields[0].Max, _this.Fields[0].Unit, _this.Fields[0].Precision, Slices_1);
	            }()]);
	          } else {
	            return _current2;
	          }
	        } else {
	          if (this.Case === "BoolBox") {
	            var _current3 = this;
	
	            if (value.Case === "BoolSlice") {
	              return new IOBox("BoolBox", [function () {
	                var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	                return new BoolBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, _this.Fields[0].Behavior, Slices_1);
	              }()]);
	            } else {
	              return _current3;
	            }
	          } else {
	            if (this.Case === "ByteBox") {
	              var _current4 = this;
	
	              if (value.Case === "ByteSlice") {
	                return new IOBox("ByteBox", [function () {
	                  var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	                  return new ByteBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, Slices_1);
	                }()]);
	              } else {
	                return _current4;
	              }
	            } else {
	              if (this.Case === "EnumBox") {
	                var _current5 = this;
	
	                if (value.Case === "EnumSlice") {
	                  return new IOBox("EnumBox", [function () {
	                    var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	                    return new EnumBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, _this.Fields[0].Properties, Slices_1);
	                  }()]);
	                } else {
	                  return _current5;
	                }
	              } else {
	                if (this.Case === "ColorBox") {
	                  var _current6 = this;
	
	                  if (value.Case === "ColorSlice") {
	                    return new IOBox("ColorBox", [function () {
	                      var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	                      return new ColorBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, Slices_1);
	                    }()]);
	                  } else {
	                    return _current6;
	                  }
	                } else {
	                  if (this.Case === "Compound") {
	                    var _current7 = this;
	
	                    if (value.Case === "CompoundSlice") {
	                      return new IOBox("Compound", [function () {
	                        var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	                        return new CompoundBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, Slices_1);
	                      }()]);
	                    } else {
	                      return _current7;
	                    }
	                  } else {
	                    var _current8 = this;
	
	                    if (value.Case === "StringSlice") {
	                      return new IOBox("StringBox", [function () {
	                        var Slices_1 = update(_this.Fields[0].Slices)(value.Fields[0]);
	                        return new StringBoxD(_this.Fields[0].Id, _this.Fields[0].Name, _this.Fields[0].Patch, _this.Fields[0].Tags, _this.Fields[0].StringType, _this.Fields[0].FileMask, _this.Fields[0].MaxChars, Slices_1);
	                      }()]);
	                    } else {
	                      return _current8;
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  IOBox.prototype.SetSlices = function SetSlices(slices) {
	    var _this2 = this;
	
	    return this.Case === "IntBox" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "IntSlices") {
	        return new IOBox("IntBox", [new IntBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, _this2.Fields[0].VecSize, _this2.Fields[0].Min, _this2.Fields[0].Max, _this2.Fields[0].Unit, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : this.Case === "FloatBox" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "FloatSlices") {
	        return new IOBox("FloatBox", [new FloatBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, _this2.Fields[0].VecSize, _this2.Fields[0].Min, _this2.Fields[0].Max, _this2.Fields[0].Unit, _this2.Fields[0].Precision, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : this.Case === "DoubleBox" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "DoubleSlices") {
	        return new IOBox("DoubleBox", [new DoubleBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, _this2.Fields[0].VecSize, _this2.Fields[0].Min, _this2.Fields[0].Max, _this2.Fields[0].Unit, _this2.Fields[0].Precision, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : this.Case === "BoolBox" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "BoolSlices") {
	        return new IOBox("BoolBox", [new BoolBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, _this2.Fields[0].Behavior, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : this.Case === "ByteBox" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "ByteSlices") {
	        return new IOBox("ByteBox", [new ByteBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : this.Case === "EnumBox" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "EnumSlices") {
	        return new IOBox("EnumBox", [new EnumBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, _this2.Fields[0].Properties, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : this.Case === "ColorBox" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "ColorSlices") {
	        return new IOBox("ColorBox", [new ColorBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : this.Case === "Compound" ? function () {
	      var value = _this2;
	
	      if (slices.Case === "CompoundSlices") {
	        return new IOBox("Compound", [new CompoundBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }() : function () {
	      var value = _this2;
	
	      if (slices.Case === "StringSlices") {
	        return new IOBox("StringBox", [new StringBoxD(_this2.Fields[0].Id, _this2.Fields[0].Name, _this2.Fields[0].Patch, _this2.Fields[0].Tags, _this2.Fields[0].StringType, _this2.Fields[0].FileMask, _this2.Fields[0].MaxChars, slices.Fields[0])]);
	      } else {
	        return value;
	      }
	    }();
	  };
	
	  IOBox.Toggle = function Toggle(id, name, patch, tags, values) {
	    return new IOBox("BoolBox", [new BoolBoxD(id, name, patch, tags, new Behavior("Toggle", []), values)]);
	  };
	
	  IOBox.Bang = function Bang(id, name, patch, tags, values) {
	    return new IOBox("BoolBox", [new BoolBoxD(id, name, patch, tags, new Behavior("Bang", []), values)]);
	  };
	
	  IOBox.String = function String(id, name, patch, tags, values) {
	    return new IOBox("StringBox", [new StringBoxD(id, name, patch, tags, new StringType("Simple", []), null, function () {
	      return 0;
	    }(), values)]);
	  };
	
	  IOBox.MultiLine = function MultiLine(id, name, patch, tags, values) {
	    return new IOBox("StringBox", [new StringBoxD(id, name, patch, tags, new StringType("MultiLine", []), null, function () {
	      return 0;
	    }(), values)]);
	  };
	
	  IOBox.FileName = function FileName(id, name, patch, tags, filemask, values) {
	    return new IOBox("StringBox", [new StringBoxD(id, name, patch, tags, new StringType("FileName", []), filemask, function () {
	      return 0;
	    }(), values)]);
	  };
	
	  IOBox.Directory = function Directory(id, name, patch, tags, filemask, values) {
	    return new IOBox("StringBox", [new StringBoxD(id, name, patch, tags, new StringType("Directory", []), filemask, function () {
	      return 0;
	    }(), values)]);
	  };
	
	  IOBox.Url = function Url(id, name, patch, tags, values) {
	    return new IOBox("StringBox", [new StringBoxD(id, name, patch, tags, new StringType("Url", []), null, function () {
	      return 0;
	    }(), values)]);
	  };
	
	  IOBox.IP = function IP(id, name, patch, tags, values) {
	    return new IOBox("StringBox", [new StringBoxD(id, name, patch, tags, new StringType("Url", []), null, function () {
	      return 0;
	    }(), values)]);
	  };
	
	  IOBox.Float = function Float(id, name, patch, tags, values) {
	    return new IOBox("FloatBox", [new FloatBoxD(id, name, patch, tags, 1, 0, function () {
	      return 0;
	    }(), "", 4, values)]);
	  };
	
	  IOBox.Double = function Double(id, name, patch, tags, values) {
	    return new IOBox("DoubleBox", [new DoubleBoxD(id, name, patch, tags, 1, 0, function () {
	      return 0;
	    }(), "", 4, values)]);
	  };
	
	  IOBox.Bytes = function Bytes(id, name, patch, tags, values) {
	    return new IOBox("ByteBox", [new ByteBoxD(id, name, patch, tags, values)]);
	  };
	
	  IOBox.Color = function Color(id, name, patch, tags, values) {
	    return new IOBox("ColorBox", [new ColorBoxD(id, name, patch, tags, values)]);
	  };
	
	  IOBox.Enum = function Enum(id, name, patch, tags, properties, values) {
	    return new IOBox("EnumBox", [new EnumBoxD(id, name, patch, tags, properties, values)]);
	  };
	
	  IOBox.CompoundBox = function CompoundBox(id, name, patch, tags, values) {
	    return new IOBox("Compound", [new CompoundBoxD(id, name, patch, tags, values)]);
	  };
	
	  IOBox.prototype.ToOffset = function ToOffset(builder) {
	    var build = function build(data) {
	      return function (tipe) {
	        var offset = data.ToOffset(builder);
	
	        _buffers.Iris.Serialization.Raft.IOBoxFB.startIOBoxFB(builder);
	
	        _buffers.Iris.Serialization.Raft.IOBoxFB.addIOBox(builder, offset);
	
	        _buffers.Iris.Serialization.Raft.IOBoxFB.addIOBoxType(builder, tipe);
	
	        return _buffers.Iris.Serialization.Raft.IOBoxFB.endIOBoxFB(builder);
	      };
	    };
	
	    if (this.Case === "IntBox") {
	      return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.IntBoxFB);
	    } else {
	      if (this.Case === "FloatBox") {
	        return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.FloatBoxFB);
	      } else {
	        if (this.Case === "DoubleBox") {
	          return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.DoubleBoxFB);
	        } else {
	          if (this.Case === "BoolBox") {
	            return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.BoolBoxFB);
	          } else {
	            if (this.Case === "ByteBox") {
	              return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.ByteBoxFB);
	            } else {
	              if (this.Case === "EnumBox") {
	                return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.EnumBoxFB);
	              } else {
	                if (this.Case === "ColorBox") {
	                  return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.ColorBoxFB);
	                } else {
	                  if (this.Case === "Compound") {
	                    return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.CompoundBoxFB);
	                  } else {
	                    return build(this.Fields[0])(_buffers.Iris.Serialization.Raft.IOBoxTypeFB.StringBoxFB);
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  IOBox.FromFB = function FromFB(fb) {
	    var matchValue = fb.IOBoxType();
	
	    if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.StringBoxFB) {
	      if (StringBoxD.FromFB(function (arg00) {
	        return fb.IOBox(arg00);
	      }(new _buffers.Iris.Serialization.Raft.StringBoxFB())).Case === "Left") {
	        return new _Either.Either("Left", [StringBoxD.FromFB(function (arg00) {
	          return fb.IOBox(arg00);
	        }(new _buffers.Iris.Serialization.Raft.StringBoxFB())).Fields[0]]);
	      } else {
	        return _Either.EitherModule.succeed(function (arg0) {
	          return new IOBox("StringBox", [arg0]);
	        }(StringBoxD.FromFB(function (arg00) {
	          return fb.IOBox(arg00);
	        }(new _buffers.Iris.Serialization.Raft.StringBoxFB())).Fields[0]));
	      }
	    } else {
	      if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.IntBoxFB) {
	        if (IntBoxD.FromFB(function (arg00) {
	          return fb.IOBox(arg00);
	        }(new _buffers.Iris.Serialization.Raft.IntBoxFB())).Case === "Left") {
	          return new _Either.Either("Left", [IntBoxD.FromFB(function (arg00) {
	            return fb.IOBox(arg00);
	          }(new _buffers.Iris.Serialization.Raft.IntBoxFB())).Fields[0]]);
	        } else {
	          return _Either.EitherModule.succeed(function (arg0) {
	            return new IOBox("IntBox", [arg0]);
	          }(IntBoxD.FromFB(function (arg00) {
	            return fb.IOBox(arg00);
	          }(new _buffers.Iris.Serialization.Raft.IntBoxFB())).Fields[0]));
	        }
	      } else {
	        if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.FloatBoxFB) {
	          if (FloatBoxD.FromFB(function (arg00) {
	            return fb.IOBox(arg00);
	          }(new _buffers.Iris.Serialization.Raft.FloatBoxFB())).Case === "Left") {
	            return new _Either.Either("Left", [FloatBoxD.FromFB(function (arg00) {
	              return fb.IOBox(arg00);
	            }(new _buffers.Iris.Serialization.Raft.FloatBoxFB())).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (arg0) {
	              return new IOBox("FloatBox", [arg0]);
	            }(FloatBoxD.FromFB(function (arg00) {
	              return fb.IOBox(arg00);
	            }(new _buffers.Iris.Serialization.Raft.FloatBoxFB())).Fields[0]));
	          }
	        } else {
	          if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.DoubleBoxFB) {
	            if (DoubleBoxD.FromFB(function (arg00) {
	              return fb.IOBox(arg00);
	            }(new _buffers.Iris.Serialization.Raft.DoubleBoxFB())).Case === "Left") {
	              return new _Either.Either("Left", [DoubleBoxD.FromFB(function (arg00) {
	                return fb.IOBox(arg00);
	              }(new _buffers.Iris.Serialization.Raft.DoubleBoxFB())).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (arg0) {
	                return new IOBox("DoubleBox", [arg0]);
	              }(DoubleBoxD.FromFB(function (arg00) {
	                return fb.IOBox(arg00);
	              }(new _buffers.Iris.Serialization.Raft.DoubleBoxFB())).Fields[0]));
	            }
	          } else {
	            if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.BoolBoxFB) {
	              if (BoolBoxD.FromFB(function (arg00) {
	                return fb.IOBox(arg00);
	              }(new _buffers.Iris.Serialization.Raft.BoolBoxFB())).Case === "Left") {
	                return new _Either.Either("Left", [BoolBoxD.FromFB(function (arg00) {
	                  return fb.IOBox(arg00);
	                }(new _buffers.Iris.Serialization.Raft.BoolBoxFB())).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (arg0) {
	                  return new IOBox("BoolBox", [arg0]);
	                }(BoolBoxD.FromFB(function (arg00) {
	                  return fb.IOBox(arg00);
	                }(new _buffers.Iris.Serialization.Raft.BoolBoxFB())).Fields[0]));
	              }
	            } else {
	              if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.ByteBoxFB) {
	                if (ByteBoxD.FromFB(function (arg00) {
	                  return fb.IOBox(arg00);
	                }(new _buffers.Iris.Serialization.Raft.ByteBoxFB())).Case === "Left") {
	                  return new _Either.Either("Left", [ByteBoxD.FromFB(function (arg00) {
	                    return fb.IOBox(arg00);
	                  }(new _buffers.Iris.Serialization.Raft.ByteBoxFB())).Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (arg0) {
	                    return new IOBox("ByteBox", [arg0]);
	                  }(ByteBoxD.FromFB(function (arg00) {
	                    return fb.IOBox(arg00);
	                  }(new _buffers.Iris.Serialization.Raft.ByteBoxFB())).Fields[0]));
	                }
	              } else {
	                if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.EnumBoxFB) {
	                  if (EnumBoxD.FromFB(function (arg00) {
	                    return fb.IOBox(arg00);
	                  }(new _buffers.Iris.Serialization.Raft.EnumBoxFB())).Case === "Left") {
	                    return new _Either.Either("Left", [EnumBoxD.FromFB(function (arg00) {
	                      return fb.IOBox(arg00);
	                    }(new _buffers.Iris.Serialization.Raft.EnumBoxFB())).Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (arg0) {
	                      return new IOBox("EnumBox", [arg0]);
	                    }(EnumBoxD.FromFB(function (arg00) {
	                      return fb.IOBox(arg00);
	                    }(new _buffers.Iris.Serialization.Raft.EnumBoxFB())).Fields[0]));
	                  }
	                } else {
	                  if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.ColorBoxFB) {
	                    if (ColorBoxD.FromFB(function (arg00) {
	                      return fb.IOBox(arg00);
	                    }(new _buffers.Iris.Serialization.Raft.ColorBoxFB())).Case === "Left") {
	                      return new _Either.Either("Left", [ColorBoxD.FromFB(function (arg00) {
	                        return fb.IOBox(arg00);
	                      }(new _buffers.Iris.Serialization.Raft.ColorBoxFB())).Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (arg0) {
	                        return new IOBox("ColorBox", [arg0]);
	                      }(ColorBoxD.FromFB(function (arg00) {
	                        return fb.IOBox(arg00);
	                      }(new _buffers.Iris.Serialization.Raft.ColorBoxFB())).Fields[0]));
	                    }
	                  } else {
	                    if (matchValue === _buffers.Iris.Serialization.Raft.IOBoxTypeFB.CompoundBoxFB) {
	                      if (CompoundBoxD.FromFB(function (arg00) {
	                        return fb.IOBox(arg00);
	                      }(new _buffers.Iris.Serialization.Raft.CompoundBoxFB())).Case === "Left") {
	                        return new _Either.Either("Left", [CompoundBoxD.FromFB(function (arg00) {
	                          return fb.IOBox(arg00);
	                        }(new _buffers.Iris.Serialization.Raft.CompoundBoxFB())).Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (arg0) {
	                          return new IOBox("Compound", [arg0]);
	                        }(CompoundBoxD.FromFB(function (arg00) {
	                          return fb.IOBox(arg00);
	                        }(new _buffers.Iris.Serialization.Raft.CompoundBoxFB())).Fields[0]));
	                      }
	                    } else {
	                      return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("%A is not a valid IOBoxTypeFB")(function (x) {
	                        return x;
	                      })(matchValue)]));
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  IOBox.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  IOBox.FromBytes = function FromBytes(bytes) {
	    return IOBox.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.IOBoxFB.getRootAsIOBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  _createClass(IOBox, [{
	    key: "Id",
	    get: function get() {
	      return this.Case === "IntBox" ? this.Fields[0].Id : this.Case === "FloatBox" ? this.Fields[0].Id : this.Case === "DoubleBox" ? this.Fields[0].Id : this.Case === "BoolBox" ? this.Fields[0].Id : this.Case === "ByteBox" ? this.Fields[0].Id : this.Case === "EnumBox" ? this.Fields[0].Id : this.Case === "ColorBox" ? this.Fields[0].Id : this.Case === "Compound" ? this.Fields[0].Id : this.Fields[0].Id;
	    }
	  }, {
	    key: "Name",
	    get: function get() {
	      return this.Case === "IntBox" ? this.Fields[0].Name : this.Case === "FloatBox" ? this.Fields[0].Name : this.Case === "DoubleBox" ? this.Fields[0].Name : this.Case === "BoolBox" ? this.Fields[0].Name : this.Case === "ByteBox" ? this.Fields[0].Name : this.Case === "EnumBox" ? this.Fields[0].Name : this.Case === "ColorBox" ? this.Fields[0].Name : this.Case === "Compound" ? this.Fields[0].Name : this.Fields[0].Name;
	    }
	  }, {
	    key: "Patch",
	    get: function get() {
	      return this.Case === "IntBox" ? this.Fields[0].Patch : this.Case === "FloatBox" ? this.Fields[0].Patch : this.Case === "DoubleBox" ? this.Fields[0].Patch : this.Case === "BoolBox" ? this.Fields[0].Patch : this.Case === "ByteBox" ? this.Fields[0].Patch : this.Case === "EnumBox" ? this.Fields[0].Patch : this.Case === "ColorBox" ? this.Fields[0].Patch : this.Case === "Compound" ? this.Fields[0].Patch : this.Fields[0].Patch;
	    }
	  }, {
	    key: "Slices",
	    get: function get() {
	      return this.Case === "IntBox" ? new Slices("IntSlices", [this.Fields[0].Slices]) : this.Case === "FloatBox" ? new Slices("FloatSlices", [this.Fields[0].Slices]) : this.Case === "DoubleBox" ? new Slices("DoubleSlices", [this.Fields[0].Slices]) : this.Case === "BoolBox" ? new Slices("BoolSlices", [this.Fields[0].Slices]) : this.Case === "ByteBox" ? new Slices("ByteSlices", [this.Fields[0].Slices]) : this.Case === "EnumBox" ? new Slices("EnumSlices", [this.Fields[0].Slices]) : this.Case === "ColorBox" ? new Slices("ColorSlices", [this.Fields[0].Slices]) : this.Case === "Compound" ? new Slices("CompoundSlices", [this.Fields[0].Slices]) : new Slices("StringSlices", [this.Fields[0].Slices]);
	    }
	  }]);
	
	  return IOBox;
	}();
	
	_fableCore.Util.setInterfaces(IOBox.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.IOBox");
	
	var BoolBoxD = exports.BoolBoxD = function () {
	  function BoolBoxD(id, name, patch, tags, behavior, slices) {
	    _classCallCheck(this, BoolBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.Behavior = behavior;
	    this.Slices = slices;
	  }
	
	  BoolBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  BoolBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  BoolBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var behavior = this.Behavior.ToOffset(builder);
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.BoolBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.BoolBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.BoolBoxFB.startBoolBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.BoolBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.BoolBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.BoolBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.BoolBoxFB.addBehavior(builder, behavior);
	
	    _buffers.Iris.Serialization.Raft.BoolBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.BoolBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.BoolBoxFB.endBoolBoxFB(builder);
	  };
	
	  BoolBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg4) {
	          return function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Case === "Left" ? new _Either.Either("Left", [function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]) : function (_arg5) {
	            return Behavior.FromFB(fb.Behavior()).Case === "Left" ? new _Either.Either("Left", [Behavior.FromFB(fb.Behavior()).Fields[0]]) : function (_arg6) {
	              return builder_.Return(new BoolBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg4, _arg6, _arg5));
	            }(Behavior.FromFB(fb.Behavior()).Fields[0]);
	          }(function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return BoolSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return BoolSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }(function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  BoolBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  BoolBoxD.FromBytes = function FromBytes(bytes) {
	    return BoolBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.BoolBoxFB.getRootAsBoolBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return BoolBoxD;
	}();
	
	_fableCore.Util.setInterfaces(BoolBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.BoolBoxD");
	
	var BoolSliceD = exports.BoolSliceD = function () {
	  function BoolSliceD(index, value) {
	    _classCallCheck(this, BoolSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  BoolSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  BoolSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  BoolSliceD.Create = function Create(idx, value) {
	    return new BoolSliceD(idx, value);
	  };
	
	  BoolSliceD.prototype.ToOffset = function ToOffset(builder) {
	    _buffers.Iris.Serialization.Raft.BoolSliceFB.startBoolSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.BoolSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.BoolSliceFB.addValue(builder, this.Value);
	
	    return _buffers.Iris.Serialization.Raft.BoolSliceFB.endBoolSliceFB(builder);
	  };
	
	  BoolSliceD.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new BoolSliceD(fb.Index(), fb.Value());
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("BoolSlice")(exn)));
	    }
	  };
	
	  BoolSliceD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  BoolSliceD.FromBytes = function FromBytes(bytes) {
	    return BoolSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.BoolSliceFB.getRootAsBoolSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return BoolSliceD;
	}();
	
	_fableCore.Util.setInterfaces(BoolSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.BoolSliceD");
	
	var IntBoxD = exports.IntBoxD = function () {
	  function IntBoxD(id, name, patch, tags, vecSize, min, max, unit, slices) {
	    _classCallCheck(this, IntBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.VecSize = vecSize;
	    this.Min = min;
	    this.Max = max;
	    this.Unit = unit;
	    this.Slices = slices;
	  }
	
	  IntBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  IntBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  IntBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var unit = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Unit);
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.IntBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.IntBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.startIntBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addVecSize(builder, this.VecSize);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addMin(builder, this.Min);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addMax(builder, this.Max);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addUnit(builder, unit);
	
	    _buffers.Iris.Serialization.Raft.IntBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.IntBoxFB.endIntBoxFB(builder);
	  };
	
	  IntBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        var unit = fb.Unit() == null ? "" : fb.Unit();
	
	        if (function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left") {
	          return new _Either.Either("Left", [function () {
	            var len = fb.get_TagsLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]);
	        } else {
	          return function (_arg7) {
	            return function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Case === "Left" ? new _Either.Either("Left", [function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Fields[0]]) : function (_arg8) {
	              return builder_.Return(new IntBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg7, fb.VecSize(), fb.Min(), fb.Max(), unit, _arg8));
	            }(function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return IntSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return IntSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Fields[0]);
	          }(function () {
	            var len = fb.get_TagsLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  IntBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  IntBoxD.FromBytes = function FromBytes(bytes) {
	    return IntBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.IntBoxFB.getRootAsIntBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return IntBoxD;
	}();
	
	_fableCore.Util.setInterfaces(IntBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.IntBoxD");
	
	var IntSliceD = exports.IntSliceD = function () {
	  function IntSliceD(index, value) {
	    _classCallCheck(this, IntSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  IntSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  IntSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  IntSliceD.Create = function Create(idx, value) {
	    return new IntSliceD(idx, value);
	  };
	
	  IntSliceD.prototype.ToOffset = function ToOffset(builder) {
	    _buffers.Iris.Serialization.Raft.IntSliceFB.startIntSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.IntSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.IntSliceFB.addValue(builder, this.Value);
	
	    return _buffers.Iris.Serialization.Raft.IntSliceFB.endIntSliceFB(builder);
	  };
	
	  IntSliceD.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new IntSliceD(fb.Index(), fb.Value());
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("IntSliceFB")(exn)));
	    }
	  };
	
	  IntSliceD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  IntSliceD.FromBytes = function FromBytes(bytes) {
	    return IntSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.IntSliceFB.getRootAsIntSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return IntSliceD;
	}();
	
	_fableCore.Util.setInterfaces(IntSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.IntSliceD");
	
	var FloatBoxD = exports.FloatBoxD = function () {
	  function FloatBoxD(id, name, patch, tags, vecSize, min, max, unit, precision, slices) {
	    _classCallCheck(this, FloatBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.VecSize = vecSize;
	    this.Min = min;
	    this.Max = max;
	    this.Unit = unit;
	    this.Precision = precision;
	    this.Slices = slices;
	  }
	
	  FloatBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  FloatBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  FloatBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var unit = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Unit);
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.FloatBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.FloatBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.startFloatBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addVecSize(builder, this.VecSize);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addMin(builder, this.Min);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addMax(builder, this.Max);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addUnit(builder, unit);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addPrecision(builder, this.Precision);
	
	    _buffers.Iris.Serialization.Raft.FloatBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.FloatBoxFB.endFloatBoxFB(builder);
	  };
	
	  FloatBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg9) {
	          return function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Case === "Left" ? new _Either.Either("Left", [function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]) : function (_arg10) {
	            var unit = fb.Unit() == null ? "" : fb.Unit();
	            return builder_.Return(new FloatBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg9, fb.VecSize(), fb.Min(), fb.Max(), unit, fb.Precision(), _arg10));
	          }(function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return FloatSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return FloatSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }(function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  FloatBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  FloatBoxD.FromBytes = function FromBytes(bytes) {
	    return FloatBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.FloatBoxFB.getRootAsFloatBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return FloatBoxD;
	}();
	
	_fableCore.Util.setInterfaces(FloatBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.FloatBoxD");
	
	var FloatSliceD = exports.FloatSliceD = function () {
	  function FloatSliceD(index, value) {
	    _classCallCheck(this, FloatSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  FloatSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  FloatSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  FloatSliceD.Create = function Create(idx, value) {
	    return new FloatSliceD(idx, value);
	  };
	
	  FloatSliceD.prototype.ToOffset = function ToOffset(builder) {
	    _buffers.Iris.Serialization.Raft.FloatSliceFB.startFloatSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.FloatSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.FloatSliceFB.addValue(builder, this.Value);
	
	    return _buffers.Iris.Serialization.Raft.FloatSliceFB.endFloatSliceFB(builder);
	  };
	
	  FloatSliceD.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new FloatSliceD(fb.Index(), fb.Value());
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("FloatSliceFB")(exn)));
	    }
	  };
	
	  FloatSliceD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  FloatSliceD.FromBytes = function FromBytes(bytes) {
	    return FloatSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.FloatSliceFB.getRootAsFloatSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return FloatSliceD;
	}();
	
	_fableCore.Util.setInterfaces(FloatSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.FloatSliceD");
	
	var DoubleBoxD = exports.DoubleBoxD = function () {
	  function DoubleBoxD(id, name, patch, tags, vecSize, min, max, unit, precision, slices) {
	    _classCallCheck(this, DoubleBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.VecSize = vecSize;
	    this.Min = min;
	    this.Max = max;
	    this.Unit = unit;
	    this.Precision = precision;
	    this.Slices = slices;
	  }
	
	  DoubleBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  DoubleBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  DoubleBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var unit = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Unit);
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.DoubleBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.DoubleBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.startDoubleBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addVecSize(builder, this.VecSize);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addMin(builder, this.Min);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addMax(builder, this.Max);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addUnit(builder, unit);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addPrecision(builder, this.Precision);
	
	    _buffers.Iris.Serialization.Raft.DoubleBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.DoubleBoxFB.endDoubleBoxFB(builder);
	  };
	
	  DoubleBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        var unit = fb.Unit() == null ? "" : fb.Unit();
	
	        if (function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left") {
	          return new _Either.Either("Left", [function () {
	            var len = fb.get_TagsLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]);
	        } else {
	          return function (_arg11) {
	            return function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Case === "Left" ? new _Either.Either("Left", [function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Fields[0]]) : function (_arg12) {
	              return builder_.Return(new DoubleBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg11, fb.VecSize(), fb.Min(), fb.Max(), unit, fb.Precision(), _arg12));
	            }(function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return DoubleSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return DoubleSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Fields[0]);
	          }(function () {
	            var len = fb.get_TagsLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  DoubleBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  DoubleBoxD.FromBytes = function FromBytes(bytes) {
	    return DoubleBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.DoubleBoxFB.getRootAsDoubleBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return DoubleBoxD;
	}();
	
	_fableCore.Util.setInterfaces(DoubleBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.DoubleBoxD");
	
	var DoubleSliceD = exports.DoubleSliceD = function () {
	  function DoubleSliceD(index, value) {
	    _classCallCheck(this, DoubleSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  DoubleSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  DoubleSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  DoubleSliceD.Create = function Create(idx, value) {
	    return new DoubleSliceD(idx, value);
	  };
	
	  DoubleSliceD.prototype.ToOffset = function ToOffset(builder) {
	    _buffers.Iris.Serialization.Raft.DoubleSliceFB.startDoubleSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.DoubleSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.DoubleSliceFB.addValue(builder, this.Value);
	
	    return _buffers.Iris.Serialization.Raft.DoubleSliceFB.endDoubleSliceFB(builder);
	  };
	
	  DoubleSliceD.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new DoubleSliceD(fb.Index(), fb.Value());
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("DoubleSliceD")(exn)));
	    }
	  };
	
	  DoubleSliceD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  DoubleSliceD.FromBytes = function FromBytes(bytes) {
	    return DoubleSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.DoubleSliceFB.getRootAsDoubleSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return DoubleSliceD;
	}();
	
	_fableCore.Util.setInterfaces(DoubleSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.DoubleSliceD");
	
	var ByteBoxD = exports.ByteBoxD = function () {
	  function ByteBoxD(id, name, patch, tags, slices) {
	    _classCallCheck(this, ByteBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.Slices = slices;
	  }
	
	  ByteBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  ByteBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  ByteBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.ByteBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.ByteBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.ByteBoxFB.startByteBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.ByteBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.ByteBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.ByteBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.ByteBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.ByteBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.ByteBoxFB.endByteBoxFB(builder);
	  };
	
	  ByteBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg13) {
	          return function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Case === "Left" ? new _Either.Either("Left", [function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]) : function (_arg14) {
	            return builder_.Return(new ByteBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg13, _arg14));
	          }(function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ByteSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ByteSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }(function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  ByteBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  ByteBoxD.FromBytes = function FromBytes(bytes) {
	    return ByteBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ByteBoxFB.getRootAsByteBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return ByteBoxD;
	}();
	
	_fableCore.Util.setInterfaces(ByteBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.ByteBoxD");
	
	var ByteSliceD = exports.ByteSliceD = function () {
	  function ByteSliceD(index, value) {
	    _classCallCheck(this, ByteSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  ByteSliceD.Create = function Create(idx, value) {
	    return new ByteSliceD(idx, value);
	  };
	
	  ByteSliceD.prototype.Equals_0 = function Equals_0(other) {
	    var _this3 = this;
	
	    return other instanceof ByteSliceD ? function () {
	      var slice = other;
	      return _this3.Equals(slice);
	    }() : false;
	  };
	
	  ByteSliceD.prototype.GetHashCode = function GetHashCode() {
	    var hash = 42;
	    hash = hash * 7 + _Id.JsUtilities.hashCode(String(this.Index));
	    hash = hash * 7 + _Id.JsUtilities.hashCode(String(this.Value.byteLength));
	    return hash;
	  };
	
	  ByteSliceD.prototype.ToOffset = function ToOffset(builder) {
	    var encode = function encode(bytes) {
	      var str = "";
	      var arr = new Uint8Array(bytes);
	
	      for (var i = 0; i <= (arr.length + 0x80000000 >>> 0) - 0x80000000 - 1; i++) {
	        str = str + String.fromCharCode(arr[i]);
	      }
	
	      return window.btoa(str);
	    };
	
	    var encoded = encode(this.Value);
	    var bytes = builder.createString(encoded);
	
	    _buffers.Iris.Serialization.Raft.ByteSliceFB.startByteSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.ByteSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.ByteSliceFB.addValue(builder, bytes);
	
	    return _buffers.Iris.Serialization.Raft.ByteSliceFB.endByteSliceFB(builder);
	  };
	
	  ByteSliceD.FromFB = function FromFB(fb) {
	    var decode = function decode(str) {
	      var binary = window.atob(str);
	      var bytes = new Uint8Array(binary.length);
	
	      for (var i = 0; i <= binary.length - 1; i++) {
	        bytes[i] = binary.charCodeAt(i);
	      }
	
	      return bytes.buffer;
	    };
	
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new ByteSliceD(fb.Index(), decode(fb.Value()));
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("ByteSliceD")(exn)));
	    }
	  };
	
	  ByteSliceD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  ByteSliceD.FromBytes = function FromBytes(bytes) {
	    return ByteSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ByteSliceFB.getRootAsByteSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  ByteSliceD.prototype.CompareTo = function CompareTo(other) {
	    var _this4 = this;
	
	    return other instanceof ByteSliceD ? function () {
	      var slice = other;
	      return _fableCore.Util.compare(_this4.Index, slice.Index);
	    }() : function () {
	      throw "other";
	    }();
	  };
	
	  ByteSliceD.prototype.Equals = function Equals(slice) {
	    var _this5 = this;
	
	    var contentsEqual = false;
	
	    var lengthEqual = function () {
	      var result = _this5.Value.byteLength === slice.Value.byteLength;
	
	      if (result) {
	        var me = new Uint8Array(_this5.Value);
	        var it = new Uint8Array(slice.Value);
	        var contents = true;
	        var i = 0;
	
	        while (i < (_this5.Value.byteLength + 0x80000000 >>> 0) - 0x80000000) {
	          if (contents) {
	            contents = me[i] === it[i];
	          }
	
	          i = i + 1;
	        }
	
	        contentsEqual = contents;
	      }
	
	      return result;
	    }();
	
	    if (slice.Index === this.Index ? lengthEqual : false) {
	      return contentsEqual;
	    } else {
	      return false;
	    }
	  };
	
	  return ByteSliceD;
	}();
	
	_fableCore.Util.setInterfaces(ByteSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.ByteSliceD");
	
	var EnumBoxD = exports.EnumBoxD = function () {
	  function EnumBoxD(id, name, patch, tags, properties, slices) {
	    _classCallCheck(this, EnumBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.Properties = properties;
	    this.Slices = slices;
	  }
	
	  EnumBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  EnumBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  EnumBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	    var propoffsets = this.Properties.map(function (prop) {
	      var patternInput = [builder.createString(prop.Key), builder.createString(prop.Value)];
	
	      _buffers.Iris.Serialization.Raft.EnumPropertyFB.startEnumPropertyFB(builder);
	
	      _buffers.Iris.Serialization.Raft.EnumPropertyFB.addKey(builder, patternInput[0]);
	
	      _buffers.Iris.Serialization.Raft.EnumPropertyFB.addValue(builder, patternInput[1]);
	
	      return _buffers.Iris.Serialization.Raft.EnumPropertyFB.endEnumPropertyFB(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.EnumBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.EnumBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    var properties = _buffers.Iris.Serialization.Raft.EnumBoxFB.createPropertiesVector(builder, propoffsets);
	
	    _buffers.Iris.Serialization.Raft.EnumBoxFB.startEnumBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.EnumBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.EnumBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.EnumBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.EnumBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.EnumBoxFB.addProperties(builder, properties);
	
	    _buffers.Iris.Serialization.Raft.EnumBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.EnumBoxFB.endEnumBoxFB(builder);
	  };
	
	  EnumBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg15) {
	          return function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Case === "Left" ? new _Either.Either("Left", [function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]) : function (_arg16) {
	            return function () {
	              var properties = new Array(fb.PropertiesLength());
	
	              if (_fableCore.Seq.fold(function (m, _arg8) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                      var prop = fb.Properties(_arg17[0]);
	                      _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                      return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, properties]]), properties).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg8) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                        var prop = fb.Properties(_arg17[0]);
	                        _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                        return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, properties]]), properties).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (m, _arg8) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                        var prop = fb.Properties(_arg17[0]);
	                        _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                        return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, properties]]), properties).Fields[0]));
	              }
	            }().Case === "Left" ? new _Either.Either("Left", [function () {
	              var properties = new Array(fb.PropertiesLength());
	
	              if (_fableCore.Seq.fold(function (m, _arg8) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                      var prop = fb.Properties(_arg17[0]);
	                      _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                      return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, properties]]), properties).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg8) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                        var prop = fb.Properties(_arg17[0]);
	                        _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                        return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, properties]]), properties).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (m, _arg8) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                        var prop = fb.Properties(_arg17[0]);
	                        _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                        return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, properties]]), properties).Fields[0]));
	              }
	            }().Fields[0]]) : function (_arg18) {
	              return builder_.Return(new EnumBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg15, _arg18, _arg16));
	            }(function () {
	              var properties = new Array(fb.PropertiesLength());
	
	              if (_fableCore.Seq.fold(function (m, _arg8) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                      var prop = fb.Properties(_arg17[0]);
	                      _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                      return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                    }(m.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, properties]]), properties).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg8) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                        var prop = fb.Properties(_arg17[0]);
	                        _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                        return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, properties]]), properties).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (m, _arg8) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg17) {
	                        var prop = fb.Properties(_arg17[0]);
	                        _arg17[1][_arg17[0]] = new _Aliases.Property(prop.Key(), prop.Value());
	                        return builder__1.Return([_arg17[0] + 1, _arg17[1]]);
	                      }(m.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, properties]]), properties).Fields[0]));
	              }
	            }().Fields[0]);
	          }(function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return EnumSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return EnumSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }(function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  EnumBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  EnumBoxD.FromEnums = function FromEnums(bytes) {
	    return EnumBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.EnumBoxFB.getRootAsEnumBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return EnumBoxD;
	}();
	
	_fableCore.Util.setInterfaces(EnumBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.EnumBoxD");
	
	var EnumSliceD = exports.EnumSliceD = function () {
	  function EnumSliceD(index, value) {
	    _classCallCheck(this, EnumSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  EnumSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  EnumSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  EnumSliceD.Create = function Create(idx, value) {
	    return new EnumSliceD(idx, value);
	  };
	
	  EnumSliceD.prototype.ToOffset = function ToOffset(builder) {
	    var _this6 = this;
	
	    var property = function () {
	      var patternInput = [builder.createString(_this6.Value.Key), builder.createString(_this6.Value.Value)];
	
	      _buffers.Iris.Serialization.Raft.EnumPropertyFB.startEnumPropertyFB(builder);
	
	      _buffers.Iris.Serialization.Raft.EnumPropertyFB.addKey(builder, patternInput[0]);
	
	      _buffers.Iris.Serialization.Raft.EnumPropertyFB.addValue(builder, patternInput[1]);
	
	      return _buffers.Iris.Serialization.Raft.EnumPropertyFB.endEnumPropertyFB(builder);
	    }();
	
	    _buffers.Iris.Serialization.Raft.EnumSliceFB.startEnumSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.EnumSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.EnumSliceFB.addValue(builder, property);
	
	    return _buffers.Iris.Serialization.Raft.EnumSliceFB.endEnumSliceFB(builder);
	  };
	
	  EnumSliceD.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        var prop = fb.Value();
	        return new EnumSliceD(fb.Index(), new _Aliases.Property(prop.Key(), prop.Value()));
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("EnumSliceD")(exn)));
	    }
	  };
	
	  EnumSliceD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  EnumSliceD.FromEnums = function FromEnums(bytes) {
	    return EnumSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.EnumSliceFB.getRootAsEnumSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return EnumSliceD;
	}();
	
	_fableCore.Util.setInterfaces(EnumSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.EnumSliceD");
	
	var ColorBoxD = exports.ColorBoxD = function () {
	  function ColorBoxD(id, name, patch, tags, slices) {
	    _classCallCheck(this, ColorBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.Slices = slices;
	  }
	
	  ColorBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  ColorBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  ColorBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.ColorBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.ColorBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.ColorBoxFB.startColorBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.ColorBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.ColorBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.ColorBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.ColorBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.ColorBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.ColorBoxFB.endColorBoxFB(builder);
	  };
	
	  ColorBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg19) {
	          return function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Case === "Left" ? new _Either.Either("Left", [function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]) : function (_arg20) {
	            return builder_.Return(new ColorBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg19, _arg20));
	          }(function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return ColorSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return ColorSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }(function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  ColorBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  ColorBoxD.FromColors = function FromColors(bytes) {
	    return ColorBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ColorBoxFB.getRootAsColorBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return ColorBoxD;
	}();
	
	_fableCore.Util.setInterfaces(ColorBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.ColorBoxD");
	
	var ColorSliceD = exports.ColorSliceD = function () {
	  function ColorSliceD(index, value) {
	    _classCallCheck(this, ColorSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  ColorSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  ColorSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  ColorSliceD.Create = function Create(idx, value) {
	    return new ColorSliceD(idx, value);
	  };
	
	  ColorSliceD.prototype.ToOffset = function ToOffset(builder) {
	    var offset = this.Value.ToOffset(builder);
	
	    _buffers.Iris.Serialization.Raft.ColorSliceFB.startColorSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.ColorSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.ColorSliceFB.addValue(builder, offset);
	
	    return _buffers.Iris.Serialization.Raft.ColorSliceFB.endColorSliceFB(builder);
	  };
	
	  ColorSliceD.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        var matchValue = _Color.ColorSpace.FromFB(fb.Value());
	
	        if (matchValue.Case === "Left") {
	          if (matchValue.Fields[0].Case === "ParseError") {
	            var error = matchValue.Fields[0].Fields[0];
	            throw error;
	          } else {
	            var _error = matchValue.Fields[0];
	            return _fableCore.String.fsFormat("Unexpected error: %A")(function (x) {
	              throw x;
	            })(_error);
	          }
	        } else {
	          var color = matchValue.Fields[0];
	          return new ColorSliceD(fb.Index(), color);
	        }
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("ColorSliceD")(exn)));
	    }
	  };
	
	  ColorSliceD.prototype.ToColors = function ToColors() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  ColorSliceD.FromColors = function FromColors(bytes) {
	    return ColorSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ColorSliceFB.getRootAsColorSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return ColorSliceD;
	}();
	
	_fableCore.Util.setInterfaces(ColorSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.ColorSliceD");
	
	var StringBoxD = exports.StringBoxD = function () {
	  function StringBoxD(id, name, patch, tags, stringType, fileMask, maxChars, slices) {
	    _classCallCheck(this, StringBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.StringType = stringType;
	    this.FileMask = fileMask;
	    this.MaxChars = maxChars;
	    this.Slices = slices;
	  }
	
	  StringBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  StringBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  StringBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var _this7 = this;
	
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var tipe = this.StringType.ToOffset(builder);
	
	    var mask = function () {
	      var $var7 = _this7.FileMask;
	
	      if ($var7 != null) {
	        return function (arg00) {
	          return builder.createString(arg00);
	        }($var7);
	      } else {
	        return $var7;
	      }
	    }();
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.StringBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.StringBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.startStringBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.addStringType(builder, tipe);
	
	    {
	      var $var8 = mask;
	
	      if ($var8 != null) {
	        (function (mask_1) {
	          _buffers.Iris.Serialization.Raft.StringBoxFB.addFileMask(builder, mask_1);
	        })($var8);
	      } else {
	        $var8;
	      }
	    }
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.addMaxChars(builder, this.MaxChars);
	
	    _buffers.Iris.Serialization.Raft.StringBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.StringBoxFB.endStringBoxFB(builder);
	  };
	
	  StringBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        var mask = fb.FileMask() == null ? null : fb.FileMask();
	
	        if (function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left") {
	          return new _Either.Either("Left", [function () {
	            var len = fb.get_TagsLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]);
	        } else {
	          return function (_arg21) {
	            return function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Case === "Left" ? new _Either.Either("Left", [function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Fields[0]]) : function (_arg22) {
	              return StringType.FromFB(fb.StringType()).Case === "Left" ? new _Either.Either("Left", [StringType.FromFB(fb.StringType()).Fields[0]]) : function (_arg23) {
	                return builder_.Return(new StringBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg21, _arg23, mask, fb.MaxChars(), _arg22));
	              }(StringType.FromFB(fb.StringType()).Fields[0]);
	            }(function () {
	              var len = fb.get_SlicesLength();
	              var arr = new Array(len);
	
	              if (_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return StringSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	                return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (tuple) {
	                  return tuple[1];
	                }(_fableCore.Seq.fold(function (result, _arg2) {
	                  return function (builder__1) {
	                    return builder__1.Run(builder__1.Delay(function () {
	                      return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                        return function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Case === "Left" ? new _Either.Either("Left", [function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]]) : function (_arg3) {
	                          _arg2_1[1][_arg2_1[0]] = _arg3;
	                          return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                        }(function () {
	                          var value = fb.Slices(_arg2_1[0]);
	                          return StringSliceD.FromFB(value);
	                        }().Fields[0]);
	                      }(result.Fields[0]);
	                    }));
	                  }(_Either.EitherUtils.either);
	                }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	              }
	            }().Fields[0]);
	          }(function () {
	            var len = fb.get_TagsLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg1) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                      _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  StringBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  StringBoxD.FromStrings = function FromStrings(bytes) {
	    return StringBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.StringBoxFB.getRootAsStringBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return StringBoxD;
	}();
	
	_fableCore.Util.setInterfaces(StringBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.StringBoxD");
	
	var StringSliceD = exports.StringSliceD = function () {
	  function StringSliceD(index, value) {
	    _classCallCheck(this, StringSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  StringSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  StringSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  StringSliceD.Create = function Create(idx, value) {
	    return new StringSliceD(idx, value);
	  };
	
	  StringSliceD.prototype.ToOffset = function ToOffset(builder) {
	    var value = builder.createString(this.Value);
	
	    _buffers.Iris.Serialization.Raft.StringSliceFB.startStringSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.StringSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.StringSliceFB.addValue(builder, value);
	
	    return _buffers.Iris.Serialization.Raft.StringSliceFB.endStringSliceFB(builder);
	  };
	
	  StringSliceD.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new StringSliceD(fb.Index(), fb.Value());
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("StringSliceD")(exn)));
	    }
	  };
	
	  StringSliceD.prototype.ToStrings = function ToStrings() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  StringSliceD.FromStrings = function FromStrings(bytes) {
	    return StringSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.StringSliceFB.getRootAsStringSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return StringSliceD;
	}();
	
	_fableCore.Util.setInterfaces(StringSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.StringSliceD");
	
	var CompoundBoxD = exports.CompoundBoxD = function () {
	  function CompoundBoxD(id, name, patch, tags, slices) {
	    _classCallCheck(this, CompoundBoxD);
	
	    this.Id = id;
	    this.Name = name;
	    this.Patch = patch;
	    this.Tags = tags;
	    this.Slices = slices;
	  }
	
	  CompoundBoxD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  CompoundBoxD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  CompoundBoxD.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var patch = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Patch));
	
	    var tagoffsets = this.Tags.map(function (arg00) {
	      return builder.createString(arg00);
	    });
	    var sliceoffsets = this.Slices.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var tags = _buffers.Iris.Serialization.Raft.CompoundBoxFB.createTagsVector(builder, tagoffsets);
	
	    var slices = _buffers.Iris.Serialization.Raft.CompoundBoxFB.createSlicesVector(builder, sliceoffsets);
	
	    _buffers.Iris.Serialization.Raft.CompoundBoxFB.startCompoundBoxFB(builder);
	
	    _buffers.Iris.Serialization.Raft.CompoundBoxFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.CompoundBoxFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.CompoundBoxFB.addPatch(builder, patch);
	
	    _buffers.Iris.Serialization.Raft.CompoundBoxFB.addTags(builder, tags);
	
	    _buffers.Iris.Serialization.Raft.CompoundBoxFB.addSlices(builder, slices);
	
	    return _buffers.Iris.Serialization.Raft.CompoundBoxFB.endCompoundBoxFB(builder);
	  };
	
	  CompoundBoxD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg24) {
	          return function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Case === "Left" ? new _Either.Either("Left", [function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]]) : function (_arg25) {
	            return builder_.Return(new CompoundBoxD(new _Id.Id("Id", [fb.Id()]), fb.Name(), new _Id.Id("Id", [fb.Patch()]), _arg24, _arg25));
	          }(function () {
	            var len = fb.get_SlicesLength();
	            var arr = new Array(len);
	
	            if (_fableCore.Seq.fold(function (result, _arg2) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                    return function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Case === "Left" ? new _Either.Either("Left", [function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Fields[0]]) : function (_arg3) {
	                      _arg2_1[1][_arg2_1[0]] = _arg3;
	                      return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                    }(function () {
	                      var value = fb.Slices(_arg2_1[0]);
	                      return CompoundSliceD.FromFB(value);
	                    }().Fields[0]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	              return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (tuple) {
	                return tuple[1];
	              }(_fableCore.Seq.fold(function (result, _arg2) {
	                return function (builder__1) {
	                  return builder__1.Run(builder__1.Delay(function () {
	                    return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg2_1) {
	                      return function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Case === "Left" ? new _Either.Either("Left", [function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]]) : function (_arg3) {
	                        _arg2_1[1][_arg2_1[0]] = _arg3;
	                        return builder__1.Return([_arg2_1[0] + 1, _arg2_1[1]]);
	                      }(function () {
	                        var value = fb.Slices(_arg2_1[0]);
	                        return CompoundSliceD.FromFB(value);
	                      }().Fields[0]);
	                    }(result.Fields[0]);
	                  }));
	                }(_Either.EitherUtils.either);
	              }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	            }
	          }().Fields[0]);
	        }(function () {
	          var len = fb.get_TagsLength();
	          var arr = new Array(len);
	
	          if (_fableCore.Seq.fold(function (result, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                  _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                  return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                }(result.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (result, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return result.Case === "Left" ? new _Either.Either("Left", [result.Fields[0]]) : function (_arg1_1) {
	                    _arg1_1[1][_arg1_1[0]] = fb.Tags(_arg1_1[0]);
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(result.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  CompoundBoxD.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  CompoundBoxD.FromCompounds = function FromCompounds(bytes) {
	    return CompoundBoxD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.CompoundBoxFB.getRootAsCompoundBoxFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return CompoundBoxD;
	}();
	
	_fableCore.Util.setInterfaces(CompoundBoxD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.CompoundBoxD");
	
	var CompoundSliceD = exports.CompoundSliceD = function () {
	  function CompoundSliceD(index, value) {
	    _classCallCheck(this, CompoundSliceD);
	
	    this.Index = index;
	    this.Value = value;
	  }
	
	  CompoundSliceD.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  CompoundSliceD.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  CompoundSliceD.Create = function Create(idx, value) {
	    return new CompoundSliceD(idx, value);
	  };
	
	  CompoundSliceD.prototype.ToOffset = function ToOffset(builder) {
	    var ioboxoffsets = this.Value.map(function (thing) {
	      return thing.ToOffset(builder);
	    });
	
	    var ioboxes = _buffers.Iris.Serialization.Raft.CompoundSliceFB.createValueVector(builder, ioboxoffsets);
	
	    _buffers.Iris.Serialization.Raft.CompoundSliceFB.startCompoundSliceFB(builder);
	
	    _buffers.Iris.Serialization.Raft.CompoundSliceFB.addIndex(builder, this.Index);
	
	    _buffers.Iris.Serialization.Raft.CompoundSliceFB.addValue(builder, ioboxes);
	
	    return _buffers.Iris.Serialization.Raft.CompoundSliceFB.endCompoundSliceFB(builder);
	  };
	
	  CompoundSliceD.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var arr = new Array(fb.ValueLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg12) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                  return IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                    _arg26[1][_arg26[0]] = _arg27;
	                    return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                  }(IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg12) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                    return IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                      _arg26[1][_arg26[0]] = _arg27;
	                      return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                    }(IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg12) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                    return IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                      _arg26[1][_arg26[0]] = _arg27;
	                      return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                    }(IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var arr = new Array(fb.ValueLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg12) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                  return IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                    _arg26[1][_arg26[0]] = _arg27;
	                    return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                  }(IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg12) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                    return IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                      _arg26[1][_arg26[0]] = _arg27;
	                      return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                    }(IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg12) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                    return IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                      _arg26[1][_arg26[0]] = _arg27;
	                      return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                    }(IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg28) {
	          return builder_.Return(new CompoundSliceD(fb.Index(), _arg28));
	        }(function () {
	          var arr = new Array(fb.ValueLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg12) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                  return IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                    _arg26[1][_arg26[0]] = _arg27;
	                    return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                  }(IOBox.FromFB(function (arg00) {
	                    return fb.Value(arg00);
	                  }(_arg26[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg12) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                    return IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                      _arg26[1][_arg26[0]] = _arg27;
	                      return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                    }(IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg12) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg26) {
	                    return IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Case === "Left" ? new _Either.Either("Left", [IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]]) : function (_arg27) {
	                      _arg26[1][_arg26[0]] = _arg27;
	                      return builder__1.Return([_arg26[0] + 1, _arg26[1]]);
	                    }(IOBox.FromFB(function (arg00) {
	                      return fb.Value(arg00);
	                    }(_arg26[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  CompoundSliceD.prototype.ToCompounds = function ToCompounds() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  CompoundSliceD.FromCompounds = function FromCompounds(bytes) {
	    return CompoundSliceD.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.CompoundSliceFB.getRootAsCompoundSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return CompoundSliceD;
	}();
	
	_fableCore.Util.setInterfaces(CompoundSliceD.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.CompoundSliceD");
	
	var Slice = exports.Slice = function () {
	  function Slice(caseName, fields) {
	    _classCallCheck(this, Slice);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  Slice.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  Slice.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  Slice.prototype.ToOffset = function ToOffset(builder) {
	    var build = function build(tipe) {
	      return function (offset) {
	        _buffers.Iris.Serialization.Raft.SliceFB.startSliceFB(builder);
	
	        _buffers.Iris.Serialization.Raft.SliceFB.addSliceType(builder, tipe);
	
	        _buffers.Iris.Serialization.Raft.SliceFB.addSlice(builder, offset);
	
	        return _buffers.Iris.Serialization.Raft.SliceFB.endSliceFB(builder);
	      };
	    };
	
	    if (this.Case === "IntSlice") {
	      return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.IntSliceFB)(this.Fields[0].ToOffset(builder));
	    } else {
	      if (this.Case === "FloatSlice") {
	        return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.FloatSliceFB)(this.Fields[0].ToOffset(builder));
	      } else {
	        if (this.Case === "DoubleSlice") {
	          return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.DoubleSliceFB)(this.Fields[0].ToOffset(builder));
	        } else {
	          if (this.Case === "BoolSlice") {
	            return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.BoolSliceFB)(this.Fields[0].ToOffset(builder));
	          } else {
	            if (this.Case === "ByteSlice") {
	              return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.ByteSliceFB)(this.Fields[0].ToOffset(builder));
	            } else {
	              if (this.Case === "EnumSlice") {
	                return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.EnumSliceFB)(this.Fields[0].ToOffset(builder));
	              } else {
	                if (this.Case === "ColorSlice") {
	                  return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.ColorSliceFB)(this.Fields[0].ToOffset(builder));
	                } else {
	                  if (this.Case === "CompoundSlice") {
	                    return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.CompoundSliceFB)(this.Fields[0].ToOffset(builder));
	                  } else {
	                    return build(_buffers.Iris.Serialization.Raft.SliceTypeFB.StringSliceFB)(this.Fields[0].ToOffset(builder));
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  Slice.FromFB = function FromFB(fb) {
	    var matchValue = fb.SliceType();
	
	    if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.StringSliceFB) {
	      if (StringSliceD.FromFB(function (arg00) {
	        return fb.Slice(arg00);
	      }(new _buffers.Iris.Serialization.Raft.StringSliceFB())).Case === "Left") {
	        return new _Either.Either("Left", [StringSliceD.FromFB(function (arg00) {
	          return fb.Slice(arg00);
	        }(new _buffers.Iris.Serialization.Raft.StringSliceFB())).Fields[0]]);
	      } else {
	        return _Either.EitherModule.succeed(function (arg0) {
	          return new Slice("StringSlice", [arg0]);
	        }(StringSliceD.FromFB(function (arg00) {
	          return fb.Slice(arg00);
	        }(new _buffers.Iris.Serialization.Raft.StringSliceFB())).Fields[0]));
	      }
	    } else {
	      if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.IntSliceFB) {
	        if (IntSliceD.FromFB(function (arg00) {
	          return fb.Slice(arg00);
	        }(new _buffers.Iris.Serialization.Raft.IntSliceFB())).Case === "Left") {
	          return new _Either.Either("Left", [IntSliceD.FromFB(function (arg00) {
	            return fb.Slice(arg00);
	          }(new _buffers.Iris.Serialization.Raft.IntSliceFB())).Fields[0]]);
	        } else {
	          return _Either.EitherModule.succeed(function (arg0) {
	            return new Slice("IntSlice", [arg0]);
	          }(IntSliceD.FromFB(function (arg00) {
	            return fb.Slice(arg00);
	          }(new _buffers.Iris.Serialization.Raft.IntSliceFB())).Fields[0]));
	        }
	      } else {
	        if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.FloatSliceFB) {
	          if (FloatSliceD.FromFB(function (arg00) {
	            return fb.Slice(arg00);
	          }(new _buffers.Iris.Serialization.Raft.FloatSliceFB())).Case === "Left") {
	            return new _Either.Either("Left", [FloatSliceD.FromFB(function (arg00) {
	              return fb.Slice(arg00);
	            }(new _buffers.Iris.Serialization.Raft.FloatSliceFB())).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (arg0) {
	              return new Slice("FloatSlice", [arg0]);
	            }(FloatSliceD.FromFB(function (arg00) {
	              return fb.Slice(arg00);
	            }(new _buffers.Iris.Serialization.Raft.FloatSliceFB())).Fields[0]));
	          }
	        } else {
	          if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.DoubleSliceFB) {
	            if (DoubleSliceD.FromFB(function (arg00) {
	              return fb.Slice(arg00);
	            }(new _buffers.Iris.Serialization.Raft.DoubleSliceFB())).Case === "Left") {
	              return new _Either.Either("Left", [DoubleSliceD.FromFB(function (arg00) {
	                return fb.Slice(arg00);
	              }(new _buffers.Iris.Serialization.Raft.DoubleSliceFB())).Fields[0]]);
	            } else {
	              return _Either.EitherModule.succeed(function (arg0) {
	                return new Slice("DoubleSlice", [arg0]);
	              }(DoubleSliceD.FromFB(function (arg00) {
	                return fb.Slice(arg00);
	              }(new _buffers.Iris.Serialization.Raft.DoubleSliceFB())).Fields[0]));
	            }
	          } else {
	            if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.BoolSliceFB) {
	              if (BoolSliceD.FromFB(function (arg00) {
	                return fb.Slice(arg00);
	              }(new _buffers.Iris.Serialization.Raft.BoolSliceFB())).Case === "Left") {
	                return new _Either.Either("Left", [BoolSliceD.FromFB(function (arg00) {
	                  return fb.Slice(arg00);
	                }(new _buffers.Iris.Serialization.Raft.BoolSliceFB())).Fields[0]]);
	              } else {
	                return _Either.EitherModule.succeed(function (arg0) {
	                  return new Slice("BoolSlice", [arg0]);
	                }(BoolSliceD.FromFB(function (arg00) {
	                  return fb.Slice(arg00);
	                }(new _buffers.Iris.Serialization.Raft.BoolSliceFB())).Fields[0]));
	              }
	            } else {
	              if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.ByteSliceFB) {
	                if (ByteSliceD.FromFB(function (arg00) {
	                  return fb.Slice(arg00);
	                }(new _buffers.Iris.Serialization.Raft.ByteSliceFB())).Case === "Left") {
	                  return new _Either.Either("Left", [ByteSliceD.FromFB(function (arg00) {
	                    return fb.Slice(arg00);
	                  }(new _buffers.Iris.Serialization.Raft.ByteSliceFB())).Fields[0]]);
	                } else {
	                  return _Either.EitherModule.succeed(function (arg0) {
	                    return new Slice("ByteSlice", [arg0]);
	                  }(ByteSliceD.FromFB(function (arg00) {
	                    return fb.Slice(arg00);
	                  }(new _buffers.Iris.Serialization.Raft.ByteSliceFB())).Fields[0]));
	                }
	              } else {
	                if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.EnumSliceFB) {
	                  if (EnumSliceD.FromFB(function (arg00) {
	                    return fb.Slice(arg00);
	                  }(new _buffers.Iris.Serialization.Raft.EnumSliceFB())).Case === "Left") {
	                    return new _Either.Either("Left", [EnumSliceD.FromFB(function (arg00) {
	                      return fb.Slice(arg00);
	                    }(new _buffers.Iris.Serialization.Raft.EnumSliceFB())).Fields[0]]);
	                  } else {
	                    return _Either.EitherModule.succeed(function (arg0) {
	                      return new Slice("EnumSlice", [arg0]);
	                    }(EnumSliceD.FromFB(function (arg00) {
	                      return fb.Slice(arg00);
	                    }(new _buffers.Iris.Serialization.Raft.EnumSliceFB())).Fields[0]));
	                  }
	                } else {
	                  if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.ColorSliceFB) {
	                    if (ColorSliceD.FromFB(function (arg00) {
	                      return fb.Slice(arg00);
	                    }(new _buffers.Iris.Serialization.Raft.ColorSliceFB())).Case === "Left") {
	                      return new _Either.Either("Left", [ColorSliceD.FromFB(function (arg00) {
	                        return fb.Slice(arg00);
	                      }(new _buffers.Iris.Serialization.Raft.ColorSliceFB())).Fields[0]]);
	                    } else {
	                      return _Either.EitherModule.succeed(function (arg0) {
	                        return new Slice("ColorSlice", [arg0]);
	                      }(ColorSliceD.FromFB(function (arg00) {
	                        return fb.Slice(arg00);
	                      }(new _buffers.Iris.Serialization.Raft.ColorSliceFB())).Fields[0]));
	                    }
	                  } else {
	                    if (matchValue === _buffers.Iris.Serialization.Raft.SliceTypeFB.CompoundSliceFB) {
	                      if (CompoundSliceD.FromFB(function (arg00) {
	                        return fb.Slice(arg00);
	                      }(new _buffers.Iris.Serialization.Raft.CompoundSliceFB())).Case === "Left") {
	                        return new _Either.Either("Left", [CompoundSliceD.FromFB(function (arg00) {
	                          return fb.Slice(arg00);
	                        }(new _buffers.Iris.Serialization.Raft.CompoundSliceFB())).Fields[0]]);
	                      } else {
	                        return _Either.EitherModule.succeed(function (arg0) {
	                          return new Slice("CompoundSlice", [arg0]);
	                        }(CompoundSliceD.FromFB(function (arg00) {
	                          return fb.Slice(arg00);
	                        }(new _buffers.Iris.Serialization.Raft.CompoundSliceFB())).Fields[0]));
	                      }
	                    } else {
	                      return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse slice. Unknown slice type %A")(function (x) {
	                        return x;
	                      })(matchValue)]));
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  Slice.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  Slice.FromBytes = function FromBytes(bytes) {
	    return Slice.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.SliceFB.getRootAsSliceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  _createClass(Slice, [{
	    key: "Index",
	    get: function get() {
	      return this.Case === "IntSlice" ? this.Fields[0].Index : this.Case === "FloatSlice" ? this.Fields[0].Index : this.Case === "DoubleSlice" ? this.Fields[0].Index : this.Case === "BoolSlice" ? this.Fields[0].Index : this.Case === "ByteSlice" ? this.Fields[0].Index : this.Case === "EnumSlice" ? this.Fields[0].Index : this.Case === "ColorSlice" ? this.Fields[0].Index : this.Case === "CompoundSlice" ? this.Fields[0].Index : this.Fields[0].Index;
	    }
	  }, {
	    key: "Value",
	    get: function get() {
	      return this.Case === "IntSlice" ? this.Fields[0].Value : this.Case === "FloatSlice" ? this.Fields[0].Value : this.Case === "DoubleSlice" ? this.Fields[0].Value : this.Case === "BoolSlice" ? this.Fields[0].Value : this.Case === "ByteSlice" ? this.Fields[0].Value : this.Case === "EnumSlice" ? this.Fields[0].Value : this.Case === "ColorSlice" ? this.Fields[0].Value : this.Case === "CompoundSlice" ? this.Fields[0].Value : this.Fields[0].Value;
	    }
	  }, {
	    key: "StringValue",
	    get: function get() {
	      return this.Case === "StringSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "StringData",
	    get: function get() {
	      return this.Case === "StringSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "IntValue",
	    get: function get() {
	      return this.Case === "IntSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "IntData",
	    get: function get() {
	      return this.Case === "IntSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "FloatValue",
	    get: function get() {
	      return this.Case === "FloatSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "FloatData",
	    get: function get() {
	      return this.Case === "FloatSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "DoubleValue",
	    get: function get() {
	      return this.Case === "DoubleSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "DoubleData",
	    get: function get() {
	      return this.Case === "DoubleSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "BoolValue",
	    get: function get() {
	      return this.Case === "BoolSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "BoolData",
	    get: function get() {
	      return this.Case === "BoolSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "ByteValue",
	    get: function get() {
	      return this.Case === "ByteSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "ByteData",
	    get: function get() {
	      return this.Case === "ByteSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "EnumValue",
	    get: function get() {
	      return this.Case === "EnumSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "EnumData",
	    get: function get() {
	      return this.Case === "EnumSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "ColorValue",
	    get: function get() {
	      return this.Case === "ColorSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "ColorData",
	    get: function get() {
	      return this.Case === "ColorSlice" ? this.Fields[0] : null;
	    }
	  }, {
	    key: "CompoundValue",
	    get: function get() {
	      return this.Case === "CompoundSlice" ? this.Fields[0].Value : null;
	    }
	  }, {
	    key: "CompoundData",
	    get: function get() {
	      return this.Case === "CompoundSlice" ? this.Fields[0] : null;
	    }
	  }]);
	
	  return Slice;
	}();
	
	_fableCore.Util.setInterfaces(Slice.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.Slice");
	
	var Slices = exports.Slices = function () {
	  function Slices(caseName, fields) {
	    _classCallCheck(this, Slices);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  Slices.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  Slices.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  Slices.prototype.Item = function Item(idx) {
	    return this.Case === "IntSlices" ? new Slice("IntSlice", [this.Fields[0][idx]]) : this.Case === "FloatSlices" ? new Slice("FloatSlice", [this.Fields[0][idx]]) : this.Case === "DoubleSlices" ? new Slice("DoubleSlice", [this.Fields[0][idx]]) : this.Case === "BoolSlices" ? new Slice("BoolSlice", [this.Fields[0][idx]]) : this.Case === "ByteSlices" ? new Slice("ByteSlice", [this.Fields[0][idx]]) : this.Case === "EnumSlices" ? new Slice("EnumSlice", [this.Fields[0][idx]]) : this.Case === "ColorSlices" ? new Slice("ColorSlice", [this.Fields[0][idx]]) : this.Case === "CompoundSlices" ? new Slice("CompoundSlice", [this.Fields[0][idx]]) : new Slice("StringSlice", [this.Fields[0][idx]]);
	  };
	
	  Slices.prototype.At = function At(idx) {
	    return this.Item(idx);
	  };
	
	  Slices.prototype.Map = function Map(f) {
	    return this.Case === "IntSlices" ? this.Fields[0].map(function ($var9) {
	      return f(function (arg0) {
	        return new Slice("IntSlice", [arg0]);
	      }($var9));
	    }) : this.Case === "FloatSlices" ? this.Fields[0].map(function ($var10) {
	      return f(function (arg0) {
	        return new Slice("FloatSlice", [arg0]);
	      }($var10));
	    }) : this.Case === "DoubleSlices" ? this.Fields[0].map(function ($var11) {
	      return f(function (arg0) {
	        return new Slice("DoubleSlice", [arg0]);
	      }($var11));
	    }) : this.Case === "BoolSlices" ? this.Fields[0].map(function ($var12) {
	      return f(function (arg0) {
	        return new Slice("BoolSlice", [arg0]);
	      }($var12));
	    }) : this.Case === "ByteSlices" ? this.Fields[0].map(function ($var13) {
	      return f(function (arg0) {
	        return new Slice("ByteSlice", [arg0]);
	      }($var13));
	    }) : this.Case === "EnumSlices" ? this.Fields[0].map(function ($var14) {
	      return f(function (arg0) {
	        return new Slice("EnumSlice", [arg0]);
	      }($var14));
	    }) : this.Case === "ColorSlices" ? this.Fields[0].map(function ($var15) {
	      return f(function (arg0) {
	        return new Slice("ColorSlice", [arg0]);
	      }($var15));
	    }) : this.Case === "CompoundSlices" ? this.Fields[0].map(function ($var16) {
	      return f(function (arg0) {
	        return new Slice("CompoundSlice", [arg0]);
	      }($var16));
	    }) : this.Fields[0].map(function ($var17) {
	      return f(function (arg0) {
	        return new Slice("StringSlice", [arg0]);
	      }($var17));
	    });
	  };
	
	  Slices.prototype.CreateString = function CreateString(idx, value) {
	    return new Slice("StringSlice", [new StringSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateInt = function CreateInt(idx, value) {
	    return new Slice("IntSlice", [new IntSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateFloat = function CreateFloat(idx, value) {
	    return new Slice("FloatSlice", [new FloatSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateDouble = function CreateDouble(idx, value) {
	    return new Slice("DoubleSlice", [new DoubleSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateBool = function CreateBool(idx, value) {
	    return new Slice("BoolSlice", [new BoolSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateByte = function CreateByte(idx, value) {
	    return new Slice("ByteSlice", [new ByteSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateEnum = function CreateEnum(idx, value) {
	    return new Slice("EnumSlice", [new EnumSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateColor = function CreateColor(idx, value) {
	    return new Slice("ColorSlice", [new ColorSliceD(idx, value)]);
	  };
	
	  Slices.prototype.CreateCompound = function CreateCompound(idx, value) {
	    return new Slice("CompoundSlice", [new CompoundSliceD(idx, value)]);
	  };
	
	  _createClass(Slices, [{
	    key: "IsString",
	    get: function get() {
	      return this.Case === "StringSlices" ? true : false;
	    }
	  }, {
	    key: "IsInt",
	    get: function get() {
	      return this.Case === "IntSlices" ? true : false;
	    }
	  }, {
	    key: "IsFloat",
	    get: function get() {
	      return this.Case === "FloatSlices" ? true : false;
	    }
	  }, {
	    key: "IsDouble",
	    get: function get() {
	      return this.Case === "DoubleSlices" ? true : false;
	    }
	  }, {
	    key: "IsBool",
	    get: function get() {
	      return this.Case === "BoolSlices" ? true : false;
	    }
	  }, {
	    key: "IsByte",
	    get: function get() {
	      return this.Case === "ByteSlices" ? true : false;
	    }
	  }, {
	    key: "IsEnum",
	    get: function get() {
	      return this.Case === "EnumSlices" ? true : false;
	    }
	  }, {
	    key: "IsColor",
	    get: function get() {
	      return this.Case === "ColorSlices" ? true : false;
	    }
	  }, {
	    key: "IsCompound",
	    get: function get() {
	      return this.Case === "CompoundSlices" ? true : false;
	    }
	  }]);
	
	  return Slices;
	}();
	
	_fableCore.Util.setInterfaces(Slices.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.Slices");
	
	var PinType = exports.PinType = function () {
	  function PinType(caseName, fields) {
	    _classCallCheck(this, PinType);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  PinType.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  PinType.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  return PinType;
	}();
	
	_fableCore.Util.setInterfaces(PinType.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.PinType");
	
	var IOBoxUtils = exports.IOBoxUtils = function ($exports) {
	  var getType = $exports.getType = function getType(_arg1) {
	    var $target0 = function $target0() {
	      return "ValuePin";
	    };
	
	    if (_arg1.Case === "FloatBox") {
	      return $target0();
	    } else {
	      if (_arg1.Case === "DoubleBox") {
	        return $target0();
	      } else {
	        if (_arg1.Case === "BoolBox") {
	          return $target0();
	        } else {
	          if (_arg1.Case === "StringBox") {
	            return "StringPin";
	          } else {
	            if (_arg1.Case === "ByteBox") {
	              return "BytePin";
	            } else {
	              if (_arg1.Case === "EnumBox") {
	                return "EnumPin";
	              } else {
	                if (_arg1.Case === "ColorBox") {
	                  return "ColorPin";
	                } else {
	                  if (_arg1.Case === "Compound") {
	                    return "CompoundPin";
	                  } else {
	                    return $target0();
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  };
	
	  return $exports;
	}({});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.Id = exports.JsUtilities = exports.Replacements = exports.Math = exports.Date = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var _Date = function ($exports) {
	  return $exports;
	}({});
	
	exports.Date = _Date;
	
	var _Math = function ($exports) {
	  return $exports;
	}({});
	
	exports.Math = _Math;
	
	var Replacements = exports.Replacements = function ($exports) {
	  return $exports;
	}({});
	
	var JsUtilities = exports.JsUtilities = function ($exports) {
	  var hashCode = $exports.hashCode = function hashCode(str) {
	    var hash = 0;
	
	    for (var n = 0; n <= str.length - 1; n++) {
	      var code = str.charCodeAt(n);
	      hash = (hash << 5) - hash + code;
	      hash = hash | 0;
	    }
	
	    return hash;
	  };
	
	  var mkGuid = $exports.mkGuid = function mkGuid(_arg1) {
	    var s4 = function s4(_arg2) {
	      return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
	    };
	
	    return _fableCore.Seq.fold(function (m, str) {
	      return m + "-" + str;
	    }, s4(), Array.from(_fableCore.Seq.delay(function () {
	      return _fableCore.Seq.collect(function (matchValue) {
	        return _fableCore.Seq.singleton(s4());
	      }, _fableCore.Seq.range(0, 3));
	    })));
	  };
	
	  return $exports;
	}({});
	
	var Id = exports.Id = function () {
	  function Id(caseName, fields) {
	    _classCallCheck(this, Id);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  Id.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  Id.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  Id.prototype.toString = function toString() {
	    return _fableCore.Serialize.toJson(this);
	  };
	
	  Id.prototype.ToString = function ToString() {
	    return this.Fields[0];
	  };
	
	  Id.Create = function Create(_arg1) {
	    return new Id("Id", [JsUtilities.mkGuid()]);
	  };
	
	  return Id;
	}();

	_fableCore.Util.setInterfaces(Id.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.Id");


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.Property = exports.Rect = exports.Coordinate = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Coordinate = exports.Coordinate = function () {
	  function Coordinate(caseName, fields) {
	    _classCallCheck(this, Coordinate);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  Coordinate.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  Coordinate.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  Coordinate.prototype.ToString = function ToString() {
	    var y = this.Fields[0][1];
	    var x = this.Fields[0][0];
	    return "(" + String(x) + ", " + String(y) + ")";
	  };
	
	  return Coordinate;
	}();
	
	_fableCore.Util.setInterfaces(Coordinate.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.Coordinate");
	
	var Rect = exports.Rect = function () {
	  function Rect(caseName, fields) {
	    _classCallCheck(this, Rect);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  Rect.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  Rect.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  Rect.prototype.ToString = function ToString() {
	    var y = this.Fields[0][1];
	    var x = this.Fields[0][0];
	    return "(" + String(x) + ", " + String(y) + ")";
	  };
	
	  return Rect;
	}();
	
	_fableCore.Util.setInterfaces(Rect.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.Rect");
	
	var Property = exports.Property = function () {
	  function Property(key, value) {
	    _classCallCheck(this, Property);
	
	    this.Key = key;
	    this.Value = value;
	  }
	
	  Property.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };

	  Property.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };

	  return Property;
	}();

	_fableCore.Util.setInterfaces(Property.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.Property");


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.ColorSpace = exports.HSLAValue = exports.RGBAValue = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _buffers = __webpack_require__(8);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var RGBAValue = exports.RGBAValue = function () {
	  function RGBAValue(red, green, blue, alpha) {
	    _classCallCheck(this, RGBAValue);
	
	    this.Red = red;
	    this.Green = green;
	    this.Blue = blue;
	    this.Alpha = alpha;
	  }
	
	  RGBAValue.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  RGBAValue.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  RGBAValue.prototype.ToOffset = function ToOffset(builder) {
	    _buffers.Iris.Serialization.Raft.RGBAValueFB.startRGBAValueFB(builder);
	
	    _buffers.Iris.Serialization.Raft.RGBAValueFB.addRed(builder, this.Red);
	
	    _buffers.Iris.Serialization.Raft.RGBAValueFB.addGreen(builder, this.Green);
	
	    _buffers.Iris.Serialization.Raft.RGBAValueFB.addBlue(builder, this.Blue);
	
	    _buffers.Iris.Serialization.Raft.RGBAValueFB.addAlpha(builder, this.Alpha);
	
	    return _buffers.Iris.Serialization.Raft.RGBAValueFB.endRGBAValueFB(builder);
	  };
	
	  RGBAValue.FromFB = function FromFB(fb) {
	    try {
	      return new _Either.Either("Right", [new RGBAValue(fb.Red(), fb.Green(), fb.Blue(), fb.Alpha())]);
	    } catch (exn) {
	      return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse RGBAValueFB: %s")(function (x) {
	        return x;
	      })(exn)]));
	    }
	  };
	
	  RGBAValue.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  RGBAValue.FromBytes = function FromBytes(bytes) {
	    return RGBAValue.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.RGBAValueFB.getRootAsRGBAValueFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return RGBAValue;
	}();
	
	_fableCore.Util.setInterfaces(RGBAValue.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.RGBAValue");
	
	var HSLAValue = exports.HSLAValue = function () {
	  function HSLAValue(hue, saturation, lightness, alpha) {
	    _classCallCheck(this, HSLAValue);
	
	    this.Hue = hue;
	    this.Saturation = saturation;
	    this.Lightness = lightness;
	    this.Alpha = alpha;
	  }
	
	  HSLAValue.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  HSLAValue.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  HSLAValue.prototype.ToOffset = function ToOffset(builder) {
	    _buffers.Iris.Serialization.Raft.HSLAValueFB.startHSLAValueFB(builder);
	
	    _buffers.Iris.Serialization.Raft.HSLAValueFB.addHue(builder, this.Hue);
	
	    _buffers.Iris.Serialization.Raft.HSLAValueFB.addSaturation(builder, this.Saturation);
	
	    _buffers.Iris.Serialization.Raft.HSLAValueFB.addLightness(builder, this.Lightness);
	
	    _buffers.Iris.Serialization.Raft.HSLAValueFB.addAlpha(builder, this.Alpha);
	
	    return _buffers.Iris.Serialization.Raft.HSLAValueFB.endHSLAValueFB(builder);
	  };
	
	  HSLAValue.FromFB = function FromFB(fb) {
	    try {
	      return new _Either.Either("Right", [new HSLAValue(fb.Hue(), fb.Saturation(), fb.Lightness(), fb.Alpha())]);
	    } catch (exn) {
	      return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse HSLAValueFB: %s")(function (x) {
	        return x;
	      })(exn)]));
	    }
	  };
	
	  HSLAValue.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  HSLAValue.FromBytes = function FromBytes(bytes) {
	    return HSLAValue.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.HSLAValueFB.getRootAsHSLAValueFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return HSLAValue;
	}();
	
	_fableCore.Util.setInterfaces(HSLAValue.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.HSLAValue");
	
	var ColorSpace = exports.ColorSpace = function () {
	  function ColorSpace(caseName, fields) {
	    _classCallCheck(this, ColorSpace);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  ColorSpace.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  ColorSpace.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  ColorSpace.prototype.ToOffset = function ToOffset(builder) {
	    var build = function build(tipe) {
	      return function (offset) {
	        _buffers.Iris.Serialization.Raft.ColorSpaceFB.startColorSpaceFB(builder);
	
	        _buffers.Iris.Serialization.Raft.ColorSpaceFB.addValueType(builder, tipe);
	
	        _buffers.Iris.Serialization.Raft.ColorSpaceFB.addValue(builder, offset);
	
	        return _buffers.Iris.Serialization.Raft.ColorSpaceFB.endColorSpaceFB(builder);
	      };
	    };
	
	    if (this.Case === "HSLA") {
	      return build(_buffers.Iris.Serialization.Raft.ColorSpaceTypeFB.HSLAValueFB)(this.Fields[0].ToOffset(builder));
	    } else {
	      return build(_buffers.Iris.Serialization.Raft.ColorSpaceTypeFB.RGBAValueFB)(this.Fields[0].ToOffset(builder));
	    }
	  };
	
	  ColorSpace.FromFB = function FromFB(fb) {
	    var matchValue = fb.ValueType();
	
	    if (matchValue === _buffers.Iris.Serialization.Raft.ColorSpaceTypeFB.RGBAValueFB) {
	      if (RGBAValue.FromFB(function (arg00) {
	        return fb.Value(arg00);
	      }(new _buffers.Iris.Serialization.Raft.RGBAValueFB())).Case === "Left") {
	        return new _Either.Either("Left", [RGBAValue.FromFB(function (arg00) {
	          return fb.Value(arg00);
	        }(new _buffers.Iris.Serialization.Raft.RGBAValueFB())).Fields[0]]);
	      } else {
	        return _Either.EitherModule.succeed(function (arg0) {
	          return new ColorSpace("RGBA", [arg0]);
	        }(RGBAValue.FromFB(function (arg00) {
	          return fb.Value(arg00);
	        }(new _buffers.Iris.Serialization.Raft.RGBAValueFB())).Fields[0]));
	      }
	    } else {
	      if (matchValue === _buffers.Iris.Serialization.Raft.ColorSpaceTypeFB.HSLAValueFB) {
	        if (HSLAValue.FromFB(function (arg00) {
	          return fb.Value(arg00);
	        }(new _buffers.Iris.Serialization.Raft.HSLAValueFB())).Case === "Left") {
	          return new _Either.Either("Left", [HSLAValue.FromFB(function (arg00) {
	            return fb.Value(arg00);
	          }(new _buffers.Iris.Serialization.Raft.HSLAValueFB())).Fields[0]]);
	        } else {
	          return _Either.EitherModule.succeed(function (arg0) {
	            return new ColorSpace("HSLA", [arg0]);
	          }(HSLAValue.FromFB(function (arg00) {
	            return fb.Value(arg00);
	          }(new _buffers.Iris.Serialization.Raft.HSLAValueFB())).Fields[0]));
	        }
	      } else {
	        return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not deserialize ColorSpaceTypeFB %A")(function (x) {
	          return x;
	        })(matchValue)]));
	      }
	    }
	  };
	
	  ColorSpace.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  ColorSpace.FromBytes = function FromBytes(bytes) {
	    return ColorSpace.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ColorSpaceFB.getRootAsColorSpaceFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return ColorSpace;
	}();

	_fableCore.Util.setInterfaces(ColorSpace.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.ColorSpace");
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.Cue = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _IOBox = __webpack_require__(11);
	
	var _Id = __webpack_require__(12);
	
	var _buffers = __webpack_require__(8);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Cue = exports.Cue = function () {
	  function Cue(id, name, iOBoxes) {
	    _classCallCheck(this, Cue);
	
	    this.Id = id;
	    this.Name = name;
	    this.IOBoxes = iOBoxes;
	  }
	
	  Cue.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  Cue.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  Cue.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var arr = new Array(fb.IOBoxesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                  return _IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                    _arg1_1[1][_arg1_1[0]] = _arg2;
	                    return builder__1.Return([_arg1_1[0] + 1, arr]);
	                  }(_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, arr]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, arr]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var arr = new Array(fb.IOBoxesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                  return _IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                    _arg1_1[1][_arg1_1[0]] = _arg2;
	                    return builder__1.Return([_arg1_1[0] + 1, arr]);
	                  }(_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, arr]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, arr]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg3) {
	          return builder_.Return(new Cue(new _Id.Id("Id", [fb.Id()]), fb.Name(), _arg3));
	        }(function () {
	          var arr = new Array(fb.IOBoxesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                  return _IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                    _arg1_1[1][_arg1_1[0]] = _arg2;
	                    return builder__1.Return([_arg1_1[0] + 1, arr]);
	                  }(_IOBox.IOBox.FromFB(function (arg00) {
	                    return fb.IOBoxes(arg00);
	                  }(_arg1_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, arr]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, arr]);
	                    }(_IOBox.IOBox.FromFB(function (arg00) {
	                      return fb.IOBoxes(arg00);
	                    }(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  Cue.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var ioboxoffsets = this.IOBoxes.map(function (iobox) {
	      return iobox.ToOffset(builder);
	    });
	
	    var ioboxes = _buffers.Iris.Serialization.Raft.CueFB.createIOBoxesVector(builder, ioboxoffsets);
	
	    _buffers.Iris.Serialization.Raft.CueFB.startCueFB(builder);
	
	    _buffers.Iris.Serialization.Raft.CueFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.CueFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.CueFB.addIOBoxes(builder, ioboxes);
	
	    return _buffers.Iris.Serialization.Raft.CueFB.endCueFB(builder);
	  };
	
	  Cue.FromBytes = function FromBytes(bytes) {
	    return Cue.FromFB(_buffers.Iris.Serialization.Raft.CueFB.getRootAsCueFB((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  Cue.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  return Cue;
	}();

	_fableCore.Util.setInterfaces(Cue.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.Cue");
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.CueList = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _buffers = __webpack_require__(8);
	
	var _Either = __webpack_require__(6);
	
	var _Cue = __webpack_require__(15);
	
	var _Id = __webpack_require__(12);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var CueList = exports.CueList = function () {
	  function CueList(id, name, cues) {
	    _classCallCheck(this, CueList);
	
	    this.Id = id;
	    this.Name = name;
	    this.Cues = cues;
	  }
	
	  CueList.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  CueList.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  CueList.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Name);
	
	    var cueoffsets = this.Cues.map(function (cue) {
	      return cue.ToOffset(builder);
	    });
	
	    var cuesvec = _buffers.Iris.Serialization.Raft.CueListFB.createCuesVector(builder, cueoffsets);
	
	    _buffers.Iris.Serialization.Raft.CueListFB.startCueListFB(builder);
	
	    _buffers.Iris.Serialization.Raft.CueListFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.CueListFB.addName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.CueListFB.addCues(builder, cuesvec);
	
	    return _buffers.Iris.Serialization.Raft.CueListFB.endCueListFB(builder);
	  };
	
	  CueList.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  CueList.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return function () {
	          var arr = new Array(fb.CuesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                  return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                    _arg1_1[1][_arg1_1[0]] = _arg2;
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Case === "Left" ? new _Either.Either("Left", [function () {
	          var arr = new Array(fb.CuesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                  return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                    _arg1_1[1][_arg1_1[0]] = _arg2;
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]]) : function (_arg3) {
	          return builder_.Return(new CueList(new _Id.Id("Id", [fb.Id()]), fb.Name(), _arg3));
	        }(function () {
	          var arr = new Array(fb.CuesLength());
	
	          if (_fableCore.Seq.fold(function (m, _arg1) {
	            return function (builder__1) {
	              return builder__1.Run(builder__1.Delay(function () {
	                return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                  return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                    _arg1_1[1][_arg1_1[0]] = _arg2;
	                    return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                  }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                }(m.Fields[0]);
	              }));
	            }(_Either.EitherUtils.either);
	          }, new _Either.Either("Right", [[0, arr]]), arr).Case === "Left") {
	            return new _Either.Either("Left", [_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]]);
	          } else {
	            return _Either.EitherModule.succeed(function (tuple) {
	              return tuple[1];
	            }(_fableCore.Seq.fold(function (m, _arg1) {
	              return function (builder__1) {
	                return builder__1.Run(builder__1.Delay(function () {
	                  return m.Case === "Left" ? new _Either.Either("Left", [m.Fields[0]]) : function (_arg1_1) {
	                    return _Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Case === "Left" ? new _Either.Either("Left", [_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]]) : function (_arg2) {
	                      _arg1_1[1][_arg1_1[0]] = _arg2;
	                      return builder__1.Return([_arg1_1[0] + 1, _arg1_1[1]]);
	                    }(_Cue.Cue.FromFB(fb.Cues(_arg1_1[0])).Fields[0]);
	                  }(m.Fields[0]);
	                }));
	              }(_Either.EitherUtils.either);
	            }, new _Either.Either("Right", [[0, arr]]), arr).Fields[0]));
	          }
	        }().Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  CueList.FromBytes = function FromBytes(bytes) {
	    return CueList.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.CueListFB.getRootAsCueListFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return CueList;
	}();

	_fableCore.Util.setInterfaces(CueList.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.CueList");
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.Node = exports.ConfigChange = exports.ConfigChangeYaml = exports.RaftNode = exports.RaftNodeYaml = exports.RaftNodeState = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	var _buffers = __webpack_require__(8);
	
	var _Id = __webpack_require__(12);
	
	var _IpAddress = __webpack_require__(18);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var RaftNodeState = exports.RaftNodeState = function () {
	  function RaftNodeState(caseName, fields) {
	    _classCallCheck(this, RaftNodeState);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  RaftNodeState.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  RaftNodeState.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  RaftNodeState.prototype.ToString = function ToString() {
	    return this.Case === "Running" ? "Running" : this.Case === "Failed" ? "Failed" : "Joining";
	  };
	
	  RaftNodeState.Parse = function Parse(str) {
	    var $var26 = null;
	
	    switch (str) {
	      case "Joining":
	        $var26 = new RaftNodeState("Joining", []);
	        break;
	
	      case "Running":
	        $var26 = new RaftNodeState("Running", []);
	        break;
	
	      case "Failed":
	        $var26 = new RaftNodeState("Failed", []);
	        break;
	
	      default:
	        $var26 = _fableCore.String.fsFormat("NodeState: failed to parse %s")(function (x) {
	          throw x;
	        })(str);
	    }
	
	    return $var26;
	  };
	
	  RaftNodeState.TryParse = function TryParse(str) {
	    try {
	      return _Either.EitherModule.succeed(RaftNodeState.Parse(str));
	    } catch (exn) {
	      return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse RaftNodeState: %s")(function (x) {
	        return x;
	      })(exn)]));
	    }
	  };
	
	  RaftNodeState.prototype.ToOffset = function ToOffset() {
	    return this.Case === "Joining" ? _buffers.Iris.Serialization.Raft.NodeStateFB.JoiningFB : this.Case === "Failed" ? _buffers.Iris.Serialization.Raft.NodeStateFB.FailedFB : _buffers.Iris.Serialization.Raft.NodeStateFB.RunningFB;
	  };
	
	  RaftNodeState.FromFB = function FromFB(fb) {
	    return fb === _buffers.Iris.Serialization.Raft.NodeStateFB.JoiningFB ? new _Either.Either("Right", [new RaftNodeState("Joining", [])]) : fb === _buffers.Iris.Serialization.Raft.NodeStateFB.RunningFB ? new _Either.Either("Right", [new RaftNodeState("Running", [])]) : fb === _buffers.Iris.Serialization.Raft.NodeStateFB.FailedFB ? new _Either.Either("Right", [new RaftNodeState("Failed", [])]) : _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse RaftNodeState: %A")(function (x) {
	      return x;
	    })(fb)]));
	  };
	
	  return RaftNodeState;
	}();
	
	_fableCore.Util.setInterfaces(RaftNodeState.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Raft.RaftNodeState");
	
	var RaftNodeYaml = exports.RaftNodeYaml = function RaftNodeYaml() {
	  _classCallCheck(this, RaftNodeYaml);
	};
	
	_fableCore.Util.setInterfaces(RaftNodeYaml.prototype, [], "Iris.Raft.RaftNodeYaml");
	
	var RaftNode = exports.RaftNode = function () {
	  function RaftNode(id, hostName, ipAddr, port, webPort, wsPort, gitPort, voting, votedForMe, state, nextIndex, matchIndex) {
	    _classCallCheck(this, RaftNode);
	
	    this.Id = id;
	    this.HostName = hostName;
	    this.IpAddr = ipAddr;
	    this.Port = port;
	    this.WebPort = webPort;
	    this.WsPort = wsPort;
	    this.GitPort = gitPort;
	    this.Voting = voting;
	    this.VotedForMe = votedForMe;
	    this.State = state;
	    this.NextIndex = nextIndex;
	    this.MatchIndex = matchIndex;
	  }
	
	  RaftNode.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  RaftNode.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  RaftNode.prototype.ToString = function ToString() {
	    return _fableCore.String.fsFormat("%s on %s (%s:%d) %s %s %s")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Id))(this.HostName)(_fableCore.Util.toString(this.IpAddr))(this.Port)(_fableCore.Util.toString(this.State))(_fableCore.String.fsFormat("(NxtIdx %A)")(function (x) {
	      return x;
	    })(this.NextIndex))(_fableCore.String.fsFormat("(MtchIdx %A)")(function (x) {
	      return x;
	    })(this.MatchIndex));
	  };
	
	  RaftNode.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var ip = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.IpAddr));
	
	    var hostname = function (arg00) {
	      return builder.createString(arg00);
	    }(this.HostName);
	
	    var state = this.State.ToOffset();
	
	    _buffers.Iris.Serialization.Raft.NodeFB.startNodeFB(builder);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addHostName(builder, hostname);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addIpAddr(builder, ip);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addPort(builder, (this.Port + 0x80000000 >>> 0) - 0x80000000);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addWebPort(builder, (this.WebPort + 0x80000000 >>> 0) - 0x80000000);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addWsPort(builder, (this.WsPort + 0x80000000 >>> 0) - 0x80000000);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addGitPort(builder, (this.GitPort + 0x80000000 >>> 0) - 0x80000000);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addVoting(builder, this.Voting);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addVotedForMe(builder, this.VotedForMe);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addState(builder, state);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addNextIndex(builder, this.NextIndex);
	
	    _buffers.Iris.Serialization.Raft.NodeFB.addMatchIndex(builder, this.MatchIndex);
	
	    return _buffers.Iris.Serialization.Raft.NodeFB.endNodeFB(builder);
	  };
	
	  RaftNode.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return RaftNodeState.FromFB(fb.State()).Case === "Left" ? new _Either.Either("Left", [RaftNodeState.FromFB(fb.State()).Fields[0]]) : function (_arg1) {
	          return builder_.Return(function () {
	            var Id = new _Id.Id("Id", [fb.Id()]);
	            return new RaftNode(Id, fb.HostName(), _IpAddress.IpAddress.Parse(fb.IpAddr()), fb.Port(), fb.WebPort(), fb.WsPort(), fb.GitPort(), fb.Voting(), fb.VotedForMe(), _arg1, fb.NextIndex(), fb.MatchIndex());
	          }());
	        }(RaftNodeState.FromFB(fb.State()).Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  RaftNode.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  RaftNode.FromBytes = function FromBytes(bytes) {
	    return RaftNode.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.NodeFB.getRootAsNodeFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return RaftNode;
	}();
	
	_fableCore.Util.setInterfaces(RaftNode.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Raft.RaftNode");
	
	var ConfigChangeYaml = exports.ConfigChangeYaml = function () {
	  function ConfigChangeYaml() {
	    _classCallCheck(this, ConfigChangeYaml);
	  }
	
	  ConfigChangeYaml.NodeAdded = function NodeAdded(node) {
	    var yaml = new ConfigChangeYaml();
	    yaml.ChangeType = "NodeAdded";
	    yaml.Node = node;
	    return yaml;
	  };
	
	  ConfigChangeYaml.NodeRemoved = function NodeRemoved(node) {
	    var yaml = new ConfigChangeYaml();
	    yaml.ChangeType = "NodeRemoved";
	    yaml.Node = node;
	    return yaml;
	  };
	
	  return ConfigChangeYaml;
	}();
	
	_fableCore.Util.setInterfaces(ConfigChangeYaml.prototype, [], "Iris.Raft.ConfigChangeYaml");
	
	var ConfigChange = exports.ConfigChange = function () {
	  function ConfigChange(caseName, fields) {
	    _classCallCheck(this, ConfigChange);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  ConfigChange.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  ConfigChange.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  ConfigChange.prototype.ToString = function ToString() {
	    return this.Case === "NodeRemoved" ? _fableCore.String.fsFormat("NodeRemoved (%s)")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0].Id)) : _fableCore.String.fsFormat("NodeAdded (%s)")(function (x) {
	      return x;
	    })(_fableCore.Util.toString(this.Fields[0].Id));
	  };
	
	  ConfigChange.prototype.ToOffset = function ToOffset(builder) {
	    var _this = this;
	
	    return this.Case === "NodeRemoved" ? function () {
	      var node = _this.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ConfigChangeFB.startConfigChangeFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ConfigChangeFB.addType(builder, _buffers.Iris.Serialization.Raft.ConfigChangeTypeFB.NodeRemovedFB);
	
	      _buffers.Iris.Serialization.Raft.ConfigChangeFB.addNode(builder, node);
	
	      return _buffers.Iris.Serialization.Raft.ConfigChangeFB.endConfigChangeFB(builder);
	    }() : function () {
	      var node = _this.Fields[0].ToOffset(builder);
	
	      _buffers.Iris.Serialization.Raft.ConfigChangeFB.startConfigChangeFB(builder);
	
	      _buffers.Iris.Serialization.Raft.ConfigChangeFB.addType(builder, _buffers.Iris.Serialization.Raft.ConfigChangeTypeFB.NodeAddedFB);
	
	      _buffers.Iris.Serialization.Raft.ConfigChangeFB.addNode(builder, node);
	
	      return _buffers.Iris.Serialization.Raft.ConfigChangeFB.endConfigChangeFB(builder);
	    }();
	  };
	
	  ConfigChange.FromFB = function FromFB(fb) {
	    return function (builder_) {
	      return builder_.Run(builder_.Delay(function () {
	        return RaftNode.FromFB(fb.Node()).Case === "Left" ? new _Either.Either("Left", [RaftNode.FromFB(fb.Node()).Fields[0]]) : function (_arg1) {
	          var matchValue = fb.Type();
	
	          if (matchValue === _buffers.Iris.Serialization.Raft.ConfigChangeTypeFB.NodeAddedFB) {
	            return builder_.Return(new ConfigChange("NodeAdded", [_arg1]));
	          } else {
	            if (matchValue === _buffers.Iris.Serialization.Raft.ConfigChangeTypeFB.NodeRemovedFB) {
	              return builder_.Return(new ConfigChange("NodeRemoved", [_arg1]));
	            } else {
	              return builder_.ReturnFrom(_Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Could not parse ConfigChangeTypeFB %A")(function (x) {
	                return x;
	              })(matchValue)])));
	            }
	          }
	        }(RaftNode.FromFB(fb.Node()).Fields[0]);
	      }));
	    }(_Either.EitherUtils.either);
	  };
	
	  ConfigChange.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  ConfigChange.FromBytes = function FromBytes(bytes) {
	    return ConfigChange.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.ConfigChangeFB.getRootAsConfigChangeFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  return ConfigChange;
	}();
	
	_fableCore.Util.setInterfaces(ConfigChange.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Raft.ConfigChange");
	
	var _Node = function ($exports) {
	  var create = $exports.create = function create(id) {
	    var hostname = window.location.host;
	    var IpAddr = new _IpAddress.IpAddress("IPv4Address", ["127.0.0.1"]);
	    var Port = 6000;
	    var WebPort = 7000;
	    var WsPort = 8000;
	    var GitPort = 9000;
	    var State = new RaftNodeState("Running", []);
	    return new RaftNode(id, hostname, IpAddr, Port, WebPort, WsPort, GitPort, true, false, State, 1, 0);
	  };
	
	  var isVoting = $exports.isVoting = function isVoting(node) {
	    return node.State.Equals(new RaftNodeState("Running", [])) ? node.Voting : false;
	  };
	
	  var setVoting = $exports.setVoting = function setVoting(node, voting) {
	    return new RaftNode(node.Id, node.HostName, node.IpAddr, node.Port, node.WebPort, node.WsPort, node.GitPort, voting, node.VotedForMe, node.State, node.NextIndex, node.MatchIndex);
	  };
	
	  var voteForMe = $exports.voteForMe = function voteForMe(node, vote) {
	    return new RaftNode(node.Id, node.HostName, node.IpAddr, node.Port, node.WebPort, node.WsPort, node.GitPort, node.Voting, vote, node.State, node.NextIndex, node.MatchIndex);
	  };
	
	  var hasVoteForMe = $exports.hasVoteForMe = function hasVoteForMe(node) {
	    return node.VotedForMe;
	  };
	
	  var setHasSufficientLogs = $exports.setHasSufficientLogs = function setHasSufficientLogs(node) {
	    var State = new RaftNodeState("Running", []);
	    var Voting = true;
	    return new RaftNode(node.Id, node.HostName, node.IpAddr, node.Port, node.WebPort, node.WsPort, node.GitPort, Voting, node.VotedForMe, State, node.NextIndex, node.MatchIndex);
	  };
	
	  var hasSufficientLogs = $exports.hasSufficientLogs = function hasSufficientLogs(node) {
	    return node.State.Equals(new RaftNodeState("Running", []));
	  };
	
	  var hostName = $exports.hostName = function hostName(node) {
	    return node.HostName;
	  };
	
	  var ipAddr = $exports.ipAddr = function ipAddr(node) {
	    return node.IpAddr;
	  };
	
	  var port = $exports.port = function port(node) {
	    return node.Port;
	  };
	
	  var canVote = $exports.canVote = function canVote(peer) {
	    return (isVoting(peer) ? hasVoteForMe(peer) : false) ? peer.State.Equals(new RaftNodeState("Running", [])) : false;
	  };
	
	  var getId = $exports.getId = function getId(node) {
	    return node.Id;
	  };
	
	  var getState = $exports.getState = function getState(node) {
	    return node.State;
	  };
	
	  var getNextIndex = $exports.getNextIndex = function getNextIndex(node) {
	    return node.NextIndex;
	  };
	
	  var getMatchIndex = $exports.getMatchIndex = function getMatchIndex(node) {
	    return node.MatchIndex;
	  };
	
	  var added = function added(oldnodes, newnodes) {
	    var folder = function folder(changes) {
	      return function (node) {
	        var matchValue = _fableCore.Seq.tryFind(function ($var27) {
	          return node.Id.Equals(getId($var27));
	        }, oldnodes);
	
	        if (matchValue != null) {
	          return changes;
	        } else {
	          return new _fableCore.List(new ConfigChange("NodeAdded", [node]), changes);
	        }
	      };
	    };
	
	    return _fableCore.Seq.fold(function ($var28, $var29) {
	      return folder($var28)($var29);
	    }, new _fableCore.List(), newnodes);
	  };
	
	  var removed = function removed(oldnodes, newnodes) {
	    var folder = function folder(changes) {
	      return function (node) {
	        var matchValue = _fableCore.Seq.tryFind(function ($var30) {
	          return node.Id.Equals(getId($var30));
	        }, newnodes);
	
	        if (matchValue != null) {
	          return changes;
	        } else {
	          return new _fableCore.List(new ConfigChange("NodeAdded", [node]), changes);
	        }
	      };
	    };
	
	    return _fableCore.Seq.fold(function ($var31, $var32) {
	      return folder($var31)($var32);
	    }, new _fableCore.List(), oldnodes);
	  };
	
	  var changes = $exports.changes = function changes(oldnodes, newnodes) {
	    return Array.from(_fableCore.List.append(removed(oldnodes, newnodes), _fableCore.List.append(added(oldnodes, newnodes), new _fableCore.List())));
	  };
	
	  return $exports;
	}({});
	
	exports.Node = _Node;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.IpAddress = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var IpAddress = exports.IpAddress = function () {
	  function IpAddress(caseName, fields) {
	    _classCallCheck(this, IpAddress);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  IpAddress.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  IpAddress.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  IpAddress.prototype.ToString = function ToString() {
	    return this.Case === "IPv6Address" ? this.Fields[0] : this.Fields[0];
	  };
	
	  IpAddress.Parse = function Parse(str) {
	    var regex = _fableCore.RegExp.create("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}");
	
	    var matchValue = _fableCore.RegExp.isMatch(regex, str);
	
	    if (matchValue) {
	      return new IpAddress("IPv4Address", [str]);
	    } else {
	      return new IpAddress("IPv6Address", [str]);
	    }
	  };
	
	  IpAddress.TryParse = function TryParse(str) {
	    try {
	      return _Either.EitherModule.succeed(IpAddress.Parse(str));
	    } catch (exn) {
	      return _Either.EitherModule.fail(new _Error.IrisError("ParseError", [_fableCore.String.fsFormat("Unable to parse IP: %s Cause: %s")(function (x) {
	        return x;
	      })(str)(exn)]));
	    }
	  };
	
	  return IpAddress;
	}();

	_fableCore.Util.setInterfaces(IpAddress.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.IpAddress");


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.User = undefined;
	
	var _Id = __webpack_require__(12);
	
	var _fableCore = __webpack_require__(5);
	
	var _buffers = __webpack_require__(8);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var User = exports.User = function () {
	  function User(id, userName, firstName, lastName, email, joined, created) {
	    _classCallCheck(this, User);
	
	    this.Id = id;
	    this.UserName = userName;
	    this.FirstName = firstName;
	    this.LastName = lastName;
	    this.Email = email;
	    this.Joined = joined;
	    this.Created = created;
	  }
	
	  User.prototype.GetHashCode = function GetHashCode() {
	    var hash = 42;
	    hash = hash * 7 + _Id.JsUtilities.hashCode(_fableCore.Util.toString(this.Id));
	    hash = hash * 7 + _Id.JsUtilities.hashCode(this.UserName);
	    hash = hash * 7 + _Id.JsUtilities.hashCode(this.FirstName);
	    hash = hash * 7 + _Id.JsUtilities.hashCode(this.LastName);
	    hash = hash * 7 + _Id.JsUtilities.hashCode(this.Email);
	    hash = hash * 7 + _Id.JsUtilities.hashCode(this.Joined);
	    hash = hash * 7 + _Id.JsUtilities.hashCode(this.Created);
	    return hash;
	  };
	
	  User.prototype.Equals_0 = function Equals_0(other) {
	    var _this = this;
	
	    return other instanceof User ? function () {
	      var user = other;
	      return _this.Equals(user);
	    }() : false;
	  };
	
	  User.prototype.ToOffset = function ToOffset(builder) {
	    var id = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var username = function (arg00) {
	      return builder.createString(arg00);
	    }(this.UserName);
	
	    var firstname = function (arg00) {
	      return builder.createString(arg00);
	    }(this.FirstName);
	
	    var lastname = function (arg00) {
	      return builder.createString(arg00);
	    }(this.LastName);
	
	    var email = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Email);
	
	    var joined = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Joined);
	
	    var created = function (arg00) {
	      return builder.createString(arg00);
	    }(this.Created);
	
	    _buffers.Iris.Serialization.Raft.UserFB.startUserFB(builder);
	
	    _buffers.Iris.Serialization.Raft.UserFB.addId(builder, id);
	
	    _buffers.Iris.Serialization.Raft.UserFB.addUserName(builder, username);
	
	    _buffers.Iris.Serialization.Raft.UserFB.addFirstName(builder, firstname);
	
	    _buffers.Iris.Serialization.Raft.UserFB.addLastName(builder, lastname);
	
	    _buffers.Iris.Serialization.Raft.UserFB.addEmail(builder, email);
	
	    _buffers.Iris.Serialization.Raft.UserFB.addJoined(builder, joined);
	
	    _buffers.Iris.Serialization.Raft.UserFB.addCreated(builder, created);
	
	    return _buffers.Iris.Serialization.Raft.UserFB.endUserFB(builder);
	  };
	
	  User.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  User.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new User(new _Id.Id("Id", [fb.Id()]), fb.UserName(), fb.FirstName(), fb.LastName(), fb.Email(), fb.Joined(), fb.Created());
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("User")(exn)));
	    }
	  };
	
	  User.FromBytes = function FromBytes(bytes) {
	    return User.FromFB(_buffers.Iris.Serialization.Raft.UserFB.getRootAsUserFB((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  User.prototype.Equals = function Equals(other) {
	    return (((((this.Id.Equals(other.Id) ? this.UserName === other.UserName : false) ? this.FirstName === other.FirstName : false) ? this.LastName === other.LastName : false) ? this.Email === other.Email : false) ? this.Joined === other.Joined : false) ? this.Created === other.Created : false;
	  };
	
	  User.prototype.CompareTo = function CompareTo(o) {
	    var _this2 = this;
	
	    return o instanceof User ? function () {
	      var other = o;
	
	      if (_this2.UserName > other.UserName) {
	        return 1;
	      } else {
	        if (_this2.UserName === other.UserName) {
	          return 0;
	        } else {
	          return -1;
	        }
	      }
	    }() : 0;
	  };
	
	  return User;
	}();

	_fableCore.Util.setInterfaces(User.prototype, ["FSharpRecord", "System.IComparable", "System.IEquatable"], "Iris.Core.User");
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(flatbuffers) {"use strict";
	
	exports.__esModule = true;
	exports.Session = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	var _Id = __webpack_require__(12);
	
	var _IpAddress = __webpack_require__(18);
	
	var _buffers = __webpack_require__(8);
	
	var _Serialization = __webpack_require__(9);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Session = exports.Session = function () {
	  function Session(id, userName, ipAddress, userAgent) {
	    _classCallCheck(this, Session);
	
	    this.Id = id;
	    this.UserName = userName;
	    this.IpAddress = ipAddress;
	    this.UserAgent = userAgent;
	  }
	
	  Session.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsRecords(this, other);
	  };
	
	  Session.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareRecords(this, other);
	  };
	
	  Session.FromFB = function FromFB(fb) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return new Session(new _Id.Id("Id", [fb.Id()]), fb.UserName(), _IpAddress.IpAddress.Parse(fb.IpAddress()), fb.UserAgent());
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("Session")(exn)));
	    }
	  };
	
	  Session.FromBytes = function FromBytes(bytes) {
	    return Session.FromFB(function (arg00) {
	      return _buffers.Iris.Serialization.Raft.SessionFB.getRootAsSessionFB(arg00);
	    }((0, _Serialization.createBuffer)(bytes)));
	  };
	
	  Session.prototype.ToOffset = function ToOffset(builder) {
	    var session = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.Id));
	
	    var name = function (arg00) {
	      return builder.createString(arg00);
	    }(this.UserName);
	
	    var ip = function (arg00) {
	      return builder.createString(arg00);
	    }(_fableCore.Util.toString(this.IpAddress));
	
	    var ua = function (arg00) {
	      return builder.createString(arg00);
	    }(this.UserAgent);
	
	    _buffers.Iris.Serialization.Raft.SessionFB.startSessionFB(builder);
	
	    _buffers.Iris.Serialization.Raft.SessionFB.addId(builder, session);
	
	    _buffers.Iris.Serialization.Raft.SessionFB.addUserName(builder, name);
	
	    _buffers.Iris.Serialization.Raft.SessionFB.addIpAddress(builder, ip);
	
	    _buffers.Iris.Serialization.Raft.SessionFB.addUserAgent(builder, ua);
	
	    return _buffers.Iris.Serialization.Raft.SessionFB.endSessionFB(builder);
	  };
	
	  Session.prototype.ToBytes = function ToBytes() {
	    var builder = new flatbuffers.flatbuffers.Builder(1);
	    var offset = this.ToOffset(builder);
	    builder.finish(offset);
	    return builder.asUint8Array().buffer.slice(builder.dataBuffer().position(), builder.dataBuffer().position() + builder.offset());
	  };
	
	  return Session;
	}();

	_fableCore.Util.setInterfaces(Session.prototype, ["FSharpRecord", "System.IEquatable", "System.IComparable"], "Iris.Core.Session");
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.LogLevel = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	var _Either = __webpack_require__(6);
	
	var _Error = __webpack_require__(7);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var LogLevel = exports.LogLevel = function () {
	  function LogLevel(caseName, fields) {
	    _classCallCheck(this, LogLevel);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  LogLevel.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };
	
	  LogLevel.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };
	
	  LogLevel.Parse = function Parse(str) {
	    var matchValue = str.toLowerCase();
	    var $var4 = null;
	
	    switch (matchValue) {
	      case "debug":
	        $var4 = "debug";
	        break;
	
	      case "info":
	        $var4 = "info";
	        break;
	
	      case "warn":
	        $var4 = "warn";
	        break;
	
	      case "err":
	      case "error":
	        $var4 = "err";
	        break;
	
	      default:
	        $var4 = _fableCore.String.fsFormat("could not parse %s")(function (x) {
	          throw x;
	        })(str);
	    }
	
	    return $var4;
	  };
	
	  LogLevel.TryParse = function TryParse(str) {
	    try {
	      return _Either.EitherModule.succeed(function () {
	        return LogLevel.Parse(str);
	      }());
	    } catch (exn) {
	      return _Either.EitherModule.fail(function (arg0) {
	        return new _Error.IrisError("ParseError", [arg0]);
	      }(_fableCore.String.fsFormat("Could not parse %s: %s")(function (x) {
	        return x;
	      })("LogLevel")(exn)));
	    }
	  };
	
	  LogLevel.prototype.ToString = function ToString() {
	    return this === "info" ? "info" : this === "warn" ? "warn" : this === "err" ? "err" : "debug";
	  };
	
	  return LogLevel;
	}();

	_fableCore.Util.setInterfaces(LogLevel.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.LogLevel");


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	exports.ClientMessage = undefined;
	
	var _fableCore = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ClientMessage = exports.ClientMessage = function () {
	  function ClientMessage(caseName, fields) {
	    _classCallCheck(this, ClientMessage);
	
	    this.Case = caseName;
	    this.Fields = fields;
	  }
	
	  ClientMessage.prototype.Equals = function Equals(other) {
	    return _fableCore.Util.equalsUnions(this, other);
	  };

	  ClientMessage.prototype.CompareTo = function CompareTo(other) {
	    return _fableCore.Util.compareUnions(this, other);
	  };

	  return ClientMessage;
	}();

	_fableCore.Util.setInterfaces(ClientMessage.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Iris.Core.ClientMessage");


/***/ }
/******/ ]);
//# sourceMappingURL=worker.js.map