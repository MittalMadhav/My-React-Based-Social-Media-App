const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const User = require('../../models/User');

const router = express.Router();

// @route   GET     api/auth
// @desc    Test    route
// @access  Public

//just add middleware as second parameter if you want to use it and make the route protected, the middleware is run automatically
router.get('/', authMiddleware, async(req, res) => { 
    
    try 
    {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }

    catch
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
