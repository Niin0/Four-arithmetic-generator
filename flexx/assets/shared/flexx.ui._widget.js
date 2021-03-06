/* ========================== flexx.ui._widget ==========================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */



flexx.define("flexx.ui._widget", ["pscript-std.js", "flexx.event.js", "flexx.app._component2"], function (_py, event, flexx$app$_component2) {

"use strict";

var _pyfunc_bool = _py._pyfunc_bool, _pyfunc_create_dict = _py._pyfunc_create_dict, _pyfunc_float = _py._pyfunc_float, _pyfunc_format = _py._pyfunc_format, _pyfunc_op_contains = _py._pyfunc_op_contains, _pyfunc_op_equals = _py._pyfunc_op_equals, _pyfunc_op_error = _py._pyfunc_op_error, _pyfunc_op_instantiate = _py._pyfunc_op_instantiate, _pyfunc_op_mult = _py._pyfunc_op_mult, _pyfunc_op_parse_kwargs = _py._pyfunc_op_parse_kwargs, _pyfunc_range = _py._pyfunc_range, _pyfunc_reversed = _py._pyfunc_reversed, _pyfunc_truthy = _py._pyfunc_truthy;

var _pymeth_append = _py._pymeth_append, _pymeth_endswith = _py._pymeth_endswith, _pymeth_format = _py._pymeth_format, _pymeth_get = _py._pymeth_get, _pymeth_insert = _py._pymeth_insert, _pymeth_items = _py._pymeth_items, _pymeth_join = _py._pymeth_join, _pymeth_pop = _py._pymeth_pop, _pymeth_remove = _py._pymeth_remove, _pymeth_repeat = _py._pymeth_repeat, _pymeth_replace = _py._pymeth_replace, _pymeth_split = _py._pymeth_split, _pymeth_startswith = _py._pymeth_startswith;

var app$LocalProperty = flexx$app$_component2.LocalProperty;

var JsComponent = flexx$app$_component2.JsComponent;

var loop = event.loop;





var create_element;
create_element = function flx_create_element (type, props) {
    var children;
    children = Array.prototype.slice.call(arguments, 2);
    props = (props === undefined) ? null: props;
    if ((children.length == 0)) {
        children = null;
    } else if (((children.length == 1) && Array.isArray(children[0]))) {
        children = children[0];
    }
    return {type:type, props:(_pyfunc_truthy(props) || ({})), children:children};
};


var Widget = function () {
    _pyfunc_op_instantiate(this, arguments);
}
Widget.prototype = Object.create(JsComponent.prototype);
Widget.prototype._base_class = JsComponent.prototype;
Widget.prototype.__name__ = "Widget";
var $Widget = Widget.prototype;

$Widget.DEFAULT_MIN_SIZE = [0, 0]
$Widget._container_value = "";
$Widget._parent_value = null;
$Widget._children_value = [];
$Widget._title_value = "";
$Widget._icon_value = "";
$Widget._css_class_value = "";
$Widget._flex_value = [0, 0];
$Widget._size_value = [0, 0];
$Widget._minsize_value = [0, 0];
$Widget._minsize_from_children_value = true;
$Widget._maxsize_value = [1000000000.0, 1000000000.0];
$Widget.__size_limits_value = [0, 1000000000.0, 0, 1000000000.0];
$Widget._tabindex_value = -2;
$Widget._capture_mouse_value = 1;
$Widget.__attributes__ = ["id", "root", "session", "uid"]
$Widget.__properties__ = ["_size_limits", "capture_mouse", "children", "container", "css_class", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]
$Widget.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_container", "set_css_class", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_title"]
$Widget.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel"]
$Widget.__reactions__ = ["_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_update_minmaxsize"]
$Widget.__jsmodule__ = "flexx.ui._widget"
$Widget.__proxy_properties__ = ["_size_limits", "capture_mouse", "container", "css_class", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]

$Widget.set_icon = function set_icon (val) {
    var err_2;
    if ((!(Object.prototype.toString.call(val).slice(8,-1).toLowerCase() === 'string'))) {
        throw _pyfunc_op_error('TypeError', "Icon must be a string");
    }
    this._mutate_icon(val);
    return null;
};
$Widget.set_icon.nobind = true;

$Widget.__init__ = function () {
    var active_component, active_components, given_parent, init_args, is_app, kwargs, parent, parent_given, stub1_seq, stub2_itr, style;
    kwargs = {};
    if (arguments.length == 1 && typeof arguments[0] == 'object' && Object.keys(arguments[0]).toString() == 'flx_args,flx_kwargs') {
        kwargs = _pyfunc_op_parse_kwargs([], [], arguments[0].flx_kwargs);
        init_args = arguments[0].flx_args;
    } else {init_args = Array.prototype.slice.call(arguments);}
    try {
        given_parent = parent = _pymeth_pop.call(kwargs, "parent");
        parent_given = true;
    } catch(err_2) {
        if (err_2 instanceof Error && err_2.name === "KeyError") {
            given_parent = parent = null;
            parent_given = false;
        } else { throw err_2; }
    }
    if ((parent === null)) {
        active_components = loop.get_active_components();
        stub1_seq = _pyfunc_reversed(active_components);
        if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
        for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
            active_component = stub1_seq[stub2_itr];
            if (_pyfunc_truthy(active_component instanceof Widget)) {
                parent = active_component;
                break;
            }
        }
    }
    if (((parent !== null) && ((!_pyfunc_truthy(_pymeth_get.call(kwargs, "flx_session", null)))))) {
        kwargs["flx_session"] = parent.session;
    }
    style = _pymeth_pop.call(kwargs, "style", "");
    is_app = _pymeth_get.call(kwargs, "flx_is_app", false);
    (JsComponent.prototype.__init__).call(this, {flx_args: init_args, flx_kwargs: kwargs});
    if ((parent_given === true)) {
        this.set_parent(given_parent);
    } else if ((parent !== null)) {
        this.set_parent(parent);
    } else if (_pyfunc_op_equals(this.container, "")) {
        if (_pyfunc_truthy(window.flexx.need_main_widget)) {
            window.flexx.need_main_widget = false;
            this.set_container("body");
        }
    }
    if ((_pymeth_get.call(kwargs, "minsize", null) === null)) {
        this.set_minsize(this.DEFAULT_MIN_SIZE);
    }
    if (_pyfunc_truthy(style)) {
        this.apply_style(style);
    }
    return null;
};

$Widget._comp_init_property_values = function (property_values) {
    var cls, err_2, i, nodes, stub1_els;
    (JsComponent.prototype._comp_init_property_values).call(this, property_values);
    nodes = this._create_dom();
    if (!(nodes !== null)) { throw _pyfunc_op_error('AssertionError', "nodes !== null");}
    if ((!Array.isArray(nodes))) {
        nodes = [nodes];
    }
    if (!((nodes.length == 1) || (nodes.length == 2))) { throw _pyfunc_op_error('AssertionError', "(nodes.length == 1) || (nodes.length == 2)");}
    if ((nodes.length == 1)) {
        this.outernode = this.node = this._Widget__render_resolve(nodes[0]);
    } else {
        this.outernode = this._Widget__render_resolve(nodes[0]);
        this.node = this._Widget__render_resolve(nodes[1]);
    }
    cls = Object.getPrototypeOf(this);
    stub1_els = true;
    for (i = 0; i < 32; i += 1) {
        this.outernode.classList.add("flx-" + cls.__name__);
        if ((cls === Widget.prototype)) {
            stub1_els = false; break;
        }
        cls = cls._base_class;
    } if (stub1_els) {
        throw _pyfunc_op_error('RuntimeError', _pymeth_format.call("Error determining class names for {}", this.id));
    }
    this._init_events();
    return null;
};

$Widget.init = function () {
    return null;
};

$Widget._create_dom = function () {
    return create_element("div");
};

$Widget._render_dom = function () {
    var i, node, nodes, stub1_seq, stub2_itr, widget;
    nodes = [];
    for (i = 0; i < this.outernode.childNodes.length; i += 1) {
        node = this.outernode.childNodes[i];
        if ((!(_pyfunc_truthy(node.classList) && (_pyfunc_truthy(node.classList.contains("flx-Widget")))))) {
            nodes.push(node);
        }
    }
    stub1_seq = this.children;
    if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
    for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
        widget = stub1_seq[stub2_itr];
        nodes.push(widget.outernode);
    }
    return nodes;
};

$Widget._Widget__render = function () {
    var err_2, err_3, node, vnode;
    vnode = this._render_dom();
    if (((vnode === null) || (vnode === this.outernode))) {
        return null;
    } else if (Array.isArray(vnode)) {
        vnode = {type:this.outernode.nodeName, props:({}), children:vnode};
    } else if ((Object.prototype.toString.call(vnode).slice(8,-1).toLowerCase() === 'object')) {
        if ((!_pyfunc_op_equals(vnode.type.toLowerCase(), this.outernode.nodeName.toLowerCase()))) {
            throw _pyfunc_op_error('ValueError', "Widget._render_dom() must return root node with same element type as outernode.");
        }
    } else {
        throw _pyfunc_op_error('TypeError', "Widget._render_dom() must return None, list or dict.");
    }
    node = this._Widget__render_resolve(vnode, this.outernode);
    if (!(node === this.outernode)) { throw _pyfunc_op_error('AssertionError', "node === this.outernode");}
    return null;
};
$Widget._Widget__render.nobind = true;
$Widget._Widget__render._mode = "auto"

$Widget._Widget__render_resolve = function (vnode, node) {
    var err_2, i, i1, i2, key, map, new_subnode, ob, parts, stub1_seq, subnode, val, vsubnode;
    node = (node === undefined) ? null: node;
    if ((_pyfunc_truthy(vnode) && _pyfunc_truthy(vnode.nodeName))) {
        return vnode;
    } else if ((Object.prototype.toString.call(vnode).slice(8,-1).toLowerCase() === 'string')) {
        return window.document.createTextNode(vnode);
    } else if ((!(Object.prototype.toString.call(vnode).slice(8,-1).toLowerCase() === 'object'))) {
        throw _pyfunc_op_error('TypeError', ("Widget._render_dom() needs virtual nodes to be dicts, not " + vnode));
    }
    if ((!(Object.prototype.toString.call(vnode.type).slice(8,-1).toLowerCase() === 'string'))) {
        throw _pyfunc_op_error('TypeError', ("Widget._render_dom() needs virtual node type to be str, not " + vnode.type));
    }
    if ((!(Object.prototype.toString.call(vnode.props).slice(8,-1).toLowerCase() === 'object'))) {
        throw _pyfunc_op_error('TypeError', ("Widget._render_dom() needs virtual node props as dict, not " + vnode.props));
    }
    if (((node === null) || (!_pyfunc_op_equals(node.nodeName.toLowerCase(), vnode.type.toLowerCase())))) {
        node = window.document.createElement(vnode.type);
    }
    map = ({css_class: "className", class: "className"});
    stub1_seq = vnode.props;
    for (key in stub1_seq) {
        if (!stub1_seq.hasOwnProperty(key)){ continue; }
        val = stub1_seq[key];
        ob = node;
        parts = _pymeth_split.call(_pymeth_replace.call(key, "__", "."), ".");
        for (i = 0; i < parts.length - 1; i += 1) {
            ob = ob[parts[i]];
        }
        key = parts[parts.length - 1];
        ob[_pymeth_get.call(map, key, key)] = val;
    }
    if ((vnode.children === null)) {
    } else if (Array.isArray(vnode.children)) {
        while (node.childNodes.length > vnode.children.length) {
            node.removeChild(node.childNodes[node.childNodes.length - 1]);
        }
        i1 = -1;
        for (i2 = 0; i2 < vnode.children.length; i2 += 1) {
            i1 += 1;
            vsubnode = vnode.children[i2];
            subnode = null;
            if ((i1 < node.childNodes.length)) {
                subnode = node.childNodes[i1];
                if ((_pyfunc_op_equals(subnode.nodeName, "#text") && ((Object.prototype.toString.call(vsubnode).slice(8,-1).toLowerCase() === 'string')))) {
                    if ((!_pyfunc_op_equals(subnode.data, vsubnode))) {
                        subnode.data = vsubnode;
                    }
                    continue;
                }
            }
            new_subnode = this._Widget__render_resolve(vsubnode, subnode);
            if ((subnode === null)) {
                node.appendChild(new_subnode);
            } else if ((subnode !== new_subnode)) {
                node.insertBefore(new_subnode, subnode);
                node.removeChild(subnode);
            }
        }
    } else {
        window.flexx_vnode = vnode;
        throw _pyfunc_op_error('TypeError', (_pymeth_format.call("Widget._render_dom() needs virtual node children to be None or list, not {}", vnode.children)));
    }
    return node;
};

$Widget.dispose = function () {
    var child, children, stub1_seq, stub2_itr;
    children = this.children;
    stub1_seq = children;
    if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
    for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
        child = stub1_seq[stub2_itr];
        child.dispose();
    }
    (JsComponent.prototype.dispose).call(this);
    this.set_parent(null);
    this._children_value = [];
    return null;
};

$Widget.apply_style = function apply_style (style) {
    var d, h1, h2, i, key, mima, part, size_limits_changed, size_limits_keys, stub1_, stub1_i0, stub1_iter0, stub1_k, stub1_v, stub2_, stub3_, stub4_seq, stub5_itr, stub6_, stub7_, val, w1, w2;
    if ((Object.prototype.toString.call(style).slice(8,-1).toLowerCase() === 'object')) {
        stub1_ = [];stub1_iter0 = _pymeth_items.call(style);if ((typeof stub1_iter0 === "object") && (!Array.isArray(stub1_iter0))) {stub1_iter0 = Object.keys(stub1_iter0);}for (stub1_i0=0; stub1_i0<stub1_iter0.length; stub1_i0++) {stub1_k = stub1_iter0[stub1_i0][0]; stub1_v = stub1_iter0[stub1_i0][1];{stub1_.push(_pymeth_format.call("{}: {}", stub1_k, stub1_v));}}
        style = stub1_;
        style = _pymeth_join.call("; ", style);
    }
    d = ({});
    if (_pyfunc_truthy(style)) {
        stub4_seq = _pymeth_split.call(style, ";");
        if ((typeof stub4_seq === "object") && (!Array.isArray(stub4_seq))) { stub4_seq = Object.keys(stub4_seq);}
        for (stub5_itr = 0; stub5_itr < stub4_seq.length; stub5_itr += 1) {
            part = stub4_seq[stub5_itr];
            if (_pyfunc_op_contains(":", part)) {
                stub2_ = _pymeth_split.call(part, ":");
                key = stub2_[0];val = stub2_[1];
                stub3_ = [key.trim(), val.trim()];
                key = stub3_[0];val = stub3_[1];
                this.outernode.style[key] = val;
                d[key] = val;
            }
        }
    }
    stub6_ = this.minsize;
    w1 = stub6_[0];h1 = stub6_[1];
    stub7_ = this.maxsize;
    w2 = stub7_[0];h2 = stub7_[1];
    mima = [w1, w2, h1, h2];
    size_limits_keys = ["min-width", "max-width", "min-height", "max-height"];
    size_limits_changed = false;
    for (i = 0; i < 4; i += 1) {
        key = size_limits_keys[i];
        if (_pyfunc_op_contains(key, d)) {
            val = d[key];
            if (_pyfunc_op_equals(val, "0")) {
                mima[i] = 0;
                size_limits_changed = true;
            } else if (_pyfunc_truthy(_pymeth_endswith.call(val, "px"))) {
                mima[i] = _pyfunc_float(val.slice(0,-2));
                size_limits_changed = true;
            }
        }
    }
    if (_pyfunc_truthy(size_limits_changed)) {
        this.set_minsize([mima[0], mima[2]]);
        this.set_maxsize([mima[1], mima[3]]);
    }
    return null;
};
$Widget.apply_style.nobind = true;

$Widget._Widget__css_class_changed = function () {
    var cn, events, stub1_seq, stub2_itr, stub3_seq, stub4_itr;
    events = Array.prototype.slice.call(arguments);
    if (events.length) {
        stub1_seq = _pymeth_split.call((events[0].old_value), " ");
        if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
        for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
            cn = stub1_seq[stub2_itr];
            if (_pyfunc_truthy(cn)) {
                _pymeth_remove.call(this.outernode.classList, cn);
            }
        }
        stub3_seq = _pymeth_split.call((events[events.length -1].new_value), " ");
        if ((typeof stub3_seq === "object") && (!Array.isArray(stub3_seq))) { stub3_seq = Object.keys(stub3_seq);}
        for (stub4_itr = 0; stub4_itr < stub3_seq.length; stub4_itr += 1) {
            cn = stub3_seq[stub4_itr];
            if (_pyfunc_truthy(cn)) {
                this.outernode.classList.add(cn);
            }
        }
    }
    return null;
};
$Widget._Widget__css_class_changed.nobind = true;
$Widget._Widget__css_class_changed._mode = "normal"
$Widget._Widget__css_class_changed._connection_strings = ["css_class"]

$Widget._Widget__title_changed = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    if (((this.parent === null) && _pyfunc_op_equals(this.container, "body"))) {
        window.document.title = _pyfunc_truthy(this.title) || "Flexx app";
    }
    return null;
};
$Widget._Widget__title_changed.nobind = true;
$Widget._Widget__title_changed._mode = "normal"
$Widget._Widget__title_changed._connection_strings = ["title"]

$Widget._Widget__icon_changed = function () {
    var events, link, oldLink;
    events = Array.prototype.slice.call(arguments);
    if (((this.parent === null) && _pyfunc_op_equals(this.container, "body"))) {
        window.document.title = _pyfunc_truthy(this.title) || "Flexx app";
        link = window.document.createElement("link");
        oldLink = window.document.getElementById("flexx-favicon");
        link.id = "flexx-favicon";
        link.rel = "shortcut icon";
        link.href = events[events.length -1].new_value;
        if (_pyfunc_truthy(oldLink)) {
            window.document.head.removeChild(oldLink);
        }
        window.document.head.appendChild(link);
    }
    return null;
};
$Widget._Widget__icon_changed.nobind = true;
$Widget._Widget__icon_changed._mode = "normal"
$Widget._Widget__icon_changed._connection_strings = ["icon"]

$Widget._Widget__update_tabindex = function () {
    var events, ti;
    events = Array.prototype.slice.call(arguments);
    ti = this.tabindex;
    if ((ti < (-1))) {
        this.node.removeAttribute("tabIndex");
    } else {
        this.node.tabIndex = ti;
    }
    return null;
};
$Widget._Widget__update_tabindex.nobind = true;
$Widget._Widget__update_tabindex._mode = "auto"

$Widget._update_minmaxsize = function () {
    var h1, h2, s, stub1_, w1, w2;
    stub1_ = this._query_min_max_size();
    w1 = stub1_[0];w2 = stub1_[1];h1 = stub1_[2];h2 = stub1_[3];
    w1 = Math.max(0, w1);
    h1 = Math.max(0, h1);
    this._set_size_limits([w1, w2, h1, h2]);
    s = this.outernode.style;
    s["min-width"] = w1 + "px";
    s["max-width"] = w2 + "px";
    s["min-height"] = h1 + "px";
    s["max-height"] = h2 + "px";
    return null;
};
$Widget._update_minmaxsize.nobind = true;
$Widget._update_minmaxsize._mode = "auto"

$Widget._query_min_max_size = function () {
    var child, h1, h2, h3, h4, stub1_, stub2_, stub3_, stub4_, stub5_, w1, w2, w3, w4;
    stub1_ = this.minsize;
    w1 = stub1_[0];h1 = stub1_[1];
    stub2_ = this.maxsize;
    w2 = stub2_[0];h2 = stub2_[1];
    if ((this.outernode.classList.contains("flx-Layout") === false)) {
        if (((this.minsize_from_children === true) && (this.children.length == 1))) {
            child = this.children[0];
            if ((child.outernode.classList.contains("flx-Layout") === true)) {
                stub3_ = child._query_min_max_size();
                w3 = stub3_[0];w4 = stub3_[1];h3 = stub3_[2];h4 = stub3_[3];
                stub4_ = [Math.max(w1, w3), Math.min(w2, w4)];
                w1 = stub4_[0];w2 = stub4_[1];
                stub5_ = [Math.max(h1, h3), Math.min(h2, h4)];
                h1 = stub5_[0];h2 = stub5_[1];
            }
        }
    }
    return [w1, w2, h1, h2];
};

$Widget.check_real_size = function check_real_size () {
    var cursize, n;
    n = this.outernode;
    cursize = this.size;
    if ((((!_pyfunc_op_equals(cursize[0], n.clientWidth))) || (!_pyfunc_op_equals(cursize[1], n.clientHeight)))) {
        this._mutate_size([n.clientWidth, n.clientHeight]);
    }
    return null;
};
$Widget.check_real_size.nobind = true;

$Widget._Widget__size_may_have_changed = function () {
    var events;
    events = Array.prototype.slice.call(arguments);
    this.check_real_size();
    return null;
};
$Widget._Widget__size_may_have_changed.nobind = true;
$Widget._Widget__size_may_have_changed._mode = "normal"
$Widget._Widget__size_may_have_changed._connection_strings = ["container", "parent.size", "children"]

$Widget._set_size = function (prefix, w, h) {
    var i, size;
    size = [w, h];
    for (i = 0; i < 2; i += 1) {
        if (((size[i] <= 0) || (size === null) || (size === undefined))) {
            size[i] = "";
        } else if ((size[i] > 1)) {
            size[i] = size[i] + "px";
        } else {
            size[i] = _pyfunc_op_mult(size[i], 100) + "%";
        }
    }
    this.outernode.style[prefix + "width"] = size[0];
    this.outernode.style[prefix + "height"] = size[1];
    return null;
};

$Widget.set_parent = function set_parent (parent, pos) {
    var child, children, err_2, i, new_parent, old_parent;
    pos = (pos === undefined) ? null: pos;
    old_parent = this.parent;
    new_parent = parent;
    if (((new_parent === old_parent) && (pos === null))) {
        return null;
    }
    if ((!((new_parent === null) || (new_parent instanceof Widget)))) {
        throw _pyfunc_op_error('ValueError', _pymeth_format.call("{}.parent must be a Widget or None", this.id));
    }
    this._mutate_parent(new_parent);
    if ((old_parent !== null)) {
        children = [];
        for (i = 0; i < old_parent.children.length; i += 1) {
            child = old_parent.children[i];
            if ((child !== this)) {
                children.push(child);
            }
        }
        if ((old_parent !== new_parent)) {
            old_parent._mutate_children(children);
        }
    }
    if ((new_parent !== null)) {
        if ((old_parent !== new_parent)) {
            children = [];
            for (i = 0; i < new_parent.children.length; i += 1) {
                child = new_parent.children[i];
                if ((child !== this)) {
                    children.push(child);
                }
            }
        }
        if ((pos === null)) {
            children.push(this);
        } else if ((pos >= 0)) {
            _pymeth_insert.call(children, pos, this);
        } else if ((pos < 0)) {
            _pymeth_append.call(children, null);
            _pymeth_insert.call(children, pos, this);
            _pymeth_pop.call(children, (-1));
        } else {
            children.push(this);
        }
        new_parent._mutate_children(children);
    }
    return null;
};
$Widget.set_parent.nobind = true;

$Widget._Widget__container_changed = function () {
    var el, events, id;
    events = Array.prototype.slice.call(arguments);
    id = this.container;
    _pymeth_remove.call(this.outernode.classList, "flx-main-widget");
    if (_pyfunc_truthy(this.parent)) {
        return null;
    }
    this._session.keep_checking_size_of(this, _pyfunc_bool(id));
    if (_pyfunc_truthy(id)) {
        if (_pyfunc_op_equals(id, "body")) {
            el = window.document.body;
            this.outernode.classList.add("flx-main-widget");
            window.document.title = _pyfunc_truthy(this.title) || "Flexx app";
        } else {
            el = window.document.getElementById(id);
            if ((el === null)) {
                window.setTimeout(this._Widget__container_changed, 100);
                return null;
            }
        }
        el.appendChild(this.outernode);
    }
    return null;
};
$Widget._Widget__container_changed.nobind = true;
$Widget._Widget__container_changed._mode = "normal"
$Widget._Widget__container_changed._connection_strings = ["container"]

$Widget._release_child = function (widget) {
    return null;
};

$Widget._registered_reactions_hook = function () {
    var event_type, event_types, stub1_seq, stub2_itr;
    event_types = (JsComponent.prototype._registered_reactions_hook).call(this);
    if ((this.tabindex < (-1))) {
        stub1_seq = event_types;
        if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
        for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
            event_type = stub1_seq[stub2_itr];
            if (_pyfunc_op_contains(event_type, ["key_down", "key_up", "key_press"])) {
                this.set_tabindex(-1);
            }
        }
    }
    return event_types;
};

$Widget._init_events = function () {
    var losecapture, mdown, mmove_inside, mmove_outside, mup_inside, mup_outside, stopcapture;
    this._addEventListener(this.node, "wheel", this.pointer_wheel, 0);
    this._addEventListener(this.node, "keydown", this.key_down, 0);
    this._addEventListener(this.node, "keyup", this.key_up, 0);
    this._addEventListener(this.node, "keypress", this.key_press, 0);
    this._addEventListener(this.node, "mousedown", this.pointer_down, 0);
    this._addEventListener(this.node, "click", this.pointer_click, 0);
    this._addEventListener(this.node, "dblclick", this.pointer_double_click, 0);
    this._addEventListener(this.node, "touchstart", this.pointer_down, 0);
    this._addEventListener(this.node, "touchmove", this.pointer_move, 0);
    this._addEventListener(this.node, "touchend", this.pointer_up, 0);
    this._addEventListener(this.node, "touchcancel", this.pointer_cancel, 0);
    this._capture_flag = 0;
    mdown = (function flx_mdown (e) {
        if (_pyfunc_op_equals(this.capture_mouse, 0)) {
            this._capture_flag = 1;
        } else {
            this._capture_flag = 2;
            window.document.addEventListener("mousemove", mmove_outside, true);
            window.document.addEventListener("mouseup", mup_outside, true);
        }
        return null;
    }).bind(this);

    mmove_inside = (function flx_mmove_inside (e) {
        if ((_pyfunc_op_equals(this._capture_flag, (-1)))) {
            this._capture_flag = 0;
        } else if (_pyfunc_op_equals(this._capture_flag, 1)) {
            this.pointer_move(e);
        } else if ((_pyfunc_op_equals(this._capture_flag, 0) && (this.capture_mouse > 1))) {
            this.pointer_move(e);
        }
        return null;
    }).bind(this);

    mup_inside = (function flx_mup_inside (e) {
        if (_pyfunc_op_equals(this._capture_flag, 1)) {
            this.pointer_up(e);
        }
        this._capture_flag = 0;
        return null;
    }).bind(this);

    mmove_outside = (function flx_mmove_outside (e) {
        if (_pyfunc_op_equals(this._capture_flag, 2)) {
            e = (_pyfunc_truthy(window.event))? (window.event) : (e);
            this.pointer_move(e);
        }
        return null;
    }).bind(this);

    mup_outside = (function flx_mup_outside (e) {
        if (_pyfunc_op_equals(this._capture_flag, 2)) {
            e = (_pyfunc_truthy(window.event))? (window.event) : (e);
            stopcapture();
            this.pointer_up(e);
        }
        return null;
    }).bind(this);

    stopcapture = (function flx_stopcapture () {
        if (_pyfunc_op_equals(this._capture_flag, 2)) {
            this._capture_flag = -1;
            window.document.removeEventListener("mousemove", mmove_outside, true);
            window.document.removeEventListener("mouseup", mup_outside, true);
        }
        return null;
    }).bind(this);

    losecapture = (function flx_losecapture (e) {
        stopcapture();
        this.pointer_cancel(e);
        return null;
    }).bind(this);

    this._addEventListener(this.node, "mousedown", mdown, true);
    this._addEventListener(this.node, "losecapture", losecapture);
    this._addEventListener(this.node, "mousemove", mmove_inside, false);
    this._addEventListener(this.node, "mouseup", mup_inside, false);
    return null;
};

$Widget.pointer_down = function (e) {
    return this._create_pointer_event(e);
};
$Widget.pointer_down.nobind = true;

$Widget.pointer_up = function (e) {
    return this._create_pointer_event(e);
};
$Widget.pointer_up.nobind = true;

$Widget.pointer_cancel = function (e) {
    return this._create_pointer_event(e);
};
$Widget.pointer_cancel.nobind = true;

$Widget.pointer_click = function (e) {
    return this._create_pointer_event(e);
};
$Widget.pointer_click.nobind = true;

$Widget.pointer_double_click = function (e) {
    return this._create_pointer_event(e);
};
$Widget.pointer_double_click.nobind = true;

$Widget.pointer_move = function (e) {
    var ev;
    ev = this._create_pointer_event(e);
    ev.button = 0;
    return ev;
};
$Widget.pointer_move.nobind = true;

$Widget.pointer_wheel = function (e) {
    var ev;
    ev = this._create_pointer_event(e);
    ev.button = 0;
    ev.hscroll = _pyfunc_op_mult(e.deltaX, ([1, 16, 600][e.deltaMode]));
    ev.vscroll = _pyfunc_op_mult(e.deltaY, ([1, 16, 600][e.deltaMode]));
    return ev;
};
$Widget.pointer_wheel.nobind = true;

$Widget._create_pointer_event = function (e) {
    var button, buttons, buttons_mask, i, modifiers, offset, page_pos, pos, rect, stub1_, stub1_i0, stub1_iter0, stub2_, stub2_i0, stub2_iter0, stub2_n, t, touches;
    rect = this.node.getBoundingClientRect();
    offset = [rect.left, rect.top];
    if (_pymeth_startswith.call(e.type, "touch")) {
        t = e.changedTouches[0];
        pos = [_pyfunc_float((t.clientX - offset[0])), _pyfunc_float((t.clientY - offset[1]))];
        page_pos = [t.pageX, t.pageY];
        button = 0;
        buttons = [];
        touches = ({});
        for (i = 0; i < e.changedTouches.length; i += 1) {
            t = e.changedTouches[i];
            if ((t.target !== e.target)) {
                continue;
            }
            touches[t.identifier] = [_pyfunc_float((t.clientX - offset[0])), _pyfunc_float((t.clientY - offset[1])), t.force];
        }
    } else {
        pos = [_pyfunc_float((e.clientX - offset[0])), _pyfunc_float((e.clientY - offset[1]))];
        page_pos = [e.pageX, e.pageY];
        if (_pyfunc_truthy(e.buttons)) {
            buttons_mask = e.buttons.toString(2).split('').reverse().join('');
        } else {
            buttons_mask = [e.button.toString(2)];
        }
        stub1_ = [];stub1_iter0 = _pyfunc_range(0, 5, 1);if ((typeof stub1_iter0 === "object") && (!Array.isArray(stub1_iter0))) {stub1_iter0 = Object.keys(stub1_iter0);}for (stub1_i0=0; stub1_i0<stub1_iter0.length; stub1_i0++) {i = stub1_iter0[stub1_i0];if (!(_pyfunc_op_equals(buttons_mask[i], "1"))) {continue;}{stub1_.push(i + 1);}}
        buttons = stub1_;
        button = ({0: 1, 1: 3, 2: 2, 3: 4, 4: 5})[e.button];
        touches = _pyfunc_create_dict((-1), ([pos[0], pos[1], 1]));
    }
    stub2_ = [];stub2_iter0 = ["Alt", "Shift", "Ctrl", "Meta"];if ((typeof stub2_iter0 === "object") && (!Array.isArray(stub2_iter0))) {stub2_iter0 = Object.keys(stub2_iter0);}for (stub2_i0=0; stub2_i0<stub2_iter0.length; stub2_i0++) {stub2_n = stub2_iter0[stub2_i0];if (!(e[stub2_n.toLowerCase() + "Key"])) {continue;}{stub2_.push(stub2_n);}}
    modifiers = stub2_;
    return {pos:pos, page_pos:page_pos, touches:touches, button:button, buttons:buttons, modifiers:modifiers};
};

$Widget.key_down = function (e) {
    return this._create_key_event(e);
};
$Widget.key_down.nobind = true;

$Widget.key_up = function (e) {
    return this._create_key_event(e);
};
$Widget.key_up.nobind = true;

$Widget.key_press = function (e) {
    return this._create_key_event(e);
};
$Widget.key_press.nobind = true;

$Widget._create_key_event = function (e) {
    var key, modifiers, stub1_, stub1_i0, stub1_iter0, stub1_n;
    stub1_ = [];stub1_iter0 = ["Alt", "Shift", "Ctrl", "Meta"];if ((typeof stub1_iter0 === "object") && (!Array.isArray(stub1_iter0))) {stub1_iter0 = Object.keys(stub1_iter0);}for (stub1_i0=0; stub1_i0<stub1_iter0.length; stub1_i0++) {stub1_n = stub1_iter0[stub1_i0];if (!(e[stub1_n.toLowerCase() + "Key"])) {continue;}{stub1_.push(stub1_n);}}
    modifiers = stub1_;
    key = e.key;
    if (_pyfunc_truthy(((!_pyfunc_truthy(key))) && _pyfunc_truthy(e.code))) {
        key = e.code;
        if (_pymeth_startswith.call(key, "Key")) {
            key = key.slice(3);
            if ((!_pyfunc_op_contains("Shift", modifiers))) {
                key = key.toLowerCase();
            }
        } else if (_pymeth_startswith.call(key, "Digit")) {
            key = key.slice(5);
        }
    }
    key = _pymeth_get.call(({Esc: "Escape", Del: "Delete"}), key, key);
    return {key:key, modifiers:modifiers};
};

$Widget._container_validate = function (value) { return event.StringProp.prototype._validate(value, "container", null); }

$Widget._mutate_container = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['container'], args));
};

$Widget.set_container = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('container', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_container.nobind = true;

$Widget._parent_validate = function (value) { return event.ComponentProp.prototype._validate(value, "parent", null); }

$Widget._mutate_parent = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['parent'], args));
};

$Widget._children_validate = function (value) { return app$LocalProperty.prototype._validate(value, "children", null); }

$Widget._mutate_children = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['children'], args));
};

$Widget._title_validate = function (value) { return event.StringProp.prototype._validate(value, "title", null); }

$Widget._mutate_title = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['title'], args));
};

$Widget.set_title = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('title', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_title.nobind = true;

$Widget._icon_validate = function (value) { return app$LocalProperty.prototype._validate(value, "icon", null); }

$Widget._mutate_icon = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['icon'], args));
};

$Widget._css_class_validate = function (value) { return event.StringProp.prototype._validate(value, "css_class", null); }

$Widget._mutate_css_class = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['css_class'], args));
};

$Widget.set_css_class = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('css_class', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_css_class.nobind = true;

$Widget._flex_validate = function (value) { return event.FloatPairProp.prototype._validate(value, "flex", null); }

$Widget._mutate_flex = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['flex'], args));
};

$Widget.set_flex = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('flex', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_flex.nobind = true;

$Widget._size_validate = function (value) { return event.FloatPairProp.prototype._validate(value, "size", null); }

$Widget._mutate_size = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['size'], args));
};

$Widget._minsize_validate = function (value) { return event.FloatPairProp.prototype._validate(value, "minsize", null); }

$Widget._mutate_minsize = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['minsize'], args));
};

$Widget.set_minsize = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('minsize', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_minsize.nobind = true;

$Widget._minsize_from_children_validate = function (value) { return event.BoolProp.prototype._validate(value, "minsize_from_children", null); }

$Widget._mutate_minsize_from_children = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['minsize_from_children'], args));
};

$Widget.set_minsize_from_children = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('minsize_from_children', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_minsize_from_children.nobind = true;

$Widget._maxsize_validate = function (value) { return event.FloatPairProp.prototype._validate(value, "maxsize", null); }

$Widget._mutate_maxsize = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['maxsize'], args));
};

$Widget.set_maxsize = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('maxsize', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_maxsize.nobind = true;

$Widget.__size_limits_validate = function (value) { return event.TupleProp.prototype._validate(value, "_size_limits", null); }

$Widget._mutate__size_limits = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['_size_limits'], args));
};

$Widget._set_size_limits = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('_size_limits', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget._set_size_limits.nobind = true;

$Widget._tabindex_validate = function (value) { return event.IntProp.prototype._validate(value, "tabindex", null); }

$Widget._mutate_tabindex = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['tabindex'], args));
};

$Widget.set_tabindex = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('tabindex', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_tabindex.nobind = true;

$Widget._capture_mouse_validate = function (value) { return event.IntProp.prototype._validate(value, "capture_mouse", null); }

$Widget._mutate_capture_mouse = function () {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this._mutate.apply(this, [].concat(['capture_mouse'], args));
};

$Widget.set_capture_mouse = function flx_setter () {
    var val;
    val = Array.prototype.slice.call(arguments);
    this._mutate('capture_mouse', ((val.length == 1))? (val[0]) : (val));
    return null;
};
$Widget.set_capture_mouse.nobind = true;



return {Widget: Widget, create_element: create_element};
});
