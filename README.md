# node-datastream

[node-datastream](http://github.com/mayconbordin/node-datastream) is a collection
of algorithms for data stream processing.

# Current Algorithms

### Frequent itemsets

* CountMin-Sketch [1]
* Frequent Algorithm [2,3]
* Lossy Counting and its variant [4]
* SpaceSaving [5]
* Sticky Sampling [4]

# Example

```javascript
var ds = require('../');

var counter = new ds.CountMin({delta: 1e-7, epsilon: 0.05, k: 10});

var alpha = 'abcdefghi';
var stream = [];
for (var i=0; i<alpha.length; i++)
    for(var j=0; j<Math.pow(2,i); j++)
        stream.push(alpha[i]);
        
stream = (function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
})(stream);

stream.forEach(function(c) {
    counter.update(c, 1);
});

counter.getTopK().forEach(function(item) {
    console.log(item.value, item.key);
});
```

## License

The MIT License (MIT)
Copyright (c) 2013 Maycon Bordin

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# References

[1] Cormode, Graham, and S. Muthukrishnan. "An improved data stream summary: the 
    count-min sketch and its applications." Journal of Algorithms 55.1 (2005):
    58-75.

[2] R. Karp, C. Papadimitriou, and S. Shenker. A simple algorithm for ﬁnding 
    frequent elements in sets and bags. ACM Transactions on Database Systems,
    28:51–55, 2003.

[3] E. Demaine, A. Lopez-Ortiz, and J. I. Munro. Frequency estimation of internet
    packet streams with limited space. In European Symposium on Algorithms
    (ESA), 2002.

[4] Manku, Gurmeet Singh, and Rajeev Motwani. "Approximate frequency counts over
    data streams." Proceedings of the 28th international conference on Very
    Large Data Bases. VLDB Endowment, 2002.

[5] Metwally, Ahmed, Divyakant Agrawal, and Amr El Abbadi. "Efficient computation
    of frequent and top-k elements in data streams." Database Theory-ICDT 2005.
    Springer Berlin Heidelberg, 2005. 398-412.
