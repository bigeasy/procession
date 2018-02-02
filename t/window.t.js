require('proof')(2, require('cadence')(prove))

function prove (async, assert) {
    var Window = require('../window')
    var window = new Window
    var abend = require('abend')

    var listener = {
        pushed: function (node) {
            assert(node.body, { value: 1 }, 'pushed')
        },
        shifted: function (node) {
            assert(node.body, { value: 1 }, 'shifted')
        }
    }
    window.listen(abend)
    window.addListener(listener)

    window.push({ value: 1 })
    window.shifter().destroy()
    window.trailer.shift()
    window.push(null)
    window.trailer.shift()

    window.removeListener(listener)
}
