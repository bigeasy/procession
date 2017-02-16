require('proof/redux')(3, require('cadence')(prove))

function prove (async, assert) {
    var Splitter = require('../splitter')
    var Procession = require('..')
    var queue = new Procession
    var splitter = new Splitter(queue, {
        able: function (envelope) { return envelope.method == 'able' },
        baker: function (envelope) { return envelope.method == 'baker'  }
    })

    async(function () {
        splitter.dequeue('baker', async())
        queue.push({ method: 'able', body: 1 })
        queue.push({ method: 'able', body: 2 })
        queue.push({ method: 'able', body: 3 })
        queue.push({ method: 'baker', body: 4 })
    }, function (envelope) {
        assert(envelope, { method: 'baker', body: 4 }, 'pull')
        splitter.dequeue('able', async())
    }, function (envelope) {
        assert(envelope, { method: 'able', body: 1 }, 'extant')
        splitter.dequeue('baker', async())
        queue.push(null)
    }, function (envelope) {
        assert(envelope, null, 'eos')
    })
}
