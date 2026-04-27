const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const uploadDir = path.join(__dirname, '..', 'assets', 'user-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `user-${req.body.userId}-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });


const app = express();
app.use('/assets/user-images', express.static(uploadDir));


const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Dev-friendly CSP - overrides node_modules strict policy
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  if (process.env.NODE_ENV !== 'production') {
    res.set('Content-Security-Policy', 
      "default-src 'self' http://localhost:* 'unsafe-inline'; " +
      "connect-src 'self' http://localhost:* ws://localhost:*; " +
      "img-src 'self' data: http://localhost:* https: blob:; " +
      "style-src 'self' 'unsafe-inline'; " +
      "script-src 'self' 'unsafe-inline' http://localhost:*; " +
      "font-src 'self' http://localhost:* data:;"
    );
  }
  next();
});

// Serve login.html as root /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// Serve static files from site root
app.use(express.static(path.join(__dirname, '..')));

const DATA_FILE = path.join(__dirname, 'reservations.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');


function readReservations(){
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch(e){
    return [];
  }
}

function readUsers(){
  try{
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch(e){
    return [];
  }
}

function writeUsers(users){
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function writeReservations(arr){
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

function readOrders(){
  try{
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch(e){
    return [];
  }
}

function writeOrders(arr){
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}


// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;
  if (!token) {
    return res.status(401).json({error: 'No token provided'});
  }
  // Simple token check (in production, verify JWT)
  next();
}

// GET all reservations (for the public display board)
app.get('/api/reservations', (req, res) => {
  const reservations = readReservations();
  // Return reservations without IP addresses for security
  const publicReservations = reservations.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    date: r.date,
    time: r.time,
    guests: r.guests,
    message: r.message,
    createdAt: r.createdAt
  }));
  res.json(publicReservations);
});

app.post('/api/reservations', (req, res) => {
  const {name, email, date, time, guests} = req.body || {};
  if(!name || !email || !date || !time || !guests){
    return res.status(400).json({error: 'Missing required fields.'});
  }
  
  const reservations = readReservations();
  
  // Check if this email already has a reservation
  const existingReservation = reservations.find(r => r.email === email);
  if(existingReservation){
    return res.status(403).json({error: 'You have already booked a table.'});
  }
  
  const newRes = {
    id: Date.now(),
    name, email, date, time, guests, 
    message: req.body.message || '',
    foods: req.body.foods || [], // Array of selected dishes
    createdAt: new Date().toISOString()
  };

  reservations.push(newRes);
  try{
    writeReservations(reservations);
    res.status(201).json({ok:true, reservation: newRes});
  } catch(err){
    res.status(500).json({error:'Could not save reservation.'});
  }
});

// POST /api/auth/profile-upload - Update profile + avatar

app.post('/api/auth/profile-upload', upload.single('avatar'), (req, res) => {
  const { id, firstName, surname, phone } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id == parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update profile fields
  if (firstName) users[userIndex].firstName = firstName;
  if (surname) users[userIndex].surname = surname;
  if (phone) users[userIndex].phone = phone;
  
  // Update avatar if uploaded
  if (req.file) {
    users[userIndex].image = `/assets/user-images/${req.file.filename}`;
  }
  
  writeUsers(users);
  res.json({ user: users[userIndex] });
});


// POST /api/auth/upload-avatar
app.post('/api/auth/upload-avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const userId = req.body.userId;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id == userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const imageUrl = `/assets/user-images/${req.file.filename}`;
  users[userIndex].image = imageUrl;
  writeUsers(users);
  res.json({ imageUrl });
});

// POST /api/auth/register


app.post('/api/auth/register', (req, res) => {
  const { email, firstName, surname, phone, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: Date.now(),
    email,
    firstName,
    surname,
    phone,
    username,
    password, // In production, hash this!
    loginDate: new Date().toISOString(),
    image: '/assets/images/download (1).jpeg'
  };
  users.push(newUser);
  writeUsers(users);

  const token = `fake-jwt-token-${newUser.id}-${Date.now()}`; // Simple token

  res.json({ token, user: { id: newUser.id, username: newUser.username, email, firstName, surname, phone } });
});

// Update login to return all fields + update loginDate
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === username && u.password === password);
  if (userIndex === -1) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Update login date
  users[userIndex].loginDate = new Date().toISOString();
  writeUsers(users);

  const token = `fake-jwt-token-${users[userIndex].id}-${Date.now()}`;
  res.json({ token, user: {
    id: users[userIndex].id,
    username: users[userIndex].username,
    email: users[userIndex].email,
    firstName: users[userIndex].firstName,
    surname: users[userIndex].surname,
    phone: users[userIndex].phone,
    loginDate: users[userIndex].loginDate,
    image: users[userIndex].image
  } });
});




// Login endpoint complete ✓


// GET /api/orders
app.get('/api/orders', (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const { name, phone, dish, quantity, address, total } = req.body;
  if (!name || !phone || !dish || !quantity || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orders = readOrders();
  const newOrder = {
    id: Date.now(),
    name, phone, dish, quantity: parseInt(quantity), address, total: parseFloat(total),
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  writeOrders(orders);

  res.json({ ok: true, order: newOrder });
});

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port} and 0.0.0.0:${port}`);
  });


  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);

