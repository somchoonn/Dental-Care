const path = require('path');
const express = require('express');
const e = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.redirect('/login'));
const jwt = require('jsonwebtoken');
// DB
let db = new sqlite3.Database('Dentalcare.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error('Error enabling foreign keys:', err.message);
      } else {
        console.log('Foreign keys enabled.');
      }
    });
  }
});


// JWT Middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send('Unauthorized');
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
}


// LOGIN TEST
app.get('/showUsers', (req, res) => {
  const sql = `SELECT * FROM users`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
      return;
    }
    res.json(rows);
  });
});

// LOGIN
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'เข้าสู่ระบบ | Dentalcare Clinic',
    message: null
  });
});

app.post('/login', (req, res) => {
  const { citizen_id, password } = req.body;
  db.get("SELECT * FROM users WHERE citizen_id = ? AND password = ? LIMIT 1",
    [citizen_id, password],
    (err, row) => {
      if (!row) {
        return res.render('login', { title: 'เข้าสู่ระบบ', message: 'ไม่ถูกต้อง' });
      }

      // Create JWT
      const token = jwt.sign(
        { id: row.id, citizen_id: row.citizen_id, role: row.role },
        'secret-key',
        { expiresIn: '1h' }
      );

      // Route
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,        // ถ้าใช้ HTTPS ให้เปลี่ยนเป็น true
        maxAge: 1000 * 60 * 60
      });
      res.redirect(`/${row.role}`); // redirect ไปหน้าของ role เลย

    }
  );
});

// REGISTER
app.get('/register', (req, res) => {
  res.render('register', {
    title: 'สมัครสมาชิก | Dentalcare Clinic'
  });
});

app.post('/register', (req, res) => {
  // const { citizen_id, password } = req.body;
  const { citizen_id, password, prefix, fname, lname, gender, dob, phone, email, race, nationality, religion, allergy } = req.body;
  const allergyVal = (allergy && allergy.trim() !== '') ? allergy : 'ไม่มี';
  const sql1 = `
    INSERT INTO users (citizen_id, password, role)
    VALUES (?, ?, 'patient')
  `;
  const sql2 = `
INSERT INTO patients (
  user_id, pre_name, first_name, last_name, gender, birth_date,
  phone, email, race, nationality, religion, drug_allergy
)
SELECT id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
FROM users
WHERE citizen_id = ?;
`;
  console.log('Registering user:', citizen_id);
  db.run(sql1, [citizen_id, password], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
    }
  });

  db.run(sql2, [
    prefix,
    fname,
    lname,
    gender,
    dob,
    phone,
    email,
    race,
    nationality,
    religion,
    allergyVal,
    citizen_id
  ], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
    }
    res.json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      patient_id: this.lastID
    });
  });
});
// Authenticated Test Routes
app.get('/staff', authenticateToken,allowRoles('staff'), (req, res) => {
  res.render('staff');
});

app.get('/dentist', authenticateToken,allowRoles('dentist'), (req, res) => {

  res.render('dentist');
});
app.get('/patient', authenticateToken,allowRoles('patient'), (req, res) => {

  res.render('patient');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DentalCare running at http://localhost:${PORT}`);
});
