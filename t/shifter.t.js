require('proof')(1, prove)

function prove (okay) {
    var Procession = require('..')

    var queue = new Procession

    var sink = new Procession
    var shifter = queue.shifter().pumpify(sink)

    var source = sink.shifter()
    queue.push(1)
    okay(source.shift(), 1, 'pumped')

    shifter.destroy()
}
