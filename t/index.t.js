require('proof/redux')(1, prove)

function prove (assert) {
    var Index = require('../index')
    assert(Index, 'require')
}
