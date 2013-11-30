var countmin      = require('./lib/countmin.js')
  , spacesaving   = require('./lib/spacesaving.js')
  , lossycounting = require('./lib/lossycounting.js')
  , exact         = require('./lib/exact.js')
  ;

module.exports = {
    CountMin: countmin,
    SpaceSaving: spacesaving,
    LossyCounting: lossycounting,
    Exact: exact
};
