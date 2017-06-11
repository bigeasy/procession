require('proof')(1, prove)

function prove (assert) {
    var Counter = require('../counter')
    assert(Counter, 'required')
    new Counter().removed()
}
