// lossycounting.js
//
// Algorithm described in Manku and Motwani [2002]
//
// References:
// Manku, Gurmeet Singh, and Rajeev Motwani. "Approximate frequency counts over
//   data streams." Proceedings of the 28th international conference on Very
//   Large Data Bases. VLDB Endowment, 2002.
// 
// Based on:
// http://github.com/mugenen/LossyCounting
// http://www.mathcs.emory.edu/~cheung/Courses/584-StreamDB/Syllabus/07-Heavy/Manku.html
//

/**
 * @class LossyCounting
 * @classdesc Manku and Motwani [2005]
 *
 * @param {object} options Define the error threshold (epsilon) and 
 *                         support threshold (support)
 **/
var LossyCounting = function(options) {
    if (options.epsilon <= 0 || options.epsilon >= 1)
        throw new Error("epsilon must be between 0 and 1, exclusive");
        
    this.epsilon = options.epsilon;
    this.support = options.support;
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
        if (this.support > (this.epsilon * this.n))
            throw new Error('threshold s is too small');
    
        var res = [];
        for (item in this.list)
            if (this.list[item].count >= (this.support - this.epsilon * this.n))
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
