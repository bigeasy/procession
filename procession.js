var Operation = require('operation')

function Procession (iterator) {
    this._iterator = iterator
    this._continuations = []
}

Procession.prototype.join = function (memento, interceptors, operation) {
    this._continuations.push({
        memento: memento,
        interceptors: interceptors,
        operation: new Operation(operation)
    })
}

Procession.prototype.advance = function () {
    var i = 0, I = this._continuations.length;
    CONTINUATIONS: while (i < I) {
        var continuation = this._continuations[i]
        var memento = this._iterator.call(null, continuation.memento)
        if (memento) {
            continuation.memento = memento
            for (var j = 0, J = continuation.interceptors.length; j < J; j++) {
                var vargs = continuation.interceptors[j].call(null, memento)
                if (vargs) {
                    continuation.operation.apply(vargs)
                    this._continuations.splice(i, 1)
                    I--
                    continue CONTINUATIONS
                }
            }
        }
        i++
    }
}

module.exports = Procession
