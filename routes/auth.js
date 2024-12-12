const express = require('express');
const User = require('../User');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const router = express.Router();

// Register Route
router.post(
  '/register',
  [
    body('username').not().isEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  async (req, res) => {
    console.log(req.body)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Create a new user
      user = new User({ username, email, password });
      await user.save();

      // Generate JWT Token
      const payload = {
        user: {
          id: user._id,
        },
      };

      const token = jwt.sign(payload, "your_jwt_secret_key", {
        expiresIn: '1h',
      });

      res.status(201).json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(req.body)

    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT Token
    const payload = {
      user: {
        id: user._id,
      },
    };

    const token = jwt.sign(payload, "your_jwt_secret_key", {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
