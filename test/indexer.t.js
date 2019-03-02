require('proof')(2, prove)

function prove (okay) {
    var Indexer = require('../indexer')

    var indexer = new Indexer(function (left, right) {
        return left.body - right.body
    })

    indexer.pushed({ body: 1 })
    okay(indexer.tree.size, 1, 'pushed')
    indexer.shifted({ body: 1 })
    okay(indexer.tree.size, 0, 'shifted')
}
