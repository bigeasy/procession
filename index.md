## Notes

How do you quickly create filters?

```javascript
procession.filter(function (message) {
    return message.type != 'administrative')
}).pump(nextProcession)

// This could replace `join`.
procession.filter(myFilter, 1).shift(async())
```
