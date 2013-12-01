var countmin         = require('./lib/countmin.js')
  , spacesaving      = require('./lib/spacesaving.js')
  , lossycounting    = require('./lib/lossycounting.js')
  , lossycountingvar = require('./lib/lossycountingvar.js')
  , stickysampling   = require('./lib/sticky-sampling.js')
  , frequent         = require('./lib/frequent.js')
  , exact            = require('./lib/exact.js')
  ;

module.exports = {
    CountMin: countmin,
    SpaceSaving: spacesaving,
    LossyCounting: lossycounting,
    LossyCountingVariant: lossycountingvar,
    StickySampling: stickysampling,
    Frequent: frequent,
    Exact: exact
};
