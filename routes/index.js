var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient(process.env.REDIS_URL);
var bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
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
            var yeses = {};
            var nos = {};
            client.keys('rsvp:*', function(err, keys) {
                for (var i = keys.length - 1; i >= 0; i--) {
                    var name = parseNameFromKey(keys[i]);
                    client.lrange(keys[i], 0, -1, function(err, rsvpData) {
                        var isComing = rsvpData[0];
                        if (isComing) {
                            yeses[name] = rsvpData;
                        } else {
                            nos[name] = rsvpData;
                        }
                        if (i == 0) {
                            res.render('rsvp-admin', {
                                yeses: yeses,
                                nos: nos
                            });
                        }
                    });
                };
            });

            client.keys('rsvp:*', function(err, keys) {
                for (var i = keys.length - 1; i >= 0; i--) {
                    name = parseNameFromKey(keys[i]);

                };
            })


            // var yeses, nos, songs;
            // client.lrangeAsync('rsvp-yes', 0, -1)
            // .then(function(data) {
            //     yeses = data;
            // })
            // .then(function() {
            //     client.lrangeAsync('rsvp-no', 0, -1)
            //     .then(function(data) {
            //         nos = data;
            //     })
            //     .then(function() {
            //         client.lrangeAsync('rsvp-song', 0, -1)
            //         .then(function(data) {
            //             res.render('rsvp-admin', {
            //                 yeses: yeses,
            //                 nos: nos,
            //                 songs: data
            //             });
            //         });
            //     });
            // });
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
    var key = 'rsvp:' + name;

    client.exists(key, function(err, exists) {
        if(!exists) {
            client.rpush(key, rsvp, song);
            req.session.rsvp = true;
            res.redirect('/rsvp');
        } else if (exists) {
            res.render('rsvp', {error: true});
        } else if (err) {
            console.log(err);
            client.rpush('errors', err);
            res.redirect('/rsvp');
        }
    });
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

function parseNameFromKey(key) {
    return key.substring(5);
};

module.exports = router;
