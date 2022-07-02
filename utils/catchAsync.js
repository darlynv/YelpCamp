// Function used to simplify async error handling by wrapping async functions with
// a function that returns a function that passes req, res, next, and any
//caught errors in next, to another function
module.exports = func => {
    return(req, res, next) => {
        func(req, res, next).catch(next)
    }
};