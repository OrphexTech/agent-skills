import { crc32 } from 'node:zlib';

// Stored (uncompressed) entries, lexical order, a fixed 1980-01-01 DOS timestamp and fixed
// Unix modes keep the archive a pure function of the portable file bytes, independent of
// the zlib build or file system that produced it.
const DOS_TIME = 0;
const DOS_DATE = (1 << 5) | 1;
const MADE_BY_UNIX = (3 << 8) | 20;
const FILE_ATTRIBUTES = (0o100644 << 16) >>> 0;
const DIRECTORY_ATTRIBUTES = ((0o40755 << 16) | 0x10) >>> 0;

function localHeader(name, crc, size) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(DOS_TIME, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(size, 18);
  header.writeUInt32LE(size, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name]);
}

function centralHeader(name, crc, size, offset, attributes) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(MADE_BY_UNIX, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(DOS_TIME, 12);
  header.writeUInt16LE(DOS_DATE, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(size, 20);
  header.writeUInt32LE(size, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt32LE(attributes, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, name]);
}

// Builds the upload archive Claude and ChatGPT expect: one top-level <slug>/ folder holding
// SKILL.md and its portable resources. `files` is the Map returned by readPortableFiles.
export function buildSkillZip(slug, files) {
  const entries = new Map([[slug + '/', null]]);
  for (const name of [...files.keys()].sort()) {
    const parts = name.split('/');
    for (let depth = 1; depth < parts.length; depth += 1) entries.set(slug + '/' + parts.slice(0, depth).join('/') + '/', null);
    entries.set(slug + '/' + name, files.get(name).bytes);
  }
  const local = [];
  const central = [];
  let offset = 0;
  for (const name of [...entries.keys()].sort()) {
    const bytes = entries.get(name) || Buffer.alloc(0);
    const encoded = Buffer.from(name, 'utf8');
    const crc = crc32(bytes);
    const record = Buffer.concat([localHeader(encoded, crc, bytes.length), bytes]);
    central.push(centralHeader(encoded, crc, bytes.length, offset, entries.get(name) ? FILE_ATTRIBUTES : DIRECTORY_ATTRIBUTES));
    local.push(record);
    offset += record.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
