require('proof/redux')(7, require('cadence')(prove))

function prove (async, assert) {
    var Heft = require('../heft')
    var heft = new Heft(function (procession, node) { return node.body })
    var Procession = require('..')
    var first = new Procession
    var second = new Procession
    second.addListener(heft)
    first.name = 'first'
    second.name = 'second'
    var shifter = second.shifter()
    second.limit = 3
    first.shifter().pump(second)
    first.push(1)
    first.push(1)
    first.push(3)
    second.enqueue(1) // create a backlog of 2
    first.push(1)
    first.push(1)
    first.push(1)
    assert([
        first.size, second.backlog, second.size
    ], [ 2, 2, 3 ], 'throttled')
    assert(shifter.shift(), 1, 'shifted')
    assert([
        first.size, second.backlog, second.size
    ], [ 2, 2, 2 ], 'too hefty')
    assert(shifter.shift(), 1, 'shifted')
    assert([
        first.size, second.backlog, second.size
    ], [ 2, 2, 1 ], 'still too hefty')
    assert(shifter.shift(), 3, 'shifted')
    assert([
        first.size, second.backlog, second.size
    ], [ 0, 1, 3 ], 'flood')
}
