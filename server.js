// server.js
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Set up Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false , // Disable logging
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Define models
const Alumni = sequelize.define('Alumni', {
  id: {
    type: DataTypes.UUID,
    defaultValue: sequelize.UUIDV4,
    primaryKey: true
  },
  
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: DataTypes.STRING,
  branch: DataTypes.STRING,
  graduationYear: DataTypes.INTEGER,
  companyName: DataTypes.STRING,
  post: DataTypes.STRING,
  jobId: DataTypes.STRING,
  companyCountry: DataTypes.STRING,
  companyState: DataTypes.STRING,
  companyCity: DataTypes.STRING,
  joiningYear: DataTypes.INTEGER,
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Student = sequelize.define('Student', {
  rollNumber: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prn: {
    type: DataTypes.STRING,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  mobileNumber: DataTypes.STRING,
  branch: DataTypes.STRING,
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Middleware for detailed error logging
const errorLogger = (error, req, res, next) => {
  console.error('Error details:', error);
  next(error);
};

app.use(errorLogger);

// Routes
app.post('/api/alumni/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('branch').notEmpty(),
  body('graduationYear').isInt({ min: 1900, max: new Date().getFullYear() + 10 }).withMessage('Invalid graduation year'),
  body('phone').isMobilePhone().notEmpty(), // Validate phone number
  body('companyName').notEmpty(), // Ensure companyName is not empty
  body('post').notEmpty(), // Ensure post (job position) is not empty
  body('jobId').isInt().notEmpty(), // Validate jobId as an integer
  body('companyCity').notEmpty(), // Ensure companyCity is not empty
  body('companyCountry').notEmpty(), // Ensure companyCountry is not empty
  body('companyState').notEmpty(), // Ensure companyState is not empty
  body('joiningYear').isInt({ min: 1900, max: new Date().getFullYear() + 10 }).withMessage('Invalid graduation year') // Validate joiningYear
], async (req, res) => {
  console.log('Received alumni signup request:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, firstName, lastName, branch, graduationYear, phone, companyName, post, jobId, companyCity, companyCountry, companyState, joiningYear } = req.body;

    // Check if alumni already exists
    let alumni = await Alumni.findOne({ where: { email } });
    if (alumni) {
      console.log('Alumni already exists:', alumni);
      return res.status(400).json({ error: 'Alumni already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword);

    // Create new alumni
    const alumniData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      branch,
      graduationYear,
      phone,
      companyName,
      post,
      jobId,
      companyCity,
      companyCountry,
      companyState,
      joiningYear
    };

    console.log('Alumni data to be inserted:', alumniData);

    alumni = await Alumni.create(alumniData, { logging: true });
    console.log('Alumni created successfully:', alumni);

    res.status(201).json({ message: 'Alumni registered successfully' });
  } catch (error) {
    console.error('Error registering alumni:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/api/student/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('rollNumber').notEmpty(),
  body('prn').notEmpty(),
  body('branch').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, firstName, lastName, rollNumber, prn, branch } = req.body;
    console.log('Received student signup request:', { email, firstName, lastName, rollNumber, prn, branch });
    // Check if student already exists
    let student = await Student.findOne({ where: { email } });
    if (student) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    student = await Student.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      rollNumber,
      prn,
      branch
    });

    console.log('Student created successfully:', student.rollNumber);
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/api/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('userType').isIn(['student', 'alumni'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, userType } = req.body;
  console.log('Received login request:', { email, userType });

  try {
    let user;
    if (userType === 'student') {
      user = await Student.findOne({ where: { email } });
    } else {
      user = await Alumni.findOne({ where: { email } });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);


    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        userType: userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected route example
app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const user = req.user.user;
    let profile;

    if (user.userType === 'student') {
      profile = await Student.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });
    } else {
      profile = await Alumni.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sync database and start the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});