function Deferred (procession, decorated) {
    this._procession = procession
    this._decorated = decorated
    this._after = procession.head.id
}

Deferred.prototype.added = function () {
}

Deferred.prototype.pushed = function (procession, node) {
    this._decorated.pushed(procession, node)
}

Deferred.prototype.shifted = function (procession, node) {
    if (this._procession._identifier.compare(this._after, node.id) < 0) {
        var index = this._procession._undecorated.indexOf(this._decorated)
        this._procession._listeners[index] = this._decorated
        this._decorated.shifted(procession, node)
    }
}

module.exports = Deferred
