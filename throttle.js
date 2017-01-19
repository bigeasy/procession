var cadence = require('cadence')

function Throttle (procession, limit, property) {
    this._procession = procession
    this._limit = limit
    this._property = property || 'size'
}

Throttle.prototype.enqueue = cadence(function (async, value) {
    var loop = async(function () {
        if (this._procession[this._property] >= this._limit) {
            this._procession.shifted.enter(async())
        } else {
            async(function () {
                this._procession.enqueue(value, async())
            }, function () {
                return [ loop.break ]
            })
        }
    })()
})

module.exports = Throttle
