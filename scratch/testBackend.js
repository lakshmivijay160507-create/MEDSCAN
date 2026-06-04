async function runTests() {
  console.log('--- Testing MedScan AI API endpoints ---');

  // Test 1: Single Symptom (Should succeed and use fallback/groq to match conditions)
  try {
    console.log('\n[Test 1] Analyzing single symptom: "Chest pain"...');
    const res = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms: ['Chest pain'] })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Source:', data.source);
    console.log('Possible conditions found:', data.possibleConditions?.map(c => `${c.name} (${c.probability})`));
  } catch (err) {
    console.error('Test 1 failed:', err.message);
  }

  // Test 2: Invalid Symptom (Should fail with 400 Bad Request)
  try {
    console.log('\n[Test 2] Analyzing invalid symptom: "Coding Fever"...');
    const res = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms: ['Coding Fever'] })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Error message:', data.error);
  } catch (err) {
    console.error('Test 2 failed:', err.message);
  }

  // Test 3: Multiple Symptoms (Should succeed and return correct assessment)
  try {
    console.log('\n[Test 3] Analyzing multiple symptoms: ["Fever", "Cough", "Runny nose"]...');
    const res = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms: ['Fever', 'Cough', 'Runny nose'] })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Source:', data.source);
    console.log('Possible conditions found:', data.possibleConditions?.map(c => `${c.name} (${c.probability})`));
  } catch (err) {
    console.error('Test 3 failed:', err.message);
  }
}

runTests();
