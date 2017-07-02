require('proof')(10, prove)

function prove (assert) {
    var Procession = require('..')

    var queue = new Procession()
    var shifter = queue.shifter()

    var destroy = shifter.shifter()

    // TODO Can't I pass another value, like the suggested `destroyed` here?
    destroy.dequeue(function (error, value, destroyed) {
        assert(value, null, 'destroyed')
    })
    destroy.destroy()
    destroy.destroy()

    shifter.shifter().join(function (value) {
        return value == 2
    }, function (error, value) {
        assert(error, null, 'shift no error')
        assert(value, 2, 'shift value')
    })

    shifter.shifter().join(function (value) {
        return value == 0
    }, function (error, value) {
        assert(/^procession#endOfStream$/m.test(error.message), 'shift eos')
    })

    shifter.dequeue(function (error, value) {
        assert(error, null, 'dequeue no error')
        assert(value, 1, 'dequeue value')
    })

    queue.push(1)
    queue.push(2)
    assert(shifter.peek(), 2, 'peek')
    queue.enqueue(null, function (error) {
        assert(!error, 'enqueue no error')
    })
    queue.push(1)

    shifter.shifter(function (node) {
        assert(node.body, 2, 'listener')
    }).shift()

    var array = []
    shifter.shifter().pump(function (value) { array.push(value) })
    assert(array, [ 2, null ], 'pump')

    shifter.destroy()
}
