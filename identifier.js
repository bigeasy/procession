// An sequential identifier that will wrap around when it reaches the maximum
// 32-bit value that can be ordered relative to other identifiers within any
// window of the 32-bit value.

// Contruct the identifier just before the wrapping so that we're always
// exercising it.

//
function Identifier () {
    this.boundary = 0xfffffffe
}

// Get the next integer value in the series.

//
Identifier.prototype.next = function () {
    var integer = this.boundary
    if (integer == 0xffffffff) {
        this.boundary = 0
    } else {
        this.boundary++
    }
    return integer
}

// Compare any two integers in the series. This assumes that values are being
// discarded before they are reissued.

//
Identifier.prototype.compare = function (left, right) {
    var leftMajor = left < this.boundary ? 1 : 0
    var rightMajor = right < this.boundary ? 1 : 0
    var compare = leftMajor - rightMajor
    if (compare == 0) {
        compare = left - right
    }
    return compare
}

// Export as object constructor.
module.exports = Identifier
