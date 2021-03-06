var cadence = require('cadence')

module.exports = cadence(function (async, options) {
    async([function () {
        options.f.call(null, async())
    }, function (error) {
        options.error(error, options.context)
        if (options.queue) {
            options.queue.end()
        }
    }])
})
