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
const session = require('express-session');

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

// Session configuration
app.use(session({
  secret: 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user) return res.redirect('/login');
    if (!roles.includes(user.role)) {
      // ไม่อนุญาต
      return res.status(403).send('Forbidden: insufficient role');
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
  let { citizen_id, password } = req.body;
  citizen_id = (citizen_id || '').trim();
  password = (password || '').trim();

  const sql = `SELECT * FROM users WHERE citizen_id = ? AND password = ? LIMIT 1`;
  db.get(sql, [citizen_id, password], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' });
    }

    if (!row) {
      return res.render('login', {
        title: 'เข้าสู่ระบบ | Dentalcare Clinic',
        message: 'บัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง',
        values: { citizen_id }
      });
    }

    // ตั้ง session
    req.session.user = { id: row.id, citizen_id: row.citizen_id, role: row.role };

    // Redirect role
    if (row.role === 'staff') return res.redirect('/staff');
    if (row.role === 'dentist') return res.redirect('/dentist');
    if (row.role === 'patient') return res.redirect('/patient');

    // ถ้า role แปลก ๆ
    return res.status(403).send('Role not allowed');
  });
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



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DentalCare running at http://localhost:${PORT}`);
});
