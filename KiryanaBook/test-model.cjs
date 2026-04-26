const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const envContent = fs.readFileSync('.env', 'utf-8');
const apiKeyLine = envContent.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : null;

if (!apiKey) {
  console.log("No API key found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("hello");
    console.log(`[${modelName}] WORKED!`);
  } catch (err) {
    console.log(`[${modelName}] FAILED:`, err.message);
  }
}

async function run() {
  await testModel("gemini-1.5-flash");
  await testModel("gemini-3.0-flash-live");
  await testModel("gemini-3-flash-live");
  await testModel("gemini-3.0-flash");
  await testModel("gemini-3-flash");
}
run();
