require('proof/redux')(1, prove)

function prove (assert) {
    var Heft = require('../index')
    assert(Heft, 'require')
}
