const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Booking = require('./Booking');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./Middleware/CheckPassport');
// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://mohamed:777888@cluster0.dxkopeq.mongodb.net/sportsDB', {
    
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
const trainerSchema = new mongoose.Schema({
    name: String,
    nameAr: String,
    sport: String,
    sportAr: String,
    description: String,
    phone: String,
    descriptionAr: String,
    availableTimes: [String],
    availableTimesAr: [String],
    experience: String,       // New field for experience (English)
    experienceAr: String,     // New field for experience (Arabic)
    price: String,            // New field for price (English)
    priceAr: String,          // New field for price (Arabic)
  });
  
  

const Trainer = mongoose.model('Trainer', trainerSchema);
app.get('/trainerss/:trainerId', async (req, res) => {
  try {
    const { trainerId } = req.params;

    if (!trainerId) {
      return res.status(400).json({ message: 'trainerId  is required' }); // Validate if sportId is provided
    }

    const trainers = await Trainer.find({ _id: trainerId }); // Correct query syntax

    if (trainers.length === 0) {
      return res.status(404).json({ message: 'No trainers found ' });
    }

    console.log(trainers);
    res.status(200).json(trainers); // Send the trainers that match the sport id
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/Sport', async (req, res) => {
  try {
    const { sportId } = req.query; // Extracting the sportId from the query parameters
    if (!sportId) {
      return res.status(400).json({ message: 'Sport ID is required' }); // Validate if sportId is provided
    }

    const trainers = await Trainer.find({ sport: sportId }); // Correct query syntax

    if (trainers.length === 0) {
      return res.status(404).json({ message: 'No trainers found for the given sport' });
    }

    console.log(trainers);
    res.status(200).json(trainers); // Send the trainers that match the sport id
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/trainers', async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new trainer
app.post('/trainers', async (req, res) => {
  const trainer = new Trainer(req.body);
  try {
    const savedTrainer = await trainer.save();
    res.status(201).json(savedTrainer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a trainer
app.delete('/trainers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Trainer.findByIdAndDelete(id);
    res.status(200).json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// حفظ الحجز
app.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user.id; // الـ id الخاص بالمستخدم مستخرج من التوكن
    const { trainer, sport, time } = req.body;
    console.log(req.user.user.id)

      const newBooking = new Booking({ trainer, sport, time, userId });
      const savedBooking2 = await newBooking.save();
  //    console.log(req.user)

    // قم بحفظ الحجز في قاعدة البيانات
    res.status(201).json(savedBooking2);
   // console.log(savedBooking2)

  } catch (error) {
  //  console.log(error)

    res.status(500).json({ message: 'Failed to save booking', error });
  }
});
app.get('/bookings', authenticateToken, (req, res) => {
  const userId = req.user.user.id; // الـ id الخاص بالمستخدم مستخرج من التوكن
  // Fetch bookings for the user
  Booking.find({ userId })
    .then(bookings => res.json(bookings))
    .catch(err => res.status(500).json({ message: 'Error fetching bookings' }));
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

