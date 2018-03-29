require('proof')(5, require('cadence')(prove))

function prove (async, okay) {
    var Throttle = require('../throttle')
    var Procession = require('../procession')

    var throttle = new Throttle(3)

    var second = new Procession

    throttle.push(1)
    throttle.push(1)
    throttle.enqueue(1, function (error) {
        okay(! error, 'directly')
    })
    okay(throttle.heft, 3, 'heft')
    okay(throttle.backlog, 0, 'no backlog')
    throttle.enqueue(1, function (error) {
        okay(! error, 'done')
    })
    okay(throttle.backlog, 1, 'backlog')
    throttle.trailer.shift()
}
