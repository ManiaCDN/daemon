var express = require('express');
var router = express.Router();

/**
 *  Get api home. -> redirect to home
 */
router.get('/', function (req, res, next) {
    res.redirect('');
    return next(false);
});

module.exports = router;
