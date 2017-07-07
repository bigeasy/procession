// Control-flow libraries.
var cadence = require('cadence')
var abend = require('abend')

// Contextualized callbacks and event handlers.
var Operation = require('operation/variadic')

function operation (vargs) {
    var operation = Operation(vargs)
    return operation.length == 2 ? operation : function (value, callback) {
       operation(value)
       callback()
    }
}

function Pumper (shifter, vargs) {
    this._shifter = shifter
    this._operation = operation(vargs)
    this._pump(abend)
}

Pumper.prototype.cancel = function () {
    this._shifter.destroy()
}

Pumper.prototype._pump = cadence(function (async) {
    async(function () {
        var loop = async(function () {
            this._shifter.dequeue(async())
        }, function (value) {
            if (value == null) {
                return [ loop.break ]
            }
            this._operation.call(null, value, async())
        })()
    }, function () {
        if (!this._shifter.destroyed) {
            this._operation.call(null, null, async())
        }
    })
})

module.exports = Pumper
