// cmsketch.js
//
// An implementation of count-min sketching from the paper due to Cormode and
// Muthukrishnan 2005
//
// Original code:
// https://tech.shareaholic.com/2012/12/03/the-count-min-sketch-how-to-count-over-large-keyspaces-when-about-right-is-good-enough/

var Heap = require('heap')
  , fn   = require('./fn.js');

/**
 * Constants
 **/
var BIG_PRIME = 9223372036854775783;

function randomParameter() {
    return fn.getRandomInt(0, BIG_PRIME - 1);
}

var Sketch = function(delta, epsilon, k) {
    if (delta <= 0 || delta >= 1)
        throw new Error("delta must be between 0 and 1, exclusive");
    if (epsilon <= 0 || epsilon >= 1)
        throw new Error("epsilon must be between 0 and 1, exclusive");
    if (k < 1)
        throw new Error("k must be a positive integer");
    
    this.w = Math.floor(Math.ceil(Math.exp(1) / epsilon));
    this.d = Math.floor(Math.ceil(Math.log(1 / delta)));
    this.k = k;
    this.hashFunctions = [];
    this.count = [];
    this.heap  = [];
    this.topK  = {};
    
    this.init();
};

Sketch.prototype = {
    init: function() {
        for (var i=0; i<this.d; i++)
            this.hashFunctions.push(this.generateHashFunction());
        
        for (var i=0; i<this.d; i++) {
            this.count.push([]);
            for (var j=0; j<this.w; j++)
                this.count[i].push(0);
        }
    },
    
    update: function(key, increment) {
        for (row in this.hashFunctions) {
            var hashFunction = this.hashFunctions[row];
            var column = hashFunction(Math.abs(fn.hashCode(key)));
            
            this.count[row][column] += increment;
        }
        
        this.updateHeap(key);
    },
    
    updateHeap: function(key) {
        var estimate = this.get(key);
        
        if (this.heap.length == 0 || estimate >= this.heap[0][0]) {
            if (key in this.topK) {
                var oldPair = this.topK[key];
                oldPair[0] = estimate;
                Heap.heapify(this.heap);
            } else {
                if (fn.objSize(this.topK) < this.k) {
                    Heap.push(this.heap, [estimate, key]);
                    this.topK[key] = [estimate, key];
                } else {
                    var newPair = [estimate, key];
                    var oldPair = Heap.pushpop(this.heap, newPair);
                    delete this.topK[oldPair[1]];
                    this.topK[key] = newPair;
                }
            }
        }
    },
    
    get: function(key) {
        var value = Number.MAX_VALUE;
        
        for (row in this.hashFunctions) {
            var hashFunction = this.hashFunctions[row];
            var column = hashFunction(Math.abs(fn.hashCode(key)));
            value = Math.min(this.count[row][column], value);
        }
        
        return value;
    },
    
    generateHashFunction: function() {
        var self = this;
        var a = randomParameter();
        var b = randomParameter();
        
        return function(x) {
            return (a * x + b) % BIG_PRIME % self.w;
        };
    },
    
    getTopK: function() {
        var res = [];
        for (key in this.topK)
            res.push(s.topK[key]);

        res.sort(function(a, b) {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        }).reverse();

        return res.slice(0, 10);
    }
};

module.exports = {
    Sketch: Sketch
};
