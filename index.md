Procession is an evented work queue or stream. I use it to create efficent
evented pipelines of events in my applications. It is a simple alternative to
Node.js streams for events when back pressure is not needed.

With Procession you can broadcast an event zero, one or more waiting listeners.
Listeners listen for events by creating a consumer on the procession and
listening for the consumer's `shift` function.

```javascript
var procession = new Procession

var consumer = procession.consumer()

consumer.shift(function (error, value) {
    if (error) throw error
    console.log(value)
})

procession.push(1)
```

You can chain processions together using `pipe`.

```javascript
var first = new Procession
var second = new Procession

var consumer = second.consumer()
first.consumer().pipe(second)

consumer.shift(function (error, value) {
    if (error) throw error
    console.log(value)
})

procession.push(1)
```

This is useful if want to build a series of transforms. Each transform an have
an input and output procession.

```javascript
var compressor = new Compressor
var encryptor = new Encryptor

compressor.output.pipe(encryptor.input)

compressor.push({ secret: 5 })
```

When you push onto a `Procession` that has no consumers it is essentially a
no-op, so it is not expensive to keep a procession around that has optional
events that you can optionally listen to.

You can have multiple consumers that listen

**TODO**: Implement back pressure by passing an optional callback to `push`.

Unlike [Turnstile](https://github.com/bigeasy/turnstile) events in Procession
are enqueued and then forgotten. There is no mechanism by which to send a
response to a response bound to a particular message through the procession. In
this sense they are like Node.js streams.

## Notes

How do you quickly create filters?

```javascript
procession.filter(function (message) {
    return message.type != 'administrative')
}).pump(nextProcession)

// This could replace `join`.
procession.filter(myFilter, 1).shift(async())
```

Currently, I'm using a singly-linked list so that advancing the final consumer
or iterator will make the now unreferenced final entry eligible for garbage
collection, but as I consider wanting to implement back pressure, there appears
to be no good way to signal that an entry is no longer in use so that it's heft
could be removed from the weight of the procession. Reference counting is
difficult because it makes destroying a consumer difficult. Now destroying a
consumer requires that the consumer run through the linked list and decrement
the count. There is, however, no good reason to keep a doubly-linked list, even
though a reference count would make it possible to know when to unlink.

Some of things that I do with Turnstile could be done with this pipeline class.

Not sure why I'd ever forgo visibility.
