require('proof')(2, require('cadence')(prove))

function prove (async, okay) {
    var Procession = require('..')
    var Transformer = require('../transformer')
    var abend = require('abend')
    var first = new Procession
    var second = new Procession
    var third = new Procession
    first.name = 'first'
    second.name = 'second'
    // TODO Really want to rethink how errors get propigated.
    first.pump(new Transformer(function (value, callback) {
        callback(null, value + 1)
    }, second), 'enqueue').run(abend)
    second.pump(new Transformer(function (value) {
        return value + 1
    }, third), 'enqueue').run(abend)
    var shifter = third.shifter()
    first.push(1)
    okay(shifter.shift(), 3, 'transformed')
    first.push(null)
    okay(shifter.shift(), null, 'eos')
}
