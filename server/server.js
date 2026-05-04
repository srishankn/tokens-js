const mongoose = require('mongoose');
const app = require('./app');
const User = require('./models/User');

const PORT = 8000;
const MONGO_URI = 'mongodb://localhost:27017/auth-js-demo';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Seed initial user
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Seeded initial test user (test@example.com / password123)');
    }

    // Start Server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  });
