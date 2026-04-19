
const { askLocalAgent, normalizeText } = require('./src/lib/localAgent');

const mockData = {
  sales: [],
  expenses: [],
  udhaars: [],
  stock: [],
  contacts: [],
  invoices: [],
  profile: null
};

try {
  console.log('Test 1 (Empty):');
  console.log(askLocalAgent('hello', mockData));
  
  console.log('\nTest 2 (Profile lookup):');
  console.log(askLocalAgent('mera email kya hai', mockData));
  
  console.log('\nTest 3 (History lookup - no customer):');
  console.log(askLocalAgent('Ali ki history', mockData));

} catch (e) {
  console.error('CRASHED:', e);
}
