const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./Dentalcare.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Patient Record router connected to Dentalcare.db");
    }
});

// แสดงหน้าหลัก
router.get('/', (req, res) => {
    const allPatientsQuery = `
        SELECT id, pre_name, first_name, last_name 
        FROM patients 
        ORDER BY first_name
    `;

    db.all(allPatientsQuery, [], (err, allPatients) => {
        if (err) {
            console.error(err);
            return res.status(500).send('เกิดข้อผิดพลาดในการดึงรายชื่อผู้ป่วย');
        }

        res.render('dentist/patientRecord', {
            title: 'เวชระเบียนผู้ป่วย | Dentalcare Clinic',
            allPatients: allPatients, // ส่ง allPatients ที่นี่
            patient: null,
            treatments: [],
            medicalRecord: null,
            appointment: null
        });
    });
});


// แสดงข้อมูลผู้ป่วยตาม ID
router.get('/:id', (req, res) => {
    const patientId = req.params.id;

    // เราต้องดึงรายชื่อผู้ป่วย "ทั้งหมด" มาด้วยเสมอสำหรับ Dropdown
    const allPatientsQuery = `
        SELECT id, pre_name, first_name, last_name 
        FROM patients ORDER BY first_name
    `;
    
    const patientQuery = `
        SELECT p.*, u.citizen_id
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    `;
    const treatmentQuery = `
        SELECT * FROM treatments
        WHERE patient_id = ?
        ORDER BY treatment_date DESC, treatment_time DESC
    `;
    const medicalQuery = `
        SELECT * FROM medical_records
        WHERE patient_id = ?
        ORDER BY record_date DESC
        LIMIT 1
    `;

    // ดึงรายชื่อผู้ป่วยทั้งหมด
    db.all(allPatientsQuery, [], (err, allPatients) => {
        if (err) return res.status(500).send('เกิดข้อผิดพลาดในการดึงรายชื่อผู้ป่วย');
        
        // จากนั้นดึงข้อมูลของผู้ป่วยที่เลือก
        db.get(patientQuery, [patientId], (err, patient) => {
            if (err) return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย');
            
            if (!patient) {
                return res.render('dentist/patientRecord', {
                    title: 'ไม่พบข้อมูลผู้ป่วย',
                    allPatients, // ส่ง allPatients 
                    patient: null,
                    treatments: [],
                    medicalRecord: null,
                    appointment: null
                });
            }

            db.all(treatmentQuery, [patientId], (err, treatments) => {
                if (err) return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลการรักษา');

                db.get(medicalQuery, [patientId], (err, medicalRecord) => {
                    if (err) return res.status(500).send('เกิดข้อผิดพลาดในการดึงเวชระเบียน');

                    res.render('dentist/patientRecord', {
                        title: `เวชระเบียน: ${patient.first_name} ${patient.last_name}`,
                        allPatients, // และส่ง allPatients 
                        patient,
                        treatments: treatments || [],
                        medicalRecord: medicalRecord || null,
                        appointment: null
                    });
                });
            });
        });
    });
});

// บันทึกประวัติทางการแพทย์
router.post('/medical-record', (req, res) => {
    const { patient_id, note, doctor_name } = req.body;

    if (!patient_id || !note) {
        return res.status(400).send('ข้อมูลไม่ครบถ้วน');
    }

    const insertQuery = `
        INSERT INTO medical_records (patient_id, note, doctor_name)
        VALUES (?, ?, ?)
    `;

    db.run(insertQuery, [patient_id, note, doctor_name || 'N/A'], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
        res.redirect(`/patientRecord/${patient_id}`);
    });
});


module.exports = router;