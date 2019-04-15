/* ===================== flexx.ui.widgets._dropdown =====================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */



flexx.define("flexx.ui.widgets._dropdown", ["pscript-std.js", "flexx.ui._widget", "flexx.event.js", "flexx.app._component2"], function (_py, flexx$ui$_widget, event, flexx$app$_component2) {

"use strict";

var _pyfunc_enumerate = _py._pyfunc_enumerate, _pyfunc_hasattr = _py._pyfunc_hasattr, _pyfunc_list = _py._pyfunc_list, _pyfunc_op_add = _py._pyfunc_op_add, _pyfunc_op_contains = _py._pyfunc_op_contains, _pyfunc_op_equals = _py._pyfunc_op_equals, _pyfunc_op_instantiate = _py._pyfunc_op_instantiate, _pyfunc_sorted = _py._pyfunc_sorted, _pyfunc_str = _py._pyfunc_str, _pyfunc_truthy = _py._pyfunc_truthy;

var _pymeth_append = _py._pymeth_append, _pymeth_keys = _py._pymeth_keys, _pymeth_remove = _py._pymeth_remove, _pymeth_strip = _py._pymeth_strip;

var app$LocalProperty = flexx$app$_component2.LocalProperty;

var create_element = flexx$ui$_widget.create_element;

var Widget = flexx$ui$_widget.Widget;





var BaseDropdown = function () {
    _pyfunc_op_instantiate(this, arguments);
}
BaseDropdown.prototype = Object.create(Widget.prototype);
BaseDropdown.prototype._base_class = Widget.prototype;
BaseDropdown.prototype.__name__ = "BaseDropdown";
var $BaseDropdown = BaseDropdown.prototype;

$BaseDropdown.DEFAULT_MIN_SIZE = [50, 28]
$BaseDropdown.__attributes__ = ["id", "root", "session", "uid"]
$BaseDropdown.__properties__ = ["_size_limits", "capture_mouse", "children", "container", "css_class", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]
$BaseDropdown.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "expand", "set_capture_mouse", "set_container", "set_css_class", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_title"]
$BaseDropdown.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel"]
$BaseDropdown.__reactions__ = ["_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$BaseDropdown.__jsmodule__ = "flexx.ui.widgets._dropdown"
$BaseDropdown.__proxy_properties__ = ["_size_limits", "capture_mouse", "container", "css_class", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]

$BaseDropdown.init = function () {
    if ((_pyfunc_op_equals(this.tabindex, (-2)))) {
        this.set_tabindex(-1);
    }
    return null;
};

$BaseDropdown.expand = function expand () {
    this._expand();
    this.node.focus();
    return null;
};
$BaseDropdown.expand.nobind = true;

$BaseDropdown._create_dom = function () {
    return window.document.createElement("span");
};

$BaseDropdown._render_dom = function () {
    var f2;
    f2 = (function (e) {return (_pyfunc_op_equals(e.which, 13))? (this._submit_text()) : (null);}).bind(this);
    return [create_element("span", ({className: "flx-dd-label", onclick: this._but_click}), this.text + "\u00a0"), create_element("input", ({className: "flx-dd-edit", onkeypress: f2, onblur: this._submit_text, value: this.text})), create_element("span"), create_element("span", ({className: "flx-dd-button", onclick: this._but_click})), create_element("div", ({className: "flx-dd-strud"}), "\u00a0")];
};

$BaseDropdown._but_click = function () {
    if (_pyfunc_truthy(this.node.classList.contains("expanded"))) {
        this._collapse();
    } else {
        this._expand();
    }
    return null;
};

$BaseDropdown._submit_text = function () {
    var edit_node;
    edit_node = this.outernode.childNodes[1];
    this.set_text(edit_node.value);
    return null;
};

$BaseDropdown._expand = function () {
    var rect;
    this.node.classList.add("expanded");
    rect = this.node.getBoundingClientRect();
    this._rect_to_check = rect;
    window.setTimeout(this._check_expanded_pos, 100);
    this._addEventListener(window.document, "mousedown", this._collapse_maybe, 1);
    return rect;
};

$BaseDropdown._collapse_maybe = function (e) {
    var t;
    t = e.target;
    while (t !== window.document.body) {
        if ((t === this.outernode)) {
            return null;
        }
        t = t.parentElement;
    }
    window.document.removeEventListener("mousedown", this._collapse_maybe, 1);
    this._collapse();
    return null;
};

$BaseDropdown._collapse = function () {
    _pymeth_remove.call(this.node.classList, "expanded");
    return null;
};

$BaseDropdown._check_expanded_pos = function () {
    var rect;
    if (_pyfunc_truthy(this.node.classList.contains("expanded"))) {
        rect = this.node.getBoundingClientRect();
        if ((!(_pyfunc_op_equals(rect.top, this._rect_to_check.top) && _pyfunc_op_equals(rect.left, this._rect_to_check.left)))) {
            this._collapse();
        } else {
            window.setTimeout(this._check_expanded_pos, 100);
        }
    }
    return null;
};



var ComboBox = function () {
    _pyfunc_op_instantiate(this, arguments);
}
ComboBox.prototype = Object.create(BaseDropdown.prototype);
ComboBox.prototype._base_class = BaseDropdown.prototype;
ComboBox.prototype.__name__ = "ComboBox";
var $ComboBox = ComboBox.prototype;

$ComboBox._text_value = "";
$ComboBox._selected_index_value = -1;
$ComboBox._selected_key_value = "";
$ComboBox._placeholder_text_value = "";
$ComboBox._editable_value = false;
$ComboBox._options_value = [];
$ComboBox.__highlighted_value = -1;
$ComboBox.__attributes__ = ["id", "root", "session", "uid"]
$ComboBox.__properties__ = ["_highlighted", "_size_limits", "capture_mouse", "children", "container", "css_class", "editable", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "options", "parent", "placeholder_text", "selected_index", "selected_key", "size", "tabindex", "text", "title"]
$ComboBox.__actions__ = ["_set_highlighted", "_set_size_limits", "apply_style", "check_real_size", "expand", "set_capture_mouse", "set_container", "set_css_class", "set_editable", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_options", "set_parent", "set_placeholder_text", "set_selected_index", "set_selected_key", "set_tabindex", "set_text", "set_title"]
$ComboBox.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel", "user_selected"]
$ComboBox.__reactions__ = ["_ComboBox__track_editable", "_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$ComboBox.__jsmodule__ = "flexx.ui.widgets._dropdown"
$ComboBox.__proxy_properties__ = ["_size_limits", "capture_mouse", "container", "css_class", "editable", "flex", "maxsize", "minsize", "minsize_from_children", "options", "parent", "placeholder_text", "selected_index", "selected_key", "size", "tabindex", "text", "title"]

$ComboBox.set_options = function set_options (options) {
    var index, key, keys, opt, options2, stub1_, stub1_i0, stub1_iter0, stub1_k, stub2_seq, stub3_itr, stub4_, stub4_i0, stub4_iter0, stub4_key_text;
    if ((Object.prototype.toString.call(options).slice(8,-1).toLowerCase() === 'object')) {
        keys = _pymeth_keys.call(options);
        keys = _pyfunc_sorted(keys, undefined, false);
        stub1_ = [];stub1_iter0 = keys;if ((typeof stub1_iter0 === "object") && (!Array.isArray(stub1_iter0))) {stub1_iter0 = Object.keys(stub1_iter0);}for (stub1_i0=0; stub1_i0<stub1_iter0.length; stub1_i0++) {stub1_k = stub1_iter0[stub1_i0];{stub1_.push([stub1_k, options[stub1_k]]);}}
        options = stub1_;
    }
    options2 = [];
    stub2_seq = options;
    if ((typeof stub2_seq === "object") && (!Array.isArray(stub2_seq))) { stub2_seq = Object.keys(stub2_seq);}
    for (stub3_itr = 0; stub3_itr < stub2_seq.length; stub3_itr += 1) {
        opt = stub2_seq[stub3_itr];
        if (Array.isArray(opt)) {
            opt = [_pyfunc_str(opt[0]), _pyfunc_str(opt[1])];
        } else {
            opt = [_pyfunc_str(opt), _pyfunc_str(opt)];
        }
        _pymeth_append.call(options2, opt);
    }
    this._mutate_options(_pyfunc_list(options2));
    stub4_ = [];stub4_iter0 = this.options;if ((typeof stub4_iter0 === "object") && (!Array.isArray(stub4_iter0))) {stub4_iter0 = Object.keys(stub4_iter0);}for (stub4_i0=0; stub4_i0<stub4_iter0.length; stub4_i0++) {stub4_key_text = stub4_iter0[stub4_i0];{stub4_.push(stub4_key_text[0]);}}
    keys = stub4_;
    if ((_pyfunc_truthy(this.selected_key) && _pyfunc_op_contains(this.selected_key, keys))) {
        key = this.selected_key;
        this.set_selected_key("");
        this.set_selected_key(key);
    } else if (((0 <= this.selected_index) && (this.selected_index < this.options.length))) {
        index = this.selected_index;
        this.set_selected_index(-1);
        this.set_selected_index(index);
    } else if (_pyfunc_truthy(this.selected_key)) {
        this.selected_key("");
    } else {
    }
    return null;
};
$ComboBox.set_options.nobind = true;

$ComboBox.set_selected_index = function set_selected_index (index) {
    var key, stub1_, text;
    if (_pyfunc_op_equals(index, this.selected_index)) {
        return null;
    } else if (((0 <= index) && (index < this.options.length))) {
        stub1_ = this.options[index];
        key = stub1_[0];text = stub1_[1];
        this._mutate("selected_index", index);
        this._mutate("selected_key", key);
        this.set_text(text);
    } else {
        this._mutate("selected_index", -1);
        this._mutate("selected_key", "");
        this.set_text("");
    }
    return null;
};
$ComboBox.set_selected_index.nobind = true;

$ComboBox.set_selected_key = function set_selected_key (key) {
    var index, option, stub1_seq, stub2_itr, stub3_tgt;
    if (_pyfunc_op_equals(key, this.selected_key)) {
        return null;
    } else if (_pyfunc_truthy(key)) {
        if (_pyfunc_op_equals(key, this.selected_key)) {
            return null;
        }
        stub1_seq = _pyfunc_enumerate(this.options);
        if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
        for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
            stub3_tgt = stub1_seq[stub2_itr];
            index = stub3_tgt[0]; option = stub3_tgt[1];
            if (_pyfunc_op_equals(option[0], key)) {
                this._mutate("selected_index", index);
                this._mutate("selected_key", key);
                this.set_text(option[1]);
                return null;
            }
        }
    }
    this._mutate("selected_index", -1);
    this._mutate("selected_key", "");
    this.set_text("");
    return null;
};
$ComboBox.set_selected_key.nobind = true;

$ComboBox.user_selected = function (index) {
    var key, options, stub1_, text;
    options = this.options;
    if (((index >= 0) && (index < options.length))) {
        stub1_ = options[index];
        key = stub1_[0];text = stub1_[1];
        this.set_selected_index(index);
        this.set_selected_key(key);
        this.set_text(text);
        return {index:index, key:key, text:text};
    }
    return null;
};
$ComboBox.user_selected.nobind = true;

$ComboBox._create_dom = function () {
    var node;
    node = (BaseDropdown.prototype._create_dom).call(this);
    node.onkeydown = this._key_down;
    return node;
};

$ComboBox._render_dom = function () {
    var clsname, i, key, li, nodes, option_nodes, options, strud, stub1_, text;
    options = this.options;
    option_nodes = [];
    strud = [];
    for (i = 0; i < options.length; i += 1) {
        stub1_ = options[i];
        key = stub1_[0];text = stub1_[1];
        clsname = (_pyfunc_op_equals(this._highlighted, i))? ("highlighted-true") : ("");
        li = create_element("li", {index:i, className:clsname}, ((_pymeth_strip.call(text).length))? (text) : ("\u00a0"));
        strud = _pyfunc_op_add(strud, [text + "\u00a0", create_element("span", ({class: "flx-dd-space"})), create_element("br")]);
        _pymeth_append.call(option_nodes, li);
    }
    nodes = (BaseDropdown.prototype._render_dom).call(this);
    nodes[1].props.placeholder = this.placeholder_text;
    nodes[nodes.length -1].children = strud;
    _pymeth_append.call(nodes, create_element("ul", {onmousedown:this._ul_click}, option_nodes));
    return nodes;
};

$ComboBox._ComboBox__track_editable = function () {
    if (_pyfunc_truthy(this.editable)) {
        _pymeth_remove.call(this.node.classList, "editable-false");
        this.node.classList.add("editable-true");
    } else {
        this.node.classList.add("editable-false");
        _pymeth_remove.call(this.node.classList, "editable-true");
    }
    return null;
};
$ComboBox._ComboBox__track_editable.nobind = true;
$ComboBox._ComboBox__track_editable._mode = "auto"

$ComboBox._ul_click = function (e) {
    if (_pyfunc_hasattr(e.target, "index")) {
        this._select_from_ul(e.target.index);
    }
    return null;
};

$ComboBox._select_from_ul = function (index) {
    this.user_selected(index);
    this._collapse();
    return null;
};

$ComboBox._key_down = function (e) {
    var hl, key;
    key = e.key;
    if (_pyfunc_truthy(((!_pyfunc_truthy(key))) && _pyfunc_truthy(e.code))) {
        key = e.code;
    }
    if ((!_pyfunc_truthy(this.node.classList.contains("expanded")))) {
        if (_pyfunc_op_contains(key, ["ArrowUp", "ArrowDown"])) {
            e.stopPropagation();
            this.expand();
        }
        return null;
    }
    if ((!_pyfunc_op_contains(key, ["Escape", "ArrowUp", "ArrowDown", " ", "Enter"]))) {
        return null;
    }
    e.preventDefault();
    e.stopPropagation();
    if (_pyfunc_op_equals(key, "Escape")) {
        this._set_highlighted(-1);
        this._collapse();
    } else if ((_pyfunc_op_equals(key, "ArrowUp") || _pyfunc_op_equals(key, "ArrowDown"))) {
        if (_pyfunc_op_equals(key, "ArrowDown")) {
            hl = this._highlighted + 1;
        } else {
            hl = this._highlighted - 1;
        }
        this._set_highlighted(Math.min(Math.max(hl, 0), (this.options.length - 1)));
    } else if ((_pyfunc_op_equals(key, "Enter") || _pyfunc_op_equals(key, " "))) {
        if (((this._highlighted >= 0) && (this._highlighted < this.options.length))) {
            this._select_from_ul(this._highlighted);
        }
    }
    return null;
};

$ComboBox._expand = function () {
    var rect, space_above, space_below, ul;
    rect = (BaseDropdown.prototype._expand).call(this);
    ul = this.outernode.children[this.outernode.children.length - 1];
    ul.style.left = rect.left + "px";
    ul.style.width = rect.width + "px";
    ul.style.top = (rect.bottom - 1) + "px";
    space_below = window.innerHeight - rect.bottom;
    if ((space_below < ul.clientHeight)) {
        space_above = rect.top;
        if ((space_above > space_below)) {
            ul.style.top = ((rect.top - 1) - ul.clientHeight) + "px";
        }
    }
    return null;
};

$ComboBox._submit_text = function () {
    (BaseDropdown.prototype._submit_text).call(this);
    this.set_selected_index(-1);
    this.set_selected_key("");
    return null;
};

$ComboBox._text_validate = function (value) { return event.StringProp.prototype._validate(value, "text", null); }

$ComboBox._mutate_text = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['text'], args));
};

$ComboBox.set_text = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('text', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$ComboBox.set_text.nobind = true;

$ComboBox._selected_index_validate = function (value) { return event.IntProp.prototype._validate(value, "selected_index", null); }

$ComboBox._mutate_selected_index = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['selected_index'], args));
};

$ComboBox._selected_key_validate = function (value) { return event.StringProp.prototype._validate(value, "selected_key", null); }

$ComboBox._mutate_selected_key = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['selected_key'], args));
};

$ComboBox._placeholder_text_validate = function (value) { return event.StringProp.prototype._validate(value, "placeholder_text", null); }

$ComboBox._mutate_placeholder_text = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['placeholder_text'], args));
};

$ComboBox.set_placeholder_text = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('placeholder_text', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$ComboBox.set_placeholder_text.nobind = true;

$ComboBox._editable_validate = function (value) { return event.BoolProp.prototype._validate(value, "editable", null); }

$ComboBox._mutate_editable = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['editable'], args));
};

$ComboBox.set_editable = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('editable', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$ComboBox.set_editable.nobind = true;

$ComboBox._options_validate = function (value) { return event.TupleProp.prototype._validate(value, "options", null); }

$ComboBox._mutate_options = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['options'], args));
};

$ComboBox.__highlighted_validate = function (value) { return app$LocalProperty.prototype._validate(value, "_highlighted", null); }

$ComboBox._mutate__highlighted = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['_highlighted'], args));
};

$ComboBox._set_highlighted = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('_highlighted', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$ComboBox._set_highlighted.nobind = true;



var DropdownContainer = function () {
    _pyfunc_op_instantiate(this, arguments);
}
DropdownContainer.prototype = Object.create(BaseDropdown.prototype);
DropdownContainer.prototype._base_class = BaseDropdown.prototype;
DropdownContainer.prototype.__name__ = "DropdownContainer";
var $DropdownContainer = DropdownContainer.prototype;

$DropdownContainer._text_value = "";
$DropdownContainer.__attributes__ = ["id", "root", "session", "uid"]
$DropdownContainer.__properties__ = ["_size_limits", "capture_mouse", "children", "container", "css_class", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]
$DropdownContainer.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "expand", "set_capture_mouse", "set_container", "set_css_class", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_text", "set_title"]
$DropdownContainer.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel"]
$DropdownContainer.__reactions__ = ["_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$DropdownContainer.__jsmodule__ = "flexx.ui.widgets._dropdown"
$DropdownContainer.__proxy_properties__ = ["_size_limits", "capture_mouse", "container", "css_class", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "text", "title"]

$DropdownContainer._render_dom = function () {
    var nodes, stub1_seq, stub2_itr, widget;
    nodes = (BaseDropdown.prototype._render_dom).call(this);
    stub1_seq = this.children;
    if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
    for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
        widget = stub1_seq[stub2_itr];
        _pymeth_append.call(nodes, widget.outernode);
    }
    return nodes;
};

$DropdownContainer._expand = function () {
    var node, rect;
    rect = (BaseDropdown.prototype._expand).call(this);
    node = this.children[0].outernode;
    node.style.left = rect.left + "px";
    node.style.top = (rect.bottom - 1) + "px";
    return null;
};

$DropdownContainer._text_validate = function (value) { return event.StringProp.prototype._validate(value, "text", null); }

$DropdownContainer._mutate_text = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['text'], args));
};

$DropdownContainer.set_text = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('text', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$DropdownContainer.set_text.nobind = true;



return {BaseDropdown: BaseDropdown, ComboBox: ComboBox, DropdownContainer: DropdownContainer};
});
