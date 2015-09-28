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

buildPages(router, {
    'our-story': '/ourstory',
    'the-main-event': '/mainevent',
    'lodging': '/lodging'
});

// router.get('/ourstory', function(req, res, next) {
//     if (authenticate(req, res)) {
//         res.render('our-story', { activeMenuLink: 'ourStory' });
//     }
// });

// router.get('/mainevent', function(req, res, next) {
//     if (authenticate(req, res)) {
//         res.render('the-main-event', { activeMenuLink: 'theMainEvent' });
//     }
// });

// router.get('/lodging', function(req, res, next) {
//     if (authenticate(req, res)) {
//         res.render('lodging', { activeMenuLink: 'lodging' });
//     }
// });

function buildPages(router, viewToRouteObject) {
    var keys = Object.keys(viewToRouteObject);
    for (var i = keys.length - 1; i >= 0; i--) {
        var view = keys[i];
        var route = viewToRouteObject[view];
        router.get(route, function(req, res, next) {
            if (authenticate(req, res)) {
                res.render(view, {activeMenuLink: view});
            }
        });
    };
};

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
