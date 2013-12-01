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
