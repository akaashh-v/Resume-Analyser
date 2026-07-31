const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/analyze', analyzeRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke on the server!' });
});

// Start Server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
