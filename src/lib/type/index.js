const assert = require('assert');

module.exports = class T {
    static get Mode() {
        return {
            VERIFY: 0,
            NORMALIZE: 1
        };
    }

    static object(structure) {
        assert(typeof structure === 'object', `expecting structure to be an object`);
        return ({node, name}, mode) => {
            if (mode === T.Mode.VERIFY || mode === T.Mode.NORMALIZE) {
                assert(typeof node[name] === 'object', `expecting a object value for key ${name}`);
                for (const [key, func] of Object.entries(structure)) {
                    func({node:node[name], name:key}, mode);
                }
            }
            else {
                assert(false, 'unknown mode');
            }
        };
    }

    static array(func) {
        assert(typeof func === 'function', `expecting func to be a function`);
        return ({node, name}, mode) => {
            if (mode === T.Mode.VERIFY || mode === T.Mode.NORMALIZE) {
                if (typeof node[name] === 'undefined')
                    node[name] = [];
                assert(Array.isArray(node[name]), `expect an array value for key ${name}`);
                for (const idx in node[name]) {
                    func({node:node[name], name:idx}, mode);
                }
            } else {
                assert(false, 'unknown mode');
            }
        }
    }

    static string(defaultValue = undefined) {
        assert((defaultValue === undefined) || (typeof defaultValue === 'string'), `expecting a string / undefined default value`);
        return ({node, name}, mode) => {
            if (mode === T.Mode.VERIFY) {
                assert((typeof node[name] === 'string'), `expecting a string value for key ${name}`);
            }
            else if (mode === T.Mode.NORMALIZE) {
                if (typeof node[name] === 'string') {
                    return;
                }
                assert((typeof node[name] === 'undefined'), `bad type for key ${name}`);
                node[name] = defaultValue;
            }
            else {
                assert(false, 'unknown mode');
            }
        }
    }

    static integer(defaultValue = undefined) {
        assert((defaultValue === undefined) || Number.isInteger(defaultValue), `expecting an integer / undefined default value`);
        return ({node, name}, mode) => {
            if (mode === T.Mode.VERIFY) {
                assert(Number.isInteger(node[name]), `expecting an integer for key ${name}`);
            }
            else if (mode === T.Mode.NORMALIZE) {
                if (Number.isInteger(node[name])) {
                    return;
                }
                assert((typeof node[name] === 'undefined'), `bad type for key ${name}`);
                node[name] = defaultValue;
            }
            else {
                assert(false, 'unknown mode');
            }
        }
    }

    static boolean(defaultValue = undefined) {
        assert((defaultValue === undefined) || defaultValue === true || defaultValue === false, `expecting a boolean / undefined default value`);
        return ({node, name}, mode) => {
            if (mode === T.Mode.VERIFY) {
                assert(node[name] === true || node[name] === false, `expecting a boolean for key ${name}`);
            }
            else if (mode === T.Mode.NORMALIZE) {
                if (node[name] === true || node[name] === false) {
                    return;
                }
                assert((typeof node[name] === 'undefined'), `bad type for key ${name}`);
                node[name] = defaultValue;
            }
            else {
                assert(false, 'unknown mode');
            }
        }
    }
};