// USACO Problems Crawler for Firestore
// Run with: node usaco-crawler.js
// Requires: axios, cheerio, firebase-admin
// Place your Firebase service account key as serviceAccountKey.json in the project root

const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ---- SETUP FIREBASE ADMIN ----
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json. Download it from Firebase Console > Project Settings > Service Accounts.');
  process.exit(1);
}
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});
const db = admin.firestore();
const problemsCollection = db.collection('problems');

// ---- HELPERS ----
function parseContestInfo(h2Text) {
  // Example: "USACO 2011 December Contest, Bronze" or "USACO 2011 December Contest, Bronze Division"
  const match = h2Text.match(/USACO (\d{4}) ([A-Za-z]+) Contest, (Bronze|Silver|Gold|Platinum)(?: Division)?/);
  if (!match) return null;
  return {
    year: parseInt(match[1]),
    month: match[2],
    division: match[3],
  };
}

function parseProblemInfo(h2Text) {
  // Example: "Problem 1. Cow Photography"
  const match = h2Text.match(/Problem (\d+)\.\s*(.+)/);
  if (!match) return null;
  return {
    'problem-number': parseInt(match[1]),
    title: match[2].trim(),
  };
}

async function getNextId() {
  // Get the max id in the collection, increment by 1
  const snapshot = await problemsCollection.orderBy('id', 'desc').limit(1).get();
  if (snapshot.empty) return 1;
  return snapshot.docs[0].data().id + 1;
}

async function cpidExists(cpid) {
  const snapshot = await problemsCollection.where('cpid', '==', cpid).limit(1).get();
  return !snapshot.empty;
}

// ---- MAIN CRAWLER ----
(async () => {
  // Allow user to specify start and end cpid via command line
  const args = process.argv.slice(2);
  let startCpid = 1, endCpid = 5000;
  if (args.length === 2) {
    startCpid = parseInt(args[0], 10);
    endCpid = parseInt(args[1], 10);
    if (isNaN(startCpid) || isNaN(endCpid) || startCpid < 1 || endCpid < startCpid) {
      console.error('Usage: node usaco-crawler.js [startCpid] [endCpid]');
      process.exit(1);
    }
  } else if (args.length !== 0) {
    console.error('Usage: node usaco-crawler.js [startCpid] [endCpid]');
    process.exit(1);
  }

  let added = 0;
  for (let cpid = startCpid; cpid <= endCpid; cpid++) {
    const url = `https://usaco.org/index.php?page=viewproblem2&cpid=${cpid}`;
    try {
      const { data: html } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(html);
      const h2s = $('h2');
      if (h2s.length < 2) continue; // Not a problem page
      const contestInfo = parseContestInfo($(h2s[0]).text());
      if (!contestInfo) {
        console.log(`Skipped. cpid returned nothing. cpid=${cpid}`)
        continue;
      }; 

      if (contestInfo.division !== 'Bronze') {
        console.log(`Skipped. Not a bronze problem. cpid=${cpid}`)
        continue;
      } // only bronze problems

      const problemInfo = parseProblemInfo($(h2s[1]).text());
      if (!problemInfo) {
        console.log(`Skipped. cpid returned nothing. cpid=${cpid}`)
        continue;
      }
      const description = $('#probtext-text').text().trim();
      if (!description) {
        console.log(`Skipped. cpid returned nothing. cpid=${cpid}`)
        continue;
      }
      // Check if cpid already exists
      if (await cpidExists(cpid)) {
        console.log(`Skipped. cpid already exists in firestore. cpid=${cpid}`)
        continue;
      };
      // Get next sequential id
      const id = await getNextId();
      // Prepare document
      const doc = {
        id,
        cpid,
        year: contestInfo.year,
        month: contestInfo.month,
        division: contestInfo.division,
        'problem-number': problemInfo['problem-number'],
        title: problemInfo.title,
        description,
        url,
        dateAdded: admin.firestore.Timestamp.now(),
        inputs: [], // Placeholder, can be parsed if needed
        outputs: [], // Placeholder, can be parsed if needed
      };
      await problemsCollection.add(doc);
      added++;
      console.log(`Added: [${id}] ${contestInfo.year} ${contestInfo.month} - ${problemInfo.title}`);
    } catch (err) {
      // Skip on error (network, parse, etc.)
      if (err.response && err.response.status === 404) continue;
      if (err.code === 'ECONNABORTED') {
        console.warn(`Timeout for cpid ${cpid}`);
        continue;
      }
      // If redirected to home page, skip
      if (err.response && err.response.request && err.response.request.res.responseUrl && err.response.request.res.responseUrl.endsWith('index.php')) continue;
      console.error(`Error for cpid ${cpid}:`, err.message);
    }
  }
  console.log(`Done. Total problems added: ${added}`);
  process.exit(0);
})();

// ---- USAGE ----
// 1. Download your Firebase service account key as serviceAccountKey.json in this directory.
// 2. Run: npm install axios cheerio firebase-admin
// 3. Run: node usaco-crawler.js
//
// The script will only add new Bronze division problems and skip existing ones by cpid.
