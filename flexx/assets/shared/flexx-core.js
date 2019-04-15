/* Bundle contents:
- asset flexx-loader.js
- asset bsdf.js
- asset bb64.js
- asset pscript-std.js
- asset flexx.event.js
- module flexx.app._clientcore
- module flexx.app._component2
*/


/* ========================== flexx-loader.js ===========================*/

/*Flexx module loader. Licensed by BSD-2-clause.*/

(function(){

if (typeof window === 'undefined' && typeof module == 'object') {
    throw Error('flexx.app does not run on NodeJS!');
}
if (typeof flexx == 'undefined') {
    window.flexx = {};
}

var modules = {};
function define (name, deps, factory) {
    if (arguments.length == 1) {
        factory = name;
        deps = [];
        name = null;
    }
    if (arguments.length == 2) {
        factory = deps;
        deps = name;
        name = null;
    }
    // Get dependencies - in current implementation, these must be loaded
    var dep_vals = [];
    for (var i=0; i<deps.length; i++) {
        if (modules[deps[i]] === undefined) {
            throw Error('Unknown dependency: ' + deps[i]);
        }
        dep_vals.push(modules[deps[i]]);
    }
    // Load the module and store it if is not anonymous
    var mod = factory.apply(null, dep_vals);
    if (name) {
        modules[name] = mod;
    }
}
define.amd = true;
define.flexx = true;

function require (name) {
    if (name.slice(0, 9) == 'phosphor/') {
        if (window.jupyter && window.jupyter.lab && window.jupyter.lab.loader) {
            var path = 'phosphor@*/' + name.slice(9);
            if (!path.slice(-3) == '.js') { path = path + '.js'; }
            return window.jupyter.lab.loader.require(path);
        } else {
            return window.require_phosphor(name);  // provided by our Phosphor-all
        }
    }
    if (modules[name] === undefined) {
        throw Error('Unknown module: ' + name);
    }
    return modules[name];
}

// Expose this
window.flexx.define = define;
window.flexx.require = require;
window.flexx._modules = modules;

})();


/* ============================== bsdf.js ===============================*/

flexx.define("bsdf", [], (function () {
"use strict";

var VERSION;
VERSION = [2, 2, 1];

// http://github.com/msgpack/msgpack-javascript/blob/master/msgpack.js#L181-L192
function utf8encode(mix) {
    // Mix is assumed to be a string. returns an Array of ints.
    var iz = mix.length;
    var rv = [];
    for (var i = 0; i < iz; ++i) {
        var c = mix.charCodeAt(i);
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv.push(c & 0x7f);
        } else if (c < 0x0800) {
            rv.push(((c >>>  6) & 0x1f) | 0xc0, (c & 0x3f) | 0x80);
        } else if (c < 0x10000) {
            rv.push(((c >>> 12) & 0x0f) | 0xe0,
                    ((c >>>  6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
        }
    }
    return rv;
}

// http://github.com/msgpack/msgpack-javascript/blob/master/msgpack.js#L365-L375
function utf8decode(buf) {
    // The buf is assumed to be an Array or Uint8Array. Returns a string.
    var iz = buf.length - 1;
    var ary = [];
    for (var i = -1; i < iz; ) {
        var c = buf[++i]; // lead byte
        ary.push(c < 0x80 ? c : // ASCII(0x00 ~ 0x7f)
                 c < 0xe0 ? ((c & 0x1f) <<  6 | (buf[++i] & 0x3f)) :
                            ((c & 0x0f) << 12 | (buf[++i] & 0x3f) << 6
                                              | (buf[++i] & 0x3f)));
    }
    return String.fromCharCode.apply(null, ary);
}


// ================== API

function bsdf_encode(d, extensions) {
    var s = new BsdfSerializer(extensions);
    return s.encode(d);
}

function bsdf_decode(buf, extensions) {
    var s = new BsdfSerializer(extensions);
    return s.decode(buf);
}

function BsdfSerializer(extensions) {
    /* A placeholder for a BSDF serializer with associated extensions.
     * Other formats also use it to associate options, but we don't have any.
     */
    this.extensions = [];
    if (extensions === undefined) { extensions = standard_extensions; }
    if (!Array.isArray(extensions)) { throw new TypeError("Extensions must be an array."); }
    for (var i=0; i<extensions.length; i++) {
        this.add_extension(extensions[i]);
    }
}

BsdfSerializer.prototype.add_extension = function (e) {
    // We use an array also as a dict for quick lookup
    if (this.extensions[e.name] !== undefined) {
        // Overwrite existing
        for (var i=0; i<this.extensions.length; i++) {
            if (this.extensions[i].name == e.name) { this.extensions[i] = e; break; }
        }
    } else {
        // Append
        this.extensions.push(e);
        this.extensions[e.name] = e;
    }
};

BsdfSerializer.prototype.remove_extension = function (e) {
    delete this.extensions[e.name];
    for (var i=0; i<this.extensions.length; i++) {
        if (this.extensions[i].name == name) { this.extensions.splice(i, 1); break; }
    }
};

BsdfSerializer.prototype.encode = function (d) {
    // Write head and version
    var f = ByteBuilder();
    f.push_char('B'); f.push_char('S'); f.push_char('D'); f.push_char('F');
    f.push_uint8(VERSION[0]); f.push_uint8(VERSION[1]);
    // Encode and return result
    this.encode_object(f, d);
    return f.get_result();
};

BsdfSerializer.prototype.decode = function (buf, extensions) {
    // Read and check head
    var f = BytesReader(buf);
    var head = f.get_char() + f.get_char() + f.get_char() + f.get_char();
    if (head != 'BSDF') {
        throw new Error("This does not look like BSDF encoded data: " + head);
    }
    // Read and check version
    var major_version = f.get_uint8();
    var minor_version = f.get_uint8();
    if (major_version != VERSION[0]) {
        throw new Error('Reading file with different major version ' + major_version + ' from the implementation ' + VERSION[0]);
    } else if (minor_version > VERSION[1]){
        console.warn('BSDF warning: reading file with higher minor version ' + minor_version + ' than the implementation ' + VERSION[1]);
    }
    // Decode
    return this.decode_object(f);
};


//---- encoder

function ByteBuilder() {
    // We use an arraybuffer for efficiency, but we don't know its final size.
    // Therefore we create a new one with increasing size when needed.
    var buffers = [];
    var min_buf_size = 1024;

    var buf8 = new Uint8Array(min_buf_size);
    var bufdv = new DataView(buf8.buffer);

    var pos = 0;
    var pos_offset = 0;
    var pos_max = buf8.byteLength;  // max valid value of pos

    // Create text encoder / decoder
    var text_encode, text_decode;
    if (typeof TextEncoder !== 'undefined') {
        var x = new TextEncoder('utf-8');
        text_encode = x.encode.bind(x);
    } else {
        // test this
        text_encode = utf8encode;
    }

    function get_result() {
        // Combine all sub buffers into one contiguous buffer
        var total = new Uint8Array(pos_offset + pos);
        var i = 0, j;
        for (var index=0; index<buffers.length; index+=2) {
            var sub = buffers[index];
            var n = buffers[index + 1];
            var offset = i;
            for(j=0; j<n; j++, i++){ total[i] = sub[j]; }
        }
        for(j=0; j<pos; j++, i++){ total[i] = buf8[j]; }  // also current buffer
        return total.buffer; // total is an exact fit on its buffer
    }
    function new_buffer(n) {
        // Establish size
        var new_size = Math.max(n + 64 , min_buf_size);
        // Store current buffer
        buffers.push(buf8);
        buffers.push(pos);
        // Create new
        buf8 = new Uint8Array(new_size);
        bufdv = new DataView(buf8.buffer);
        // Set positions
        pos_offset += pos;
        pos_max = buf8.byteLength;
        pos = 0;
    }
    function tell() {
        return pos_offset + pos;
    }
    function push_bytes(s) {  // we use Uint8Array internally for this
        var n = s.byteLength;
        if (pos + n > pos_max) { new_buffer(n); }
        for (var i=0; i<n; i++) { buf8[pos+i] = s[i]; }
        pos += n;
    }
    function push_char(s) {
        if (pos + 1 > pos_max) { new_buffer(1); }
        buf8[pos] = s.charCodeAt();
        pos += 1;
    }
    function push_str(s) {
        var bb = text_encode(s);
        push_size(bb.length);
        if (pos + bb.length > pos_max) { new_buffer(bb.length); }
        for (var i=0; i<bb.length; i++) { buf8[pos + i] = bb[i]; }
        pos += bb.length;
    }
    function push_size(s, big) {
        if (s <= 250 && typeof big == 'undefined') {
            if (pos + 1 > pos_max) { new_buffer(1); }
            buf8[pos] = s;
            pos += 1;
        } else {
            if (pos + 9 > pos_max) { new_buffer(9); }
            buf8[pos] = 253;
            bufdv.setUint32(pos+1, (s % 4294967296), true); // uint64
            bufdv.setUint32(pos+5, (s / 4294967296) & 4294967295, true);
            pos += 9;
        }
    }
    function push_uint8(s) {
        if (pos + 1 > pos_max) { new_buffer(1); }
        buf8[pos] = s;
        pos += 1;
    }
    function push_int16(s) {
        if (pos + 2 > pos_max) { new_buffer(2); }
        bufdv.setInt16(pos, s, true);
        pos += 2;
    }
    function push_int64(s) {
        if (pos + 8 > pos_max) { new_buffer(8); }
        var j, a;
        if (s < 0) { // perform two's complement encoding
            for (j=0, a=s+1; j<8; j++, a/=256) { buf8[pos+j] = ((-(a % 256 )) & 255) ^ 255; }
        } else {
            for (j=0, a=s; j<8; j++, a/=256) { buf8[pos+j] = ((a % 256 ) & 255); }
        }
        pos += 8;
    }
    function push_float64(s) {
        // todo: we could push 32bit floats via "f"
        if (pos + 8 > pos_max) { new_buffer(8); }
        bufdv.setFloat64(pos, s, true);
        pos += 8;
    }
    return {get_result: get_result, tell: tell, push_bytes: push_bytes,
            push_char: push_char, push_str: push_str, push_size: push_size,
            push_uint8: push_uint8, push_int16: push_int16, push_int64: push_int64,
            push_float64: push_float64};
}

function encode_type_id(f, c, extension_id) {
    if (typeof extension_id == 'undefined') {
        f.push_char(c);
    } else {
        f.push_char(c.toUpperCase());
        f.push_str(extension_id);
    }
}

BsdfSerializer.prototype.encode_object = function (f, value, extension_id) {
    var iext, ext;
    
    // We prefer to fail on undefined, instead of silently converting to null like JSON
    // if (typeof value == 'undefined') { encode_type_id(f, 'v', extension_id); }
    if (typeof value == 'undefined') { throw new TypeError("BSDF cannot encode undefined, use null instead."); }
    else if (value === null) { encode_type_id(f, 'v', extension_id); }
    else if (value === false) { encode_type_id(f, 'n', extension_id); }
    else if (value === true) { encode_type_id(f, 'y', extension_id); }
    else if (typeof value == 'number') {
        if ((value ^ 0) == value) { // no Number.isInteger on IE
            if (value >= -32768 && value <= 32767) {
                encode_type_id(f, 'h', extension_id);
                f.push_int16(value);
            } else {
                encode_type_id(f, 'i', extension_id);
                f.push_int64(value);
            }
        } else {
            encode_type_id(f, 'd', extension_id);
            f.push_float64(value);
        }
    } else if (typeof value == 'string') {
        encode_type_id(f, 's', extension_id);
        f.push_str(value);
    } else if (typeof value == 'object') {
        if (Array.isArray(value)) {  // heterogeneous list
            encode_type_id(f, 'l', extension_id);
            var n = value.length;
            f.push_size(n);
            for (var i=0; i<n; i++) {
                this.encode_object(f, value[i]);
            }
        } else if (value.constructor === Object) {  // mapping / dict
            encode_type_id(f, 'm', extension_id);
            var nm = Object.keys(value).length;
            f.push_size(nm);
            for (var key in value) {
                f.push_str(key);
                this.encode_object(f, value[key]);
            }
        } else if (value instanceof ArrayBuffer || value instanceof DataView) {  // bytes
            if (value instanceof ArrayBuffer) { value = new DataView(value); }
            encode_type_id(f, 'b', extension_id);
            var compression = 0;
            var compressed = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);  // map to uint8
            var data_size = value.byteLength;
            var used_size = data_size;
            var extra_size = 0;
            var allocated_size = used_size + extra_size;
            // Write sizes - write at least in a size that allows resizing
            if (allocated_size > 250) {  // && compression == 0
                f.push_size(allocated_size, true);
                f.push_size(used_size, true);
                f.push_size(data_size, true);
            } else {
                f.push_size(allocated_size);
                f.push_size(used_size);
                f.push_size(data_size);
            }
            // Compression and checksum
            f.push_uint8(0);
            f.push_uint8(0);  // no checksum
            // Byte alignment
            if (compression == 0) {
                var alignment = 8 - (f.tell() + 1) % 8;  // +1 for the byte to write
                f.push_uint8(alignment);
                for (var j=0; j<alignment; j++) { f.push_uint8(0); }
            } else {
                f.push_uint8(0);  // zero alignment
            }
            // The actual data and extra space
            f.push_bytes(compressed);
            f.push_bytes(new Uint8Array(allocated_size - used_size));
        } else {
            // Try extensions (for objects)
            for (iext=0; iext<this.extensions.length; iext++) {
                ext = this.extensions[iext];
                if (ext.match(this, value)) {
                    this.encode_object(f, ext.encode(this, value), ext.name);
                    return;
                }
            }
            var cls = Object.getPrototypeOf(value);
            var cname = cls.__name__ || cls.constructor.name;  // __name__ is a PyScript thing
            throw new TypeError("cannot encode object of type " + cname);
        }
    } else {
        if (typeof extension_id != 'undefined') {
            throw new Error('Extension ' + extension_id + ' wronfully encodes object to another ' +
                        'extension object (though it may encode to a list/dict ' +
                        'that contains other extension objects).');
        }
        // Try extensions (for other types)
        for (iext=0; iext<this.extensions.length; iext++) {
            ext = this.extensions[iext];
            if (ext.match(this, value)) {
                this.encode_object(f, ext.encode(this, value), ext.name);
                return;
            }
        }
        throw new Error("cannot encode type " + typeof(value));
    }
};

//---- decoder

function BytesReader(buf) {

    // Buffer can be ArrayBuffer, DataView or Uint8Array, or Nodejs Buffer, we map to DataView
    var bufdv;

    if (typeof buf.byteLength == 'undefined') {
        throw new Error("BSDF decorer needs something that looks like bytes");
    }
    if (typeof buf.byteOffset == 'undefined') {
        bufdv = new DataView(buf);  // buf was probably an ArrayBuffer
    } else {
        bufdv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);  // remap to something we know
    }

    var startpos = bufdv.byteOffset;
    var pos = 0;
    var buf8 = new Uint8Array(bufdv.buffer, bufdv.byteOffset, bufdv.byteLength);

    // Create text encoder / decoder
    var text_encode, text_decode;
    if (typeof TextDecoder !== 'undefined') {
        var x = new TextDecoder('utf-8');
        text_decode = x.decode.bind(x);
    } else {
        // test this
        text_decode = utf8decode;
    }

    function tell() {
        return pos;
    }
    function get_char() {
        return String.fromCharCode(buf8[pos++]);
    }
    function get_size() {
        var s = buf8[pos++];
        if (s >= 253) {
            if (s == 253) {
                s = bufdv.getUint32(pos, true) + bufdv.getUint32(pos+4, true) * 4294967296;
            } else if (s == 254) { // closed stream
                s = bufdv.getUint32(pos, true) + bufdv.getUint32(pos+4, true) * 4294967296;
            } else if (s == 255) {  // unclosed stream
                s = -1;
            } else {
                throw new Error("Invalid size");
            }
            pos += 8;
        }
        return s;
    }
    function get_bytes(n) {  // we use Uint8Array internally for this
        var s = new Uint8Array(buf8.buffer, buf8.byteOffset + pos, n);
        pos += n;
        return s;
    }
    function get_str() {
        var n = get_size();
        var bb = new Uint8Array(buf8.buffer, buf8.byteOffset + pos, n);
        pos += n;
        return text_decode(bb);
    }
    function get_uint8() {
        return buf8[pos++];
    }
    function get_int16() {
        var s = bufdv.getInt16(pos, true);
        pos += 2;
        return s;
    }
    function get_int64() {
        var isneg = (buf8[pos+7] & 0x80) > 0;
        var s, j, m;
        if (isneg) {
            s = -1;
            for (j=0, m=1; j<8; j++, m*=256) { s -= (buf8[pos+j] ^ 0xff) * m; }
        } else {
            s = 0;
            for (j=0, m=1; j<8; j++, m*=256) { s += buf8[pos+j] * m; }
        }
        pos += 8;
        return s;
    }
    function get_float32() {
        var s = bufdv.getFloat32(pos, true);
        pos += 4;
        return s;
    } function get_float64() {
        var s = bufdv.getFloat64(pos, true);
        pos += 8;
        return s;
    }

    return {tell: tell, get_size:get_size, get_bytes: get_bytes,
            get_uint8: get_uint8, get_int16: get_int16, get_int64: get_int64,
            get_float32: get_float32, get_float64: get_float64, get_char: get_char, get_str: get_str};

}

BsdfSerializer.prototype.decode_object = function (f) {

    var char = f.get_char();
    var c = char.toLowerCase();
    var value;
    var extension_id = null;

    if (char == '\x00') {  // because String.fromCharCode(undefined) produces ASCII 0.
        throw new EOFError('End of BSDF data reached.');
    }

    // Conversion (uppercase value identifiers signify converted values)
    if (char != c) {
        extension_id = f.get_str();
    }

    if (c == 'v') {
        value = null;
    } else if (c == 'n') {
        value = false;
    } else if (c == 'y') {
        value = true;
    } else if (c == 'h') {
        value = f.get_int16();
    } else if (c == 'i') {
        value = f.get_int64();
    } else if (c == 'f') {
        value = f.get_float32();
    } else if (c == 'd') {
        value = f.get_float64();
    } else if (c == 's') {
        value = f.get_str();
    } else if (c == 'l') {
        var n = f.get_size();
        if (n < 0) {
            // Streaming
            value = [];
            try {
                while (true) { value.push(this.decode_object(f)); }
            } catch(err) {
                if (err instanceof EOFError) { /* ok */ } else { throw err; }
            }
        } else {
            // Normal
            value = new Array(n);
            for (var i=0; i<n; i++) {
                value[i] = this.decode_object(f);
            }
        }
    } else if (c == 'm') {
        var nm = f.get_size();
        value = {};
        for (var j=0; j<nm; j++) {
            var key = f.get_str();
            value[key] = this.decode_object(f);
        }
    } else if (c == 'b') {
        // Get sizes
        var allocated_size = f.get_size();
        var used_size = f.get_size();
        var data_size = f.get_size();
        // Compression and checksum
        var compression = f.get_uint8();
        var has_checksum = f.get_uint8();
        if (has_checksum) {
            var checksum = f.get_bytes(16);
        }
        // Skip alignment
        var alignment = f.get_uint8();
        f.get_bytes(alignment);
        // Get data (as ArrayBuffer)
        var compressed = f.get_bytes(used_size);  // uint8
        f.get_bytes(allocated_size - used_size);  // skip extra space
        if (compression == 0) {
            value = new DataView(compressed.buffer, compressed.byteOffset, compressed.byteLength);
        } else {
            throw new Error("JS implementation of BSDF does not support compression (" + compression + ')');
        }
    } else {
        throw new Error("Invalid value specifier at pos " + f.tell() + ": " + JSON.stringify(char));
    }

    // Convert using an extension?
    if (extension_id !== null) {
        var ext = this.extensions[extension_id];
        if (ext) {
            value = ext.decode(this, value);
        } else {
            console.warn('BSDF warning: no known extension for "' + extension_id + '", value passes in raw form.');
        }
    }
    return value;
};


// To be able to support complex numbers
function Complex(real, imag) {
    this.real = real;
    this.imag = imag;
}

function EOFError(msg) {
    this.name = 'EOF';
    this.message = msg;
}


// ================== Standard extensions

var rootns;
if (typeof window == 'undefined') { rootns = global; } else { rootns = window; }

var complex_extension = {
    name: 'c',
    match: function(s, v) { return v instanceof Complex; },
    encode: function(s, v) { return [v.real, v.imag]; },
    decode: function(s, v) { return new Complex(v[0], v[1]); }
};

var ndarray_extension = {
    name: 'ndarray',
    match: function(s, v) {
        return v.BYTES_PER_ELEMENT !== undefined && v.constructor.name.slice(-5) == 'Array';
    },
    encode: function(s, v) {
        return {shape: v.shape || [v.length],
                dtype: v.constructor.name.slice(0, -5).toLowerCase(),
                data: new DataView(v.buffer, v.byteOffset, v.byteLength)};
    },
    decode: function(s, v) {
        var cls = rootns[v.dtype[0].toUpperCase() + v.dtype.slice(1) + 'Array'];
        if (typeof cls == 'undefined') {
            throw new TypeError("Cannot create typed array with dtype: " + v.dtype);
        }
        var value = new cls(v.data.buffer, v.data.byteOffset, v.data.byteLength / cls.BYTES_PER_ELEMENT);
        value.shape = v.shape;
        return value;
    }
};

var standard_extensions = [complex_extension, ndarray_extension];

// ================== the UMD module suffix
return {encode: bsdf_encode, decode: bsdf_decode, BsdfSerializer: BsdfSerializer, standard_extensions: standard_extensions};
}));


/* ============================== bb64.js ===============================*/

flexx.define("bb64", [], (function () {
"use strict";

function base64encode(b, last_two) {
    "use strict";
    console.assert(b.BYTES_PER_ELEMENT == 1);
    // Most Base64 encoders use +/ for the last two characters, but not all
    if (last_two === undefined) last_two = '+/';
    // Init charcodes array
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" + last_two;
    var charcodes = new Uint8Array(64);
    for (var k=0; k<64; k++) charcodes[k] = chars.charCodeAt(k);
    // Init result string, as a typed array of ASCII values
    var s = new Uint8Array(Math.ceil(b.length / 3) * 4);
    // Init
    var b1, b2, b3;
    var i = 0;  // The byte index
    var j = 0;  // The string index
    // Iterate over bytes
    while (i < b.length) {
        // Sample bytes, out of bounds are mapped to zero
        b1 = b[i+0] || 0; b2 = b[i+1] || 0; b3 = b[i+2] || 0;
        i += 3;
        // Encode and assign
        s[j+0] = charcodes[( b1 >> 2 ) & 0x3F];
        s[j+1] = charcodes[( ( b1 & 0x3 ) << 4 ) | ( ( b2 >> 4 ) & 0xF )];
        s[j+2] = charcodes[( ( b2 & 0xF ) << 2 ) | ( ( b3 >> 6 ) & 0x3 )];
        s[j+3] = charcodes[b3 & 0x3F];
        j += 4;
    }
    // Replace stub bytes with the padding char
    for (var k=0; k<(i-b.length); k++) s[s.length-k-1] = '61';
    // Convert to string
    return String.fromCharCode.apply(null, s);
}

function base64decode(s, last_two) {
    "use strict";
    // Most Base64 encoders use +/ for the last two characters, but not all
    if (last_two === undefined) last_two = '+/';
    var charcode62 = last_two.charCodeAt(0), charcode63 = last_two.charCodeAt(1);
    // Allocate byte array, with a length as large as it can possibly become
    var b = new Uint8Array(Math.floor((s.length / 4) * 3));
    // Init
    var i = 0; // The number of bytes (and byte index)
    var j = 0; // The index into the string
    var c, cc = new Array(4);  // to store character codes (ints)
    // Iterate while there are chars left
    while (j < s.length) {
        // Collect 4 (or less) characters
        var charcount = 0;
        while (charcount < 4 && j < s.length) {
            c = s.charCodeAt(j++);
            if (c >= 65 && c <=90) c -= 65;  // A-Z: 0-25
            else if (c >=97 && c<=122) c -= 71;  // a-z: 26-51
            else if (c >=48 && c<=57) c += 4;  // 0-9: 52-61
            else if (c == charcode62) c = 62;
            else if (c == charcode63) c = 63;
            else continue;  // skip other chars, like newline, padding, or other
            cc[charcount] = c;
            charcount += 1;
        }
        // At the end, we may not have enough chars, zero these values
        if (charcount != 4) for (var k=charcount; k<4; k++) cc[k] = 0;
        // Calculate the 3 byte values
        b[i+0] = (cc[0] << 2) | (cc[1] >> 4);
        b[i+1] = ((cc[1] & 15) << 4) | (cc[2] >> 2);
        b[i+2] = ((cc[2] & 3) << 6) | cc[3];
        // Next i (4 chars -> 3 bytes, 3 chars -> 2 bytes, 2 chars -> 1 byte)
        i += charcount - 1;
    }
    // Return view that has the correct length, but on same data buffer.
    // The unused memory should be marginal, so making a copy not worth it.
    return new Uint8Array(b.buffer, 0, i);
}

return {encode: base64encode, decode: base64decode};
}));


/* =========================== pscript-std.js ===========================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */

flexx.define("pscript-std.js", [], function () {

"use strict";

var _pyfunc_abs = Math.abs;
var _pyfunc_all = function (x) { // nargs: 1
    for (var i=0; i<x.length; i++) {
        if (!_pyfunc_truthy(x[i])){return false;}
    } return true;
};
var _pyfunc_any = function (x) { // nargs: 1
    for (var i=0; i<x.length; i++) {
        if (_pyfunc_truthy(x[i])){return true;}
    } return false;
};
var _pyfunc_bool = function (x) { // nargs: 1
    return Boolean(_pyfunc_truthy(x));
};
var _pyfunc_create_dict = function () {
    var d = {};
    for (var i=0; i<arguments.length; i+=2) { d[arguments[i]] = arguments[i+1]; }
    return d;
};
var _pyfunc_delattr = function (ob, name) {  // nargs: 2
    delete ob[name];
};
var _pyfunc_dict = function (x) {
    var t, i, keys, r={};
    if (Array.isArray(x)) {
        for (i=0; i<x.length; i++) {
            t=x[i]; r[t[0]] = t[1];
        }
    } else {
        keys = Object.keys(x);
        for (i=0; i<keys.length; i++) {
            t=keys[i]; r[t] = x[t];
        }
    }
    return r;
};
var _pyfunc_divmod = function (x, y) { // nargs: 2
    var m = x % y; return [(x-m)/y, m];
};
var _pyfunc_enumerate = function (iter) { // nargs: 1
    var i, res=[];
    if ((typeof iter==="object") && (!Array.isArray(iter))) {iter = Object.keys(iter);}
    for (i=0; i<iter.length; i++) {res.push([i, iter[i]]);}
    return res;
};
var _pyfunc_filter = function (func, iter) { // nargs: 2
    if (typeof func === "undefined" || func === null) {func = function(x) {return x;}}
    if ((typeof iter==="object") && (!Array.isArray(iter))) {iter = Object.keys(iter);}
    return iter.filter(func);
};
var _pyfunc_float = Number;
var _pyfunc_format = function (v, fmt) {  // nargs: 2
    fmt = fmt.toLowerCase();
    var s = String(v);
    if (fmt.indexOf('!r') >= 0) {
        try { s = JSON.stringify(v); } catch (e) { s = undefined; }
        if (typeof s === 'undefined') { s = v._IS_COMPONENT ? v.id : String(v); }
    }
    var fmt_type = '';
    if (fmt.slice(-1) == 'i' || fmt.slice(-1) == 'f' ||
        fmt.slice(-1) == 'e' || fmt.slice(-1) == 'g') {
            fmt_type = fmt[fmt.length-1]; fmt = fmt.slice(0, fmt.length-1);
    }
    var i0 = fmt.indexOf(':');
    var i1 = fmt.indexOf('.');
    var spec1 = '', spec2 = '';  // before and after dot
    if (i0 >= 0) {
        if (i1 > i0) { spec1 = fmt.slice(i0+1, i1); spec2 = fmt.slice(i1+1); }
        else { spec1 = fmt.slice(i0+1); }
    }
    // Format numbers
    if (fmt_type == '') {
    } else if (fmt_type == 'i') { // integer formatting, for %i
        s = parseInt(v).toFixed(0);
    } else if (fmt_type == 'f') {  // float formatting
        v = parseFloat(v);
        var decimals = spec2 ? Number(spec2) : 6;
        s = v.toFixed(decimals);
    } else if (fmt_type == 'e') {  // exp formatting
        v = parseFloat(v);
        var precision = (spec2 ? Number(spec2) : 6) || 1;
        s = v.toExponential(precision);
    } else if (fmt_type == 'g') {  // "general" formatting
        v = parseFloat(v);
        var precision = (spec2 ? Number(spec2) : 6) || 1;
        // Exp or decimal?
        s = v.toExponential(precision-1);
        var s1 = s.slice(0, s.indexOf('e')), s2 = s.slice(s.indexOf('e'));
        if (s2.length == 3) { s2 = 'e' + s2[1] + '0' + s2[2]; }
        var exp = Number(s2.slice(1));
        if (exp >= -4 && exp < precision) { s1=v.toPrecision(precision); s2=''; }
        // Skip trailing zeros and dot
        var j = s1.length-1;
        while (j>0 && s1[j] == '0') { j-=1; }
        s1 = s1.slice(0, j+1);
        if (s1.slice(-1) == '.') { s1 = s1.slice(0, s1.length-1); }
        s = s1 + s2;
    }
    // prefix/padding
    var prefix = '';
    if (spec1) {
        if (spec1[0] == '+' && v > 0) { prefix = '+'; spec1 = spec1.slice(1); }
        else if (spec1[0] == ' ' && v > 0) { prefix = ' '; spec1 = spec1.slice(1); }
    }
    if (spec1 && spec1[0] == '0') {
        var padding = Number(spec1.slice(1)) - (s.length + prefix.length);
        s = '0'.repeat(Math.max(0, padding)) + s;
    }
    return prefix + s;
};
var _pyfunc_getattr = function (ob, name, deflt) { // nargs: 2 3
    var has_attr = ob !== undefined && ob !== null && ob[name] !== undefined;
    if (has_attr) {return ob[name];}
    else if (arguments.length == 3) {return deflt;}
    else {var e = Error(name); e.name='AttributeError'; throw e;}
};
var _pyfunc_hasattr = function (ob, name) { // nargs: 2
    return (ob !== undefined) && (ob !== null) && (ob[name] !== undefined);
};
var _pyfunc_int = function (x, base) { // nargs: 1 2
    if(base !== undefined) return parseInt(x, base);
    return x<0 ? Math.ceil(x): Math.floor(x);
};
var _pyfunc_list = function (x) {
    var r=[];
    if (typeof x==="object" && !Array.isArray(x)) {x = Object.keys(x)}
    for (var i=0; i<x.length; i++) {
        r.push(x[i]);
    }
    return r;
};
var _pyfunc_map = function (func, iter) { // nargs: 2
    if (typeof func === "undefined" || func === null) {func = function(x) {return x;}}
    if ((typeof iter==="object") && (!Array.isArray(iter))) {iter = Object.keys(iter);}
    return iter.map(func);
};
var _pyfunc_merge_dicts = function () {
    var res = {};
    for (var i=0; i<arguments.length; i++) {
        var d = arguments[i];
        var key, keys = Object.keys(d);
        for (var j=0; j<keys.length; j++) { key = keys[j]; res[key] = d[key]; }
    }
    return res;
};
var _pyfunc_op_add = function (a, b) { // nargs: 2
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.concat(b);
    } return a + b;
};
var _pyfunc_op_contains = function op_contains (a, b) { // nargs: 2
    if (b == null) {
    } else if (Array.isArray(b)) {
        for (var i=0; i<b.length; i++) {if (_pyfunc_op_equals(a, b[i]))
                                           return true;}
        return false;
    } else if (b.constructor === Object) {
        for (var k in b) {if (a == k) return true;}
        return false;
    } else if (b.constructor == String) {
        return b.indexOf(a) >= 0;
    } var e = Error('Not a container: ' + b); e.name='TypeError'; throw e;
};
var _pyfunc_op_equals = function op_equals (a, b) { // nargs: 2
    var a_type = typeof a;
    // If a (or b actually) is of type string, number or boolean, we don't need
    // to do all the other type checking below.
    if (a_type === "string" || a_type === "boolean" || a_type === "number") {
        return a == b;
    }

    if (a == null || b == null) {
    } else if (Array.isArray(a) && Array.isArray(b)) {
        var i = 0, iseq = a.length == b.length;
        while (iseq && i < a.length) {iseq = op_equals(a[i], b[i]); i+=1;}
        return iseq;
    } else if (a.constructor === Object && b.constructor === Object) {
        var akeys = Object.keys(a), bkeys = Object.keys(b);
        akeys.sort(); bkeys.sort();
        var i=0, k, iseq = op_equals(akeys, bkeys);
        while (iseq && i < akeys.length)
            {k=akeys[i]; iseq = op_equals(a[k], b[k]); i+=1;}
        return iseq;
    } return a == b;
};
var _pyfunc_op_error = function (etype, msg) { // nargs: 2
    var e = new Error(etype + ': ' + msg);
    e.name = etype
    return e;
};
var _pyfunc_op_instantiate = function (ob, args) { // nargs: 2
    if ((typeof ob === "undefined") ||
            (typeof window !== "undefined" && window === ob) ||
            (typeof global !== "undefined" && global === ob))
            {throw "Class constructor is called as a function.";}
    for (var name in ob) {
        if (Object[name] === undefined &&
            typeof ob[name] === 'function' && !ob[name].nobind) {
            ob[name] = ob[name].bind(ob);
            ob[name].__name__ = name;
        }
    }
    if (ob.__init__) {
        ob.__init__.apply(ob, args);
    }
};
var _pyfunc_op_mult = function (a, b) { // nargs: 2
    if ((typeof a === 'number') + (typeof b === 'number') === 1) {
        if (a.constructor === String) return _pymeth_repeat.call(a, b);
        if (b.constructor === String) return _pymeth_repeat.call(b, a);
        if (Array.isArray(b)) {var t=a; a=b; b=t;}
        if (Array.isArray(a)) {
            var res = []; for (var i=0; i<b; i++) res = res.concat(a);
            return res;
        }
    } return a * b;
};
var _pyfunc_op_parse_kwargs = function (arg_names, arg_values, kwargs, strict) { // nargs: 3
    for (var i=0; i<arg_values.length; i++) {
        var name = arg_names[i];
        if (kwargs[name] !== undefined) {
            arg_values[i] = kwargs[name];
            delete kwargs[name];
        }
    }
    if (strict && Object.keys(kwargs).length > 0) {
        throw _pyfunc_op_error('TypeError',
            'Function ' + strict + ' does not accept **kwargs.');
    }
    return kwargs;
};
var _pyfunc_perf_counter = function() { // nargs: 0
    if (typeof(process) === "undefined"){return performance.now()*1e-3;}
    else {var t = process.hrtime(); return t[0] + t[1]*1e-9;}
};
var _pyfunc_pow = Math.pow;
var _pyfunc_range = function (start, end, step) {
    var i, res = [];
    var val = start;
    var n = (end - start) / step;
    for (i=0; i<n; i++) {
        res.push(val);
        val += step;
    }
    return res;
};
var _pyfunc_repr = function (x) { // nargs: 1
    var res; try { res = JSON.stringify(x); } catch (e) { res = undefined; }
    if (typeof res === 'undefined') { res = x._IS_COMPONENT ? x.id : String(x); }
    return res;
};
var _pyfunc_reversed = function (iter) { // nargs: 1
    if ((typeof iter==="object") && (!Array.isArray(iter))) {iter = Object.keys(iter);}
    return iter.slice().reverse();
};
var _pyfunc_round = Math.round;
var _pyfunc_setattr = function (ob, name, value) {  // nargs: 3
    ob[name] = value;
};
var _pyfunc_sorted = function (iter, key, reverse) { // nargs: 1 2 3
    if ((typeof iter==="object") && (!Array.isArray(iter))) {iter = Object.keys(iter);}
    var comp = function (a, b) {a = key(a); b = key(b);
        if (a<b) {return -1;} if (a>b) {return 1;} return 0;};
    comp = Boolean(key) ? comp : undefined;
    iter = iter.slice().sort(comp);
    if (reverse) iter.reverse();
    return iter;
};
var _pyfunc_str = String;
var _pyfunc_sum = function (x) {  // nargs: 1
    return x.reduce(function(a, b) {return a + b;});
};
var _pyfunc_time = function () {return Date.now() / 1000;};
var _pyfunc_truthy = function (v) {
    if (v === null || typeof v !== "object") {return v;}
    else if (v.length !== undefined) {return v.length ? v : false;}
    else if (v.byteLength !== undefined) {return v.byteLength ? v : false;}
    else if (v.constructor !== Object) {return true;}
    else {return Object.getOwnPropertyNames(v).length ? v : false;}
};
var _pyfunc_zip = function () { // nargs: 2 3 4 5 6 7 8 9
    var i, j, tup, arg, args = [], res = [], len = 1e20;
    for (i=0; i<arguments.length; i++) {
        arg = arguments[i];
        if ((typeof arg==="object") && (!Array.isArray(arg))) {arg = Object.keys(arg);}
        args.push(arg);
        len = Math.min(len, arg.length);
    }
    for (j=0; j<len; j++) {
        tup = []
        for (i=0; i<args.length; i++) {tup.push(args[i][j]);}
        res.push(tup);
    }
    return res;
};
var _pymeth_append = function (x) { // nargs: 1
    if (!Array.isArray(this)) return this.append.apply(this, arguments);
    this.push(x);
};
var _pymeth_capitalize = function () { // nargs: 0
    if (this.constructor !== String) return this.capitalize.apply(this, arguments);
    return this.slice(0, 1).toUpperCase() + this.slice(1).toLowerCase();
};
var _pymeth_casefold = function () { // nargs: 0
    if (this.constructor !== String) return this.casefold.apply(this, arguments);
    return this.toLowerCase();
};
var _pymeth_center = function (w, fill) { // nargs: 1 2
    if (this.constructor !== String) return this.center.apply(this, arguments);
    fill = (fill === undefined) ? ' ' : fill;
    var tofill = Math.max(0, w - this.length);
    var left = Math.ceil(tofill / 2);
    var right = tofill - left;
    return _pymeth_repeat.call(fill, left) + this + _pymeth_repeat.call(fill, right);
};
var _pymeth_clear = function () { // nargs: 0
    if (Array.isArray(this)) {
        this.splice(0, this.length);
    } else if (this.constructor === Object) {
        var keys = Object.keys(this);
        for (var i=0; i<keys.length; i++) delete this[keys[i]];
    } else return this.clear.apply(this, arguments);
};
var _pymeth_copy = function () { // nargs: 0
    if (Array.isArray(this)) {
        return this.slice(0);
    } else if (this.constructor === Object) {
        var key, keys = Object.keys(this), res = {};
        for (var i=0; i<keys.length; i++) {key = keys[i]; res[key] = this[key];}
        return res;
    } else return this.copy.apply(this, arguments);
};
var _pymeth_count = function (x, start, stop) { // nargs: 1 2 3
    start = (start === undefined) ? 0 : start;
    stop = (stop === undefined) ? this.length : stop;
    start = Math.max(0, ((start < 0) ? this.length + start : start));
    stop = Math.min(this.length, ((stop < 0) ? this.length + stop : stop));
    if (Array.isArray(this)) {
        var count = 0;
        for (var i=0; i<this.length; i++) {
            if (_pyfunc_op_equals(this[i], x)) {count+=1;}
        } return count;
    } else if (this.constructor == String) {
        var count = 0, i = start;
        while (i >= 0 && i < stop) {
            i = this.indexOf(x, i);
            if (i < 0) break;
            count += 1;
            i += Math.max(1, x.length);
        } return count;
    } else return this.count.apply(this, arguments);
};
var _pymeth_endswith = function (x) { // nargs: 1
    if (this.constructor !== String) return this.endswith.apply(this, arguments);
    return this.lastIndexOf(x) == this.length - x.length;
};
var _pymeth_expandtabs = function (tabsize) { // nargs: 0 1
    if (this.constructor !== String) return this.expandtabs.apply(this, arguments);
    tabsize = (tabsize === undefined) ? 8 : tabsize;
    return this.replace(/\t/g, _pymeth_repeat.call(' ', tabsize));
};
var _pymeth_extend = function (x) { // nargs: 1
    if (!Array.isArray(this)) return this.extend.apply(this, arguments);
    this.push.apply(this, x);
};
var _pymeth_find = function (x, start, stop) { // nargs: 1 2 3
    if (this.constructor !== String) return this.find.apply(this, arguments);
    start = (start === undefined) ? 0 : start;
    stop = (stop === undefined) ? this.length : stop;
    start = Math.max(0, ((start < 0) ? this.length + start : start));
    stop = Math.min(this.length, ((stop < 0) ? this.length + stop : stop));
    var i = this.slice(start, stop).indexOf(x);
    if (i >= 0) return i + start;
    return -1;
};
var _pymeth_format = function () {
    if (this.constructor !== String) return this.format.apply(this, arguments);
    var parts = [], i = 0, i1, i2;
    var itemnr = -1;
    while (i < this.length) {
        // find opening
        i1 = this.indexOf('{', i);
        if (i1 < 0 || i1 == this.length-1) { break; }
        if (this[i1+1] == '{') {parts.push(this.slice(i, i1+1)); i = i1 + 2; continue;}
        // find closing
        i2 = this.indexOf('}', i1);
        if (i2 < 0) { break; }
        // parse
        itemnr += 1;
        var fmt = this.slice(i1+1, i2);
        var index = fmt.split(':')[0].split('!')[0];
        index = index? Number(index) : itemnr
        var s = _pyfunc_format(arguments[index], fmt);
        parts.push(this.slice(i, i1), s);
        i = i2 + 1;
    }
    parts.push(this.slice(i));
    return parts.join('');
};
var _pymeth_get = function (key, d) { // nargs: 1 2
    if (this.constructor !== Object) return this.get.apply(this, arguments);
    if (this[key] !== undefined) {return this[key];}
    else if (d !== undefined) {return d;}
    else {return null;}
};
var _pymeth_index = function (x, start, stop) { // nargs: 1 2 3
    start = (start === undefined) ? 0 : start;
    stop = (stop === undefined) ? this.length : stop;
    start = Math.max(0, ((start < 0) ? this.length + start : start));
    stop = Math.min(this.length, ((stop < 0) ? this.length + stop : stop));
    if (Array.isArray(this)) {
        for (var i=start; i<stop; i++) {
            if (_pyfunc_op_equals(this[i], x)) {return i;} // indexOf cant
        }
    } else if (this.constructor === String) {
        var i = this.slice(start, stop).indexOf(x);
        if (i >= 0) return i + start;
    } else return this.index.apply(this, arguments);
    var e = Error(x); e.name='ValueError'; throw e;
};
var _pymeth_insert = function (i, x) { // nargs: 2
    if (!Array.isArray(this)) return this.insert.apply(this, arguments);
    i = (i < 0) ? this.length + i : i;
    this.splice(i, 0, x);
};
var _pymeth_isalnum = function () { // nargs: 0
    if (this.constructor !== String) return this.isalnum.apply(this, arguments);
    return Boolean(/^[A-Za-z0-9]+$/.test(this));
};
var _pymeth_isalpha = function () { // nargs: 0
    if (this.constructor !== String) return this.isalpha.apply(this, arguments);
    return Boolean(/^[A-Za-z]+$/.test(this));
};
var _pymeth_isdecimal = function () { // nargs: 0
    if (this.constructor !== String) return this.isdecimal.apply(this, arguments);
    return Boolean(/^[0-9]+$/.test(this));
};
var _pymeth_isdigit = function () { // nargs: 0
    if (this.constructor !== String) return this.isdigit.apply(this, arguments);
    return Boolean(/^[0-9]+$/.test(this));
};
var _pymeth_isidentifier = function () { // nargs: 0
    if (this.constructor !== String) return this.isidentifier.apply(this, arguments);
    return Boolean(/^[A-Za-z_][A-Za-z0-9_]*$/.test(this));
};
var _pymeth_islower = function () { // nargs: 0
    if (this.constructor !== String) return this.islower.apply(this, arguments);
    var low = this.toLowerCase(), high = this.toUpperCase();
    return low != high && low == this;
};
var _pymeth_isnumeric = function () { // nargs: 0
    if (this.constructor !== String) return this.isnumeric.apply(this, arguments);
    return Boolean(/^[0-9]+$/.test(this));
};
var _pymeth_isspace = function () { // nargs: 0
    if (this.constructor !== String) return this.isspace.apply(this, arguments);
    return Boolean(/^\s+$/.test(this));
};
var _pymeth_istitle = function () { // nargs: 0
    if (this.constructor !== String) return this.istitle.apply(this, arguments);
    var low = this.toLowerCase(), title = _pymeth_title.call(this);
    return low != title && title == this;
};
var _pymeth_isupper = function () { // nargs: 0
    if (this.constructor !== String) return this.isupper.apply(this, arguments);
    var low = this.toLowerCase(), high = this.toUpperCase();
    return low != high && high == this;
};
var _pymeth_items = function () { // nargs: 0
    if (this.constructor !== Object) return this.items.apply(this, arguments);
    var key, keys = Object.keys(this), res = []
    for (var i=0; i<keys.length; i++) {key = keys[i]; res.push([key, this[key]]);}
    return res;
};
var _pymeth_join = function (x) { // nargs: 1
    if (this.constructor !== String) return this.join.apply(this, arguments);
    return x.join(this);  // call join on the list instead of the string.
};
var _pymeth_keys = function () { // nargs: 0
    if (typeof this['keys'] === 'function') return this.keys.apply(this, arguments);
    return Object.keys(this);
};
var _pymeth_ljust = function (w, fill) { // nargs: 1 2
    if (this.constructor !== String) return this.ljust.apply(this, arguments);
    fill = (fill === undefined) ? ' ' : fill;
    var tofill = Math.max(0, w - this.length);
    return this + _pymeth_repeat.call(fill, tofill);
};
var _pymeth_lower = function () { // nargs: 0
    if (this.constructor !== String) return this.lower.apply(this, arguments);
    return this.toLowerCase();
};
var _pymeth_lstrip = function (chars) { // nargs: 0 1
    if (this.constructor !== String) return this.lstrip.apply(this, arguments);
    chars = (chars === undefined) ? ' \t\r\n' : chars;
    for (var i=0; i<this.length; i++) {
        if (chars.indexOf(this[i]) < 0) return this.slice(i);
    } return '';
};
var _pymeth_partition = function (sep) { // nargs: 1
    if (this.constructor !== String) return this.partition.apply(this, arguments);
    if (sep === '') {var e = Error('empty sep'); e.name='ValueError'; throw e;}
    var i1 = this.indexOf(sep);
    if (i1 < 0) return [this.slice(0), '', '']
    var i2 = i1 + sep.length;
    return [this.slice(0, i1), this.slice(i1, i2), this.slice(i2)];
};
var _pymeth_pop = function (i, d) { // nargs: 1 2
    if (Array.isArray(this)) {
        i = (i === undefined) ? -1 : i;
        i = (i < 0) ? (this.length + i) : i;
        var popped = this.splice(i, 1);
        if (popped.length)  return popped[0];
        var e = Error(i); e.name='IndexError'; throw e;
    } else if (this.constructor === Object) {
        var res = this[i]
        if (res !== undefined) {delete this[i]; return res;}
        else if (d !== undefined) return d;
        var e = Error(i); e.name='KeyError'; throw e;
    } else return this.pop.apply(this, arguments);
};
var _pymeth_popitem = function () { // nargs: 0
    if (this.constructor !== Object) return this.popitem.apply(this, arguments);
    var keys, key, val;
    keys = Object.keys(this);
    if (keys.length == 0) {var e = Error(); e.name='KeyError'; throw e;}
    key = keys[0]; val = this[key]; delete this[key];
    return [key, val];
};
var _pymeth_remove = function (x) { // nargs: 1
    if (!Array.isArray(this)) return this.remove.apply(this, arguments);
    for (var i=0; i<this.length; i++) {
        if (_pyfunc_op_equals(this[i], x)) {this.splice(i, 1); return;}
    }
    var e = Error(x); e.name='ValueError'; throw e;
};
var _pymeth_repeat = function(count) { // nargs: 0
    if (this.repeat) return this.repeat(count);
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
};
var _pymeth_replace = function (s1, s2, count) {  // nargs: 2 3
    if (this.constructor !== String) return this.replace.apply(this, arguments);
    var i = 0, i2, parts = [];
    count = (count === undefined) ? 1e20 : count;
    while (count > 0) {
        i2 = this.indexOf(s1, i);
        if (i2 >= 0) {
            parts.push(this.slice(i, i2));
            parts.push(s2);
            i = i2 + s1.length;
            count -= 1;
        } else break;
    }
    parts.push(this.slice(i));
    return parts.join('');
};
var _pymeth_reverse = function () { // nargs: 0
    this.reverse();
};
var _pymeth_rfind = function (x, start, stop) { // nargs: 1 2 3
    if (this.constructor !== String) return this.rfind.apply(this, arguments);
    start = (start === undefined) ? 0 : start;
    stop = (stop === undefined) ? this.length : stop;
    start = Math.max(0, ((start < 0) ? this.length + start : start));
    stop = Math.min(this.length, ((stop < 0) ? this.length + stop : stop));
    var i = this.slice(start, stop).lastIndexOf(x);
    if (i >= 0) return i + start;
    return -1;
};
var _pymeth_rindex = function (x, start, stop) {  // nargs: 1 2 3
    if (this.constructor !== String) return this.rindex.apply(this, arguments);
    var i = _pymeth_rfind.call(this, x, start, stop);
    if (i >= 0) return i;
    var e = Error(x); e.name='ValueError'; throw e;
};
var _pymeth_rjust = function (w, fill) { // nargs: 1 2
    if (this.constructor !== String) return this.rjust.apply(this, arguments);
    fill = (fill === undefined) ? ' ' : fill;
    var tofill = Math.max(0, w - this.length);
    return _pymeth_repeat.call(fill, tofill) + this;
};
var _pymeth_rpartition = function (sep) { // nargs: 1
    if (this.constructor !== String) return this.rpartition.apply(this, arguments);
    if (sep === '') {var e = Error('empty sep'); e.name='ValueError'; throw e;}
    var i1 = this.lastIndexOf(sep);
    if (i1 < 0) return ['', '', this.slice(0)]
    var i2 = i1 + sep.length;
    return [this.slice(0, i1), this.slice(i1, i2), this.slice(i2)];
};
var _pymeth_rsplit = function (sep, count) { // nargs: 1 2
    if (this.constructor !== String) return this.rsplit.apply(this, arguments);
    sep = (sep === undefined) ? /\s/ : sep;
    count = Math.max(0, (count === undefined) ? 1e20 : count);
    var parts = this.split(sep);
    var limit = Math.max(0, parts.length-count);
    var res = parts.slice(limit);
    if (count < parts.length) res.splice(0, 0, parts.slice(0, limit).join(sep));
    return res;
};
var _pymeth_rstrip = function (chars) { // nargs: 0 1
    if (this.constructor !== String) return this.rstrip.apply(this, arguments);
    chars = (chars === undefined) ? ' \t\r\n' : chars;
    for (var i=this.length-1; i>=0; i--) {
        if (chars.indexOf(this[i]) < 0) return this.slice(0, i+1);
    } return '';
};
var _pymeth_setdefault = function (key, d) { // nargs: 1 2
    if (this.constructor !== Object) return this.setdefault.apply(this, arguments);
    if (this[key] !== undefined) {return this[key];}
    else if (d !== undefined) { this[key] = d; return d;}
    else {return null;}
};
var _pymeth_sort = function (key, reverse) { // nargs: 0 1 2
    if (!Array.isArray(this)) return this.sort.apply(this, arguments);
    var comp = function (a, b) {a = key(a); b = key(b);
        if (a<b) {return -1;} if (a>b) {return 1;} return 0;};
    comp = Boolean(key) ? comp : undefined;
    this.sort(comp);
    if (reverse) this.reverse();
};
var _pymeth_split = function (sep, count) { // nargs: 0, 1 2
    if (this.constructor !== String) return this.split.apply(this, arguments);
    if (sep === '') {var e = Error('empty sep'); e.name='ValueError'; throw e;}
    sep = (sep === undefined) ? /\s/ : sep;
    if (count === undefined) { return this.split(sep); }
    var res = [], i = 0, index1 = 0, index2 = 0;
    while (i < count && index1 < this.length) {
        index2 = this.indexOf(sep, index1);
        if (index2 < 0) { break; }
        res.push(this.slice(index1, index2));
        index1 = index2 + sep.length || 1;
        i += 1;
    }
    res.push(this.slice(index1));
    return res;
};
var _pymeth_splitlines = function (keepends) { // nargs: 0 1
    if (this.constructor !== String) return this.splitlines.apply(this, arguments);
    keepends = keepends ? 1 : 0
    var finder = /\r\n|\r|\n/g;
    var i = 0, i2, isrn, parts = [];
    while (finder.exec(this) !== null) {
        i2 = finder.lastIndex -1;
        isrn = i2 > 0 && this[i2-1] == '\r' && this[i2] == '\n';
        if (keepends) parts.push(this.slice(i, finder.lastIndex));
        else parts.push(this.slice(i, i2 - isrn));
        i = finder.lastIndex;
    }
    if (i < this.length) parts.push(this.slice(i));
    else if (!parts.length) parts.push('');
    return parts;
};
var _pymeth_startswith = function (x) { // nargs: 1
    if (this.constructor !== String) return this.startswith.apply(this, arguments);
    return this.indexOf(x) == 0;
};
var _pymeth_strip = function (chars) { // nargs: 0 1
    if (this.constructor !== String) return this.strip.apply(this, arguments);
    chars = (chars === undefined) ? ' \t\r\n' : chars;
    var i, s1 = this, s2 = '', s3 = '';
    for (i=0; i<s1.length; i++) {
        if (chars.indexOf(s1[i]) < 0) {s2 = s1.slice(i); break;}
    } for (i=s2.length-1; i>=0; i--) {
        if (chars.indexOf(s2[i]) < 0) {s3 = s2.slice(0, i+1); break;}
    } return s3;
};
var _pymeth_swapcase = function () { // nargs: 0
    if (this.constructor !== String) return this.swapcase.apply(this, arguments);
    var c, res = [];
    for (var i=0; i<this.length; i++) {
        c = this[i];
        if (c.toUpperCase() == c) res.push(c.toLowerCase());
        else res.push(c.toUpperCase());
    } return res.join('');
};
var _pymeth_title = function () { // nargs: 0
    if (this.constructor !== String) return this.title.apply(this, arguments);
    var i0, res = [], tester = /^[^A-Za-z]?[A-Za-z]$/;
    for (var i=0; i<this.length; i++) {
        i0 = Math.max(0, i-1);
        if (tester.test(this.slice(i0, i+1))) res.push(this[i].toUpperCase());
        else res.push(this[i].toLowerCase());
    } return res.join('');
};
var _pymeth_translate = function (table) { // nargs: 1
    if (this.constructor !== String) return this.translate.apply(this, arguments);
    var c, res = [];
    for (var i=0; i<this.length; i++) {
        c = table[this[i]];
        if (c === undefined) res.push(this[i]);
        else if (c !== null) res.push(c);
    } return res.join('');
};
var _pymeth_update = function (other) { // nargs: 1
    if (this.constructor !== Object) return this.update.apply(this, arguments);
    var key, keys = Object.keys(other);
    for (var i=0; i<keys.length; i++) {key = keys[i]; this[key] = other[key];}
    return null;
};
var _pymeth_upper = function () { // nargs: 0
    if (this.constructor !== String) return this.upper.apply(this, arguments);
    return this.toUpperCase();
};
var _pymeth_values = function () { // nargs: 0
    if (this.constructor !== Object) return this.values.apply(this, arguments);
    var key, keys = Object.keys(this), res = [];
    for (var i=0; i<keys.length; i++) {key = keys[i]; res.push(this[key]);}
    return res;
};
var _pymeth_zfill = function (width) { // nargs: 1
    if (this.constructor !== String) return this.zfill.apply(this, arguments);
    return _pymeth_rjust.call(this, width, '0');
};

return {_pyfunc_perf_counter: _pyfunc_perf_counter, _pyfunc_time: _pyfunc_time, _pyfunc_op_instantiate: _pyfunc_op_instantiate, _pyfunc_create_dict: _pyfunc_create_dict, _pyfunc_merge_dicts: _pyfunc_merge_dicts, _pyfunc_op_parse_kwargs: _pyfunc_op_parse_kwargs, _pyfunc_op_error: _pyfunc_op_error, _pyfunc_hasattr: _pyfunc_hasattr, _pyfunc_getattr: _pyfunc_getattr, _pyfunc_setattr: _pyfunc_setattr, _pyfunc_delattr: _pyfunc_delattr, _pyfunc_dict: _pyfunc_dict, _pyfunc_list: _pyfunc_list, _pyfunc_range: _pyfunc_range, _pyfunc_format: _pyfunc_format, _pyfunc_pow: _pyfunc_pow, _pyfunc_sum: _pyfunc_sum, _pyfunc_round: _pyfunc_round, _pyfunc_int: _pyfunc_int, _pyfunc_float: _pyfunc_float, _pyfunc_str: _pyfunc_str, _pyfunc_repr: _pyfunc_repr, _pyfunc_bool: _pyfunc_bool, _pyfunc_abs: _pyfunc_abs, _pyfunc_divmod: _pyfunc_divmod, _pyfunc_all: _pyfunc_all, _pyfunc_any: _pyfunc_any, _pyfunc_enumerate: _pyfunc_enumerate, _pyfunc_zip: _pyfunc_zip, _pyfunc_reversed: _pyfunc_reversed, _pyfunc_sorted: _pyfunc_sorted, _pyfunc_filter: _pyfunc_filter, _pyfunc_map: _pyfunc_map, _pyfunc_truthy: _pyfunc_truthy, _pyfunc_op_equals: _pyfunc_op_equals, _pyfunc_op_contains: _pyfunc_op_contains, _pyfunc_op_add: _pyfunc_op_add, _pyfunc_op_mult: _pyfunc_op_mult, _pymeth_append: _pymeth_append, _pymeth_extend: _pymeth_extend, _pymeth_insert: _pymeth_insert, _pymeth_remove: _pymeth_remove, _pymeth_reverse: _pymeth_reverse, _pymeth_sort: _pymeth_sort, _pymeth_clear: _pymeth_clear, _pymeth_copy: _pymeth_copy, _pymeth_pop: _pymeth_pop, _pymeth_count: _pymeth_count, _pymeth_index: _pymeth_index, _pymeth_get: _pymeth_get, _pymeth_items: _pymeth_items, _pymeth_keys: _pymeth_keys, _pymeth_popitem: _pymeth_popitem, _pymeth_setdefault: _pymeth_setdefault, _pymeth_update: _pymeth_update, _pymeth_values: _pymeth_values, _pymeth_repeat: _pymeth_repeat, _pymeth_capitalize: _pymeth_capitalize, _pymeth_casefold: _pymeth_casefold, _pymeth_center: _pymeth_center, _pymeth_endswith: _pymeth_endswith, _pymeth_expandtabs: _pymeth_expandtabs, _pymeth_find: _pymeth_find, _pymeth_format: _pymeth_format, _pymeth_isalnum: _pymeth_isalnum, _pymeth_isalpha: _pymeth_isalpha, _pymeth_isidentifier: _pymeth_isidentifier, _pymeth_islower: _pymeth_islower, _pymeth_isdecimal: _pymeth_isdecimal, _pymeth_isnumeric: _pymeth_isnumeric, _pymeth_isdigit: _pymeth_isdigit, _pymeth_isspace: _pymeth_isspace, _pymeth_istitle: _pymeth_istitle, _pymeth_isupper: _pymeth_isupper, _pymeth_join: _pymeth_join, _pymeth_ljust: _pymeth_ljust, _pymeth_lower: _pymeth_lower, _pymeth_lstrip: _pymeth_lstrip, _pymeth_partition: _pymeth_partition, _pymeth_replace: _pymeth_replace, _pymeth_rfind: _pymeth_rfind, _pymeth_rindex: _pymeth_rindex, _pymeth_rjust: _pymeth_rjust, _pymeth_rpartition: _pymeth_rpartition, _pymeth_rsplit: _pymeth_rsplit, _pymeth_rstrip: _pymeth_rstrip, _pymeth_split: _pymeth_split, _pymeth_splitlines: _pymeth_splitlines, _pymeth_startswith: _pymeth_startswith, _pymeth_strip: _pymeth_strip, _pymeth_swapcase: _pymeth_swapcase, _pymeth_title: _pymeth_title, _pymeth_translate: _pymeth_translate, _pymeth_upper: _pymeth_upper, _pymeth_zfill: _pymeth_zfill};
});


/* =========================== flexx.event.js ===========================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */

flexx.define("flexx.event.js", ["pscript-std.js"], function (_py) {

"use strict";

var _pyfunc_op_add = _py._pyfunc_op_add, _pyfunc_float = _py._pyfunc_float, _pyfunc_int = _py._pyfunc_int, _pyfunc_str = _py._pyfunc_str, _pyfunc_hasattr = _py._pyfunc_hasattr, _pyfunc_create_dict = _py._pyfunc_create_dict, _pyfunc_getattr = _py._pyfunc_getattr, _pyfunc_all = _py._pyfunc_all, _pyfunc_op_contains = _py._pyfunc_op_contains, _pyfunc_truthy = _py._pyfunc_truthy, _pyfunc_op_instantiate = _py._pyfunc_op_instantiate, _pyfunc_op_equals = _py._pyfunc_op_equals, _pyfunc_format = _py._pyfunc_format, _pyfunc_op_parse_kwargs = _py._pyfunc_op_parse_kwargs, _pyfunc_setattr = _py._pyfunc_setattr, _pyfunc_range = _py._pyfunc_range, _pyfunc_dict = _py._pyfunc_dict, _pyfunc_bool = _py._pyfunc_bool, _pyfunc_op_mult = _py._pyfunc_op_mult, _pyfunc_list = _py._pyfunc_list, _pyfunc_op_error = _py._pyfunc_op_error;
var _pymeth_replace = _py._pymeth_replace, _pymeth_upper = _py._pymeth_upper, _pymeth_get = _py._pymeth_get, _pymeth_lstrip = _py._pymeth_lstrip, _pymeth_lower = _py._pymeth_lower, _pymeth_insert = _py._pymeth_insert, _pymeth_repeat = _py._pymeth_repeat, _pymeth_endswith = _py._pymeth_endswith, _pymeth_strip = _py._pymeth_strip, _pymeth_append = _py._pymeth_append, _pymeth_copy = _py._pymeth_copy, _pymeth_join = _py._pymeth_join, _pymeth_format = _py._pymeth_format, _pymeth_pop = _py._pymeth_pop, _pymeth_startswith = _py._pymeth_startswith, _pymeth_rstrip = _py._pymeth_rstrip, _pymeth_clear = _py._pymeth_clear, _pymeth_split = _py._pymeth_split, _pymeth_sort = _py._pymeth_sort, _pymeth_partition = _py._pymeth_partition;
var _mutate_array_js;
_mutate_array_js = function flx__mutate_array_js (array, ev) {
	var err_3, index, is_nd, mutation, objects;
	is_nd = _pyfunc_hasattr(array, "shape") && _pyfunc_hasattr(array, "dtype");
	mutation = ev.mutation;
	index = ev.index;
	objects = ev.objects;
	if ((is_nd === true)) {
		if (_pyfunc_op_equals(mutation, "set")) {
			throw _pyfunc_op_error('NotImplementedError', "Cannot set nd array in-place");
		} else if (_pyfunc_op_contains(mutation, ["extend", "insert", "remove"])) {
			throw _pyfunc_op_error('NotImplementedError', "Cannot resize nd arrays");
		} else if (_pyfunc_op_equals(mutation, "replace")) {
			throw _pyfunc_op_error('NotImplementedError', "Cannot replace items in nd array");
		}
	} else {
		if (_pyfunc_op_equals(mutation, "remove")) {
			if (!(Object.prototype.toString.call(objects).slice(8,-1).toLowerCase() === 'number')) { throw _pyfunc_op_error('AssertionError', "Object.prototype.toString.call(objects).slice(8,-1).toLowerCase() === 'number'");}
		} else if ((!Array.isArray(objects))) {
			throw _pyfunc_op_error('TypeError', "Inplace list/array mutating requires a list of objects.");
		}
		if (_pyfunc_op_equals(mutation, "set")) {
			array.splice.apply(array, [].concat([0, array.length], objects));
		} else if (_pyfunc_op_equals(mutation, "insert")) {
			array.splice.apply(array, [].concat([index, 0], objects));
		} else if (_pyfunc_op_equals(mutation, "remove")) {
			array.splice(index, objects);
		} else if (_pyfunc_op_equals(mutation, "replace")) {
			array.splice.apply(array, [].concat([index, objects.length], objects));
		} else {
			throw _pyfunc_op_error('NotImplementedError', mutation);
		}
	}
	return null;
};

var mutate_array = _mutate_array_js;
var mutate_dict;
mutate_dict = function flx_mutate_dict (d, ev) {
	var err_2, key, mutation, objects, stub1_seq, stub2_seq, stub3_itr, val;
	mutation = ev["mutation"];
	objects = ev["objects"];
	if (_pyfunc_op_equals(mutation, "set")) {
		_pymeth_clear.call(d);
	} else if (_pyfunc_op_contains(mutation, ["set", "insert", "replace"])) {
		if (!(Object.prototype.toString.call(objects).slice(8,-1).toLowerCase() === 'object')) { throw _pyfunc_op_error('AssertionError', "Object.prototype.toString.call(objects).slice(8,-1).toLowerCase() === 'object'");}
		stub1_seq = objects;
		for (key in stub1_seq) {
			if (!stub1_seq.hasOwnProperty(key)){ continue; }
			val = stub1_seq[key];
			d[key] = val;
		}
	} else if (_pyfunc_op_equals(mutation, "remove")) {
		if (!(Array.isArray(objects))) { throw _pyfunc_op_error('AssertionError', "Array.isArray(objects)");}
		stub2_seq = objects;
		if ((typeof stub2_seq === "object") && (!Array.isArray(stub2_seq))) { stub2_seq = Object.keys(stub2_seq);}
		for (stub3_itr = 0; stub3_itr < stub2_seq.length; stub3_itr += 1) {
			key = stub2_seq[stub3_itr];
			_pymeth_pop.call(d, key);
		}
	} else {
		throw _pyfunc_op_error('NotImplementedError', mutation);
	}
	return null;
};

var Logger = function () {
	this.level = 25;
}
var $Logger = Logger.prototype;
$Logger.debug = function (msg) {
	if (this.level <= 10) { console.info(msg); }
};
$Logger.info = function (msg) {
	if (this.level <= 20) { console.info(msg); }
};
$Logger.warning = function (msg) {
	if (this.level <= 30) { console.warn(msg); }
};
$Logger.warn = $Logger.warning;
$Logger.exception = function (msg) {
	console.error(msg);
};
$Logger.error = function (msg) {
	console.error(msg);
};
var logger = new Logger();
var Loop;
Loop = function () {
	_pyfunc_op_instantiate(this, arguments);
}
var $Loop = Loop.prototype;
$Loop.__init__ = function () {
	this._active_components = [];
	this.reset();
	return null;
};

$Loop._call_soon_func = function (func) {
	setTimeout(func, 0);
	return null;
};

$Loop._iter_callback = function () {
	this._scheduled_call_to_iter = false;
	return this.iter();
};


$Loop.__enter__ = function () {
	return this;
};

$Loop.__exit__ = function (type, value, traceback) {
	this.iter();
	return null;
};

$Loop._activate_component = function (component) {
	_pymeth_append.call(this._active_components, component);
	return null;
};

$Loop._deactivate_component = function (component) {
	var err_2, top;
	top = _pymeth_pop.call(this._active_components, (-1));
	if ((top !== component)) {
		throw _pyfunc_op_error('RuntimeError', (_pymeth_format.call("loop._deactivate_component: {} is not {}", component.id, (_pyfunc_truthy(top) && _pyfunc_truthy(top.id)))));
	}
	return null;
};

$Loop._process_actions = function (n) {
	var action, args, err, i, pending_actions, stub1_err, stub2_;
	n = (n === undefined) ? null: n;
	{/* with lock */
				if ((n === null)) {
			pending_actions = this._pending_actions;
			this._pending_actions = [];
		} else {
			pending_actions = this._pending_actions.slice(0,n);
			this._pending_actions = this._pending_actions.slice(n);
		}
	}
	for (i = 0; i < pending_actions.length; i += 1) {
		stub2_ = pending_actions[i];
		action = stub2_[0];args = stub2_[1];
		this._processing_action = action;
		try {
			action.apply(null, args);
		} catch(err_3) {
			{
				err = err_3;
				logger.exception(err);
			}
		} finally {
			this._processing_action = null;
		}
	}
	return null;
};

$Loop._process_calls = function () {
	var args, err, func, i, pending_calls, stub1_err, stub2_;
	{/* with lock */
				pending_calls = this._pending_calls;
		this._pending_calls = [];
	}
	for (i = 0; i < pending_calls.length; i += 1) {
		stub2_ = pending_calls[i];
		func = stub2_[0];args = stub2_[1];
		try {
			func.apply(null, args);
		} catch(err_3) {
			{
				err = err_3;
				logger.exception(err);
			}
		}
	}
	return null;
};

$Loop._process_reactions = function () {
	var _, component, component_names, connections, err, events, ir, name, pending_reactions, reaction, stub1_err, stub2_, stub3_seq, stub4_seq;
	{/* with lock */
				pending_reactions = this._pending_reactions;
		this._pending_reactions = [];
		this._pending_reaction_ids = ({});
	}
	for (ir = 0; ir < pending_reactions.length; ir += 1) {
		stub2_ = pending_reactions[ir];
		reaction = stub2_[0];_ = stub2_[1];events = stub2_[2];
		if (((events.length > 0) || (_pyfunc_op_equals(reaction.get_mode(), "auto")))) {
			this._prop_access = ({});
			this._processing_reaction = reaction;
			try {
				reaction.apply(null, events);
			} catch(err_4) {
				{
					err = err_4;
					logger.exception(err);
				}
			} finally {
				this._processing_reaction = null;
			}
		}
		try {
			if ((_pyfunc_op_equals(reaction.get_mode(), "auto"))) {
				connections = [];
				stub4_seq = this._prop_access;
				for (component_names in stub4_seq) {
					if (!stub4_seq.hasOwnProperty(component_names)){ continue; }
					component_names = stub4_seq[component_names];
					component = component_names[0];
					stub3_seq = component_names[1];
					for (name in stub3_seq) {
						if (!stub3_seq.hasOwnProperty(name)){ continue; }
						_pymeth_append.call(connections, [component, name]);
					}
				}
				reaction._update_implicit_connections(connections);
			}
		} catch(err_3) {
			{
				err = err_3;
				logger.exception(err);
			}
		} finally {
			this._prop_access = ({});
		}
	}
	return null;
};

$Loop._schedule_iter = function () {
	if ((this._scheduled_call_to_iter === false)) {
		this._scheduled_call_to_iter = true;
		this._call_soon_func(this._iter_callback);
	}
	return null;
};

$Loop.add_action_invokation = function (action, args) {
	var stub1_err;
	{/* with lock */
		_pymeth_append.call(this._pending_actions, [action, args]);
		this._schedule_iter();
	}
	return null;
};

$Loop.add_reaction_event = function (reaction, ev) {
	var ev2, i, mode, new_item, pending_reactions, stub1_err;
	pending_reactions = this._pending_reactions;
	mode = reaction.get_mode();
	{/* with lock */
				if (_pyfunc_op_equals(mode, "normal")) {
			i = pending_reactions.length;
			while (i > 0) {
				i -= 1;
				ev2 = pending_reactions[i][1];
				if (((pending_reactions[i][0]) === reaction)) {
					_pymeth_append.call((pending_reactions[i][2]), ev);
					if ((!((ev2["source"] === ev["source"]) && _pyfunc_op_equals(ev2["type"], ev["type"])))) {
						pending_reactions[i][1] = ({source: null});
					}
					return null;
				}
				if ((!((ev2 === null) || ((ev2["source"] === ev["source"]) && _pyfunc_op_equals(ev2.type, ev.type))))) {
					break;
				}
			}
		} else if (_pyfunc_op_contains(reaction._id, this._pending_reaction_ids)) {
			if ((reaction._connections.length > 0)) {
				_pymeth_append.call((this._pending_reaction_ids[reaction._id][2]), ev);
			}
			return null;
		}
		if ((reaction._connections.length > 0)) {
			new_item = [reaction, ev, [ev]];
		} else {
			new_item = [reaction, null, []];
		}
		_pymeth_append.call(pending_reactions, new_item);
		this._pending_reaction_ids[reaction._id] = new_item;
		this._schedule_iter();
	}
	return null;
};

$Loop.call_soon = function (func) {
	var args, stub1_err;
	args = Array.prototype.slice.call(arguments, 1);
	{/* with lock */
		_pymeth_append.call(this._pending_calls, [func, args]);
		this._schedule_iter();
	}
	return null;
};

$Loop.can_mutate = function (component) {
	var active;
	component = (component === undefined) ? null: component;
	active = this.get_active_component();
	if ((active !== null)) {
		return active === component;
	} else {
		return this._processing_action !== null;
	}
	return null;
};

$Loop.get_active_component = function () {
	if ((this._active_components.length > 0)) {
		return this._active_components[this._active_components.length -1];
	}
	return null;
};

$Loop.get_active_components = function () {
	return _pyfunc_list(this._active_components);
};

$Loop.has_pending = function () {
	return (this._pending_reactions.length > 0) || (this._pending_actions.length > 0) || (this._pending_calls.length > 0);
};

$Loop.iter = function () {
	var err_2, stub1_err;
	{/* with lock */
			}
	if ((this._in_iter === true)) {
		throw _pyfunc_op_error('RuntimeError', "Cannot call flexx.event.loop.iter() while it is processing.");
	}
	this._in_iter = true;
	try {
		this._process_calls();
		this._process_actions();
		this._process_reactions();
	} finally {
		this._in_iter = false;
	}
	return null;
};

$Loop.register_prop_access = function (component, prop_name) {
	var d;
	if ((this._processing_reaction !== null)) {
		if ((_pyfunc_op_equals(this._processing_reaction.get_mode(), "auto"))) {
			 {
				if ((!_pyfunc_op_contains(component._id, this._prop_access))) {
					d = ({});
					this._prop_access[component._id] = [component, d];
				} else {
					d = this._prop_access[component._id][1];
				}
				d[prop_name] = true;
			}
		}
	}
	return null;
};

$Loop.reset = function () {
	this._in_iter = false;
	this._scheduled_call_to_iter = false;
	this._processing_action = null;
	this._processing_reaction = null;
	this._prop_access = ({});
	this._pending_calls = [];
	this._pending_actions = [];
	this._pending_reactions = [];
	this._pending_reaction_ids = ({});
	return null;
};

var loop = new Loop();
var Component;
Component = function () {
	_pyfunc_op_instantiate(this, arguments);
}
var $Component = Component.prototype;
$Component._base_class = Object;
$Component.__name__ = "Component";

$Component._IS_COMPONENT = true;
$Component._COUNT = 0;
$Component._REACTION_COUNT = 0;
$Component.__init__ = function () {
	var i, init_args, name, property_values, stub1_err;
	property_values = {};
	if (arguments.length == 1 && typeof arguments[0] == 'object' && Object.keys(arguments[0]).toString() == 'flx_args,flx_kwargs') {
		property_values = _pyfunc_op_parse_kwargs([], [], arguments[0].flx_kwargs);
		init_args = arguments[0].flx_args;
	} else {init_args = Array.prototype.slice.call(arguments);}
	$Component._COUNT += 1;
	this._id = this.__name__ + $Component._COUNT;
	this._disposed = false;
	this._Component__handlers = ({});
	this._Component__pending_events = [];
	this._Component__anonymous_reactions = [];
	this._Component__initial_mutation = false;
	for (i = 0; i < this.__actions__.length; i += 1) {
		name = this.__actions__[i];
		this._Component__create_action(this[name], name);
	}
	for (i = 0; i < this.__emitters__.length; i += 1) {
		name = this.__emitters__[i];
		this._Component__handlers[name] = [];
		this._Component__create_emitter(this[name], name);
	}
	for (i = 0; i < this.__properties__.length; i += 1) {
		name = this.__properties__[i];
		this._Component__handlers[name] = [];
		this._Component__create_property(name);
	}
	for (i = 0; i < this.__attributes__.length; i += 1) {
		name = this.__attributes__[i];
		this._Component__create_attribute(name);
	}
	this.__enter__();
	try {
		this._comp_init_property_values(property_values);
		this.init.apply(this, init_args);
	} catch(err_1)  { stub1_err=err_1; }
	if (stub1_err) { if (!this.__exit__(stub1_err.name || "error", stub1_err, null)) { throw stub1_err; }
	} else { this.__exit__(null, null, null); }
	this._comp_init_reactions();
	return null;
};

$Component._comp_init_property_values = function (property_values) {
	var err_4, i, name, stub2_seq, value, values;
	values = [];
	for (i = 0; i < this.__properties__.length; i += 1) {
		name = this.__properties__[i];
		if ((!_pyfunc_op_contains(name, property_values))) {
			_pymeth_append.call(values, ([name, this[("_" + name) + "_value"]]));
		}
	}
	stub2_seq = property_values;
	for (name in stub2_seq) {
		if (!stub2_seq.hasOwnProperty(name)){ continue; }
		value = stub2_seq[name];
		if ((!_pyfunc_op_contains(name, this.__properties__))) {
			if (_pyfunc_op_contains(name, this.__attributes__)) {
				throw _pyfunc_op_error('AttributeError', _pymeth_format.call("{}.{} is an attribute, not a property", this._id, name));
			} else {
				throw _pyfunc_op_error('AttributeError', _pymeth_format.call("{} does not have property {}.", this._id, name));
			}
		}
		if ((typeof value === "function")) {
			this._comp_make_implicit_setter(name, value);
			continue;
		}
		_pymeth_append.call(values, [name, value]);
	}
	this._comp_apply_property_values(values);
	return null;
};

$Component._comp_make_implicit_setter = function (prop_name, func) {
	var err_2, reaction, setter_func, setter_reaction, t;
	setter_func = _pyfunc_getattr(this, ("set_" + prop_name), null);
	if ((setter_func === null)) {
		t = "%s does not have a set_%s() action for property %s.";
		throw _pyfunc_op_error('TypeError', (t % [this._id, prop_name, prop_name]));
	}
	setter_reaction = (function () {return setter_func(func());}).bind(this);
	reaction = this._Component__create_reaction(setter_reaction, "auto-" + prop_name, "auto", []);
	_pymeth_append.call(this._Component__anonymous_reactions, reaction);
	return null;
};

$Component._comp_init_reactions = function () {
	var ev, func, i, name, r;
	if ((this._Component__pending_events !== null)) {
		_pymeth_append.call(this._Component__pending_events, null);
		loop.call_soon(this._comp_stop_capturing_events);
	}
	for (i = 0; i < this.__reactions__.length; i += 1) {
		name = this.__reactions__[i];
		func = this[name];
		r = this._Component__create_reaction(func, name, func._mode, _pyfunc_truthy(func._connection_strings) || []);
		if ((_pyfunc_op_equals(r.get_mode(), "auto"))) {
			ev = {source:this, type:"", label:""};
			loop.add_reaction_event(r, ev);
		}
	}
	for (i = 0; i < this._Component__anonymous_reactions.length; i += 1) {
		r = this._Component__anonymous_reactions[i];
		if ((_pyfunc_op_equals(r.get_mode(), "auto"))) {
			ev = {source:this, type:"", label:""};
			loop.add_reaction_event(r, ev);
		}
	}
	return null;
};

$Component.reaction = function () {
	var connection_strings, err_2, err_3, func, i, mode, name, nameparts, s;
	connection_strings = Array.prototype.slice.call(arguments);
	if ((connection_strings.length < 2)) {
		throw _pyfunc_op_error('RuntimeError', "Component.reaction() (js) needs a function and one or more connection strings.");
	}
	if ((typeof connection_strings[0] === "function")) {
		func = connection_strings[0];
		connection_strings = connection_strings.slice(1);
	} else if ((typeof connection_strings[connection_strings.length -1] === "function")) {
		func = connection_strings[connection_strings.length -1];
		connection_strings = connection_strings.slice(0,-1);
	} else {
		throw _pyfunc_op_error('TypeError', "Component.reaction() requires a callable.");
	}
	for (i = 0; i < connection_strings.length; i += 1) {
		s = connection_strings[i];
		if ((!(((Object.prototype.toString.call(s).slice(8,-1).toLowerCase() === 'string')) && s.length))) {
			throw _pyfunc_op_error('ValueError', "Connection string must be nonempty strings.");
		}
	}
	name = func.__name__ || func.name || 'anonymous';
	nameparts = name.split(' ');
	nameparts = nameparts[nameparts.length-1].split('flx_');
	name = nameparts[nameparts.length -1];
	mode = "normal";
	return this._Component__create_reaction_ob(func, name, mode, connection_strings);
};

$Component._Component__create_action = function (action_func, name) {
	var action, getter, opts, setter;
	action = (function flx_action () {
		var res;
		if ((loop.can_mutate(this) === true)) {
			res = action_func.apply(this, arguments);
			if ((res !== null)) {
				logger.warning(_pymeth_format.call("Action ({}) should not return a value", name));
			}
		} else {
			loop.add_action_invokation(action, arguments);
		}
		return this;
	}).bind(this);

	action.is_autogenerated = _pyfunc_op_equals(action_func.name, "flx_setter");
	getter = (function flx_getter () {
		return action;
	}).bind(this);

	setter = (function flx_setter (x) {
		var err_2;
		throw _pyfunc_op_error('AttributeError', _pymeth_format.call("Action {} is not settable", name));
		return null;
	}).bind(this);

	opts = ({enumerable: true, configurable: true, get: getter, set: setter});
	Object.defineProperty(this, name, opts);
	return null;
};

$Component._Component__create_attribute = function (name) {
	var getter, opts, setter;
	getter = (function flx_getter () {
		return this["_" + name];
	}).bind(this);

	setter = (function flx_setter (x) {
		var err_2;
		throw _pyfunc_op_error('AttributeError', _pymeth_format.call("Cannot set attribute {!r}", name));
		return null;
	}).bind(this);

	opts = ({enumerable: false, configurable: false, get: getter, set: setter});
	Object.defineProperty(this, name, opts);
	return null;
};

$Component._Component__create_property = function (name) {
	var getter, opts, private_name, setter;
	private_name = ("_" + name) + "_value";
	getter = (function flx_getter () {
		loop.register_prop_access(this, name);
		return this[private_name];
	}).bind(this);

	setter = (function flx_setter (x) {
		var err_2;
		throw _pyfunc_op_error('AttributeError', _pymeth_format.call("Cannot set property {!r}; properties can only be mutated by actions.", name));
		return null;
	}).bind(this);

	opts = ({enumerable: true, configurable: true, get: getter, set: setter});
	Object.defineProperty(this, name, opts);
	return null;
};

$Component._Component__create_emitter = function (emitter_func, name) {
	var func, getter, opts, setter;
	func = (function flx_func () {
		var ev;
		ev = emitter_func.apply(this, arguments);
		if ((ev !== null)) {
			this.emit(name, ev);
		}
		return null;
	}).bind(this);

	getter = (function flx_getter () {
		return func;
	}).bind(this);

	setter = (function flx_setter (x) {
		var err_2;
		throw _pyfunc_op_error('AttributeError', _pymeth_format.call("Emitter {} is not settable", name));
		return null;
	}).bind(this);

	opts = ({enumerable: true, configurable: true, get: getter, set: setter});
	Object.defineProperty(this, name, opts);
	return null;
};

$Component._Component__create_reaction = function (reaction_func, name, mode, c_strings) {
	var getter, opts, reaction, setter;
	reaction = this._Component__create_reaction_ob(reaction_func, name, mode, c_strings);
	getter = (function flx_getter () {
		return reaction;
	}).bind(this);

	setter = (function flx_setter (x) {
		var err_2;
		throw _pyfunc_op_error('AttributeError', _pymeth_format.call("Reaction {} is not settable", name));
		return null;
	}).bind(this);

	opts = ({enumerable: true, configurable: true, get: getter, set: setter});
	Object.defineProperty(this, name, opts);
	return reaction;
};

$Component._Component__create_reaction_ob = function (reaction_func, name, mode, connection_strings) {
	var reaction, that;
	reaction = (function flx_reaction () {
		return reaction_func.apply(this, arguments);
	}).bind(this);

	
	reaction._clear_component_refs = function (ob) {
		var connection, i, ic;
		for (i = this._implicit_connections.length - 1; i > -1; i += -1) {
			if (((this._implicit_connections[i][0]) === ob)) {
				_pymeth_pop.call(this._implicit_connections, i);
			}
		}
		for (ic = 0; ic < this._connections.length; ic += 1) {
			connection = this._connections[ic];
			for (i = connection.objects.length - 1; i > -1; i += -1) {
				if (((connection.objects[i][0]) === ob)) {
					_pymeth_pop.call(connection.objects, i);
				}
			}
		}
		return null;
	};

	reaction._connect_and_disconnect = function (old_objects, new_objects, force) {
		var i, i1, i2, i3, ob, should_stay, stub1_, stub2_, stub3_, type;
		force = (force === undefined) ? false: force;
		should_stay = ({});
		i1 = 0;
		while ((i1 < new_objects.length) && (i1 < old_objects.length) && (((new_objects[i1][0]) === (old_objects[i1][0]))) && ((_pyfunc_op_equals((new_objects[i1][1]), (old_objects[i1][1]))))) {
			should_stay[(((new_objects[i1][0]).id) + "-") + (new_objects[i1][1])] = true;
			i1 += 1;
		}
		stub1_ = [new_objects.length - 1, old_objects.length - 1];
		i2 = stub1_[0];i3 = stub1_[1];
		while ((i2 >= i1) && (i3 >= i1) && (((new_objects[i2][0]) === (old_objects[i3][0]))) && ((_pyfunc_op_equals((new_objects[i2][1]), (old_objects[i3][1]))))) {
			should_stay[(((new_objects[i2][0]).id) + "-") + (new_objects[i2][1])] = true;
			i2 -= 1;
			i3 -= 1;
		}
		for (i = i1; i < i3 + 1; i += 1) {
			stub2_ = old_objects[i];
			ob = stub2_[0];type = stub2_[1];
			if (((_pymeth_get.call(should_stay, ((ob.id + "-") + type), false)) === false)) {
				ob.disconnect(type, this);
			}
		}
		for (i = i1; i < i2 + 1; i += 1) {
			stub3_ = new_objects[i];
			ob = stub3_[0];type = stub3_[1];
			ob._register_reaction(type, this, force);
		}
		return null;
	};

	reaction._init = function (connection_strings) {
		var _, d, err_5, force, fullname, i, ic, ichars, ipart, is_identifier, label, part, parts, s, s0, stub1_;
		ichars = "0123456789_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		this._connections = [];
		this._implicit_connections = [];
		for (ic = 0; ic < connection_strings.length; ic += 1) {
			fullname = connection_strings[ic];
			force = _pymeth_startswith.call(fullname, "!");
			stub1_ = _pymeth_partition.call(_pymeth_lstrip.call(fullname, "!"), ":");
			s = stub1_[0];_ = stub1_[1];label = stub1_[2];
			s0 = s;
			if ((_pyfunc_op_contains(".*.", (s + ".")))) {
				s = _pymeth_replace.call(s, ".*", "*");
				console.warn(_pymeth_format.call("Connection string syntax \"foo.*.bar\" is deprecated, use \"{}\" instead of \"{}\":.", s, s0));
			}
			if (_pyfunc_op_contains("!", s)) {
				s = _pymeth_replace.call(s, "!", "");
				force = true;
				console.warn(_pymeth_format.call("Exclamation marks in connection strings must come at the very start, use \"!{}\" instead of \"{}\".", s, s0));
			}
			parts = _pymeth_split.call(s, ".");
			for (ipart = 0; ipart < parts.length; ipart += 1) {
				part = _pymeth_rstrip.call(parts[ipart], "*");
				is_identifier = part.length > 0;
				for (i = 0; i < part.length; i += 1) {
					is_identifier = _pyfunc_truthy(is_identifier) && _pyfunc_op_contains(part[i], ichars);
				}
				if ((is_identifier === false)) {
					throw _pyfunc_op_error('ValueError', _pymeth_format.call("Connection string {!r} contains non-identifier part {!r}", s, part));
				}
			}
			d = {};
			_pymeth_append.call(this._connections, d);
			d.fullname = fullname;
			d.parts = parts;
			d.type = (_pymeth_rstrip.call(parts[parts.length -1], "*") + ":") + (_pyfunc_truthy(label) || this._name);
			d.force = force;
			d.objects = [];
		}
		for (ic = 0; ic < this._connections.length; ic += 1) {
			this.reconnect(ic);
		}
		return null;
	};

	reaction._seek_event_object = function (index, path, ob) {
		var connection, err_3, isub, name_label, new_ob, obname, obname_full, selector, stub1_, t;
		connection = this._connections[index];
		if (((ob === null) || (path.length == 0))) {
			return null;
		}
		if ((path.length == 1)) {
			if (_pyfunc_hasattr(ob, "_IS_COMPONENT")) {
				_pymeth_append.call(connection.objects, [ob, connection.type]);
			}
			if ((!_pyfunc_truthy(_pymeth_endswith.call(path[0], "**")))) {
				return null;
			}
		}
		stub1_ = [path[0], path.slice(1)];
		obname_full = stub1_[0];path = stub1_[1];
		obname = _pymeth_rstrip.call(obname_full, "*");
		selector = obname_full.slice(obname.length);
		if (_pyfunc_op_equals(selector, "***")) {
			this._seek_event_object(index, path, ob);
		}
		if ((_pyfunc_hasattr(ob, "_IS_COMPONENT") && _pyfunc_op_contains(obname, ob.__properties__))) {
			name_label = (obname + ":reconnect_") + _pyfunc_str(index);
			_pymeth_append.call(connection.objects, [ob, name_label]);
			new_ob = _pyfunc_getattr(ob, obname, null);
		} else {
			new_ob = _pyfunc_getattr(ob, obname, null);
		}
		if (_pyfunc_truthy(selector.length && _pyfunc_op_contains(selector, "***") && Array.isArray(new_ob))) {
			if ((selector.length > 1)) {
				path = _pyfunc_op_add([obname + "***"], path);
			}
			for (isub = 0; isub < new_ob.length; isub += 1) {
				this._seek_event_object(index, path, new_ob[isub]);
			}
			return null;
		} else if (_pyfunc_op_equals(selector, "*")) {
			t = "Invalid connection {name_full} because {name} is not a tuple/list.";
			throw _pyfunc_op_error('RuntimeError', (_pymeth_replace.call(_pymeth_replace.call(t, "{name_full}", obname_full), "{name}", obname)));
		} else {
			return this._seek_event_object(index, path, new_ob);
		}
		return null;
	};

	reaction._update_implicit_connections = function (connections) {
		var new_conns, old_conns;
		old_conns = this._implicit_connections;
		new_conns = connections;
		this._implicit_connections = new_conns;
		this._connect_and_disconnect(old_conns, new_conns);
		return null;
	};

	reaction._use_once = function (func) {
		this._func_once = func;
		return null;
	};

	reaction.dispose = function () {
		var connection, ic, ob, stub1_, stub2_, type;
		if (((this._connections.length == 0) && (this._implicit_connections.length == 0))) {
			return null;
		}
		if ((!"this_is_js()")) {
		}
		while (this._implicit_connections.length) {
			stub1_ = _pymeth_pop.call(this._implicit_connections, 0);
			ob = stub1_[0];type = stub1_[1];
			ob.disconnect(type, this);
		}
		for (ic = 0; ic < this._connections.length; ic += 1) {
			connection = this._connections[ic];
			while (connection.objects.length > 0) {
				stub2_ = _pymeth_pop.call(connection.objects, 0);
				ob = stub2_[0];type = stub2_[1];
				ob.disconnect(type, this);
			}
		}
		this._connections = [];
		return null;
	};

	reaction.get_connection_info = function () {
		return (function list_comprehension (iter0) {var res = [];var c, i0;if ((typeof iter0 === "object") && (!Array.isArray(iter0))) {iter0 = Object.keys(iter0);}for (i0=0; i0<iter0.length; i0++) {c = iter0[i0];{res.push([c.fullname, (function list_comprehension (iter0) {var res = [];var u, i0;if ((typeof iter0 === "object") && (!Array.isArray(iter0))) {iter0 = Object.keys(iter0);}for (i0=0; i0<iter0.length; i0++) {u = iter0[i0];{res.push(u[1]);}}return res;}).call(this, c.objects)]);}}return res;}).call(this, this._connections);
	};

	reaction.get_mode = function () {
		return this._mode;
	};

	reaction.get_name = function () {
		return this._name;
	};

	reaction.reconnect = function (index) {
		var connection, err_3, new_objects, ob, old_objects;
		connection = this._connections[index];
		old_objects = connection.objects;
		connection.objects = [];
		ob = this._ob1();
		if ((ob !== null)) {
			this._seek_event_object(index, connection.parts, ob);
		}
		new_objects = connection.objects;
		if ((new_objects.length == 0)) {
			throw _pyfunc_op_error('RuntimeError', _pymeth_format.call("Could not connect to {!r}", connection.fullname));
		}
		this._connect_and_disconnect(old_objects, new_objects, connection.force);
		return null;
	};

;
	that = this;
	$Component._REACTION_COUNT += 1;
	reaction._id = 'r' + $Component._REACTION_COUNT;
	reaction._name = name;
	reaction._mode = mode;
	reaction._ob1 = (function () {return that;}).bind(this);
	reaction._init(connection_strings, this);
	return reaction;
};


$Component._Component__check_not_active = function () {
	var active_components, err_2;
	active_components = loop.get_active_components();
	if (_pyfunc_op_contains(this, active_components)) {
		throw _pyfunc_op_error('RuntimeError', "It seems that the event loop is processing events while a Component is active. This has a high risk on race conditions.");
	}
	return null;
};

$Component.__actions__ = []
$Component.__attributes__ = ["id"]
$Component.__emitters__ = []
$Component.__enter__ = function () {
	loop._activate_component(this);
	loop.call_soon(this._Component__check_not_active);
	return this;
};

$Component.__exit__ = function (type, value, traceback) {
	loop._deactivate_component(this);
	return null;
};

$Component.__properties__ = []
$Component.__reactions__ = []
$Component._comp_apply_property_values = function (values) {
	var name, setter, setter_name, stub1_seq, stub2_itr, stub3_tgt, stub4_seq, stub5_itr, stub6_tgt, value;
	this._Component__initial_mutation = true;
	stub1_seq = values;
	if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
	for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
		stub3_tgt = stub1_seq[stub2_itr];
		name = stub3_tgt[0]; value = stub3_tgt[1];
		this._mutate(name, value);
	}
	stub4_seq = values;
	if ((typeof stub4_seq === "object") && (!Array.isArray(stub4_seq))) { stub4_seq = Object.keys(stub4_seq);}
	for (stub5_itr = 0; stub5_itr < stub4_seq.length; stub5_itr += 1) {
		stub6_tgt = stub4_seq[stub5_itr];
		name = stub6_tgt[0]; value = stub6_tgt[1];
		setter_name = _pyfunc_op_add(((_pymeth_startswith.call(name, "_"))? ("_set") : ("set_")), name);
		setter = _pyfunc_getattr(this, setter_name, null);
		if ((setter !== null)) {
			if ((_pyfunc_getattr(setter, "is_autogenerated", null) === false)) {
				setter(value);
			}
		}
	}
	this._Component__initial_mutation = false;
	return null;
};

$Component._comp_stop_capturing_events = function () {
	var allow_reconnect, ev, events, stub1_seq, stub2_itr;
	events = this._Component__pending_events;
	this._Component__pending_events = null;
	allow_reconnect = false;
	stub1_seq = events;
	if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
	for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
		ev = stub1_seq[stub2_itr];
		if ((ev === null)) {
			allow_reconnect = true;
			continue;
		}
		ev.allow_reconnect = allow_reconnect;
		this.emit(ev.type, ev);
	}
	return null;
};

$Component._dispose = function () {
	var i, name, reactions, stub1_seq;
	this._disposed = true;
	if ((!"this_is_js()")) {
	}
	stub1_seq = this._Component__handlers;
	for (name in stub1_seq) {
		if (!stub1_seq.hasOwnProperty(name)){ continue; }
		reactions = stub1_seq[name];
		for (i = 0; i < reactions.length; i += 1) {
			((reactions[i][1])._clear_component_refs)(this);
		}
		while (reactions.length) {
			reactions.pop();
		}
	}
	for (i = 0; i < this.__reactions__.length; i += 1) {
		(_pyfunc_getattr(this, this.__reactions__[i]).dispose)();
	}
	return null;
};

$Component._mutate = function (prop_name, value, mutation, index) {
	var cname, err_2, err_4, ev, is_equal, old, private_name, validator_name, value2;
	mutation = (mutation === undefined) ? "set": mutation;
	index = (index === undefined) ? -1: index;
	if ((!(Object.prototype.toString.call(prop_name).slice(8,-1).toLowerCase() === 'string'))) {
		throw _pyfunc_op_error('TypeError', (_pymeth_format.call("_mutate's first arg must be str, not {}", Object.getPrototypeOf(prop_name))));
	}
	if ((!_pyfunc_op_contains(prop_name, this.__properties__))) {
		cname = Object.getPrototypeOf(this).__name__;
		throw _pyfunc_op_error('AttributeError', _pymeth_format.call("{} object has no property {!r}", cname, prop_name));
	}
	if ((loop.can_mutate(this) === false)) {
		throw _pyfunc_op_error('AttributeError', _pymeth_format.call("Trying to mutate property {} outside of an action or context.", prop_name));
	}
	private_name = ("_" + prop_name) + "_value";
	validator_name = ("_" + prop_name) + "_validate";
	old = _pyfunc_getattr(this, private_name);
	if (_pyfunc_op_equals(mutation, "set")) {
		value2 = _pyfunc_getattr(this, validator_name)(value);
		_pyfunc_setattr(this, private_name, value2);
		if (true) { /* if this_is_js() */
			is_equal = _pyfunc_op_equals(old, value2);
		}
		if ((this._Component__initial_mutation === true)) {
			old = value2;
			is_equal = false;
		}
		if ((!_pyfunc_truthy(is_equal))) {
			this.emit(prop_name, {new_value:value2, old_value:old, mutation:mutation});
			return true;
		}
	} else {
		ev = {};
		ev.objects = value;
		ev.mutation = mutation;
		ev.index = index;
		if ((Object.prototype.toString.call(old).slice(8,-1).toLowerCase() === 'object')) {
			if ((!_pyfunc_op_equals(index, (-1)))) {
				throw _pyfunc_op_error('IndexError', "For in-place dict mutations, the index is not used, and must be -1.");
			}
			mutate_dict(old, ev);
		} else {
			if ((index < 0)) {
				throw _pyfunc_op_error('IndexError', "For insert, remove, and replace mutations, the index must be >= 0.");
			}
			mutate_array(old, ev);
		}
		this.emit(prop_name, ev);
		return true;
	}
	return null;
};

$Component._register_reaction = function (event_type, reaction, force) {
	var _, comp1, comp2, i, label, msg, reactions, stub1_, stub2_els, t, type;
	force = (force === undefined) ? false: force;
	stub1_ = _pymeth_partition.call(event_type, ":");
	type = stub1_[0];_ = stub1_[1];label = stub1_[2];
	label = _pyfunc_truthy(label) || reaction._name;
	reactions = _pymeth_get.call(this._Component__handlers, type, null);
	if ((reactions === null)) {
		reactions = [];
		this._Component__handlers[type] = reactions;
		if (_pyfunc_truthy(force)) {
		} else if (_pymeth_startswith.call(type, "mouse_")) {
			t = "The event \"{}\" has been renamed to \"pointer{}\".";
			logger.warning(_pymeth_format.call(t, type, type.slice(5)));
		} else {
			msg = ("Event type \"{type}\" does not exist on component {id}. ") + ("Use \"!{type}\" or \"!xx.yy.{type}\" to suppress this warning.");
			msg = _pymeth_replace.call(_pymeth_replace.call(msg, "{type}", type), "{id}", this._id);
			logger.warning(msg);
		}
	}
	comp1 = (label + "-") + reaction._id;
	stub2_els = true;
	for (i = 0; i < reactions.length; i += 1) {
		comp2 = ((reactions[i][0]) + "-") + ((reactions[i][1])._id);
		if ((comp1 < comp2)) {
			_pymeth_insert.call(reactions, i, [label, reaction]);
			stub2_els = false; break;
		} else if (_pyfunc_op_equals(comp1, comp2)) {
			stub2_els = false; break;
		}
	} if (stub2_els) {
		_pymeth_append.call(reactions, [label, reaction]);
	}
	this._registered_reactions_hook();
	return null;
};

$Component._registered_reactions_hook = function () {
	var key, reactions, stub1_seq, used_event_types;
	used_event_types = [];
	stub1_seq = this._Component__handlers;
	for (key in stub1_seq) {
		if (!stub1_seq.hasOwnProperty(key)){ continue; }
		reactions = stub1_seq[key];
		if ((reactions.length > 0)) {
			_pymeth_append.call(used_event_types, key);
		}
	}
	return used_event_types;
};

$Component.disconnect = function (type, reaction) {
	var _, entry, i, label, reactions, stub1_;
	reaction = (reaction === undefined) ? null: reaction;
	stub1_ = _pymeth_partition.call(type, ":");
	type = stub1_[0];_ = stub1_[1];label = stub1_[2];
	reactions = _pymeth_get.call(this._Component__handlers, type, []);
	for (i = reactions.length - 1; i > -1; i += -1) {
		entry = reactions[i];
		if ((!(((_pyfunc_truthy(label) && ((!_pyfunc_op_equals(label, entry[0]))))) || (_pyfunc_truthy(reaction) && (reaction !== entry[1]))))) {
			_pymeth_pop.call(reactions, i);
		}
	}
	this._registered_reactions_hook();
	return null;
};

$Component.dispose = function () {
	this._dispose();
	return null;
};

$Component.emit = function (type, info) {
	var _, err_2, ev, i, index, label, reaction, reactions, stub1_, stub2_;
	info = (info === undefined) ? null: info;
	info = ((info === null))? (({})) : (info);
	stub1_ = _pymeth_partition.call(type, ":");
	type = stub1_[0];_ = stub1_[1];label = stub1_[2];
	if (label.length) {
		throw _pyfunc_op_error('ValueError', "The type given to emit() should not include a label.");
	}
	if ((!(Object.prototype.toString.call(info).slice(8,-1).toLowerCase() === 'object'))) {
		throw _pyfunc_op_error('TypeError', (_pymeth_format.call("Info object (for {!r}) must be a dict, not {!r}", type, info)));
	}
	ev = _pyfunc_dict(info);
	ev.type = type;
	ev.source = this;
	if ((this._Component__pending_events !== null)) {
		_pymeth_append.call(this._Component__pending_events, ev);
	} else {
		reactions = _pymeth_get.call(this._Component__handlers, ev.type, []);
		for (i = 0; i < reactions.length; i += 1) {
			stub2_ = reactions[i];
			label = stub2_[0];reaction = stub2_[1];
			if (_pymeth_startswith.call(label, "reconnect_")) {
				if ((_pyfunc_getattr(ev, "allow_reconnect", true) === true)) {
					index = _pyfunc_int((_pymeth_split.call(label, "_")[1]));
					reaction.reconnect(index);
				}
			} else {
				loop.add_reaction_event(reaction, ev);
			}
		}
	}
	return ev;
};

$Component.get_event_handlers = function (type) {
	var _, err_2, label, reactions, stub1_;
	if ((!_pyfunc_truthy(type))) {
		throw _pyfunc_op_error('TypeError', ("get_event_handlers() missing \"type\" argument."));
	}
	stub1_ = _pymeth_partition.call(type, ":");
	type = stub1_[0];_ = stub1_[1];label = stub1_[2];
	if (label.length) {
		throw _pyfunc_op_error('ValueError', "The type given to get_event_handlers() should not include a label.");
	}
	reactions = _pymeth_get.call(this._Component__handlers, type, []);
	return (function list_comprehension (iter0) {var res = [];var h, i0;if ((typeof iter0 === "object") && (!Array.isArray(iter0))) {iter0 = Object.keys(iter0);}for (i0=0; i0<iter0.length; i0++) {h = iter0[i0];{res.push(h[1]);}}return res;}).call(this, reactions);
};

$Component.get_event_types = function () {
	var types;
	types = _pyfunc_list(this._Component__handlers);
	_pymeth_sort.call(types, undefined, false);
	return types;
};

$Component.init = function () {
	return null;
};
var Property = function () {};
Property.prototype._validate = function(value, name, data) {return value;};
var AnyProp;
AnyProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
AnyProp.prototype = Object.create(Property.prototype);
AnyProp.prototype._base_class = Property.prototype;
AnyProp.prototype.__name__ = "AnyProp";


var BoolProp;
BoolProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
BoolProp.prototype = Object.create(Property.prototype);
BoolProp.prototype._base_class = Property.prototype;
BoolProp.prototype.__name__ = "BoolProp";

BoolProp.prototype._default = false;
BoolProp.prototype._validate = function (value, name, data) {
	return _pyfunc_bool(value);
};


var ColorProp;
ColorProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
ColorProp.prototype = Object.create(Property.prototype);
ColorProp.prototype._base_class = Property.prototype;
ColorProp.prototype.__name__ = "ColorProp";

ColorProp.prototype._default = "#000";
ColorProp.prototype._validate = function (value, name, data) {
	var M, Mi, blackfactor, common_colors, d, err_2, err_3, hex, i, stub10_, stub10_c, stub10_i0, stub10_iter0, stub1_, stub2_, stub3_, stub4_, stub5_, stub5_i, stub5_i0, stub5_iter0, stub6_, stub6_i, stub6_i0, stub6_iter0, stub7_, stub7_i0, stub7_iter0, stub7_x, stub8_, stub8_i0, stub8_iter0, stub8_v, stub9_, stub9_i0, stub9_iter0, stub9_v, val, whitefactor;
	val = value;
	common_colors = ({k: "#000000", black: "#000000", w: "#ffffff", white: "#ffffff", r: "#ff0000", red: "#ff0000", g: "#00ff00", green: "#00ff00", lime: "#00ff00", b: "#0000ff", blue: "#0000ff", y: "#ffff00", yellow: "#ffff00", m: "#ff00ff", magenta: "#ff00ff", fuchsia: "#ff00ff", c: "#00ffff", cyan: "#00ffff", aqua: "#00ffff", gray: "#808080", grey: "#808080"});
	common_colors[""] = "#0000";
	M = _pyfunc_create_dict("0", 0, "1", 1, "2", 2, "3", 3, "4", 4, "5", 5, "6", 6, "7", 7, "8", 8, "9", 9, "a", 10, "b", 11, "c", 12, "d", 13, "e", 14, "f", 15);
	Mi = "0123456789abcdef";
	if ((Object.prototype.toString.call(val).slice(8,-1).toLowerCase() === 'string')) {
		val = _pymeth_lower.call(val);
		whitefactor = 0.0;
		blackfactor = 0.0;
		if (_pymeth_startswith.call(val, "darker")) {
			stub1_ = [0.66, val.slice(6)];
			blackfactor = stub1_[0];val = stub1_[1];
		} else if (_pymeth_startswith.call(val, "dark")) {
			stub2_ = [0.33, val.slice(4)];
			blackfactor = stub2_[0];val = stub2_[1];
		} else if (_pymeth_startswith.call(val, "lighter")) {
			stub3_ = [0.66, val.slice(7)];
			whitefactor = stub3_[0];val = stub3_[1];
		} else if (_pymeth_startswith.call(val, "light")) {
			stub4_ = [0.33, val.slice(5)];
			whitefactor = stub4_[0];val = stub4_[1];
		}
		val = _pymeth_get.call(common_colors, val, val);
		if ((((_pymeth_startswith.call(val, "#") && (val.length == 4))) || (val.length == 5))) {
			stub5_ = [];stub5_iter0 = _pyfunc_range(1, val.length, 1);if ((typeof stub5_iter0 === "object") && (!Array.isArray(stub5_iter0))) {stub5_iter0 = Object.keys(stub5_iter0);}for (stub5_i0=0; stub5_i0<stub5_iter0.length; stub5_i0++) {stub5_i = stub5_iter0[stub5_i0];{stub5_.push(_pyfunc_op_mult(_pymeth_get.call(M, val[stub5_i], 0), 17));}}
			val = stub5_;
		} else if ((((_pymeth_startswith.call(val, "#") && (val.length == 7))) || (val.length == 9))) {
			stub6_ = [];stub6_iter0 = _pyfunc_range(1, val.length, 2);if ((typeof stub6_iter0 === "object") && (!Array.isArray(stub6_iter0))) {stub6_iter0 = Object.keys(stub6_iter0);}for (stub6_i0=0; stub6_i0<stub6_iter0.length; stub6_i0++) {stub6_i = stub6_iter0[stub6_i0];{stub6_.push(_pyfunc_op_add((_pyfunc_op_mult(_pymeth_get.call(M, val[stub6_i], 0), 16)), _pymeth_get.call(M, val[stub6_i + 1], 0)));}}
			val = stub6_;
		} else if (_pyfunc_truthy(_pymeth_startswith.call(val, "rgb(") || _pymeth_startswith.call(val, "rgba("))) {
			stub7_ = [];stub7_iter0 = _pymeth_split.call(val.slice(4,-1), ",");if ((typeof stub7_iter0 === "object") && (!Array.isArray(stub7_iter0))) {stub7_iter0 = Object.keys(stub7_iter0);}for (stub7_i0=0; stub7_i0<stub7_iter0.length; stub7_i0++) {stub7_x = stub7_iter0[stub7_i0];{stub7_.push(_pyfunc_float((_pymeth_strip.call(stub7_x, " ,();"))));}}
			val = stub7_;
			if ((val.length == 4)) {
				val[val.length -1] = _pyfunc_op_mult(val[val.length -1], 255);
			}
		} else {
			throw _pyfunc_op_error('ValueError', _pymeth_format.call("ColorProp {!r} got invalid color: {!r}", name, value));
		}
		stub8_ = [];stub8_iter0 = val;if ((typeof stub8_iter0 === "object") && (!Array.isArray(stub8_iter0))) {stub8_iter0 = Object.keys(stub8_iter0);}for (stub8_i0=0; stub8_i0<stub8_iter0.length; stub8_i0++) {stub8_v = stub8_iter0[stub8_i0];{stub8_.push(stub8_v / 255);}}
		val = stub8_;
		for (i = 0; i < 3; i += 1) {
			val[i] = _pyfunc_op_add((_pyfunc_op_mult((1.0 - whitefactor), val[i])), whitefactor);
			val[i] = (_pyfunc_op_mult((1.0 - blackfactor), val[i])) + 0;
		}
	}
	if ((val === null)) {
		val = [0, 0, 0, 0];
	} else if ((((Object.prototype.toString.call(val).slice(8,-1).toLowerCase() === 'object')) && _pyfunc_op_contains("t", val))) {
		val = val["t"];
	}
	if ((!Array.isArray(val))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("ColorProp {!r} value must be str or tuple.", name));
	}
	stub9_ = [];stub9_iter0 = val;if ((typeof stub9_iter0 === "object") && (!Array.isArray(stub9_iter0))) {stub9_iter0 = Object.keys(stub9_iter0);}for (stub9_i0=0; stub9_i0<stub9_iter0.length; stub9_i0++) {stub9_v = stub9_iter0[stub9_i0];{stub9_.push(Math.max((Math.min(_pyfunc_float(stub9_v), 1.0)), 0.0));}}
	val = stub9_;
	if ((val.length == 3)) {
		val = _pyfunc_op_add(val, [1.0]);
	} else if (_pyfunc_truthy(val.length != 4)) {
		throw _pyfunc_op_error('ValueError', _pymeth_format.call("ColorProp {!r} value must have 3 or 4 elements, not {:i}", name, val.length));
	}
	val = _pyfunc_list(val);
	if (true) { /* if this_is_js() */
		val.push = undefined;
		val.splice = undefined;
		val.push = undefined;
		val.reverse = undefined;
		val.sort = undefined;
	}
	if (true) { /* if this_is_js() */
		d = ({});
	}
	d.t = val;
	d.alpha = val[3];
	stub10_ = [];stub10_iter0 = val.slice(0,3);if ((typeof stub10_iter0 === "object") && (!Array.isArray(stub10_iter0))) {stub10_iter0 = Object.keys(stub10_iter0);}for (stub10_i0=0; stub10_i0<stub10_iter0.length; stub10_i0++) {stub10_c = stub10_iter0[stub10_i0];{stub10_.push(_pyfunc_int(_pyfunc_op_mult(stub10_c, 255)));}}
	hex = stub10_;
	d.hex = "#" + (_pymeth_join.call("", ((function list_comprehension (iter0) {var res = [];var c, i0;if ((typeof iter0 === "object") && (!Array.isArray(iter0))) {iter0 = Object.keys(iter0);}for (i0=0; i0<iter0.length; i0++) {c = iter0[i0];{res.push(_pyfunc_op_add(Mi[_pyfunc_int((c / 16))], Mi[c % 16]));}}return res;}).call(this, hex))));
	d.css = _pymeth_format.call("rgba({:.0f},{:.0f},{:.0f},{:g})", _pyfunc_op_mult(val[0], 255), _pyfunc_op_mult(val[1], 255), _pyfunc_op_mult(val[2], 255), val[3]);
	return d;
};


var ComponentProp;
ComponentProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
ComponentProp.prototype = Object.create(Property.prototype);
ComponentProp.prototype._base_class = Property.prototype;
ComponentProp.prototype.__name__ = "ComponentProp";

ComponentProp.prototype._default = null;
ComponentProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((!((value === null) || _pyfunc_hasattr(value, "_IS_COMPONENT")))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("Component property {!r} cannot accept {!r}.", name, value));
	}
	return value;
};


var DictProp;
DictProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
DictProp.prototype = Object.create(Property.prototype);
DictProp.prototype._base_class = Property.prototype;
DictProp.prototype.__name__ = "DictProp";

DictProp.prototype._default = ({});
DictProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((!(Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'object'))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("Dict property {!r} cannot accept {!r}.", name, value));
	}
	return _pymeth_copy.call(value);
};


var EnumProp;
EnumProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
EnumProp.prototype = Object.create(Property.prototype);
EnumProp.prototype._base_class = Property.prototype;
EnumProp.prototype.__name__ = "EnumProp";

EnumProp.prototype._default = "";
EnumProp.prototype._consume_args = function (options) {
	var args, err_2;
	args = Array.prototype.slice.call(arguments, 1);
	if ((!Array.isArray(options))) {
		throw _pyfunc_op_error('TypeError', "EnumProp needs list of options");
	}
	if ((!(_pyfunc_all(((function list_comprehension (iter0) {var res = [];var i, i0;if ((typeof iter0 === "object") && (!Array.isArray(iter0))) {iter0 = Object.keys(iter0);}for (i0=0; i0<iter0.length; i0++) {i = iter0[i0];{res.push(Object.prototype.toString.call(i).slice(8,-1).toLowerCase() === 'string');}}return res;}).call(this, options)))))) {
		throw _pyfunc_op_error('TypeError', "EnumProp options must be str");
	}
	if ((!_pyfunc_truthy(args))) {
		args = [options[0]];
	}
	this._set_data((function list_comprehension (iter0) {var res = [];var option, i0;if ((typeof iter0 === "object") && (!Array.isArray(iter0))) {iter0 = Object.keys(iter0);}for (i0=0; i0<iter0.length; i0++) {option = iter0[i0];{res.push(_pymeth_upper.call(option));}}return res;}).call(this, options));
	EnumProp.prototype._base_class._consume_args.apply(this, args);
	return null;
};

EnumProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((!(Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'string'))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("EnumProp {!r} value must be str.", name));
	}
	value = _pymeth_upper.call(value);
	if ((!_pyfunc_op_contains(_pymeth_upper.call(value), data))) {
		throw _pyfunc_op_error('ValueError', _pymeth_format.call("Invalid value for enum {!r}: {}", name, value));
	}
	return value;
};


var FloatPairProp;
FloatPairProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
FloatPairProp.prototype = Object.create(Property.prototype);
FloatPairProp.prototype._base_class = Property.prototype;
FloatPairProp.prototype.__name__ = "FloatPairProp";

FloatPairProp.prototype._default = [0.0, 0.0];
FloatPairProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((!Array.isArray(value))) {
		value = [value, value];
	}
	if (_pyfunc_truthy(value.length != 2)) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("FloatPair property {!r} needs a scalar or two values, not {:i}", name, value.length));
	}
	if ((!(Object.prototype.toString.call(value[0]).slice(8,-1).toLowerCase() === 'number'))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("FloatPair {!r} 1st value cannot be {!r}.", name, value[0]));
	}
	if ((!(Object.prototype.toString.call(value[1]).slice(8,-1).toLowerCase() === 'number'))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("FloatPair {!r} 2nd value cannot be {!r}.", name, value[1]));
	}
	value = [_pyfunc_float(value[0]), _pyfunc_float(value[1])];
	if (true) { /* if this_is_js() */
		value.push = undefined;
		value.splice = undefined;
		value.push = undefined;
		value.reverse = undefined;
		value.sort = undefined;
	}
	return value;
};


var FloatProp;
FloatProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
FloatProp.prototype = Object.create(Property.prototype);
FloatProp.prototype._base_class = Property.prototype;
FloatProp.prototype.__name__ = "FloatProp";

FloatProp.prototype._default = 0.0;
FloatProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((((Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'number')) || (Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'string'))) {
		return _pyfunc_float(value);
	} else {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("Float property {!r} cannot accept {!r}.", name, value));
	}
	return null;
};


var IntProp;
IntProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
IntProp.prototype = Object.create(Property.prototype);
IntProp.prototype._base_class = Property.prototype;
IntProp.prototype.__name__ = "IntProp";

IntProp.prototype._default = 0;
IntProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((((Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'number')) || ((Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'boolean')) || (Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'string'))) {
		return _pyfunc_int(value);
	} else {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("Int property {!r} cannot accept {!r}.", name, value));
	}
	return null;
};


var ListProp;
ListProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
ListProp.prototype = Object.create(Property.prototype);
ListProp.prototype._base_class = Property.prototype;
ListProp.prototype.__name__ = "ListProp";

ListProp.prototype._default = [];
ListProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((!Array.isArray(value))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("List property {!r} cannot accept {!r}.", name, value));
	}
	return _pyfunc_list(value);
};


var StringProp;
StringProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
StringProp.prototype = Object.create(Property.prototype);
StringProp.prototype._base_class = Property.prototype;
StringProp.prototype.__name__ = "StringProp";

StringProp.prototype._default = "";
StringProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((!(Object.prototype.toString.call(value).slice(8,-1).toLowerCase() === 'string'))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("String property {!r} cannot accept {!r}.", name, value));
	}
	return value;
};


var TriStateProp;
TriStateProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
TriStateProp.prototype = Object.create(Property.prototype);
TriStateProp.prototype._base_class = Property.prototype;
TriStateProp.prototype.__name__ = "TriStateProp";

TriStateProp.prototype._default = null;
TriStateProp.prototype._validate = function (value, name, data) {
	if ((value === null)) {
		return null;
	}
	return _pyfunc_bool(value);
};


var TupleProp;
TupleProp = function () {
	_pyfunc_op_instantiate(this, arguments);
}
TupleProp.prototype = Object.create(Property.prototype);
TupleProp.prototype._base_class = Property.prototype;
TupleProp.prototype.__name__ = "TupleProp";

TupleProp.prototype._default = [];
TupleProp.prototype._validate = function (value, name, data) {
	var err_2;
	if ((!Array.isArray(value))) {
		throw _pyfunc_op_error('TypeError', _pymeth_format.call("Tuple property {!r} cannot accept {!r}.", name, value));
	}
	value = _pyfunc_list(value);
	if (true) { /* if this_is_js() */
		value.push = undefined;
		value.splice = undefined;
		value.push = undefined;
		value.reverse = undefined;
		value.sort = undefined;
	}
	return value;
};


var event = {}; // convenience "module emulator"
event.Property = Property;
event.AnyProp = AnyProp;
event.BoolProp = BoolProp;
event.ColorProp = ColorProp;
event.ComponentProp = ComponentProp;
event.DictProp = DictProp;
event.EnumProp = EnumProp;
event.FloatPairProp = FloatPairProp;
event.FloatProp = FloatProp;
event.IntProp = IntProp;
event.ListProp = ListProp;
event.StringProp = StringProp;
event.TriStateProp = TriStateProp;
event.TupleProp = TupleProp;

return {Component: Component, loop: loop, logger: logger, Property: Property, AnyProp: AnyProp, BoolProp: BoolProp, TriStateProp: TriStateProp, IntProp: IntProp, FloatProp: FloatProp, StringProp: StringProp, TupleProp: TupleProp, ListProp: ListProp, DictProp: DictProp, ComponentProp: ComponentProp, FloatPairProp: FloatPairProp, EnumProp: EnumProp, ColorProp: ColorProp};
});


/* ======================= flexx.app._clientcore ========================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */



flexx.define("flexx.app._clientcore", ["pscript-std.js"], function (_py) {

"use strict";

var _pyfunc_format = _py._pyfunc_format, _pyfunc_op_add = _py._pyfunc_op_add, _pyfunc_op_contains = _py._pyfunc_op_contains, _pyfunc_op_equals = _py._pyfunc_op_equals, _pyfunc_op_error = _py._pyfunc_op_error, _pyfunc_op_instantiate = _py._pyfunc_op_instantiate, _pyfunc_range = _py._pyfunc_range, _pyfunc_reversed = _py._pyfunc_reversed, _pyfunc_str = _py._pyfunc_str, _pyfunc_time = _py._pyfunc_time, _pyfunc_truthy = _py._pyfunc_truthy;

var _pymeth_count = _py._pymeth_count, _pymeth_format = _py._pymeth_format, _pymeth_get = _py._pymeth_get, _pymeth_join = _py._pymeth_join, _pymeth_pop = _py._pymeth_pop, _pymeth_replace = _py._pymeth_replace, _pymeth_split = _py._pymeth_split, _pymeth_splitlines = _py._pymeth_splitlines;





var Flexx, JsSession, __pscript__, bsdf, serializer;
"\nThe client's core Flexx engine, implemented in PScript.\n";
__pscript__ = true;
Flexx = function () {
    _pyfunc_op_instantiate(this, arguments);
}
Flexx.prototype._base_class = Object;
Flexx.prototype.__name__ = "Flexx";

Flexx.prototype.__init__ = function () {
    var err_2, key, stub1_seq;
    if (_pyfunc_truthy(window.flexx.init)) {
        throw _pyfunc_op_error('RuntimeError', "Should not create global Flexx object more than once.");
    }
    this.is_notebook = false;
    this.is_exported = false;
    stub1_seq = window.flexx;
    for (key in stub1_seq) {
        if (!stub1_seq.hasOwnProperty(key)){ continue; }
        this[key] = window.flexx[key];
    }
    this.need_main_widget = true;
    this._session_count = 0;
    this.sessions = ({});
    window.addEventListener("load", this.init, false);
    window.addEventListener("unload", this.exit, false);
    return null;
};

Flexx.prototype.init = function () {
    this.asset_node = window.document.createElement("div");
    this.asset_node.id = "Flexx asset container";
    window.document.body.appendChild(this.asset_node);
    if (_pyfunc_truthy(this.is_exported)) {
        if (_pyfunc_truthy(this.is_notebook)) {
            console.log("Flexx: I am in an exported notebook!");
        } else {
            console.log("Flexx: I am in an exported app!");
            this.run_exported_app();
        }
    } else {
        console.log("Flexx: Initializing");
        if ((!_pyfunc_truthy(this.is_notebook))) {
            this._remove_querystring();
        }
        this.init_logging();
    }
    return null;
};

Flexx.prototype._remove_querystring = function () {
    try {
        window.history.replaceState(window.history.state, "", window.location.pathname);
    } catch(err_2) {
        {
        }
    }
    return null;
};

Flexx.prototype.exit = function () {
    var session, stub2_seq;
    stub2_seq = this.sessions;
    for (session in stub2_seq) {
        if (!stub2_seq.hasOwnProperty(session)){ continue; }
        session = stub2_seq[session];
        session.exit();
    }
    return null;
};

Flexx.prototype.spin = function (n) {
    n = (n === undefined) ? 1: n;
    var el = window.document.getElementById('flexx-spinner');
    if (el) {
        if (n === null) {  // Hide the spinner overlay, now or in a bit
            if (el.children[0].innerHTML.indexOf('limited') > 0) {
                setTimeout(function() { el.style.display = 'none'; }, 2000);
            } else {
                el.style.display = 'none';
            }
        } else {
            for (var i=0; i<n; i++) { el.children[1].innerHTML += '&#9632'; }
        }
    };
    return null;
};

Flexx.prototype.init_logging = function () {
    var error, info, log, on_error, warn;
    if (_pyfunc_truthy(window.console.ori_log)) {
        return null;
    }
    window.console.ori_log = window.console.log;
    window.console.ori_info = _pyfunc_truthy(window.console.info) || window.console.log;
    window.console.ori_warn = _pyfunc_truthy(window.console.warn) || window.console.log;
    window.console.ori_error = _pyfunc_truthy(window.console.error) || window.console.log;
    log = (function flx_log (msg) {
        var session, stub3_seq;
        window.console.ori_log(msg);
        stub3_seq = this.sessions;
        for (session in stub3_seq) {
            if (!stub3_seq.hasOwnProperty(session)){ continue; }
            session = stub3_seq[session];
            session.send_command("PRINT", _pyfunc_str(msg));
        }
        return null;
    }).bind(this);

    info = (function flx_info (msg) {
        var session, stub4_seq;
        window.console.ori_info(msg);
        stub4_seq = this.sessions;
        for (session in stub4_seq) {
            if (!stub4_seq.hasOwnProperty(session)){ continue; }
            session = stub4_seq[session];
            session.send_command("INFO", _pyfunc_str(msg));
        }
        return null;
    }).bind(this);

    warn = (function flx_warn (msg) {
        var session, stub5_seq;
        window.console.ori_warn(msg);
        stub5_seq = this.sessions;
        for (session in stub5_seq) {
            if (!stub5_seq.hasOwnProperty(session)){ continue; }
            session = stub5_seq[session];
            session.send_command("WARN", _pyfunc_str(msg));
        }
        return null;
    }).bind(this);

    error = (function flx_error (msg) {
        var evt;
        evt = {message:_pyfunc_str(msg), error:msg, preventDefault:((function () {return null;}).bind(this))};
        on_error(evt);
        return null;
    }).bind(this);

    on_error = (function flx_on_error (evt) {
        this._handle_error(evt);
        return null;
    }).bind(this);

    on_error = on_error.bind(this);
    window.console.log = log;
    window.console.info = info;
    window.console.warn = warn;
    window.console.error = error;
    window.addEventListener("error", on_error, false);
    return null;
};

Flexx.prototype.create_session = function (app_name, session_id, ws_url) {
    var s;
    if ((_pyfunc_truthy(window.performance) && _pyfunc_op_equals(window.performance.navigation.type, 2))) {
        window.location.reload();
    } else if (_pyfunc_truthy(this._validate_browser_capabilities())) {
        s = new JsSession(app_name, session_id, ws_url);
        this._session_count += 1;
        this["s" + this._session_count] = s;
        this.sessions[session_id] = s;
    }
    return null;
};

Flexx.prototype._validate_browser_capabilities = function () {
    var el = window.document.getElementById('flexx-spinner');
    if (    window.WebSocket === undefined || // IE10+
            Object.keys === undefined || // IE9+
            false
       ) {
        var msg = ('Flexx does not support this browser.<br>' +
                   'Try Firefox, Chrome, ' +
                   'or a more recent version of the current browser.');
        if (el) { el.children[0].innerHTML = msg; }
        else { window.alert(msg); }
        return false;
    } else if (''.startsWith === undefined) { // probably IE
        var msg = ('Flexx support for this browser is limited.<br>' +
                   'Consider using Firefox, Chrome, or maybe Edge.');
        if (el) { el.children[0].innerHTML = msg; }
        return true;
    } else {
        return true;
    };
    return null;
};

Flexx.prototype._handle_error = function (evt) {
    var i, msg, session, session_needle, short_msg, stack, stub10_seq, stub11_itr, stub12_seq, stub13_itr, stub14_seq, stub6_seq, stub7_itr, stub8_seq, stub9_itr, x;
    msg = short_msg = evt.message;
    if ((!_pyfunc_truthy(window.evt))) {
        window.evt = evt;
    }
    if ((_pyfunc_truthy(evt.error) && _pyfunc_truthy(evt.error.stack))) {
        stack = _pymeth_splitlines.call(evt.error.stack);
        session_needle = "?session_id=" + this.id;
        for (i = 0; i < stack.length; i += 1) {
            stack[i] = _pymeth_replace.call(_pymeth_replace.call(stack[i], "@", " @ "), session_needle, "");
        }
        stub6_seq = [evt.message, "_pyfunc_op_error"];
        if ((typeof stub6_seq === "object") && (!Array.isArray(stub6_seq))) { stub6_seq = Object.keys(stub6_seq);}
        for (stub7_itr = 0; stub7_itr < stub6_seq.length; stub7_itr += 1) {
            x = stub6_seq[stub7_itr];
            if (_pyfunc_op_contains(x, stack[0])) {
                _pymeth_pop.call(stack, 0);
            }
        }
        for (i = 0; i < stack.length; i += 1) {
            stub8_seq = ["_process_actions", "_process_reactions", "_process_calls"];
            if ((typeof stub8_seq === "object") && (!Array.isArray(stub8_seq))) { stub8_seq = Object.keys(stub8_seq);}
            for (stub9_itr = 0; stub9_itr < stub8_seq.length; stub9_itr += 1) {
                x = stub8_seq[stub9_itr];
                if ((_pyfunc_op_contains(("Loop." + x), stack[i]))) {
                    stack = stack.slice(0,i);
                    break;
                }
            }
        }
        stub12_seq = _pyfunc_reversed(_pyfunc_range(0, stack.length, 1));
        if ((typeof stub12_seq === "object") && (!Array.isArray(stub12_seq))) { stub12_seq = Object.keys(stub12_seq);}
        for (stub13_itr = 0; stub13_itr < stub12_seq.length; stub13_itr += 1) {
            i = stub12_seq[stub13_itr];
            stub10_seq = ["flx_action "];
            if ((typeof stub10_seq === "object") && (!Array.isArray(stub10_seq))) { stub10_seq = Object.keys(stub10_seq);}
            for (stub11_itr = 0; stub11_itr < stub10_seq.length; stub11_itr += 1) {
                x = stub10_seq[stub11_itr];
                if ((_pyfunc_truthy(stack[i]) && _pymeth_count.call(stack[i], x))) {
                    _pymeth_pop.call(stack, i);
                }
            }
        }
        msg = _pyfunc_op_add(msg, "\n" + _pymeth_join.call("\n", stack));
    } else if ((_pyfunc_truthy(evt.message) && _pyfunc_truthy(evt.lineno))) {
        msg = _pyfunc_op_add(msg, _pymeth_format.call("\nIn {}:{:i}", evt.filename, evt.lineno));
    }
    evt.preventDefault();
    window.console.ori_error(msg);
    stub14_seq = this.sessions;
    for (session in stub14_seq) {
        if (!stub14_seq.hasOwnProperty(session)){ continue; }
        session = stub14_seq[session];
        session.send_command("ERROR", short_msg);
    }
    return null;
};


JsSession = function () {
    _pyfunc_op_instantiate(this, arguments);
}
JsSession.prototype._base_class = Object;
JsSession.prototype.__name__ = "JsSession";

JsSession.prototype.__init__ = function (app_name, id, ws_url) {
    var config, err, jconfig;
    ws_url = (ws_url === undefined) ? null: ws_url;
    this.app = null;
    this.app_name = app_name;
    this.id = id;
    this.status = 1;
    this.ws_url = ws_url;
    this._component_counter = 0;
    this._disposed_ob = ({_disposed: true});
    if ((!_pyfunc_truthy(this.id))) {
        jconfig = window.document.getElementById("jupyter-config-data");
        if (_pyfunc_truthy(jconfig)) {
            try {
                config = JSON.parse(jconfig.innerText);
                this.id = config.flexx_session_id;
                this.app_name = config.flexx_app_name;
            } catch(err_4) {
                {
                    err = err_4;
                    console.log(err);
                }
            }
        }
    }
    this._init_time = _pyfunc_time();
    this._pending_commands = [];
    this._asset_count = 0;
    this._ws = null;
    this.last_msg = null;
    this.instances = ({});
    this.instances_to_check_size = ({});
    if ((!_pyfunc_truthy(window.flexx.is_exported))) {
        this.init_socket();
    }
    window.addEventListener("resize", this._check_size_of_objects, false);
    window.setInterval(this._check_size_of_objects, 1000);
    return null;
};

JsSession.prototype.exit = function () {
    if (_pyfunc_truthy(this._ws)) {
        this._ws.close();
        this._ws = null;
        this.status = 0;
    }
    return null;
};

JsSession.prototype.send_command = function () {
    var bb, command, err;
    command = Array.prototype.slice.call(arguments);
    if ((this._ws !== null)) {
        try {
            bb = serializer.encode(command);
        } catch(err_3) {
            {
                err = err_3;
                console.log("Command that failed to encode:");
                console.log(command);
                throw err;
            }
        }
        this._ws.send(bb);
    }
    return null;
};

JsSession.prototype.instantiate_component = function (module, cname, id, args, kwargs, active_components) {
    var Cls, ac, c, m, stub15_seq, stub16_itr, stub17_seq, stub18_itr;
    c = _pymeth_get.call(this.instances, id, null);
    if (((c !== null) && (c._disposed === false))) {
        return c;
    }
    m = window.flexx.require(module);
    Cls = m[cname];
    kwargs["flx_session"] = this;
    kwargs["flx_id"] = id;
    active_components = _pyfunc_truthy(active_components) || [];
    stub15_seq = active_components;
    if ((typeof stub15_seq === "object") && (!Array.isArray(stub15_seq))) { stub15_seq = Object.keys(stub15_seq);}
    for (stub16_itr = 0; stub16_itr < stub15_seq.length; stub16_itr += 1) {
        ac = stub15_seq[stub16_itr];
        ac.__enter__();
    }
    try {
        c = new Cls({flx_args: args, flx_kwargs: kwargs});
    } finally {
        stub17_seq = _pyfunc_reversed(active_components);
        if ((typeof stub17_seq === "object") && (!Array.isArray(stub17_seq))) { stub17_seq = Object.keys(stub17_seq);}
        for (stub18_itr = 0; stub18_itr < stub17_seq.length; stub18_itr += 1) {
            ac = stub17_seq[stub18_itr];
            ac.__exit__();
        }
    }
    return c;
};

JsSession.prototype._register_component = function (c, id) {
    id = (id === undefined) ? null: id;
    if ((this.app === null)) {
        this.app = c;
    }
    if ((id === null)) {
        this._component_counter += 1;
        id = ((c.__name__ + "_") + _pyfunc_str(this._component_counter)) + "js";
    }
    c._id = id;
    c._uid = (this.id + "_") + id;
    this.instances[c._id] = c;
    return null;
};

JsSession.prototype._unregister_component = function (c) {
    _pymeth_pop.call(this.instances_to_check_size, c.id, null);
    return null;
};

JsSession.prototype.get_component_instance = function (id) {
    if (_pyfunc_op_equals(id, "body")) {
        return window.document.body;
    } else {
        return _pymeth_get.call(this.instances, id, null);
    }
    return null;
};

JsSession.prototype.init_socket = function () {
    var WebSocket, address, err_2, on_ws_close, on_ws_error, on_ws_message, on_ws_open, proto, ws;
    WebSocket = window.WebSocket;
    if ((WebSocket === undefined)) {
        window.document.body.textContent = "Browser does not support WebSockets";
        throw "FAIL: need websocket";
    }
    if ((!_pyfunc_truthy(this.ws_url))) {
        proto = "ws";
        if (_pyfunc_op_equals(window.location.protocol, "https:")) {
            proto = "wss";
        }
        address = window.location.hostname;
        if (_pyfunc_truthy(window.location.port)) {
            address = _pyfunc_op_add(address, ":" + window.location.port);
        }
        this.ws_url = _pymeth_format.call("{}://{}/flexx/ws/{}", proto, address, this.app_name);
    }
    this.ws_url = _pymeth_replace.call(this.ws_url, "0.0.0.0", window.location.hostname);
    this._ws = ws = new WebSocket(this.ws_url);
    ws.binaryType = "arraybuffer";
    this.status = 2;
    on_ws_open = (function flx_on_ws_open (evt) {
        window.console.info("Socket opened with session id " + this.id);
        this.send_command("HI_FLEXX", this.id);
        return null;
    }).bind(this);

    on_ws_message = (function flx_on_ws_message (evt) {
        var msg;
        msg = evt.data;
        if ((!_pyfunc_truthy(msg))) {
        } else if ((this._pending_commands === null)) {
            this._receive_raw_command(msg);
        } else {
            if ((this._pending_commands.length == 0)) {
                window.setTimeout(this._process_commands, 0);
            }
            this._pending_commands.push(msg);
        }
        return null;
    }).bind(this);

    on_ws_close = (function flx_on_ws_close (evt) {
        var msg;
        this._ws = null;
        this.status = 0;
        msg = "Lost connection with server";
        if ((_pyfunc_truthy(evt) && _pyfunc_truthy(evt.reason))) {
            msg = _pyfunc_op_add(msg, _pymeth_format.call(": {} ({:i})", evt.reason, evt.code));
        }
        if ((!_pyfunc_truthy(window.flexx.is_notebook))) {
            window.document.body.textContent = msg;
        } else {
            window.console.info(msg);
        }
        return null;
    }).bind(this);

    on_ws_error = function (evt) {
        this._ws = null;
        this.status = 0;
        window.console.error("Socket error");
        return null;
    };

    ws.onopen = on_ws_open;
    ws.onmessage = on_ws_message;
    ws.onclose = on_ws_close;
    ws.onerror = on_ws_error;
    return null;
};

JsSession.prototype._process_commands = function () {
    var command, err, msg;
    while ((this._pending_commands !== null) && (this._pending_commands.length > 0)) {
        msg = _pymeth_pop.call(this._pending_commands, 0);
        try {
            command = this._receive_raw_command(msg);
        } catch(err_3) {
            {
                err = err_3;
                window.setTimeout(this._process_commands, 0);
                throw err;
            }
        }
        if (_pyfunc_op_equals(command[0], "DEFINE")) {
            this._asset_count += 1;
            if ((_pyfunc_op_equals((this._asset_count % 3), 0))) {
                if (this._pending_commands.length) {
                    window.setTimeout(this._process_commands, 0);
                }
                break;
            }
        }
    }
    return null;
};

JsSession.prototype._receive_raw_command = function (msg) {
    return this._receive_command(serializer.decode(msg));
};

JsSession.prototype._receive_command = function (command) {
    var address, args, c, cmd, code, el, err, eval_id, id, kind, name, ob, stub19_, stub20_, x;
    cmd = command[0];
    if (_pyfunc_op_equals(cmd, "PING")) {
        window.setTimeout(this.send_command, 10, "PONG", command[1]);
    } else if (_pyfunc_op_equals(cmd, "INIT_DONE")) {
        window.flexx.spin(null);
        while (this._pending_commands.length) {
            this._receive_raw_command(_pymeth_pop.call(this._pending_commands, 0));
        }
        this._pending_commands = null;
    } else if (_pyfunc_op_equals(cmd, "PRINT")) {
        (_pyfunc_truthy(window.console.ori_log) || window.console.log)(command[1]);
    } else if (_pyfunc_op_equals(cmd, "EXEC")) {
        eval(command[1]);
    } else if (_pyfunc_op_equals(cmd, "EVAL")) {
        x = null;
        if ((command.length == 2)) {
            x = eval(command[1]);
        } else if ((command.length == 3)) {
            x = eval((("this.instances." + command[1]) + ".") + command[2]);
        }
        console.log(_pyfunc_str(x));
    } else if (_pyfunc_op_equals(cmd, "EVALANDRETURN")) {
        try {
            x = eval(command[1]);
        } catch(err_3) {
            {
                err = err_3;
                x = _pyfunc_str(err);
            }
        }
        eval_id = command[2];
        this.send_command("EVALRESULT", x, eval_id);
    } else if (_pyfunc_op_equals(cmd, "INVOKE")) {
        stub19_ = command.slice(1);
        id = stub19_[0];name = stub19_[1];args = stub19_[2];
        ob = _pymeth_get.call(this.instances, id, null);
        if ((ob === null)) {
            console.warn(_pymeth_format.call("Cannot invoke {}.{}; session does not know it (anymore).", id, name));
        } else if ((ob._disposed === true)) {
        } else {
            ob[name].apply(ob, args);
        }
    } else if (_pyfunc_op_equals(cmd, "INSTANTIATE")) {
        this.instantiate_component.apply(this, command.slice(1));
    } else if (_pyfunc_op_equals(cmd, "DISPOSE")) {
        id = command[1];
        c = _pymeth_get.call(this.instances, id, null);
        if (((c !== null) && (c._disposed === false))) {
            c._dispose();
        }
        this.send_command("DISPOSE_ACK", command[1]);
        _pymeth_pop.call(this.instances, id, null);
    } else if (_pyfunc_op_equals(cmd, "DISPOSE_ACK")) {
        _pymeth_pop.call(this.instances, command[1], null);
    } else if (_pyfunc_op_equals(cmd, "DEFINE")) {
        stub20_ = command.slice(1);
        kind = stub20_[0];name = stub20_[1];code = stub20_[2];
        window.flexx.spin();
        address = (window.location.protocol + "//") + (_pymeth_split.call(this.ws_url, "/")[2]);
        code = _pyfunc_op_add(code, _pymeth_format.call("\n//# sourceURL={}/flexx/assets/shared/{}\n", address, name));
        if (_pyfunc_op_equals(kind, "JS-EVAL")) {
            eval(code);
        } else if (_pyfunc_op_equals(kind, "JS")) {
            el = window.document.createElement("script");
            el.id = name;
            el.innerHTML = code;
            window.flexx.asset_node.appendChild(el);
        } else if (_pyfunc_op_equals(kind, "CSS")) {
            el = window.document.createElement("style");
            el.type = "text/css";
            el.id = name;
            el.innerHTML = code;
            window.flexx.asset_node.appendChild(el);
        } else {
            window.console.error(((("Dont know how to DEFINE " + name) + (" with \"")) + kind) + ("\"."));
        }
    } else if (_pyfunc_op_equals(cmd, "OPEN")) {
        window.win1 = window.open(command[1], "new", "chrome");
    } else {
        window.console.error((("Invalid command: \"") + cmd) + ("\""));
    }
    return command;
};

JsSession.prototype.call_after_roundtrip = function (callback) {
    var args, ping_to_schedule_at;
    args = Array.prototype.slice.call(arguments, 1);
    ping_to_schedule_at = this._ping_counter + 1;
    if (((this._ping_calls.length == 0) || ((this._ping_calls[this._ping_calls.length -1][0]) < ping_to_schedule_at))) {
        window.setTimeout(this._send_ping, 0);
    }
    this._ping_calls.push([ping_to_schedule_at, callback, args]);
    return null;
};

JsSession.prototype._send_ping = function () {
    this._ping_counter += 1;
    this.send_command("PING", this._ping_counter);
    return null;
};

JsSession.prototype._receive_pong = function (count) {
    var _, args, callback, stub21_;
    while ((this._ping_calls.length > 0) && (((this._ping_calls[0][0]) <= count))) {
        stub21_ = _pymeth_pop.call(this._ping_calls, 0);
        _ = stub21_[0];callback = stub21_[1];args = stub21_[2];
        window.setTimeout.apply(window, [].concat([callback, 0], args));
    }
    return null;
};

JsSession.prototype.keep_checking_size_of = function (ob, check) {
    check = (check === undefined) ? true: check;
    if (_pyfunc_truthy(check)) {
        this.instances_to_check_size[ob.id] = ob;
    } else {
        _pymeth_pop.call(this.instances_to_check_size, ob.id, null);
    }
    return null;
};

JsSession.prototype._check_size_of_objects = function () {
    var ob, stub22_seq;
    stub22_seq = this.instances_to_check_size;
    for (ob in stub22_seq) {
        if (!stub22_seq.hasOwnProperty(ob)){ continue; }
        ob = stub22_seq[ob];
        if ((ob._disposed === false)) {
            ob.check_real_size();
        }
    }
    return null;
};


if (true) { /* if this_is_js() */
    window.flexx = new Flexx();
    bsdf = flexx.require('bsdf');
    serializer = new bsdf.BsdfSerializer();
    window.flexx.serializer = serializer;
}

return {Flexx: Flexx, JsSession: JsSession, bsdf: bsdf, serializer: serializer};
});


/* ======================= flexx.app._component2 ========================*/

/* Autogenerated code from Flexx. Code Subject to the BSD-2-clause license. */



flexx.define("flexx.app._component2", ["pscript-std.js", "flexx.event.js", "flexx.app._clientcore"], function (_py, event, flexx$app$_clientcore) {

"use strict";

var _pyfunc_format = _py._pyfunc_format, _pyfunc_getattr = _py._pyfunc_getattr, _pyfunc_hasattr = _py._pyfunc_hasattr, _pyfunc_op_contains = _py._pyfunc_op_contains, _pyfunc_op_equals = _py._pyfunc_op_equals, _pyfunc_op_error = _py._pyfunc_op_error, _pyfunc_op_instantiate = _py._pyfunc_op_instantiate, _pyfunc_op_parse_kwargs = _py._pyfunc_op_parse_kwargs, _pyfunc_setattr = _py._pyfunc_setattr, _pyfunc_truthy = _py._pyfunc_truthy;

var _pymeth_format = _py._pymeth_format, _pymeth_get = _py._pymeth_get, _pymeth_keys = _py._pymeth_keys, _pymeth_pop = _py._pymeth_pop;

var serializer = flexx$app$_clientcore.serializer;

var serializer = flexx$app$_clientcore.serializer;

var logger = event.logger;

var loop = event.loop;

var Component = event.Component;

var LocalProperty = event.LocalProperty;

var Property = event.Property;





var LocalProperty;
LocalProperty = function () {
    _pyfunc_op_instantiate(this, arguments);
}
LocalProperty.prototype = Object.create(Property.prototype);
LocalProperty.prototype._base_class = Property.prototype;
LocalProperty.prototype.__name__ = "LocalProperty";



var BaseAppComponent = function () {
    _pyfunc_op_instantiate(this, arguments);
}
BaseAppComponent.prototype = Object.create(Component.prototype);
BaseAppComponent.prototype._base_class = Component.prototype;
BaseAppComponent.prototype.__name__ = "BaseAppComponent";
var $BaseAppComponent = BaseAppComponent.prototype;

$BaseAppComponent.__attributes__ = ["id", "root", "session", "uid"]
$BaseAppComponent.__properties__ = []
$BaseAppComponent.__actions__ = []
$BaseAppComponent.__emitters__ = []
$BaseAppComponent.__reactions__ = []

$BaseAppComponent._comp_init_app_component = function (property_values) {
    var active, custom_id, err_2, session;
    _pymeth_pop.call(property_values, "flx_is_app", null);
    custom_id = _pymeth_pop.call(property_values, "flx_id", null);
    this._session = null;
    session = _pymeth_pop.call(property_values, "flx_session", null);
    if ((session !== null)) {
        this._session = session;
    } else {
        active = loop.get_active_components();
        active = ((active.length > 1))? (active[active.length -2]) : (null);
        if ((active !== null)) {
            this._session = active._session;
        } else if ((!"this_is_js()")) {
        }
    }
    if ((this._session === null)) {
        throw _pyfunc_op_error('RuntimeError', (_pymeth_format.call("{} needs a session!", (_pyfunc_truthy(custom_id) || this._id))));
    }
    this._session._register_component(this, custom_id);
    this._root = this._session.app;
    return custom_id === null;
};


var LocalComponent = function () {
    _pyfunc_op_instantiate(this, arguments);
}
LocalComponent.prototype = Object.create(BaseAppComponent.prototype);
LocalComponent.prototype._base_class = BaseAppComponent.prototype;
LocalComponent.prototype.__name__ = "LocalComponent";
var $LocalComponent = LocalComponent.prototype;

$LocalComponent.__attributes__ = ["id", "root", "session", "uid"]
$LocalComponent.__properties__ = []
$LocalComponent.__actions__ = []
$LocalComponent.__emitters__ = []
$LocalComponent.__reactions__ = []
$LocalComponent.__jsmodule__ = "flexx.app._component2"

$LocalComponent._comp_init_property_values = function (property_values) {
    this._LocalComponent__event_types_at_proxy = [];
    this._comp_init_app_component(property_values);
    this._has_proxy = _pymeth_pop.call(property_values, "flx_has_proxy", false);
    (BaseAppComponent.prototype._comp_init_property_values).call(this, property_values);
    if (true) { /* if this_is_js() */
        this._event_listeners = [];
    }
    return null;
};

$LocalComponent._ensure_proxy_instance = function (include_props) {
    var name, props, stub1_seq, stub2_itr;
    include_props = (include_props === undefined) ? true: include_props;
    if (((this._has_proxy === false) && (this._disposed === false))) {
        if ((this._session.status > 0)) {
            props = ({});
            if (_pyfunc_truthy(include_props)) {
                stub1_seq = this.__proxy_properties__;
                if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
                for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
                    name = stub1_seq[stub2_itr];
                    props[name] = _pyfunc_getattr(this, name);
                }
            }
            this._session.send_command("INSTANTIATE", this.__jsmodule__, Object.getPrototypeOf(this).__name__, this._id, [], props);
            this._has_proxy = true;
        }
    }
    return null;
};

$LocalComponent.emit = function (type, info) {
    var ev;
    info = (info === undefined) ? null: info;
    ev = (BaseAppComponent.prototype.emit).call(this, type, info);
    if (((this._has_proxy === true) && (this._session.status > 0))) {
        if (_pyfunc_op_contains(type, this.__proxy_properties__)) {
            this._session.send_command("INVOKE", this._id, "_emit_at_proxy", [ev]);
        } else if (_pyfunc_op_contains(type, this._LocalComponent__event_types_at_proxy)) {
            this._session.send_command("INVOKE", this._id, "_emit_at_proxy", [ev]);
        }
    }
    return null;
};

$LocalComponent._dispose = function () {
    var was_disposed;
    was_disposed = this._disposed;
    (BaseAppComponent.prototype._dispose).call(this);
    this._has_proxy = false;
    if (((was_disposed === false) && (this._session !== null))) {
        this._session._unregister_component(this);
        if ((this._session.status > 0)) {
            this._session.send_command("DISPOSE", this._id);
        }
    }
    return null;
};

$LocalComponent._flx_set_has_proxy = function (has_proxy) {
    this._has_proxy = has_proxy;
    return null;
};

$LocalComponent._flx_set_event_types_at_proxy = function (event_types) {
    this._LocalComponent__event_types_at_proxy = event_types;
    return null;
};


var ProxyComponent = function () {
    _pyfunc_op_instantiate(this, arguments);
}
ProxyComponent.prototype = Object.create(BaseAppComponent.prototype);
ProxyComponent.prototype._base_class = BaseAppComponent.prototype;
ProxyComponent.prototype.__name__ = "ProxyComponent";
var $ProxyComponent = ProxyComponent.prototype;

$ProxyComponent.__attributes__ = ["id", "root", "session", "uid"]
$ProxyComponent.__properties__ = []
$ProxyComponent.__actions__ = ["_emit_at_proxy"]
$ProxyComponent.__emitters__ = []
$ProxyComponent.__reactions__ = []
$ProxyComponent.__jsmodule__ = "flexx.app._component2"

$ProxyComponent.__init__ = function () {
    var err_3, init_args, kwargs;
    kwargs = {};
    if (arguments.length == 1 && typeof arguments[0] == 'object' && Object.keys(arguments[0]).toString() == 'flx_args,flx_kwargs') {
        kwargs = _pyfunc_op_parse_kwargs([], [], arguments[0].flx_kwargs);
        init_args = arguments[0].flx_args;
    } else {init_args = Array.prototype.slice.call(arguments);}
    if (true) { /* if this_is_js() */
        if (!(init_args.length == 0)) { throw _pyfunc_op_error('AssertionError', "init_args.length == 0");}
        if ((!_pyfunc_op_contains("flx_id", kwargs))) {
            throw _pyfunc_op_error('RuntimeError', "Cannot instantiate a PyComponent from JS.");
        }
        (BaseAppComponent.prototype.__init__).call(this, {flx_args: [], flx_kwargs: kwargs});
    }
    return null;
};

$ProxyComponent._comp_init_property_values = function (property_values) {
    var local_inst, props2set;
    local_inst = this._comp_init_app_component(property_values);
    props2set = (_pyfunc_truthy(local_inst))? (({})) : (property_values);
    (BaseAppComponent.prototype._comp_init_property_values).call(this, props2set);
    if (true) { /* if this_is_js() */
        if (!(_pyfunc_op_equals((_pymeth_keys.call(property_values).length), 0))) { throw _pyfunc_op_error('AssertionError', "_pyfunc_op_equals((_pymeth_keys.call(property_values).length), 0)");}
    }
    return null;
};

$ProxyComponent._comp_apply_property_values = function (values) {
    var name, stub1_seq, stub2_itr, stub3_tgt, value;
    stub1_seq = values;
    if ((typeof stub1_seq === "object") && (!Array.isArray(stub1_seq))) { stub1_seq = Object.keys(stub1_seq);}
    for (stub2_itr = 0; stub2_itr < stub1_seq.length; stub2_itr += 1) {
        stub3_tgt = stub1_seq[stub2_itr];
        name = stub3_tgt[0]; value = stub3_tgt[1];
        _pyfunc_setattr(this, (("_" + name) + "_value"), value);
    }
    return null;
};

$ProxyComponent._proxy_action = function (name) {
    var args, kwargs;
    kwargs = {};
    if (arguments.length == 1 && typeof arguments[0] == 'object' && Object.keys(arguments[0]).toString() == 'flx_args,flx_kwargs') {
        kwargs = _pyfunc_op_parse_kwargs([], [], arguments[0].flx_kwargs);
        name = arguments[0].flx_args[0];
        args = arguments[0].flx_args.slice(1);
    } else {args = Array.prototype.slice.call(arguments, 1);}
    if (!(!_pyfunc_truthy(kwargs))) { throw _pyfunc_op_error('AssertionError', "!_pyfunc_truthy(kwargs)");}
    this._session.send_command("INVOKE", this._id, name, args);
    return null;
};

$ProxyComponent._proxy_emitter = function (name) {
    var args, kwargs;
    kwargs = {};
    if (arguments.length == 1 && typeof arguments[0] == 'object' && Object.keys(arguments[0]).toString() == 'flx_args,flx_kwargs') {
        kwargs = _pyfunc_op_parse_kwargs([], [], arguments[0].flx_kwargs);
        name = arguments[0].flx_args[0];
        args = arguments[0].flx_args.slice(1);
    } else {args = Array.prototype.slice.call(arguments, 1);}
    if (true) { /* if this_is_js() */
        logger.error("Cannot use emitters of a PyComponent in JS.");
    }
    return null;
};

$ProxyComponent._mutate = function () {
    var args, err_1, kwargs;
    kwargs = {};
    if (arguments.length == 1 && typeof arguments[0] == 'object' && Object.keys(arguments[0]).toString() == 'flx_args,flx_kwargs') {
        kwargs = _pyfunc_op_parse_kwargs([], [], arguments[0].flx_kwargs);
        args = arguments[0].flx_args;
    } else {args = Array.prototype.slice.call(arguments);}
    throw _pyfunc_op_error('RuntimeError', "Cannot mutate properties from a proxy class.");
    serializer;
    BsdfComponentExtension;
    return null;
};

$ProxyComponent._registered_reactions_hook = function () {
    var event_types;
    event_types = (BaseAppComponent.prototype._registered_reactions_hook).call(this);
    try {
        if (((this._disposed === false) && (this._session.status > 0))) {
            this._session.send_command("INVOKE", this._id, "_flx_set_event_types_at_proxy", [event_types]);
        }
    } finally {
        return event_types;
    }
    return null;
};

$ProxyComponent._emit_at_proxy = function _emit_at_proxy (ev) {
    if ((!"this_is_js()")) {
    }
    if ((_pyfunc_op_contains(ev.type, this.__properties__) && _pyfunc_hasattr(ev, "mutation"))) {
        if (_pyfunc_op_equals(ev.mutation, "set")) {
            (BaseAppComponent.prototype._mutate).call(this, ev.type, ev.new_value);
        } else {
            (BaseAppComponent.prototype._mutate).call(this, ev.type, ev.objects, ev.mutation, ev.index);
        }
    } else {
        this.emit(ev.type, ev);
    }
    return null;
};
$ProxyComponent._emit_at_proxy.nobind = true;

$ProxyComponent.dispose = function () {
    var err_2;
    if (true) { /* if this_is_js() */
        throw _pyfunc_op_error('RuntimeError', "Cannot dispose a PyComponent from JS.");
    }
    return null;
};

$ProxyComponent._dispose = function () {
    var was_disposed;
    was_disposed = this._disposed;
    (BaseAppComponent.prototype._dispose).call(this);
    if (((was_disposed === false) && (this._session !== null))) {
        this._session._unregister_component(this);
        if ((this._session.status > 0)) {
            this._session.send_command("INVOKE", this._id, "_flx_set_has_proxy", [false]);
        }
    }
    return null;
};


var StubComponent = function () {
    _pyfunc_op_instantiate(this, arguments);
}
StubComponent.prototype = Object.create(BaseAppComponent.prototype);
StubComponent.prototype._base_class = BaseAppComponent.prototype;
StubComponent.prototype.__name__ = "StubComponent";
var $StubComponent = StubComponent.prototype;

$StubComponent.__attributes__ = ["id", "root", "session", "uid"]
$StubComponent.__properties__ = []
$StubComponent.__actions__ = []
$StubComponent.__emitters__ = []
$StubComponent.__reactions__ = []
$StubComponent.__jsmodule__ = "flexx.app._component2"

$StubComponent.__init__ = function (session, id) {
    (BaseAppComponent.prototype.__init__).call(this);
    this._session = session;
    this._id = id;
    this._uid = (session.id + "_") + id;
    return null;
};


var JsComponent = function () {
    _pyfunc_op_instantiate(this, arguments);
}
JsComponent.prototype = Object.create(LocalComponent.prototype);
JsComponent.prototype._base_class = LocalComponent.prototype;
JsComponent.prototype.__name__ = "JsComponent";
var $JsComponent = JsComponent.prototype;

$JsComponent.__attributes__ = ["id", "root", "session", "uid"]
$JsComponent.__properties__ = []
$JsComponent.__actions__ = []
$JsComponent.__emitters__ = []
$JsComponent.__reactions__ = []
$JsComponent.__jsmodule__ = "flexx.app._component2"
$JsComponent.__proxy_properties__ = []

$JsComponent._addEventListener = function (node, type, callback, capture) {
    capture = (capture === undefined) ? false: capture;
    node.addEventListener(type, callback, capture);
    this._event_listeners.push([node, type, callback, capture]);
    return null;
};

$JsComponent._dispose = function () {
    var callback, capture, err, node, stub1_, type;
    (LocalComponent.prototype._dispose).call(this);
    while (this._event_listeners.length > 0) {
        try {
            stub1_ = this._event_listeners.pop();
            node = stub1_[0];type = stub1_[1];callback = stub1_[2];capture = stub1_[3];
            node.removeEventListener(type, callback, capture);
        } catch(err_3) {
            {
                err = err_3;
                console.log(err);
            }
        }
    }
    return null;
};



var PyComponent = function () {
    _pyfunc_op_instantiate(this, arguments);
}
PyComponent.prototype = Object.create(ProxyComponent.prototype);
PyComponent.prototype._base_class = ProxyComponent.prototype;
PyComponent.prototype.__name__ = "PyComponent";
var $PyComponent = PyComponent.prototype;

$PyComponent.__attributes__ = ["id", "root", "session", "uid"]
$PyComponent.__properties__ = []
$PyComponent.__actions__ = ["_emit_at_proxy"]
$PyComponent.__emitters__ = []
$PyComponent.__reactions__ = []
$PyComponent.__jsmodule__ = "flexx.app._component2"


var BsdfComponentExtension = {name: "flexx.app.component",
    match: function (s, c) {
        return c instanceof BaseAppComponent;
    },
    encode: function (s, c) {
        if (_pyfunc_truthy(c instanceof JsComponent)) {
            c._ensure_proxy_instance();
        }
        return {session_id:c._session.id, id:c._id};
    },
    decode: function (s, d) {
        var c, session;
        c = null;
        session = _pymeth_get.call(window.flexx.sessions, d["session_id"], null);
        if ((session === null)) {
            session = {id:d["session_id"]};
            c = new StubComponent(session, d["id"]);
        } else {
            c = session.get_component_instance(d["id"]);
            if ((c === null)) {
                logger.warning(_pymeth_format.call("Using stub component for {}.", d["id"]));
                c = new StubComponent(session, d["id"]);
            }
        }
        return c;
    }};
serializer.add_extension(BsdfComponentExtension);


return {JsComponent: JsComponent, LocalProperty: LocalProperty, PyComponent: PyComponent};
});
