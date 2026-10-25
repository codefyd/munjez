// يولّد أيقونة التطبيق (PNG) بدون أي مكتبات خارجية
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function sample(u, v) {
  // مربع بحواف دائرية
  const r = 0.24, m = 0.04;
  const qx = Math.max(Math.abs(u - 0.5) - (0.5 - m - r), 0);
  const qy = Math.max(Math.abs(v - 0.5) - (0.5 - m - r), 0);
  if (Math.hypot(qx, qy) > r) return null;
  // علامة صح
  const d = Math.min(segDist(u, v, 0.29, 0.52, 0.44, 0.67), segDist(u, v, 0.44, 0.67, 0.72, 0.37));
  if (d < 0.055) return [255, 255, 255];
  const t = (u + v) / 2; // تدرج قطري
  return [Math.round(20 + 10 * t), Math.round(184 - 60 * t), Math.round(140 - 40 * t)];
}

function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const S = 4;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
        const c = sample((x + (sx + 0.5) / S) / size, (y + (sy + 0.5) / S) / size);
        if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = a ? r / a : 0; raw[o + 1] = a ? g / a : 0; raw[o + 2] = a ? b / a : 0;
      raw[o + 3] = Math.round((a / (S * S)) * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = path.join(__dirname, '..', 'assets');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon.png'), png(256));
fs.writeFileSync(path.join(out, 'icon-32.png'), png(32));
console.log('icons written to', out);
