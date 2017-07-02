function Deferred (listeners, decorated) {
    this._listeners = listeners
    this._sentry = null
    this._decorated = decorated
}

Deferred.prototype.pushed = function (node) {
    if (this._sentry == null) {
        this._sentry = node
    }
    this._decorated.pushed(node)
}

Deferred.prototype.shifted = function (node) {
    if (this._sentry === node) {
        var index = this._listeners.indexOf(this)
        this._listeners[index] = this._decorated
        this._decorated.shifted( node)
    }
}

module.exports = Deferred
