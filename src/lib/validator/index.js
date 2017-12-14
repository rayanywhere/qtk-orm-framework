const isObject = require('isobject');

module.exports = {
    skey: function(minLen, maxLen = undefined) {
        maxLen = maxLen ? maxLen : minLen;
        return function(val) {
            if (typeof val !== 'string') {
                throw new Error('expect a string value');
            }
            if (val.length < minLen || val.length > maxLen) {
                throw new Error(`length of skey ${val} must be in [${minLen}, ${maxLen}]`);
            }
        };
    },
    ikey: function() {
        return function(val) {
            if (!Number.isInteger(val)) {
                throw new Error(`expect an integer value, got: ${typeof val}(${val})`);
            }
        }
    },
    string: function() {
        return function(val) {
            if (typeof val !== 'string') {
                throw new Error('expect a string value');
            }
        }
    },
    boolean: function() {
        return function(val) {
            if (typeof val !== 'boolean') {
                throw new Error('expect a boolean value');
            }
        }
    },
    integer: function() {
        return function(val) {
            if (!Number.isInteger(val)) {
                throw new Error(`expect an integer value, got: ${typeof val}(${val})`);
            }
        }
    },
    object: function(validator) {
        if (!isObject(validator)) {
            throw new Error(`expect validator to be an object`);
        }
        return function(val) {
            if (!isObject(val)) {
                throw new Error('expect an object value');
            }
            let validatorKeys = Object.keys(validator);
            let valKeys = Object.keys(val);
            if (!valKeys.every(i => validatorKeys.includes(i))) {
                throw new Error(`extra key in object instance.`);
            } 
            if (!validatorKeys.every(i => valKeys.includes(i))) {
                throw new Error(`missing key in object instance`);
            }
            for(let [key, subValidator] of Object.entries(validator)) {
                if (typeof subValidator !== 'function') {
                    throw new Error(`bad validator for key ${key}`);
                }
                subValidator(val[key]);
            }
        };
    }, 
    array: function(validator) {
        if (typeof validator !== 'function') {
            throw new Error(`bad validator for array`);
        }
        return function(val) {
            if (!Array.isArray(val)) {
                throw new Error('expect an array value');
            }
            val.forEach(item => validator(item));
        }
    }
};