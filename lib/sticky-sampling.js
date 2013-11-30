// stickysampling.js
//
// Ref.: Manku, Gurmeet Singh, and Rajeev Motwani. "Approximate frequency counts over data streams." Proceedings of the 28th international conference on Very Large Data Bases. VLDB Endowment, 2002.
// Based on: http://bitbucket.org/cbockermann/stream-mining

var hashes = require('hashes');

/**
 * @class StickySampling
 * @classdesc Manku and Motwani [2002]
 *
 * @param {object} options Define the error threshold (epsilon),
 *                         support threshold (support) and
 *                         probability of failure (delta)
 **/
var StickySampling = function(options) {
    if (options.epsilon <= 0 || options.epsilon >= 1)
        throw new Error("epsilon must be between 0 and 1, exclusive");
    if (options.support <= 0 || options.support >= 1)
        throw new Error("support must be between 0 and 1, exclusive");
    if (options.delta <= 0 || options.delta >= 1)
        throw new Error("delta must be between 0 and 1, exclusive");
        
    this.epsilon = options.epsilon;
    this.support = options.support;
    this.delta   = options.delta;
    
    this.samplingRate = 1;
    this.t = (1 / this.epsilon) * Math.log(1 / (this.support * this.delta));
    this.windowCount = 0;
    this.windowLength = 2 * this.t;
    
    this.items = new hashes.HashTable();
    this.n = 0;
};

StickySampling.prototype = {
    update: function(key, increment) {
        var count = this.items.contains(key) ? this.items.get(key).value : null;
        
        if (count) {
            this.items.add(key, (count+increment), true);
            this.n += increment;
        } else if (this.sample()) {
            this.items.add(key, increment);
            this.n += increment;
        }
        
        this.windowCount++;
        
        if (this.changeOfSamplingRateNeeded()) {
            this.changeSamplingRate();
			this.adaptNewSamplingRate();
        }
    },
    
    sample: function() {
        return Math.random() <= (1 / this.samplingRate);
    },
    
    changeOfSamplingRateNeeded: function() {
        return this.windowCount == this.windowLength;
    },
    
    changeSamplingRate: function() {
        this.windowCount   = 0;
        this.samplingRate *= 2;
        this.windowLength  = this.samplingRate * this.t;
    },
    
    adaptNewSamplingRate: function() {
        var self = this;
        
        this.items.getKeyValuePairs().forEach(function(item) {
            while (self.tossCoin()) {
                self.items.add(item.key, item.value--, true);
                if (item.value == 0) {
                    self.items.remove(item.key);
                    break;
                }
            }
        });
    },
    
    tossCoin: function() {
        return Math.random() < 0.5;
    },
    
    getTopK: function(k) {
        var self = this;
        var pairs = this.items.getKeyValuePairs();

        var res = [];
        pairs.forEach(function(item) {
            if (item.value >= ((self.support - self.epsilon) * self.n))
                res.push(item);
        });

        res.sort(function(a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        return res.slice(0, k);
    }
};

module.exports = StickySampling;
