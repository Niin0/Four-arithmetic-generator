/* ============================== __main__ ==============================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */



flexx.define("__main__", ["pscript-std.js", "flexx.app._component2"], function (_py, flexx$app$_component2) {

"use strict";

var _pyfunc_op_instantiate = _py._pyfunc_op_instantiate;

var PyComponent = flexx$app$_component2.PyComponent;





var Fag = function () {
    _pyfunc_op_instantiate(this, arguments);
}
Fag.prototype = Object.create(PyComponent.prototype);
Fag.prototype._base_class = PyComponent.prototype;
Fag.prototype.__name__ = "Fag";
var $Fag = Fag.prototype;

$Fag.__attributes__ = ["id", "root", "session", "uid"]
$Fag.__properties__ = []
$Fag.__actions__ = ["_emit_at_proxy"]
$Fag.__emitters__ = []
$Fag.__reactions__ = []
$Fag.__jsmodule__ = "__main__"


var SendDataView = function () {
    _pyfunc_op_instantiate(this, arguments);
}
SendDataView.prototype = Object.create(PyComponent.prototype);
SendDataView.prototype._base_class = PyComponent.prototype;
SendDataView.prototype.__name__ = "SendDataView";
var $SendDataView = SendDataView.prototype;

$SendDataView.__attributes__ = ["id", "root", "session", "uid"]
$SendDataView.__properties__ = []
$SendDataView.__actions__ = ["_emit_at_proxy"]
$SendDataView.__emitters__ = []
$SendDataView.__reactions__ = []
$SendDataView.__jsmodule__ = "__main__"


var MainView = function () {
    _pyfunc_op_instantiate(this, arguments);
}
MainView.prototype = Object.create(PyComponent.prototype);
MainView.prototype._base_class = PyComponent.prototype;
MainView.prototype.__name__ = "MainView";
var $MainView = MainView.prototype;

$MainView.__attributes__ = ["id", "root", "session", "uid"]
$MainView.__properties__ = []
$MainView.__actions__ = ["_emit_at_proxy"]
$MainView.__emitters__ = []
$MainView.__reactions__ = []
$MainView.__jsmodule__ = "__main__"


return {Fag: Fag, MainView: MainView, SendDataView: SendDataView};
});
