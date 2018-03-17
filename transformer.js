// Sketch of a transform. No use for it yet.
//
// Maybe it is also a filter where if you return `null` from the transform
// operation the value is not enqueued.

// First use of Operation variadic helpers.

//
var Operation = require('operation/variadic')
var cadence = require('cadence')

function Transformer () {
    var vargs = Array.prototype.slice.call(arguments)
    var operation = Operation(vargs)
    if (operation.length == 2) {
        this._operation = operation
    } else {
        this._operation = function (value, callback) {
            callback(null, operation(value))
        }
    }
    this._write = vargs.shift()
}

Transformer.prototype.enqueue = cadence(function (async, value) {
    async(function () {
        if (value == null) {
            return [ value ]
        }
        this._operation(value, async())
    }, function (value) {
        this._write.enqueue(value, async())
    })
})

module.exports = Transformer
