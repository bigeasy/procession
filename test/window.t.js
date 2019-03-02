require('proof')(2, require('cadence')(prove))

function prove (async, okay) {
    var Window = require('../window')
    var window = new Window
    var abend = require('abend')

    var listener = {
        pushed: function (node) {
            okay(node.body, { value: 1 }, 'pushed')
        },
        shifted: function (node) {
            okay(node.body, { value: 1 }, 'shifted')
        }
    }
    window.addListener(listener)

    window.push({ value: 1 })
    window.shifter().destroy()
    window.trailer.shift()
    window.end()
    window.trailer.shift()

    window.removeListener(listener)
}
