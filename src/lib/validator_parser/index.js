const isObject = require('isobject');

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
    string: function() {
        return {
            type: "string"
        }
    },
    boolean: function() {
        return {
            type: "boolean"
        }
    },
    integer: function() {
        return {
            type: "integer"
        }
    },
    object: function(validator) {
        if (!isObject(validator)) {
            throw new Error(`expect validator to be an object`);
        }
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