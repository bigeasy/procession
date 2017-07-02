require('proof')(5, require('cadence')(prove))

function prove (async, assert) {
    var Throttle = require('../throttle')
    var Pumper = require('../pumper')
    var Procession = require('../procession')

    var throttle = new Throttle(3)

    var second = new Procession

    throttle.procession.push(1)
    throttle.procession.push(1)
    throttle.enqueue(1, function (error) {
        assert(! error, 'directly')
    })
    assert(throttle.heft, 3, 'heft')
    assert(throttle.backlog, 0, 'no backlog')
    throttle.enqueue(1, function (error) {
        assert(! error, 'done')
    })
    assert(throttle.backlog, 1, 'backlog')
    throttle.trailer.shift()
}
