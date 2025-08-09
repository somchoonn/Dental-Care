function isValidThaiID(id) {
  if (!/^\d{13}$/.test(id)) return false;
  const digits = id.split('').map(Number);
  const sum = digits.slice(0, 12).reduce((acc, d, i) => acc + d * (13 - i), 0);
  const check = (11 - (sum % 11)) % 10;
  return check === digits[12];
}

function thaiCheckDigit(twelveDigits) {
  if (!/^\d{12}$/.test(twelveDigits)) return null;
  const digits = twelveDigits.split('').map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (13 - i), 0);
  return (11 - (sum % 11)) % 10;
}

function strength(pw) {
  let s = 0;
  if ((pw || '').length >= 8) s++;
  if (/[A-Zก-ฮ]/.test(pw || '')) s++;
  if (/[a-z]/.test(pw || '')) s++;
  if (/[0-9]/.test(pw || '')) s++;
  if (/[^A-Za-z0-9]/.test(pw || '')) s++;
  return Math.min(s, 4);
}

module.exports = { isValidThaiID, thaiCheckDigit, strength };
