// Uploads a built firmware .bin to Supabase Storage and updates the
// `firmware` table row (file_size, version, chip). Uses the service role
// key so RLS is bypassed. Called by the CI build workflow.
//
// Usage:
//   node index.js <bin-path> <chip> <version>
//
// Env:
//   SUPABASE_URL            e.g. https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const [binPath, chip, version] = process.argv.slice(2);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !binPath || !chip || !version) {
  console.error(
    'usage: node index.js <bin-path> <chip> <version>\n' +
      'env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const id = `mimios-base-${chip}`;
const fsBinPath = binPath.replace(/\.bin$/, '-fs.bin');
const bucket = 'cartridges';

async function uploadFile(path, storagePath) {
  const fs = await import('node:fs/promises');
  const data = await fs.readFile(path);
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: data
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`storage upload failed (${storagePath}): ${res.status} ${text}`);
  }
  return data.length;
}

async function main() {
  const fs = await import('node:fs/promises');

  const fileSize = await uploadFile(binPath, `firmware/${id}.bin`);
  console.log(`[upload] ${id} (${fileSize} bytes) -> firmware/${id}.bin`);

  let fsSize = 0;
  try {
    await fs.access(fsBinPath);
    fsSize = await uploadFile(fsBinPath, `firmware/${id}-fs.bin`);
    console.log(`[upload] ${id}-fs (${fsSize} bytes) -> firmware/${id}-fs.bin`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    console.log(`[upload] no filesystem image at ${fsBinPath}, skipping`);
  }

  // DB: upsert the firmware row.
  const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/firmware?on_conflict=id`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({
      id,
      title: `MimiOS Base ${chip.toUpperCase()}`,
      description: `MimiOS base firmware for ${chip.toUpperCase()} (ESP32 family)`,
      author: 'MimiOS',
      version,
      chip,
      file_size: fileSize,
      fs_size: fsSize
    })
  });
  if (!dbRes.ok) {
    const text = await dbRes.text();
    throw new Error(`db upsert failed: ${dbRes.status} ${text}`);
  }
  console.log('[upload] db ok');
}

main().catch((err) => {
  console.error(`[upload] ${err.message}`);
  process.exit(1);
});
