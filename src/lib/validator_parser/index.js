const isObject = require('isobject');
const assert = require('assert');

module.exports = {
    skey: function(minLen, maxLen = undefined) {
        maxLen = maxLen ? maxLen : minLen;
        return {
            type: "skey",
            limit: {
                minLen: minLen,
                maxLen: maxLen
            }
        }
    },
    ikey: function() {
        return {
            type: "ikey"
        };
    },
    string: function(defaultVal=undefined) {
        if (defaultVal !== undefined)
            assert(typeof defaultVal == 'string', 'expect a string default value');
        return {
            type: "string",
            defaultVal: defaultVal
        }
    },
    boolean: function(defaultVal=undefined) {
        if (defaultVal !== undefined)
            assert(typeof defaultVal == 'boolean', 'expect a boolean default value');
        return {
            type: "boolean",
            defaultVal: defaultVal
        }
    },
    integer: function(defaultVal=undefined) {
        if (defaultVal !== undefined)
            assert(Number.isInteger(defaultVal), 'expect an integer default value');
        return {
            type: "integer",
            defaultVal: defaultVal
        }
    },
    object: function(validator) {
        assert(isObject(validator), 'expect validator to be an object');
        let obj = {
            type: "object",
            properties: {}
        };
        for(let [key, subValidator] of Object.entries(validator)) {
            obj.properties[key] = subValidator;
        }
        return obj;
    }, 
    array: function(validator) {
        return {
            type: "array",
            items: validator
        }
    }
};