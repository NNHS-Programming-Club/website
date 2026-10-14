// Copies the problems collection from one Firebase project to another.
// Run with: node crawler/copy-problems.js [sourceKey] [targetKey]

const admin = require('firebase-admin');
const path = require('path');

const sourceKey = require(path.resolve(process.argv[2] || path.join(__dirname, 'serviceAccountKey.json')));
const targetKey = require(path.resolve(process.argv[3] || path.join(__dirname, '..', 'judge', 'serviceAccountKey.json')));

if (sourceKey.project_id === targetKey.project_id) {
  console.error(`Both keys belong to ${sourceKey.project_id}. The target must be a different project.`);
  process.exit(1);
}

const source = admin.initializeApp({ credential: admin.credential.cert(sourceKey) }, 'source').firestore();
const target = admin.initializeApp({ credential: admin.credential.cert(targetKey) }, 'target').firestore();

(async () => {
  const { docs } = await source.collection('problems').get();
  // A batch holds at most 500 writes.
  for (let i = 0; i < docs.length; i += 500) {
    const batch = target.batch();
    for (const doc of docs.slice(i, i + 500)) {
      batch.set(target.collection('problems').doc(doc.id), doc.data());
    }
    await batch.commit();
  }
  console.log(`Copied ${docs.length} problems from ${sourceKey.project_id} to ${targetKey.project_id}.`);
  process.exit(0);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
