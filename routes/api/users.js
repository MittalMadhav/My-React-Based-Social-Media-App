const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

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

		const { name, email, password } = req.body;

		try {
			//Now we have checked for errors after the user has entered his particulars, but still haven't actually added the user to our database

			let user = await User.findOne({ email });

			if (user) {
				//To see if the user already exists
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
			} else {
				//if the user doesn't already exist
				//To get the users Gravitar forom his email
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

				//To return the jsonwebtoken

				res.send('Users route connected and registered');
			}
		} catch (
			err //this is when there's a server error, can't connect to server or something, not because of bad data
		) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
