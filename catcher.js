var cadence = require('cadence')

module.exports = cadence(function (async, options) {
    async([function () {
        options.f.call(null, async())
    }, function (error) {
        var entry = {}
        Object.getOwnPropertyNames(error).forEach(function (name) {
            if (name != 'stack') {
                entry[name] = error[name]
            }
        })
        options.error(entry)
        if (options.queue) {
            options.queue.end()
        }
    }])
})
