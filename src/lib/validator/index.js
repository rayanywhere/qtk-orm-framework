module.exports = {
    string: function(validator = undefined) {
        if ((validator !== undefined) && !(validator instanceof RegExp)) {
            throw new Error('expect pattern passed to a string validator to be an instance of class RegExp');
        }
        return function(val) {
            if (typeof val !== 'string') {
                throw new Error('expect a string value');
            }
            if (validator !== undefined && val.match(validator) === null) {
                throw new Error(`value ${val} mismatch pattern ${validator}`);
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
        if (validator !== undefined) {
            if ((typeof validator !== 'object') || !Number.isInteger(validator.min) || !Number.isInteger(validator.max)) {
                throw new Error(`expect range to be an object with both min & max fields`);
            }
        }

        return function(val) {
            if (!Number.isInteger(val)) {
                throw new Error('expect an integer value');
            }
            if ((validator !== undefined) && (val < validator.min || val > validator.max)) {
                throw new Error(`value ${val} of out range of [${validator.min}-${validator.max}]`);
            }
        }
    },
    object: function(validator) {
        if (typeof validator !== 'object') {
            throw new Error(`expect validator to be an object`);
        }
        return function(val) {
            if (typeof val !== 'object' || val === null) {
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