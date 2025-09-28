// USACO Problems Crawler for Firestore
// Run with: node usaco-crawler.js
// Requires: axios, cheerio, firebase-admin, adm-zip
// Place your Firebase service account key as serviceAccountKey.json in the project root

const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const os = require('os');

// ---- SETUP FIREBASE ADMIN ----
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json. Download it from Firebase Console > Project Settings > Service Accounts.');
  process.exit(1);
}
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  storageBucket: 'gs://nnhs-programming-club-website.firebasestorage.app',
});
const db = admin.firestore();
const problemsCollection = db.collection('problems');
const bucket = admin.storage().bucket();

// ---- HELPERS ----
function parseContestInfo(h2Text) {
  // Example: "USACO 2011 December Contest, Bronze" or "USACO 2018 US Open, Bronze"
  const match = h2Text.match(/USACO (\d{4}) ((?:[A-Za-z]+|US Open))(?: Contest)?, (Bronze|Silver|Gold|Platinum)(?: Division)?/);
  if (!match) return null;
  let month = match[2];
  if (month === 'US Open') month = 'Open';
  return {
    year: parseInt(match[1]),
    month,
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

function generateTestCasesUrls(contestInfo, problemInfo, description) {
  const urls = [];
  
  // Check if problem uses file-based input/output
  // Format: INPUT FORMAT (file filename.in):
  const fileInputMatch = description.match(/INPUT FORMAT \(file (\w+)\.in\):/i);
  
  if (fileInputMatch) {
    // File-based input/output format
    const fileName = fileInputMatch[1];
    const monthAbbr = contestInfo.month.toLowerCase() === 'open' 
      ? 'open' 
      : contestInfo.month.substring(0, 3).toLowerCase();
    const yearSuffix = contestInfo.year.toString().slice(-2);
    
    // Try with month and year
    urls.push(`https://usaco.org/current/data/${fileName}_${contestInfo.division.toLowerCase()}_${monthAbbr}${yearSuffix}.zip`);
    // Try without month and year
    urls.push(`https://usaco.org/current/data/${fileName}_${contestInfo.division.toLowerCase()}.zip`);
  } else {
    // Standard stdin/stdout format
    const monthAbbr = contestInfo.month.toLowerCase() === 'open' 
      ? 'open' 
      : contestInfo.month.substring(0, 3).toLowerCase();
    const yearSuffix = contestInfo.year.toString().slice(-2);
    
    // Try with month and year
    urls.push(`https://usaco.org/current/data/prob${problemInfo['problem-number']}_${contestInfo.division.toLowerCase()}_${monthAbbr}${yearSuffix}.zip`);
  }
  
  return urls;
}

async function downloadAndExtractTestCases(testCasesUrls) {
  for (const testCasesUrl of testCasesUrls) {
    try {
      console.log(`Trying to download test cases from: ${testCasesUrl}`);
      
      // Download the zip file
      const response = await axios.get(testCasesUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000 
      });
      
      // Create temporary directory
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usaco-test-cases-'));
      
      // Extract zip file
      const zip = new AdmZip(response.data);
      zip.extractAllTo(tempDir, true);
      
      // Read all .in and .out files
      const testCases = [];
      const files = fs.readdirSync(tempDir);
      
      // Group files by test case number
      const testCaseMap = new Map();
      
      files.forEach(file => {
        const match = file.match(/^(\d+)\.(in|out)$/);
        if (match) {
          const testId = parseInt(match[1]);
          const type = match[2];
          const content = fs.readFileSync(path.join(tempDir, file), 'utf8');
          
          if (!testCaseMap.has(testId)) {
            testCaseMap.set(testId, { testId });
          }
          testCaseMap.get(testId)[type] = content;
        }
      });
      
      // Convert map to array and sort by test number
      testCases.push(...Array.from(testCaseMap.values()).sort((a, b) => a.testId - b.testId));
      
      // Clean up temporary directory
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      console.log(`Successfully extracted ${testCases.length} test cases from: ${testCasesUrl}`);
      return { testCases, workingUrl: testCasesUrl };
      
    } catch (error) {
      console.warn(`Failed to download test cases from ${testCasesUrl}:`, error.message);
      continue; // Try next URL
    }
  }
  
  console.warn(`All URLs failed for test case download`);
  return { testCases: [], workingUrl: null };
}

function calculateTestCasesSize(testCases) {
  return JSON.stringify(testCases).length;
}

async function uploadLargeTestCasesToStorage(cpid, testCases) {
  try {
    const fileName = `test-cases/${cpid}.json`;
    const file = bucket.file(fileName);
    await file.save(JSON.stringify(testCases), {
      metadata: {
        contentType: 'application/json',
        cacheControl: 'public, max-age=31536000',
      },
    });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  } catch (error) {
    console.error(`Failed to upload test cases to storage for cpid ${cpid}:`, error.message);
    return null;
  }
}

function shouldUseStorage(testCases) {
  const size = calculateTestCasesSize(testCases);
  const MAX_FIRESTORE_SIZE = 500000; // 500KB limit for Firestore (leaving room for other fields)
  return size > MAX_FIRESTORE_SIZE;
}

// ---- MAIN CRAWLER ----
(async () => {
  // Allow user to specify start and end cpid via command line
  const args = process.argv.slice(2);
  let startCpid = 1, endCpid = 2000;
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
      
      // Download test cases
      const testCasesUrls = generateTestCasesUrls(contestInfo, problemInfo, description);
      const result = await downloadAndExtractTestCases(testCasesUrls);
      const { testCases, workingUrl } = result;
      
      // Skip if no test cases found
      if (testCases.length === 0) {
        console.log(`Skipped. No test cases found. cpid=${cpid}`);
        continue;
      }
      
      // Get next sequential id
      const id = await getNextId();
      const testCasesSize = calculateTestCasesSize(testCases);
      console.log(`Uploading test cases to Firebase Storage...`);
      const storageUrl = await uploadLargeTestCasesToStorage(cpid, testCases);
      if (!storageUrl) {
        console.log(`Skipped. Failed to upload test cases to storage. cpid=${cpid}`);
        continue;
      }
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
        testCasesUrl: workingUrl,
        testCasesStorageUrl: storageUrl,
        testCasesCount: testCases.length,
        testCasesSize,
        dateAdded: admin.firestore.Timestamp.now(),
      };
      await problemsCollection.add(doc);
      added++;
      console.log(`Added: [${id}] ${contestInfo.year} ${contestInfo.month} - ${problemInfo.title} (${testCases.length} test cases, ${Math.round(testCasesSize/1024)}KB, firebase-storage)`);
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

    // empty line
    console.log();
  }
  console.log(`Done. Total problems added: ${added}`);
  process.exit(0);
})();

// ---- USAGE ----
// 1. Download your Firebase service account key as serviceAccountKey.json in this directory.
// 2. Run: npm install axios cheerio firebase-admin adm-zip
// 3. Run: node usaco-crawler.js
//
// The script will only add new Bronze division problems and skip existing ones by cpid.
// Test cases will be automatically downloaded and stored in Firestore.
