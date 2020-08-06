const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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



// @route   POST     api/auth
// @desc    Authenticate User and Get Token
// @access  Public
router.post(
	'/',

	[
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Password is required'
		).exists(),
	],

	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		const { email, password } = req.body; //for easier typing

        try 
        {
            //To see if the user exists or not
			let user = await User.findOne({ email }); 

            if (!user) 
            {	
				return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            } 

            //If user exists, to see if email matches password
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch)
            {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            
            else
            {
				//To return the jsonwebtoken, jwt is used by user to access protected routes
				const payload = {
					user: {
						id: user.id, // this id will be given automatically from the promise sent back from user.save
					},
				};

				jwt.sign(
					payload, //needs the payload that will be converted into jwt, basically the token will consist of the payload information in an encrypted format
					config.get('jwtSecret'),
					{ expiresIn: 360000 },
					(err, token) => { //token is the encoded user payload that has the unique user id
                        if (err) 
                            throw err;
                        else 
                            res.json({ token });
					}
				);
			}
        } 
        
        catch (err) //this is when there's a server error, can't connect to server or something, not because of bad data
        {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);



module.exports = router;
