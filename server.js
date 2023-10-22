const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { signinHandler, logoutHandler, isAuthenticated } = require('./handlers')

var app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

var port = 3100;

app.listen(port, function () {
    console.log('listening on port ' + port);
});

/* public routes */
app.get('/', function (req, res, end) {
    if (isAuthenticated(req, res)) {
        res.redirect('/profile');
    } else {
        res.redirect('/login');
    }
})
app.get('/login', function (req, res, end) {
    if (isAuthenticated(req, res)) {
        res.redirect('/profile');
    } else {
        res.status(200).sendFile('./login.html', { root: __dirname });
    }
    
})

app.post('/login', signinHandler);

/* routes protected by login */
app.get('/profile', function (req, res, end) {
    if (isAuthenticated(req, res)) {
        res.status(200).sendFile('./profile.html', { root: __dirname });
    } else {
        res.redirect('/login');
    }

})

app.post('/logout', logoutHandler);