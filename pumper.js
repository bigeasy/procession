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

function Pumper () {
    var vargs = Array.prototype.slice.call(arguments)
    this._shifter = vargs.shift()
    this._operation = operation(vargs)
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

// We never need to worry about errors being thrown from `Shifter.dequeue`.
Pumper.prototype.pump = function () {
    this._pump(abend)
}

module.exports = Pumper
