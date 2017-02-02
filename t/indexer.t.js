require('proof/redux')(2, prove)

function prove (assert) {
    var Procession = require('..')
    var Indexer = require('../indexer')

    var queue = new Procession()
    var indexer = new Indexer(function (left, right) {
        return left.body.body - right.body.body
    })
    queue.addListener(indexer)
    var shifter = queue.shifter()
    queue.push(1)
    queue.push(2)
    var node = indexer.tree.find({ body: { body: 1 } })
    assert(node.body.body, 1, 'found')
    assert(shifter.shift().body, 1, 'shifted')

    queue.removeListener(indexer)
}
