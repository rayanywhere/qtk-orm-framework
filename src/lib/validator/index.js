const isObject = require('isobject');

module.exports = {
    string: function(validator = undefined) {
        // no validator or regexp
        if(validator === undefined || validator instanceof RegExp) {
            // find. just let it pass.
        }
        // enum
        else if(Array.isArray(validator)) {
            if(!validator.every(i => typeof i === 'string')) {
                throw new Error(`expect all items in enum to be string`);
            }
        }
        // oops...
        else {
            throw new Error(`expect validator to be an instanceof RegExp as pattern, or an array<string> as enum`);
        }

        return function(val) {
            if (typeof val !== 'string') {
                throw new Error('expect a string value');
            }
            if (validator instanceof RegExp && !validator.test(val)) {
                throw new Error(`value ${val} mismatch pattern ${validator}`);
            }
            if (Array.isArray(validator) && !validator.includes(val)) {
                throw new Error(`value ${val} is not in enum[${validator}]`);
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
    integer: function(validator = undefined) {
        // no validator
        if (validator === undefined) {
            // fine. just let it pass.
        }
        // range
        else if (isObject(validator)) {
            if(!Number.isInteger(validator.min) || !Number.isInteger(validator.max)) {
                throw new Error(`expect range with both min & max fields`);
            }
        }
        // enum
        else if (Array.isArray(validator)) {
            if(!validator.every(i => Number.isInteger(i))) {
                throw new Error(`expect all items in enum to be integer`);
            }
        }
        // oops...
        else {
            throw new Error(`expect validator to be an object as range, or an array<integer> as enum`);
        }

        return function(val) {
            if (!Number.isInteger(val)) {
                throw new Error(`expect an integer value, got: ${typeof val}(${val})`);
            }
            if (isObject(validator) && (val < validator.min || val > validator.max)) {
                throw new Error(`value ${val} of out range of [${validator.min}-${validator.max}]`);
            }
            if(Array.isArray(validator) && !validator.includes(val)) {
                throw new Error(`value ${val} is not in enum[${validator}]`);
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