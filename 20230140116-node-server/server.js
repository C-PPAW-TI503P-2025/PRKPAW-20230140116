require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const presensiRoutes = require('./routes/presensi');
const reportRoutes = require('./routes/reports'); 
const iotRoutes = require('./routes/iot');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/presensi', presensiRoutes);
app.use('/api/reports', reportRoutes); 
app.use('/api/iot', iotRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: '🚀 Presensi API is running!' });
});

// Sync database dan start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database sync error:', err);
  });

  const path = require('path'); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
