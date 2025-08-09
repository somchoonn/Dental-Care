const path = require('path');
const express = require('express');
const { isValidThaiID } = require('./lib/helpers');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/login'));

// Login routes
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'เข้าสู่ระบบ | SmileCare',
    message: null,
    values: { citizenId: '' }
  });
});

app.post('/login', (req, res) => {
  const { citizenId, password } = req.body;
  const errors = [];
  if (!isValidThaiID(citizenId || '')) errors.push('เลขบัตรประชาชนไม่ถูกต้อง');
  if (!password) errors.push('กรุณากรอกรหัสผ่าน');

  if (errors.length) {
    return res.render('login', {
      title: 'เข้าสู่ระบบ | SmileCare',
      message: { type: 'error', text: errors.join(' • ') },
      values: { citizenId: citizenId || '' }
    });
  }

  return res.render('login', {
    title: 'เข้าสู่ระบบ | SmileCare',
    message: { type: 'success', text: 'เข้าสู่ระบบสำเร็จ (จำลอง)' },
    values: { citizenId: '' }
  });
});

// Register routes
app.get('/register', (req, res) => {
  res.render('register', {
    title: 'สมัครสมาชิก | SmileCare',
    message: null,
    values: { citizenId: '', email: '', phone: '' }
  });
});
app.post('/register', (req, res) => {
  const {
    citizenId, email, phone, password, confirm, agree,
    titleName, firstName, lastName, gender, dob,
    maritalStatus, ethnicity, nationality, religion, drugAllergy
  } = req.body;

  const errors = [];

  // Existing checks
  if (!isValidThaiID(citizenId || '')) errors.push('เลขบัตรประชาชนไม่ถูกต้อง');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim())) errors.push('อีเมลไม่ถูกต้อง');
  if (!/^\+?\d{8,15}$/.test((phone || '').trim())) errors.push('เบอร์โทรไม่ถูกต้อง');
  if ((password || '').length < 8) errors.push('รหัสผ่านอย่างน้อย 8 ตัวอักษร');
  if ((password || '') !== (confirm || '')) errors.push('รหัสผ่านไม่ตรงกัน');
  if (!agree) errors.push('กรุณายอมรับเงื่อนไขการใช้งาน');

  // New required fields
  if (!titleName) errors.push('กรุณาเลือกคำนำหน้าชื่อ');
  if (!(firstName || '').trim()) errors.push('กรุณากรอกชื่อ');
  if (!(lastName || '').trim()) errors.push('กรุณากรอกนามสกุล');
  if (!gender) errors.push('กรุณาเลือกเพศ');
  if (!dob) {
    errors.push('กรุณาเลือกวันเกิด');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    errors.push('รูปแบบวันเกิดไม่ถูกต้อง (YYYY-MM-DD)');
  }
  // Optional: validate marital status only if present

  const values = {
    citizenId, email, phone,
    titleName, firstName, lastName, gender, dob,
    maritalStatus, ethnicity, nationality, religion, drugAllergy
  };

  if (errors.length) {
    return res.render('register', {
      title: 'สมัครสมาชิก | SmileCare',
      message: { type: 'error', text: errors.join(' • ') },
      values
    });
  }

  return res.render('register', {
    title: 'สมัครสมาชิก | SmileCare',
    message: { type: 'success', text: 'สร้างบัญชีสำเร็จ! ยินดีต้อนรับสู่คลินิกทันตกรรมของเรา' },
    values: {
      citizenId: '', email: '', phone: '',
      titleName: '', firstName: '', lastName: '', gender: '', dob: '',
      maritalStatus: '', ethnicity: '', nationality: '', religion: '', drugAllergy: ''
    }
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DentalCare running at http://localhost:${PORT}`);
});
