require('proof')(9, prove)

function prove (okay) {
    var Procession = require('..')

    var queue = new Procession()
    var shifter = queue.shifter()

    var destroy = shifter.shifter()

    // TODO Can't I pass another value, like the suggested `destroyed` here?
    destroy.dequeue(function (error, value, destroyed) {
        okay(value, null, 'destroyed')
    })
    destroy.destroy()
    destroy.destroy()

    shifter.shifter().join(function (value) {
        return value == 2
    }, function (error, value) {
        okay(error, null, 'shift no error')
        okay(value, 2, 'shift value')
    })

    shifter.shifter().join(function (value) {
        return value == 0
    }, function (error, value) {
        okay(/^procession#endOfStream$/m.test(error.message), 'shift eos')
    })

    shifter.dequeue(function (error, value) {
        okay(error, null, 'dequeue no error')
        okay(value, 1, 'dequeue value')
    })

    queue.push(1)
    queue.push(2)
    okay(shifter.peek(), 2, 'peek')
    queue.enqueue(null, function (error) {
        okay(!error, 'enqueue no error')
    })
    queue.push(1)

    shifter.shifter(function (node) {
        okay(node.body, 2, 'listener')
    }).shift()

    shifter.destroy()
}
