require('proof')(1, prove)

function prove (okay) {
    var Procession = require('..')

    var queue = new Procession

    var shifter = queue.shifter()

    var sink = new Procession
    shifter.pump(sink)

    var source = sink.shifter()
    queue.push(1)
    okay(source.shift(), 1, 'pumped')

    shifter.destroy()
}
