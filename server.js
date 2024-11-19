const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const PORT = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
const whiteList = ['https://www.yoursite.com', 'http://127.0.0.1:5500', 'http://localhost:3500']
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-ww-form-urlencoded'
app.use(express.urlencoded({ extended: true }));

// build-in middleware for json
app.use(express.json());

// serve static files
app.use(express.static(path.join(__dirname, '/public')));

app.get('^/$|/index(.html)?', (req, res) => {
  // res.sendFile('./views/index.html', { root: __dirname});
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/new-page(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

app.get('/old-page(.html)?', (req, res) => {
  res.redirect(301, '/new-page.html'); //302 by default
});

// Route Handlers
app.get('/hello(.html)?', (req, res, next) => {
  console.log('Attempted to load hello.html');
  next(); // Pass control to the next handler
}, (req, res) => {
  res.send("Hello World!");
});

// Chaining route handlers
const one = (req, res, next) => {
  console.log('One');
  next();
}

const two = (req, res, next) => {
  console.log('Two');
  next();
}
const three = (req, res) => {
  console.log('three');
  res.send('Finished!')
}

app.get('/chain(.html)?', [one, two, three]);

// app.all = all http methods
app.all('*', (req, res) => {
  res.status(404);
  if(req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  }else if(req.accepts('json')) {
    res.json({ error: ' 404 Not Found'});
  } else {
    res.type('txt').send('404 Not Found');
  }
})

// Error handling middleware
app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));