const isObject = require('isobject');
const assert = require('assert');

module.exports = {
    skey: function(minLen, maxLen = undefined) {
        maxLen = maxLen ? maxLen : minLen;
        return function(val, node=undefined, key=undefined) {
            if (typeof val !== 'string') {
                throw new Error('expect a string value');
            }
            if (val.length < minLen || val.length > maxLen) {
                throw new Error(`length of skey ${val} must be in [${minLen}, ${maxLen}]`);
            }
        };
    },
    ikey: function() {
        return function(val, node=undefined, key=undefined) {
            if (!Number.isInteger(val)) {
                throw new Error(`expect an integer value, got: ${typeof val}(${val})`);
            }
        }
    },
    string: function(defaultVal=undefined) {
        return function(val, node=undefined, key=undefined) {
            if (typeof val === 'undefined') {
                if (typeof defaultVal !== 'undefined') {
                    assert(typeof defaultVal === 'string', 'expect a string default value');
                    node[key] = defaultVal;
                }
            }
            if (typeof node[key] !== 'string') {
                throw new Error('expect a string value');
            }
        }
    },
    boolean: function(defaultVal=undefined) {
        return function(val, node=undefined, key=undefined) {
            if (typeof val === 'undefined') {
                if (typeof defaultVal !== 'undefined') {
                    assert(typeof defaultVal === 'boolean', 'expect a boolean default value');
                    node[key] = defaultVal;
                }
            }
            if (typeof node[key] !== 'boolean') {
                throw new Error('expect a boolean value');
            }
        }
    },
    integer: function(defaultVal=undefined) {
        return function(val, node=undefined, key=undefined) {
            if (typeof val === 'undefined') {
                if (typeof defaultVal !== 'undefined') {
                    assert(Number.isInteger(defaultVal), 'expect an integer default value');
                    node[key] = defaultVal;
                }
            }
            if (!Number.isInteger(node[key])) {
                throw new Error(`expect an integer value, got: ${typeof node[key]}(${node[key]})`);
            }
        }
    },
    object: function(validator) {
        if (!isObject(validator)) {
            throw new Error(`expect validator to be an object`);
        }
        return function(val, node=undefined, key=undefined) {
            if (!isObject(val)) {
                node[key] = {};
                val = node[key]
            }
            let validatorKeys = Object.keys(validator);
            let valKeys = Object.keys(val);
            if (!valKeys.every(i => validatorKeys.includes(i))) {
                throw new Error(`extra key in object instance.`);
            }
            for(let [key, subValidator] of Object.entries(validator)) {
                if (typeof subValidator !== 'function') {
                    throw new Error(`bad validator for key ${key}`);
                }
                subValidator(val[key], val, key);
            }
        };
    }, 
    array: function(validator) {
        if (typeof validator !== 'function') {
            throw new Error(`bad validator for array`);
        }
        return function(val, node, key) {
            if (!Array.isArray(node[key])) {
                throw new Error('expect an array value');
            }
            for (let idx in node[key]) {
                validator(node[key][idx], node[key], idx);
            }
        }
    }
};