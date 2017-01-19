function Counter () {
}

Counter.prototype.added = function (procession) {
    procession.size = 0
}

Counter.prototype.pushed = function (procession) {
    procession.size++
}

Counter.prototype.shifted = function (procession) {
    procession.size--
}

module.exports = Counter
