var cadence = require('cadence')
var util = require('util')
var abend = require('abend')
var stream = require('stream')
var Signal = require('signal')
var coalesce = require('extant')

function Readable (shifter, options) {
    stream.Readable.call(this, coalesce(options, {}))
    this._pump(shifter, abend)
    this._resume = new Signal
}
util.inherits(Readable, stream.Readable)

Readable.prototype._pump = cadence(function (async, shifter) {
    async([function () {
        var loop = async(function () {
            shifter.dequeue(async())
        }, function (envelope) {
            if (envelope == null) {
                this.push(null)
                return [ loop.break ]
            }
            if (!this.push(envelope.body)) {
                this._resume.wait(async())
            }
        })()
    }, function (error) {
        this.emit('error', error)
    }])
})

Readable.prototype._read = function () {
    this._resume.notify()
}


module.exports = Readable
