export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}/${y}`;
}

export function getMonthKey(isoDate) {
  return isoDate.slice(5, 7);
}

export function isOverspeed(speed, threshold) {
  return speed > threshold;
}
