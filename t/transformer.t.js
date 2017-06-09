require('proof')(2, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')
    var Transformer = require('../transformer')
    var first = new Procession
    var second = new Procession
    var third = new Procession
    first.name = 'first'
    second.name = 'second'
    first.pump(new Transformer(function (value, callback) {
        callback(null, value + 1)
    }, second), 'enqueue')
    second.pump(new Transformer(function (value) {
        return value + 1
    }, third), 'enqueue')
    var shifter = third.shifter()
    first.push(1)
    assert(shifter.shift(), 3, 'transformed')
    first.push(null)
    assert(shifter.shift(), null, 'eos')
}
