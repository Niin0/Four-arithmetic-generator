/* ======================= flexx.ui.layouts._form =======================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */



flexx.define("flexx.ui.layouts._form", ["pscript-std.js", "flexx.ui.layouts._layout", "flexx.ui._widget", "flexx.event.js"], function (_py, flexx$ui$layouts$_layout, flexx$ui$_widget, event) {

"use strict";

var _pyfunc_op_add = _py._pyfunc_op_add, _pyfunc_op_equals = _py._pyfunc_op_equals, _pyfunc_op_error = _py._pyfunc_op_error, _pyfunc_op_instantiate = _py._pyfunc_op_instantiate, _pyfunc_op_mult = _py._pyfunc_op_mult, _pyfunc_round = _py._pyfunc_round, _pyfunc_truthy = _py._pyfunc_truthy;

var _pymeth_append = _py._pymeth_append, _pymeth_repeat = _py._pymeth_repeat;

var create_element = flexx$ui$_widget.create_element;

var Layout = flexx$ui$layouts$_layout.Layout;





var BaseTableLayout = function () {
    _pyfunc_op_instantiate(this, arguments);
}
BaseTableLayout.prototype = Object.create(Layout.prototype);
BaseTableLayout.prototype._base_class = Layout.prototype;
BaseTableLayout.prototype.__name__ = "BaseTableLayout";
var $BaseTableLayout = BaseTableLayout.prototype;

$BaseTableLayout.__attributes__ = ["id", "root", "session", "uid"]
$BaseTableLayout.__properties__ = ["_size_limits", "capture_mouse", "children", "container", "css_class", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]
$BaseTableLayout.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_container", "set_css_class", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_title"]
$BaseTableLayout.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel"]
$BaseTableLayout.__reactions__ = ["_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_adapt_to_size_change", "_update_minmaxsize"]
$BaseTableLayout.__jsmodule__ = "flexx.ui.layouts._form"
$BaseTableLayout.__proxy_properties__ = ["_size_limits", "capture_mouse", "container", "css_class", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]

$BaseTableLayout._apply_table_layout = function () {
    var AUTOFLEX, col, cum_hflex, cum_vflex, hflexes, i, j, ncols, nrows, row, table, vflexes;
    table = this.node;
    AUTOFLEX = 729;
    nrows = table.children.length;
    ncols = 0;
    for (i = 0; i < table.children.length; i += 1) {
        row = table.children[i];
        ncols = Math.max(ncols, row.children.length);
    }
    if ((_pyfunc_op_equals(ncols, 0) && _pyfunc_op_equals(nrows, 0))) {
        return null;
    }
    vflexes = [];
    hflexes = [];
    for (i = 0; i < nrows; i += 1) {
        row = table.children[i];
        for (j = 0; j < ncols; j += 1) {
            col = row.children[j];
            if (((col === undefined) || (col.children.length == 0))) {
                continue;
            }
            vflexes[i] = Math.max((_pyfunc_truthy(vflexes[i]) || 0), (_pyfunc_truthy(col.children[0].vflex) || 0));
            hflexes[j] = Math.max((_pyfunc_truthy(hflexes[j]) || 0), (_pyfunc_truthy(col.children[0].hflex) || 0));
        }
    }
    cum_vflex = vflexes.reduce((function (pv, cv) {return _pyfunc_op_add(pv, cv);}).bind(this), 0);
    cum_hflex = hflexes.reduce((function (pv, cv) {return _pyfunc_op_add(pv, cv);}).bind(this), 0);
    if (_pyfunc_op_equals(cum_vflex, 0)) {
        for (i = 0; i < vflexes.length; i += 1) {
            vflexes[i] = AUTOFLEX;
        }
        cum_vflex = _pyfunc_op_mult(vflexes.length, AUTOFLEX);
    }
    if (_pyfunc_op_equals(cum_hflex, 0)) {
        for (i = 0; i < hflexes.length; i += 1) {
            hflexes[i] = AUTOFLEX;
        }
        cum_hflex = _pyfunc_op_mult(hflexes.length, AUTOFLEX);
    }
    for (i = 0; i < nrows; i += 1) {
        row = table.children[i];
        row.vflex = _pyfunc_truthy(vflexes[i]) || 0;
        for (j = 0; j < ncols; j += 1) {
            col = row.children[j];
            if (((col === undefined) || (col.children.length === 0))) {
                continue;
            }
            this._apply_cell_layout(row, col, vflexes[i], hflexes[j], cum_vflex, cum_hflex);
        }
    }
    return null;
};

$BaseTableLayout._adapt_to_size_change = function () {
    var cum_vflex, events, i, remainingHeight, remainingPercentage, row, table;
    events = Array.prototype.slice.call(arguments);
    table = this.node;
    if ((!_pyfunc_op_equals((events[events.length -1].new_value[1]), (events[0].old_value[1])))) {
        for (i = 0; i < table.children.length; i += 1) {
            row = table.children[i];
            if ((row.vflex > 0)) {
                row.style.height = "100%";
                break;
            }
        }
        remainingHeight = table.clientHeight;
        cum_vflex = 0;
        for (i = 0; i < table.children.length; i += 1) {
            row = table.children[i];
            cum_vflex = _pyfunc_op_add(cum_vflex, row.vflex);
            if ((_pyfunc_op_equals(row.vflex, 0) && (row.children.length > 0))) {
                remainingHeight -= row.children[0].clientHeight;
            }
        }
        remainingPercentage = _pyfunc_op_mult(100, remainingHeight) / table.clientHeight;
        for (i = 0; i < table.children.length; i += 1) {
            row = table.children[i];
            if ((row.vflex > 0)) {
                row.style.height = ((_pyfunc_round((_pyfunc_op_mult((row.vflex / cum_vflex), remainingPercentage)))) + 1) + "%";
            }
        }
    }
    return null;
};
$BaseTableLayout._adapt_to_size_change.nobind = true;
$BaseTableLayout._adapt_to_size_change._mode = "normal"
$BaseTableLayout._adapt_to_size_change._connection_strings = ["size"]

$BaseTableLayout._apply_cell_layout = function (row, col, vflex, hflex, cum_vflex, cum_hflex) {
    var err_1;
    throw _pyfunc_op_error('NotImplementedError', "");
    return null;
};



var FormLayout = function () {
    _pyfunc_op_instantiate(this, arguments);
}
FormLayout.prototype = Object.create(BaseTableLayout.prototype);
FormLayout.prototype._base_class = BaseTableLayout.prototype;
FormLayout.prototype.__name__ = "FormLayout";
var $FormLayout = FormLayout.prototype;

$FormLayout.__attributes__ = ["id", "root", "session", "uid"]
$FormLayout.__properties__ = ["_size_limits", "capture_mouse", "children", "container", "css_class", "flex", "icon", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]
$FormLayout.__actions__ = ["_set_size_limits", "apply_style", "check_real_size", "set_capture_mouse", "set_container", "set_css_class", "set_flex", "set_icon", "set_maxsize", "set_minsize", "set_minsize_from_children", "set_parent", "set_tabindex", "set_title"]
$FormLayout.__emitters__ = ["key_down", "key_press", "key_up", "pointer_cancel", "pointer_click", "pointer_double_click", "pointer_down", "pointer_move", "pointer_up", "pointer_wheel"]
$FormLayout.__reactions__ = ["_Widget__container_changed", "_Widget__css_class_changed", "_Widget__icon_changed", "_Widget__render", "_Widget__size_may_have_changed", "_Widget__title_changed", "_Widget__update_tabindex", "_adapt_to_size_change", "_update_minmaxsize"]
$FormLayout.__jsmodule__ = "flexx.ui.layouts._form"
$FormLayout.__proxy_properties__ = ["_size_limits", "capture_mouse", "container", "css_class", "flex", "maxsize", "minsize", "minsize_from_children", "parent", "size", "tabindex", "title"]

$FormLayout._create_dom = function () {
    return window.document.createElement("table");
};

$FormLayout._render_dom = function () {
    var row, rows, stub1_seq, stub2_itr, widget;
    rows = [];
    stub1_seq = this.children;
    if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
    for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
        widget = stub1_seq[stub2_itr];
        row = create_element("tr", ({}), create_element("td", ({class: "flx-title"}), widget.title), create_element("td", ({}), [widget.outernode]));
        widget.outernode.hflex = 1;
        widget.outernode.vflex = widget.flex[1];
        _pymeth_append.call(rows, row);
    }
    event.loop.call_soon(this._apply_table_layout);
    return rows;
};

$FormLayout._apply_cell_layout = function (row, col, vflex, hflex, cum_vflex, cum_hflex) {
    var AUTOFLEX, className;
    AUTOFLEX = 729;
    className = "";
    if ((_pyfunc_op_equals(vflex, AUTOFLEX) || _pyfunc_op_equals(vflex, 0))) {
        row.style.height = "auto";
        className += "";
    } else {
        row.style.height = (_pyfunc_op_mult(vflex, 100) / cum_vflex) + "%";
        className += "flx-vflex";
    }
    className += " ";
    if (_pyfunc_op_equals(hflex, 0)) {
        col.style.width = "auto";
        className += "";
    } else {
        col.style.width = "100%";
        className += "flx-hflex";
    }
    col.className = className;
    return null;
};

$FormLayout._query_min_max_size = function () {
    var child, extra_padding, extra_spacing, i, mima1, mima2, mima3, stub1_seq, stub2_itr;
    mima1 = [0, 1000000000.0, 0, 0];
    stub1_seq = this.children;
    if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
    for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
        child = stub1_seq[stub2_itr];
        mima2 = child._size_limits;
        mima1[0] = Math.max(mima1[0], mima2[0]);
        mima1[1] = Math.min(mima1[1], mima2[1]);
        mima1[2] = _pyfunc_op_add(mima1[2], mima2[2]);
        mima1[3] = _pyfunc_op_add(mima1[3], mima2[3]);
    }
    extra_padding = 2;
    extra_spacing = 2;
    for (i = 0; i < 4; i += 1) {
        mima1[i] = _pyfunc_op_add(mima1[i], extra_padding);
    }
    mima1[2] = _pyfunc_op_add(mima1[2], extra_spacing);
    mima1[3] = _pyfunc_op_add(mima1[3], extra_spacing);
    mima3 = (BaseTableLayout.prototype._query_min_max_size).call(this);
    return [Math.max(mima1[0], mima3[0]), Math.min(mima1[1], mima3[1]), Math.max(mima1[2], mima3[2]), Math.min(mima1[3], mima3[3])];
};



return {BaseTableLayout: BaseTableLayout, FormLayout: FormLayout};
});
