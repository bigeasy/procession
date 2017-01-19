function Identifier () {
    this.maximum = 0xfffffffe
}

Identifier.prototype.next = function () {
    var integer = this.maximum
    if (integer == 0xffffffff) {
        this.maximum = 0
    } else {
        this.maximum++
    }
    return integer
}

Identifier.prototype.compare = function (left, right) {
    var leftMajor = left < this.maximum ? 1 : 0
    var rightMajor = right < this.maximum ? 1 : 0
    var compare = leftMajor - rightMajor
    if (compare == 0) {
        compare = left - right
    }
    return compare
}

module.exports = Identifier
