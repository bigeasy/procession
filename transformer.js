// Sketch of a transform. No use for it yet.
//
// Maybe it is also a filter where if you return `null` from the transform
// operation the value is not enqueued.

// First use of Operation variadic helpers.

//
var operation = require('operation')
var cadence = require('cadence')

function Transformer () {
    var vargs = operation.vargs.apply(operation, arguments)
    var f = vargs.shift()
    if (f.length == 2) {
        this._operation = f
    } else {
        this._operation = function (value, callback) {
            callback(null, f(value))
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
