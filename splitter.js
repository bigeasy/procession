// Control-flow utilities.
var cadence = require('cadence')

// Evented message queue.
var Procession = require('./procession')

// Create a splitter that will split the given queue.

//
function Splitter (queue, splits) {
    this._shifter = queue.shifter()
    this._map = {}
    this._array = []
    for (var key in splits) {
        var queue = new Procession
        var split = {
            selector: splits[key],
            queue: queue,
            shifter: queue.shifter()
        }
        this._map[key] = split
        this._array.push(split)
    }
}

Splitter.prototype.dequeue = cadence(function (async, name) {
    var split = this._map[name]
    async.loop([], function () {
        if (split.shifter.peek() != null || this._shifter.endOfStream) {
            return [ async.break, split.shifter.shift() ]
        }
        this._shifter.dequeue(async())
    }, function (envelope) {
        if (envelope == null) {
            this._array.forEach(function (split) { split.queue.push(null) })
        } else {
            for (var i = 0, I = this._array.length; i < I; i++) {
                if (this._array[i].selector(envelope)) {
                    this._array[i].queue.push(envelope)
                    break
                }
            }
        }
    })
})

module.exports = Splitter
