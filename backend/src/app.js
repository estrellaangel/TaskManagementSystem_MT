const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running' });
});

// Serve the OpenAPI spec file
app.get('/api/openapi.yaml', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../openapi.yaml'));
});

// Swagger UI at /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/api/openapi.yaml' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorMiddleware);

module.exports = app;