// Tiny, zero-dependency ZIP writer using the STORE method (no compression).
//
// Why STORE and not DEFLATE: the only large entries are WebP/PNG/JPEG
// screenshots, which are already compressed — deflating them again buys almost
// nothing while pulling in a compression library. The text entries (.ts, .md)
// are small. STORE keeps this to ~80 lines with no supply-chain footprint,
// which matches the repo's stance on dependencies.
//
// Produces a standard ZIP (local file headers + central directory + EOCD) that
// macOS Archive Utility, Windows Explorer and `unzip` all open natively.

export type ZipEntry = {
  /** Repo-relative path, e.g. `src/data/orchestrators/foo/0.1.ts`. */
  path: string;
  data: Uint8Array;
};

// Precomputed CRC-32 table (IEEE polynomial 0xEDB88320).
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();

export function textEntry(path: string, content: string): ZipEntry {
  return { path, data: encoder.encode(content) };
}

export async function blobEntry(path: string, blob: Blob): Promise<ZipEntry> {
  const buffer = await blob.arrayBuffer();
  return { path, data: new Uint8Array(buffer) };
}

// Assemble the entries into a single ZIP Blob. All offsets are <4GiB and entry
// names are ASCII paths, so the classic 32-bit format is sufficient (no ZIP64).
export function makeZip(entries: ZipEntry[]): Blob {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); // local file header signature
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // flags: UTF-8 filenames
    local.setUint16(8, 0, true); // compression: STORE
    local.setUint16(10, 0, true); // mod time
    local.setUint16(12, 0, true); // mod date
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true); // compressed size
    local.setUint32(22, size, true); // uncompressed size
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true); // extra field length

    chunks.push(new Uint8Array(local.buffer), nameBytes, entry.data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true); // central directory header signature
    cd.setUint16(4, 20, true); // version made by
    cd.setUint16(6, 20, true); // version needed
    cd.setUint16(8, 0x0800, true); // flags: UTF-8
    cd.setUint16(10, 0, true); // compression
    cd.setUint16(12, 0, true); // mod time
    cd.setUint16(14, 0, true); // mod date
    cd.setUint32(16, crc, true);
    cd.setUint32(20, size, true);
    cd.setUint32(24, size, true);
    cd.setUint16(28, nameBytes.length, true);
    cd.setUint16(30, 0, true); // extra length
    cd.setUint16(32, 0, true); // comment length
    cd.setUint16(34, 0, true); // disk number start
    cd.setUint16(36, 0, true); // internal attrs
    cd.setUint32(38, 0, true); // external attrs
    cd.setUint32(42, offset, true); // local header offset

    central.push(new Uint8Array(cd.buffer), nameBytes);
    offset += 30 + nameBytes.length + size;
  }

  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true); // end of central directory signature
  eocd.setUint16(4, 0, true); // disk number
  eocd.setUint16(6, 0, true); // disk with central dir
  eocd.setUint16(8, entries.length, true); // entries on this disk
  eocd.setUint16(10, entries.length, true); // total entries
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, offset, true); // central dir offset
  eocd.setUint16(20, 0, true); // comment length

  // Concatenate everything into a single ArrayBuffer-backed Uint8Array so the
  // Blob gets one well-typed part (avoids the SharedArrayBuffer-vs-ArrayBuffer
  // typing friction of spreading many generically-typed views).
  const parts = [...chunks, ...central, new Uint8Array(eocd.buffer)];
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Uint8Array(total);
  let cursor = 0;
  for (const p of parts) {
    combined.set(p, cursor);
    cursor += p.length;
  }
  return new Blob([combined], { type: 'application/zip' });
}
