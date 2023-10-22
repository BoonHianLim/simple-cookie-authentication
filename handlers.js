const users = require('./users')
const uuid = require('uuid')
const Session = require('./session')

// this object stores the users sessions. For larger scale applications, a database or cache are usually used for this purpose
const sessions = {}

module.exports = {
    signinHandler : (req, res) => {
        // get users credentials from the JSON body
        const { username, password } = req.body
        if (!username) {
            res.redirect('/login')
            // If the username isn't present, return an HTTP unauthorized code
            return
        }

        // validate the password against our data
        // if invalid, send an unauthorized code
        const expectedPassword = users[username]
        if (!expectedPassword || expectedPassword !== password) {
            res.redirect('/login')
            return
        }

        // generate a random UUID as the session token
        const sessionToken = uuid.v4()

        // set the expiry time as 120s after the current time
        const now = new Date()
        const expiresAt = new Date(+now + 120 * 1000)

        // create a session containing information about the user and expiry time
        const session = new Session(username, expiresAt)
        // add the session information to the sessions map
        sessions[sessionToken] = session

        // In the response, set a cookie on the client with the name "session_cookie"
        // and the value as the UUID we generated. We also set the expiry time
        res.cookie("session_token", sessionToken, { expires: expiresAt })
        res.redirect('/profile');
    },
    isAuthenticated :(req, res) => {
        // if this request doesn't have any cookies, that means it isn't
        // authenticated. Return an error code.
        if (!req.cookies) {
            return false;
        }

        // We can obtain the session token from the requests cookies, which come with every request
        const sessionToken = req.cookies['session_token']
        if (!sessionToken) {
            // If the cookie is not set, return an unauthorized status
            return false;
        }

        // We then get the session of the user from our session map
        // that we set in the signinHandler
        userSession = sessions[sessionToken]
        if (!userSession) {
            // If the session token is not present in session map, return an unauthorized error
            return false;
        }
        // if the session has expired, return an unauthorized error, and delete the 
        // session from our map
        if (userSession.isExpired()) {
            delete sessions[sessionToken]
            return false;
        }

        // If all checks have passed, we can consider the user authenticated and
        // send a welcome message
        return true;
    },
    logoutHandler:(req, res) => {
        if (!req.cookies) {
            return
        }

        const sessionToken = req.cookies['session_token']
        if (!sessionToken) {
            return
        }

        delete sessions[sessionToken]

        res.cookie("session_token", "", { expires: new Date() })
        res.redirect('/login')
    }
}
