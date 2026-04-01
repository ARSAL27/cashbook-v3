
import { askLocalAgent, ShopData } from './KiryanaBook/src/lib/localAgent';

const mockData: ShopData = {
  sales: [],
  expenses: [],
  udhaars: [],
  stock: [],
  contacts: [],
  profile: { name: 'Test Shop', city: 'Lahore' }
};

const queries = [
  "aaj kitna bika",
  "galle mein kitne paise hain",
  "maal kitne ka para hai",
  "kis se paise lene hain",
  "nuqsan ho raha hai",
  "aoa kaisa hal he",
  "mashwara do",
  "purani recovery",
  "best selling item",
  "kam munafa wale item"
];

console.log("--- AI AGENT TEST ---");
queries.forEach(q => {
  console.log(`Query: "${q}"`);
  const resp = askLocalAgent(q, mockData);
  console.log(`Response: ${resp.split('\n')[0]}...`);
  console.log("-------------------");
});
