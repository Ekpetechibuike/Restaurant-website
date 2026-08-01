const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.BOARD_PORT || 3000;

// API endpoints - reservations + orders
app.get('/api/reservations', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/reservations');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Could not fetch reservations' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/api/orders');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});


// Serve only the reservations board as the root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'reservations-board.html'));
});

// Serve assets (CSS, JS, images)
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Serve specific files needed for the board
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'styles.css'));
});

app.get('/reservations-board.js', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'reservations-board.js'));
});

// Serve any other CSS or JS files
app.use(express.static(path.join(__dirname, '..'), {
  extensions: ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2']
}));

// Default: serve board for any other request
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'reservations-board.html'));
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Restaurant Board Server listening on http://localhost:${port}`);
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
