const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pdsRoutes = require('./routes/pdsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const waterRoutes = require('./routes/waterRoutes');
const electricityRoutes = require('./routes/electricityRoutes');
const houseRoutes = require('./routes/houseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pds', pdsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/electricity', electricityRoutes);
app.use('/api/house', houseRoutes);

const donationRoutes = require('./routes/donationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const fundRoutes = require('./routes/fundRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/donations', donationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static images from uploads directory
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Voice of Village Backend is Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});