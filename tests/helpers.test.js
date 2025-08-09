const assert = require('assert');
const { isValidThaiID, thaiCheckDigit, strength } = require('../lib/helpers');

function makeValidThaiID(prefix12){
  const cd = thaiCheckDigit(prefix12);
  return prefix12 + cd;
}

// Thai ID tests (do not modify existing checks)
{
  const base='110170023456';
  const valid = makeValidThaiID(base);
  assert.strictEqual(isValidThaiID(valid), true, 'constructed ID should be valid');
  const wrong = valid.slice(0,12) + ((+valid[12]+1)%10);
  assert.strictEqual(isValidThaiID(wrong), false, 'changing checksum must be invalid');
  assert.strictEqual(isValidThaiID('123'), false, 'short must be invalid');
  assert.strictEqual(isValidThaiID('abcdefghijklm'), false, 'non-digits invalid');
}

// Additional Thai ID edge cases
{
  assert.strictEqual(isValidThaiID('0000000000000'), false, 'all zeros must be invalid');
  assert.strictEqual(isValidThaiID('1111111111111'), false, 'all ones must be invalid');
}

// Strength tests (existing + extras)
{
  assert.strictEqual(strength(''), 0);
  assert.strictEqual(strength('12345678'), 2);
  assert.strictEqual(strength('abcdEFGH'), 3);
  assert.strictEqual(strength('Abcdef12!'), 4);
  // more
  assert.strictEqual(strength('Abcdefg!'), 3, 'no digits so <=3');
  assert.strictEqual(strength('Abc12def'), 3, 'no special so <=3');
}

console.log('All tests passed ✅');
