// Control-flow libraries.
var cadence = require('cadence')

// Contextualized callbacks and event handlers.
var Operation = require('operation/variadic')

function operation (vargs) {
    var operation = Operation(vargs)
    return operation.length == 2 ? operation : function (value, callback) {
       operation(value)
       callback()
    }
}

function Pump (shifter, vargs) {
    vargs = Array.prototype.slice.call(arguments)
    this.shifter = vargs.shift()
    this._operation = operation(vargs)
}

Pump.prototype.pump = cadence(function (async) {
    async(function () {
        var loop = async(function () {
            this.shifter.dequeue(async())
        }, function (value) {
            if (value == null) {
                return [ loop.break ]
            }
            this._operation.call(null, value, async())
        })()
    }, function () {
        if (!this.shifter.destroyed) {
            this._operation.call(null, null, async())
        }
    })
})

module.exports = Pump
