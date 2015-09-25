var express = require('express');
var router = express.Router();
var secretCode = process.env.SECRETE_CODE;

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.secretCode === secretCode) {
        res.render('index', { activeMenuLink: 'home' });
    } else {
        res.render('login');
    }
});

/* Login */
router.post('/login', function(req, res, next) {
    if (req.body.password === secretCode) {
        req.session.secretCode = secretCode;
        res.redirect('/');
    } else {
        res.render('login', { message: 'Sorry, the code entered is incorrect!'})
    }
});

router.get('/ourstory', function(req, res, next) {
    if (authenticate(req, res)) {
        res.render('our-story', { activeMenuLink: 'ourStory' });
    }
});

router.get('/mainevent', function(req, res, next) {
    if (authenticate(req, res)) {
        res.render('the-main-event', { activeMenuLink: 'theMainEvent' });
    }
});

router.get('/lodging', function(req, res, next) {
    if (authenticate(req, res)) {
        res.render('lodging', { activeMenuLink: 'lodging' });
    }
});

function authenticate(req, res) {
    if (req.session.secretCode !== secretCode) {
        res.redirect('/');
    } else {
        return true;
    }
};

// redirect any unknown routes to home
router.get('*', function(req, res, next) {
    res.redirect('/');
});

module.exports = router;
