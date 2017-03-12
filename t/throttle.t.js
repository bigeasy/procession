require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var Procession = require('..')
    var first = new Procession
    var second = new Procession
    var shifter = second.shifter()
    second.limit = 6
    first.shifter().pump(second)
    async(function () {
        var count = 0, loop = async(function () {
            if (count == 12) {
                return [ loop.break ]
            }
            first.enqueue(count++, async())
        })()
    }, function () {
        assert(second.size, 6, 'throttled')
    })
}
