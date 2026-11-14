import { inspectPassword } from "password-inspector";

const result = inspectPassword("hello123");

console.log("Score:", result.score);
console.log("Strength:", result.strength);
console.log("Issues:", result.issues);
console.log("Suggestions:", result.suggestions);
