// Test file to verify formatting
const testVar = 'hello' // Extra spaces will be fixed by prettier

// Missing semicolon - prettier will add it
const anotherVar = 42

// Proper typing
const numberVar: number = 42

// Prettier will format this export
export { testVar, anotherVar, numberVar }
