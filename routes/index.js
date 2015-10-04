var express = require('express');
var router = express.Router();
var secretCode = process.env.SECRETE_CODE;
var pages = [
    'lodging',
    'mainevent',
    'ourstory',
    'rsvp'
];

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

router.get('/:page', function(req, res, next) {
    var page = req.params.page;
    if (authenticate(req, res) && pages.indexOf(page) > -1) {
        res.render(page, { activeMenuLink: page});
    } else {
        res.redirect('/');
    }
});

function authenticate(req, res) {
    if (req.session.secretCode !== secretCode) {
        res.redirect('/');
    } else {
        return true;
    }
};

module.exports = router;
