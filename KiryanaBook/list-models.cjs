const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const envContent = fs.readFileSync('z:/last cash book/KiryanaBook/.env', 'utf-8');
const apiKeyLine = envContent.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : null;

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available Models:");
    data.models.forEach(m => console.log(m.name));
  } catch (err) {
    console.log("Error listing models:", err.message);
  }
}

listModels();
