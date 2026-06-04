import { analyzeWithKnowledgeBase } from '../server/services/medicalKnowledge.js';

console.log('--- Testing Fallback Knowledge Base Engine ---');

// Test 1: Single Symptom "Chest pain" (Should return conditions containing Chest pain like Myocardial Infarction, Angina, etc.)
console.log('\n[Test 1] Fallback for ["Chest pain"]:');
const result1 = analyzeWithKnowledgeBase(['Chest pain']);
console.log('Possible conditions:');
console.log(result1.possibleConditions.map(c => `- ${c.name} (probability: ${c.probability}, urgency: ${c.urgency})`).join('\n'));
console.log('Advice:', result1.generalAdvice);
console.log('Warning:', result1.warningSign);

// Test 2: Single Symptom "Weight loss" (Should match Hyperthyroidism!)
console.log('\n[Test 2] Fallback for ["Weight loss"]:');
const result2 = analyzeWithKnowledgeBase(['Weight loss']);
console.log('Possible conditions:');
console.log(result2.possibleConditions.map(c => `- ${c.name} (probability: ${c.probability}, urgency: ${c.urgency})`).join('\n'));
console.log('Advice:', result2.generalAdvice);
console.log('Warning:', result2.warningSign);
