const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) 
{
    //Get token from the header
    const token = req.header('x-auth-token');

    //Check if no token 
    if (!token)
    {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    //if token found, then verification needed
    try
    {
        const decoded = jwt.verify(token, config.get('jwtSecret')); //this decodes the encoded token using jwt and compares it to actual token
        // console.log(decoded);
        

        req.user = decoded.user; //creates a user variable within each user, that contains the unique web token
        // console.log(req.user);
        next();
    }

    catch
    {
        res.status(401).json({msg: 'Token is not valid'})
    }
}

//a midd;eware is basically a function that has access to req and res