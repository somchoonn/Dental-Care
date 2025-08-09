(function(){
  function isValidThaiID(id){
    if(!/^\d{13}$/.test(id)) return false;
    const digits = id.split('').map(Number);
    const sum = digits.slice(0,12).reduce((a,d,i)=>a+d*(13-i),0);
    const check = (11-(sum%11))%10; return check===digits[12];
  }
  function strength(pw){
    let s=0; if((pw||'').length>=8) s++; if(/[A-Zก-ฮ]/.test(pw||'')) s++; if(/[a-z]/.test(pw||'')) s++; if(/[0-9]/.test(pw||'')) s++; if(/[^A-Za-z0-9]/.test(pw||'')) s++; return Math.min(s,4);
  }
  window.toggleVisibility=function(id){const el=document.getElementById(id); if(!el) return; el.type = el.type==='password' ? 'text':'password';};
  window.updateStrength=function(id){const el=document.getElementById(id); const bar=document.getElementById('bar'); if(!el||!bar) return; const s=strength(el.value); bar.style.width=['0%','25%','50%','75%','100%'][s];};

  window.validateLogin=function(evt){
    const f=evt.target; const cid=(f.citizenId.value||'').trim(); const pw=f.password.value||''; const errors=[];
    if(!isValidThaiID(cid)) errors.push('เลขบัตรประชาชนไม่ถูกต้อง'); if(!pw) errors.push('กรุณากรอกรหัสผ่าน');
    if(errors.length){ evt.preventDefault(); alert(errors.join('\n')); return false;} return true;
  };

  window.validateRegister=function(evt){
    const f=evt.target;
    const cid=(f.citizenId.value||'').trim();
    const email=(f.email.value||'').trim();
    const phone=(f.phone.value||'').trim();
    const pw=f.password.value||'';
    const cf=f.confirm.value||'';
    const agree=f.agree.checked;

    // new fields
    const titleName=f.titleName.value||'';
    const firstName=(f.firstName.value||'').trim();
    const lastName=(f.lastName.value||'').trim();
    const gender=f.gender.value||'';
    const dob=f.dob.value||'';
    const maritalStatus=f.maritalStatus ? f.maritalStatus.value : '';
    const ethnicity=(f.ethnicity ? f.ethnicity.value : '').trim();
    const nationality=(f.nationality ? f.nationality.value : '').trim();
    const religion=f.religion ? f.religion.value : '';
    const drugAllergy=(f.drugAllergy ? f.drugAllergy.value : '').trim();

    const errors=[];
    if(!titleName) errors.push('กรุณาเลือกคำนำหน้าชื่อ');
    if(!firstName) errors.push('กรุณากรอกชื่อ');
    if(!lastName) errors.push('กรุณากรอกนามสกุล');
    if(!gender) errors.push('กรุณาเลือกเพศ');
    if(!dob) errors.push('กรุณาเลือกวันเกิด');
    else if(!/^\d{4}-\d{2}-\d{2}$/.test(dob)) errors.push('รูปแบบวันเกิดไม่ถูกต้อง (YYYY-MM-DD)');

    // เดิม
    if(!isValidThaiID(cid)) errors.push('เลขบัตรประชาชนไม่ถูกต้อง');
    if(!/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) errors.push('อีเมลไม่ถูกต้อง');
    if(!/^\+?\d{8,15}$/.test(phone)) errors.push('เบอร์โทรไม่ถูกต้อง');
    if(pw.length<8) errors.push('รหัสผ่านอย่างน้อย 8 ตัวอักษร');
    if(pw!==cf) errors.push('รหัสผ่านไม่ตรงกัน');
    if(!agree) errors.push('กรุณายอมรับเงื่อนไขการใช้งาน');

    if(errors.length){ evt.preventDefault(); alert(errors.join('\n')); return false;} return true;
  };

  // dev console tests (เดิม)
  function mkValid(prefix12){
    const digits=prefix12.split('').map(Number);
    const sum=digits.reduce((a,d,i)=>a+d*(13-i),0);
    const cd=(11-(sum%11))%10; return prefix12+cd;
  }
  const base='110170023456'; const id=mkValid(base); console.log('✓ ThaiID constructed valid:', isValidThaiID(id));
  console.log('✓ ThaiID invalid when checksum changed:', isValidThaiID(id.slice(0,12)+((+id[12]+1)%10))===false);
  console.log('✓ Strength(\"Abcdef12!\")===4:', (function(){return (function(p){let s=0; if(p.length>=8)s++; if(/[A-Zก-ฮ]/.test(p))s++; if(/[a-z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++; return Math.min(s,4);}('Abcdef12!'))===4;})());
})();
