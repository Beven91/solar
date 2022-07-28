
function hex(num: number, length: number) {
  let str = num.toString(16);
  let i = length - str.length;
  let z = '0';
  for (; i > 0; i >>>= 1, z += z) {
    if (i & 1) {
      str = z + str;
    }
  }
  return str;
}

function random(x: number) {
  if (x < 0 || x > 53) {
    return NaN;
  }
  const n = 0 | Math.random() * 0x40000000; // 1 << 30
  return x > 30 ? n + (0 | Math.random() * (1 << x - 30)) * 0x40000000 : n >>> 30 - x;
}

export default {
  uuid() {
    return hex(random(32), 8) + // time_low
      '-' +
      hex(random(16), 4) + // time_mid
      '-' +
      hex(0x4000 | random(12), 4) + // time_hi_and_version
      '-' +
      hex(0x8000 | random(14), 4) + // clock_seq_hi_and_reserved clock_seq_low
      '-' +
      hex(random(48), 12);
  },
};
