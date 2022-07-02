// Extend makes custom class (ExpressError) a child of parent class (Error)
class ExpressError extends Error {
    constructor(message, statusCode) {
        // super() is used to access parent constructor's (Error) properties
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;