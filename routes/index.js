var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient(process.env.REDIS_URL);
var bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
var secretCode = process.env.SECRETE_CODE;
var adminSecret = process.env.ADMIN_SECRET;
var pages = [
    'lodging',
    'mainevent',
    'ourstory',
    'rsvp',
    'registry'
];
var rsvpYesKey = 'rsvp:yes';
var rsvpNoKey = 'rsvp:no';

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
            var yeses = [];
            var nos = [];
            client.lrangeAsync(rsvpYesKey, 0, -1)
            .then(function(data) {
                for (var i = 0; i < data.length; i++) {
                    yeses.push(splitNameSongDate(data[i]));
                };
            })
            .then(function() {
                client.lrangeAsync(rsvpNoKey, 0, -1)
                .then(function(data) {
                    for (var i = 0; i < data.length; i++) {
                        nos.push(splitNameSongDate(data[i]));
                    };
                    res.render('rsvp-admin', {
                        yeses: yeses,
                        nos: nos
                    });
                });
            });
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
    var date = new Date();
    var nameSongDateString = name + ':::' + song + ':::' + date.toString();

    if (rsvp) {
        client.rpush(rsvpYesKey, nameSongDateString);
    } else {
        client.rpush(rsvpNoKey, nameSongDateString);
    }

    var yesOrNo = rsvp ? 'Yes' : 'No';
    var html = '<p>' + yesOrNo + '</p><p>Name: ' + name + '</p><p>Song: ' + song + '</p>';
    transporter.sendMail({
        to: process.env.EMAIL_SEND_TO,
        subject: 'Wedding RSVP',
        html: html
    });

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

function splitNameSongDate(nameSongDateString) {
    return nameSongDateString.split(':::');
};

module.exports = router;
