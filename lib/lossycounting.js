// lossycounting.js
//
// Algorithm described in Manku and Motwani [2002]
//
// Ref.: Manku, Gurmeet Singh, and Rajeev Motwani. "Approximate frequency counts over data streams." Proceedings of the 28th international conference on Very Large Data Bases. VLDB Endowment, 2002.
// 
// Based on: http://github.com/mugenen/LossyCounting
//

/**
 * @class LossyCounting
 * @classdesc Manku and Motwani [2005]
 *
 * @param {object} options Define the error threshold (epsilon) and support threshold (s)
 **/
var LossyCounting = function(options) {
    if (options.epsilon <= 0 || options.epsilon >= 1)
        throw new Error("epsilon must be between 0 and 1, exclusive");
        
    this.epsilon = options.epsilon;
    this.s = options.s;
    this.n = 0;
    this.list = {};
    this.bCurrent = 1;
};

LossyCounting.prototype = {
    update: function(key, increment) {
        this.n += increment;
        
        if (key in this.list)
            this.list[key].count += increment;
        else
            this.list[key] = {count: increment, delta: this.bCurrent - 1};
            
        if (this.n % parseInt(1 / this.epsilon) == 0) {
            this.trim();
            this.bCurrent++;
        }
    },
    
    trim: function() {
        for (item in this.list)
            if (this.list[item].count <= (this.bCurrent - this.list[item].delta))
                delete this.list[item];
    },
    
    getTopK: function(k) {
        var res = [];
        for (item in this.list)
            if (this.list[item].count >= (this.s - this.epsilon * this.n))
                res.push({key: item, value: this.list[item].count});
    
        res.sort(function(a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        return res.slice(0, k);
    }
};

module.exports = LossyCounting;
