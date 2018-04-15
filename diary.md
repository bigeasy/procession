## Sat Apr 14 22:07:21 CDT 2018

Occurs to me that this could be a message tree of sorts. Everyone provides a
method to pump too and instead of having `dequeue` method, there is instead a
propagation of errors from the callback. Instead of turning the corner, the
errors really do bubble up. It means that you always `queue.enqueue` and…

And then what? Wait for everyone to process the message until you enqueue the
next message?

In for a penny, in for a pound? Use Destructible when there is a method to
capture. Or else leave it is is. Know the difference and fallback to `abend`.
