require('proof')(2, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')
    var Pump = require('../pump')
    var Transformer = require('../transformer')
    var abend = require('abend')
    var first = new Procession
    var second = new Procession
    var third = new Procession
    first.name = 'first'
    second.name = 'second'
    var pumps = {
        first: new Pump(first.shifter(), new Transformer(function (value, callback) {
            callback(null, value + 1)
        }, second), 'enqueue'),
        second: new Pump(second.shifter(), new Transformer(function (value) {
            return value + 1
        }, third), 'enqueue')
    }
    pumps.first.pump(abend)
    pumps.second.pump(abend)
    var shifter = third.shifter()
    first.push(1)
    assert(shifter.shift(), 3, 'transformed')
    first.push(null)
    assert(shifter.shift(), null, 'eos')
}
