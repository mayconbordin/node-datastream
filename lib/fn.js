/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length, chars) {
    if (typeof(chars) == 'undefined') chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function hashCode(str) {
    var hash = 0, i, ch;
    if (str.length == 0) return hash;
        for (i = 0, l = str.length; i < l; i++) {
            ch  = str.charCodeAt(i);
            hash  = ((hash<<5)-hash)+ch;
            hash |= 0; // Convert to 32bit integer
        }
    return hash;
}

function objSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function foreach(arr, fn) {
    if (!arr) return;
    
    if (arr instanceof Array) {
        for (var i=0; i<arr.length; i++) {
            fn(arr[i], i);
        }
    } else {
        for (attr in arr) {
            fn(arr[attr], attr);
        }
    }
}

function highestOneBit(num){
    if (!num) return 0;

    var ret = 1;
    
    while (num >>= 1)
        ret <<= 1;

    return ret;
}

/*
function getRandNormalDistNumber(mean, stdev) {
    function rnd_snd() {
	    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    }

    return Math.round(rnd_snd()*stdev+mean);
}
*/

function getRandNormalDistNumber(mean, stdev, rnd) {
    var x,y,r,z;
    do {
            x = 2.0 * rnd() - 1.0; 
            y = 2.0 * rnd() - 1.0;                 
            r = x * x + y * y;
    } while (r >= 1.0);

    z = Math.sqrt(-2.0 * Math.log(r)/r);
    return mean + stdev*y*z;
}

module.exports = {
    getRandomInt: getRandomInt,
    randomString: randomString,
    hashCode: hashCode,
    objSize: objSize,
    foreach: foreach,
    highestOneBit: highestOneBit,
    getRandNormalDistNumber: getRandNormalDistNumber
};
