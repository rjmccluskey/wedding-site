var express = require('express');
var router = express.Router();
var client = require('redis').createClient(process.env.REDIS_URL);
var secretCode = process.env.SECRETE_CODE;
var adminSecret = process.env.ADMIN_SECRET;
var pages = [
    'lodging',
    'mainevent',
    'ourstory',
    'rsvp',
    'registry'
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

router.get('/rsvp', function(req, res, next) {
    if (authenticate(req, res)) {
        if (req.session.rsvp) {
            res.render('rsvp-submitted', {activeMenuLink: 'rsvp'})
        } else {
            res.render('rsvp', {activeMenuLink: 'rsvp'});
        }
    } else {
        res.redirect('/');
    }
});

router.get('/rsvp-admin', function(req, res, next) {
    if (authenticate(req, res)) {
        if (req.session.adminSecret === adminSecret) {
            res.render('rsvp-admin');
        } else {
            res.render('rsvp-admin-login');
        }
    } else {
        res.reditect('/');
    }
});

router.post('/rsvp/login', function(req, res, next) {
    if (req.body.password === adminSecret) {
        req.session.adminSecret = adminSecret;
    }
    res.redirect('/rsvp-admin');
});

router.post('/rsvp', function(req, res, next) {
    var rsvp = Boolean(req.body.rsvp);
    var name = req.body.name;
    var song = req.body.song;

    if (rsvp) {
        client.rpush('rsvp-yes', name);
        client.rpush('rsvp-song', song);
    } else {
        client.rpush('rsvp-no', name);
    }
    req.session.rsvp = true;

    res.redirect('/rsvp');
});

/* This route should always be the last GET route in this file */
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
