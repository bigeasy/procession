function Heft (calculator) {
    this._calculator = calculator
}

Heft.prototype.added = function () {
}

Heft.prototype.pushed = function (procession, node) {
    procession.heft += this._calculator.call(null, procession, node)
}

Heft.prototype.shifted = function (procession, node) {
    procession.heft -= this._calculator.call(null, procession, node)
}

Heft.prototype.removed = function () {
}

module.exports = Heft
