/* ====================== flexx.ui.widgets._button ======================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */



flexx.define("flexx.ui.widgets._button", ["pscript-std.js", "flexx.ui._widget", "flexx.event.js"], function (_py, flexx$ui$_widget, event) {

"use strict";

var _pyfunc_op_equals = _py._pyfunc_op_equals, _pyfunc_op_instantiate = _py._pyfunc_op_instantiate, _pyfunc_truthy = _py._pyfunc_truthy;

var _pymeth_remove = _py._pymeth_remove;

var Widget = flexx$ui$_widget.Widget;





var BaseButton = function () {
    _pyfunc_op_instantiate(this, arguments);
}
BaseButton.prototype = Object.create(Widget.prototype);
BaseButton.prototype._base_class = Widget.prototype;
BaseButton.prototype.__name__ = "BaseButton";
var $BaseButton = BaseButton.prototype;

$BaseButton.DEFAULT_MIN_SIZE = [10, 24]
$BaseButton._text_value = "";
$BaseButton._checked_value = false;
$BaseButton._disabled_value = false;
$BaseButton.__attributes__ = ["id", "root", "session", "uid"]
$BaseButton.__properties__ = ["_size_limits", "capture_mouse", "checked", "children", "container", "css_class", "disabled", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]
$BaseButton.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_checked", "set_container", "set_css_class", "set_disabled", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_text", "set_title"]
$BaseButton.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel", "user_checked"]
$BaseButton.__reactions__ = ["_BaseButton__on_pointer_click", "_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$BaseButton.__jsmodule__ = "flexx.ui.widgets._button"
$BaseButton.__proxy_properties__ = ["_size_limits", "capture_mouse", "checked", "container", "css_class", "disabled", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]

$BaseButton._BaseButton__on_pointer_click = function (e) {
    this.node.blur();
    return null;
};
$BaseButton._BaseButton__on_pointer_click.nobind = true;
$BaseButton._BaseButton__on_pointer_click._mode = "normal"
$BaseButton._BaseButton__on_pointer_click._connection_strings = ["pointer_click"]

$BaseButton.user_checked = function (checked) {
    var d;
    d = ({old_value: this.checked, new_value: checked});
    this.set_checked(checked);
    return d;
};
$BaseButton.user_checked.nobind = true;

$BaseButton._text_validate = function (value) { return event.StringProp.prototype._validate(value, "text", null); }

$BaseButton._mutate_text = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['text'], args));
};

$BaseButton.set_text = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('text', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$BaseButton.set_text.nobind = true;

$BaseButton._checked_validate = function (value) { return event.BoolProp.prototype._validate(value, "checked", null); }

$BaseButton._mutate_checked = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['checked'], args));
};

$BaseButton.set_checked = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('checked', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$BaseButton.set_checked.nobind = true;

$BaseButton._disabled_validate = function (value) { return event.BoolProp.prototype._validate(value, "disabled", null); }

$BaseButton._mutate_disabled = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['disabled'], args));
};

$BaseButton.set_disabled = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('disabled', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$BaseButton.set_disabled.nobind = true;



var Button = function () {
    _pyfunc_op_instantiate(this, arguments);
}
Button.prototype = Object.create(BaseButton.prototype);
Button.prototype._base_class = BaseButton.prototype;
Button.prototype.__name__ = "Button";
var $Button = Button.prototype;

$Button.DEFAULT_MIN_SIZE = [10, 28]
$Button.__attributes__ = ["id", "root", "session", "uid"]
$Button.__properties__ = ["_size_limits", "capture_mouse", "checked", "children", "container", "css_class", "disabled", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]
$Button.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_checked", "set_container", "set_css_class", "set_disabled", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_text", "set_title"]
$Button.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel", "user_checked"]
$Button.__reactions__ = ["_BaseButton__on_pointer_click", "_Button__disabled_changed", "_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$Button.__jsmodule__ = "flexx.ui.widgets._button"
$Button.__proxy_properties__ = ["_size_limits", "capture_mouse", "checked", "container", "css_class", "disabled", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]

$Button._create_dom = function () {
    var node;
    node = window.document.createElement("button");
    return node;
};

$Button._render_dom = function () {
    return [this.text];
};

$Button._Button__disabled_changed = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    if (_pyfunc_truthy(events[events.length -1].new_value)) {
        this.node.setAttribute("disabled", "disabled");
    } else {
        this.node.removeAttribute("disabled");
    }
    return null;
};
$Button._Button__disabled_changed.nobind = true;
$Button._Button__disabled_changed._mode = "normal"
$Button._Button__disabled_changed._connection_strings = ["disabled"]



var ToggleButton = function () {
    _pyfunc_op_instantiate(this, arguments);
}
ToggleButton.prototype = Object.create(BaseButton.prototype);
ToggleButton.prototype._base_class = BaseButton.prototype;
ToggleButton.prototype.__name__ = "ToggleButton";
var $ToggleButton = ToggleButton.prototype;

$ToggleButton.DEFAULT_MIN_SIZE = [10, 28]
$ToggleButton.__attributes__ = ["id", "root", "session", "uid"]
$ToggleButton.__properties__ = ["_size_limits", "capture_mouse", "checked", "children", "container", "css_class", "disabled", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]
$ToggleButton.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_checked", "set_container", "set_css_class", "set_disabled", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_text", "set_title"]
$ToggleButton.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel", "user_checked"]
$ToggleButton.__reactions__ = ["_BaseButton__on_pointer_click", "_ToggleButton__check_changed", "_ToggleButton__toggle_checked", "_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$ToggleButton.__jsmodule__ = "flexx.ui.widgets._button"
$ToggleButton.__proxy_properties__ = ["_size_limits", "capture_mouse", "checked", "container", "css_class", "disabled", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]

$ToggleButton._create_dom = function () {
    var node;
    node = window.document.createElement("button");
    return node;
};

$ToggleButton._render_dom = function () {
    return [this.text];
};

$ToggleButton._ToggleButton__toggle_checked = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    this.user_checked(!_pyfunc_truthy(this.checked));
    return null;
};
$ToggleButton._ToggleButton__toggle_checked.nobind = true;
$ToggleButton._ToggleButton__toggle_checked._mode = "normal"
$ToggleButton._ToggleButton__toggle_checked._connection_strings = ["pointer_click"]

$ToggleButton._ToggleButton__check_changed = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    if (_pyfunc_truthy(this.checked)) {
        this.node.classList.add("flx-checked");
    } else {
        _pymeth_remove.call(this.node.classList, "flx-checked");
    }
    return null;
};
$ToggleButton._ToggleButton__check_changed.nobind = true;
$ToggleButton._ToggleButton__check_changed._mode = "normal"
$ToggleButton._ToggleButton__check_changed._connection_strings = ["checked"]



var RadioButton = function () {
    _pyfunc_op_instantiate(this, arguments);
}
RadioButton.prototype = Object.create(BaseButton.prototype);
RadioButton.prototype._base_class = BaseButton.prototype;
RadioButton.prototype.__name__ = "RadioButton";
var $RadioButton = RadioButton.prototype;

$RadioButton.__attributes__ = ["id", "root", "session", "uid"]
$RadioButton.__properties__ = ["_size_limits", "capture_mouse", "checked", "children", "container", "css_class", "disabled", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]
$RadioButton.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_checked", "set_container", "set_css_class", "set_disabled", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_text", "set_title"]
$RadioButton.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel", "user_checked"]
$RadioButton.__reactions__ = ["_BaseButton__on_pointer_click", "_RadioButton__check_changed", "_RadioButton__update_group", "_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$RadioButton.__jsmodule__ = "flexx.ui.widgets._button"
$RadioButton.__proxy_properties__ = ["_size_limits", "capture_mouse", "checked", "container", "css_class", "disabled", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]

$RadioButton._create_dom = function () {
    var node, outernode;
    outernode = window.document.createElement("label");
    node = window.document.createElement("input");
    outernode.appendChild(node);
    node.setAttribute("type", "radio");
    node.setAttribute("id", this.id);
    outernode.setAttribute("for", this.id);
    return [outernode, node];
};

$RadioButton._render_dom = function () {
    return [this.node, this.text];
};

$RadioButton._RadioButton__update_group = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    if (_pyfunc_truthy(this.parent)) {
        this.node.name = this.parent.id;
    }
    return null;
};
$RadioButton._RadioButton__update_group.nobind = true;
$RadioButton._RadioButton__update_group._mode = "normal"
$RadioButton._RadioButton__update_group._connection_strings = ["parent"]

$RadioButton._RadioButton__check_changed = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    this.node.checked = this.checked;
    return null;
};
$RadioButton._RadioButton__check_changed.nobind = true;
$RadioButton._RadioButton__check_changed._mode = "normal"
$RadioButton._RadioButton__check_changed._connection_strings = ["checked"]

$RadioButton.pointer_click = function (e) {
    var child, stub1_seq, stub2_itr;
    if (_pyfunc_truthy(this.parent)) {
        stub1_seq = this.parent.children;
        if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
        for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
            child = stub1_seq[stub2_itr];
            if ((_pyfunc_truthy(child instanceof RadioButton) && (child !== this))) {
                child.set_checked(child.node.checked);
            }
        }
    }
    this.user_checked(this.node.checked);
    (BaseButton.prototype.pointer_click).call(this, e);
    return null;
};
$RadioButton.pointer_click.nobind = true;



var CheckBox = function () {
    _pyfunc_op_instantiate(this, arguments);
}
CheckBox.prototype = Object.create(BaseButton.prototype);
CheckBox.prototype._base_class = BaseButton.prototype;
CheckBox.prototype.__name__ = "CheckBox";
var $CheckBox = CheckBox.prototype;

$CheckBox.__attributes__ = ["id", "root", "session", "uid"]
$CheckBox.__properties__ = ["_size_limits", "capture_mouse", "checked", "children", "container", "css_class", "disabled", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]
$CheckBox.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_checked", "set_container", "set_css_class", "set_disabled", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_text", "set_title"]
$CheckBox.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel", "user_checked"]
$CheckBox.__reactions__ = ["_BaseButton__on_pointer_click", "_CheckBox__check_changed", "_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$CheckBox.__jsmodule__ = "flexx.ui.widgets._button"
$CheckBox.__proxy_properties__ = ["_size_limits", "capture_mouse", "checked", "container", "css_class", "disabled", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]

$CheckBox._create_dom = function () {
    var node, outernode;
    outernode = window.document.createElement("label");
    node = window.document.createElement("input");
    outernode.appendChild(node);
    node.setAttribute("type", "checkbox");
    node.setAttribute("id", this.id);
    outernode.setAttribute("for", this.id);
    this._addEventListener(node, "click", this._check_changed_from_dom, 0);
    return [outernode, node];
};

$CheckBox._render_dom = function () {
    return [this.node, this.text];
};

$CheckBox._CheckBox__check_changed = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    this.node.checked = this.checked;
    return null;
};
$CheckBox._CheckBox__check_changed.nobind = true;
$CheckBox._CheckBox__check_changed._mode = "normal"
$CheckBox._CheckBox__check_changed._connection_strings = ["checked"]

$CheckBox._check_changed_from_dom = function (ev) {
    this.user_checked(this.node.checked);
    return null;
};



return {BaseButton: BaseButton, Button: Button, CheckBox: CheckBox, RadioButton: RadioButton, ToggleButton: ToggleButton};
});
