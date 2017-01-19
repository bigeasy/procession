function Heft (calculator, property) {
    this._calculator = calculator
    this._property = property
}

Heft.prototype.added = function () {
    this._procession[this._property] = 0
}

Heft.prototype.pushed = function (procession, node) {
    this._procession[this._property] += this._calculator.call(null, node)
}

Heft.prototype.shifted = function (procession, node) {
    this._procession[this._property] += this._calculator.call(null, node)
}

module.exports = Heft
