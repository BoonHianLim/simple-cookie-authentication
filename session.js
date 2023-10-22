class Session {
    constructor(username, expiresAt) {
        this.username = username
        this.expiresAt = expiresAt
    }

    // we'll use this method later to determine if the session has expired
    isExpired() {
        this.expiresAt < (new Date())
    }
}

module.exports = Session