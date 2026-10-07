const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://forte.ac.in',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads - serve all files in uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const uploadRoutes = require('./routes/upload');
const homeRoutes = require('./routes/home');
const admissionRoutes = require('./routes/admission');
const contactRoutes = require('./routes/contact');
const academicsRoutes = require('./routes/academics');
const placementsRoutes = require('./routes/placements');
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const visionMissionRoutes = require('./routes/visionMission');
const messagesRoutes = require('./routes/messages');
const governingBodyRoutes = require('./routes/governingBody');
const lifeAtFitRoutes = require('./routes/lifeAtFit');
const achievementsRoutes = require('./routes/achievements');
const careersRoutes = require('./routes/careers');
const administrationContentRoutes = require('./routes/administrationContent');
const antiRaggingCommitteeRoutes = require('./routes/antiRaggingCommittee');
const mandatoryDisclosuresRoutes = require('./routes/mandatoryDisclosures');
const aboutPageRoutes = require('./routes/aboutPage');
const announcementsRoutes = require('./routes/announcements');
const eventsRoutes = require('./routes/events');
const smtpSettingsRoutes = require('./routes/smtpSettings');
const emailLogsRoutes = require('./routes/emailLogs');

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/vision-mission', visionMissionRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/governing-body', governingBodyRoutes);
app.use('/api/life-at-fit', lifeAtFitRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/administration-content', administrationContentRoutes);
app.use('/api/anti-ragging-committee', antiRaggingCommitteeRoutes);
app.use('/api/mandatory-disclosures', mandatoryDisclosuresRoutes);
app.use('/api/about-page', aboutPageRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/smtp-settings', smtpSettingsRoutes);
app.use('/api/email-logs', emailLogsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8009;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Server started successfully!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log('\n✅ API endpoints available at:');
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`   - http://localhost:${PORT}/api/home`);
  console.log(`   - http://localhost:${PORT}/api/admission`);
  console.log(`   - http://localhost:${PORT}/api/contact`);
  console.log(`   - http://localhost:${PORT}/api/academics`);
  console.log(`   - http://localhost:${PORT}/api/placements`);
  console.log(`   - http://localhost:${PORT}/api/auth`);
  console.log('\n');
});

module.exports = app;
