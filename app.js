const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// View & Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Routes
app.use('/', require('./routes/auth'));
app.use('/staff', require('./routes/staff'));
app.use('/dentist', require('./routes/dentist'));
app.use('/patient', require('./routes/patient'));

app.get('/', (req, res) => res.redirect('/login'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DentalCare running at http://localhost:${PORT}`));
