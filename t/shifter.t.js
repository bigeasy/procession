require('proof')(1, prove)

function prove (okay) {
    var Procession = require('..')
    var abend = require('abend')

    var queue = new Procession

    var sink = new Procession
    var shifter = queue.shifter()
    shifter.pump(sink, 'enqueue').run(abend)

    var source = sink.shifter()
    queue.push(1)
    okay(source.shift(), 1, 'pumped')

    shifter.destroy()
}
