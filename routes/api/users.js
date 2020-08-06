const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

const router = express.Router();

// @route   POST     api/users
// @desc    Register User
// @access  Public
router.post(
	'/',

	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 }),
	],

	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		const { name, email, password } = req.body; //for easier typing

        try //Now we have checked for errors after the user has entered his particulars, but still haven't actually added the user to our database
        {
			let user = await User.findOne({ email }); ////To see if the user already exists

            if (user) 
            {	
				return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            } 
            
            else //Now we can go ahead with the new user details, encrypting it etc
            {
				//To get the users Gravitar from his email
				const avatar = gravatar.url(email, {
					s: '200',
					r: 'pg',
					d: 'mm',
				});

				user = new User({
					name,
					email,
					gravatar,
					password,
				});

				//To encrypt user's password
				const salt = await bcrypt.genSalt(10);
				user.password = await bcrypt.hash(password, salt);

				//To save the entered user details in the mongoDB database
				await user.save();

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
					(err, token) => {
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
