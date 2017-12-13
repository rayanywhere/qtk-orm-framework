module.exports = {
    string: function(pattern = undefined) {
        if ((pattern !== undefined) && !(pattern instanceof RegExp)) {
            throw new Error('expect pattern passed to a string validator to be an instance of class RegExp');
        }
        return function(val) {
            if (typeof val !== 'string') {
                throw new Error('expect a string value');
            }
            if (pattern !== undefined && val.match(pattern) === null) {
                throw new Error(`value ${val} mismatch pattern ${pattern}`);
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
    integer: function(range = undefined) {
        if (range !== undefined) {
            if ((typeof range !== 'object') || !Number.isInteger(range.min) || !Number.isInteger(range.max)) {
                throw new Error(`expect range to be an object with both min & max fields`);
            }
        }

        return function(val) {
            if (!Number.isInteger(val)) {
                throw new Error('expect an integer value');
            }
            if ((range !== undefined) && (val < range.min || val > range.max)) {
                throw new Error(`value ${val} of out range of [${range.min}-${range.max}]`);
            }
        }
    }
};