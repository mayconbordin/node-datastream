/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

module.exports = {
    getRandomInt: getRandomInt,
    hashCode: hashCode,
    objSize: objSize
};
