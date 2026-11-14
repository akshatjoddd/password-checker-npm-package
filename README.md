# password-inspector

A lightweight, dependency-free password strength analyzer for JavaScript.

`password-inspector` checks password length, character variety, common passwords, repeated characters, sequential patterns, and predictable keyboard sequences. It returns a score, a strength label, detected issues, and suggestions.

## Features

- Strength score from 0 to 100
- Labels: Very Weak, Weak, Fair, Strong, Very Strong
- Checks lowercase, uppercase, numbers, symbols, and spaces
- Detects a small built-in list of common passwords
- Detects common words and predictable substitutions
- Detects sequential patterns such as `123` and `abc`
- Detects repeated characters and repeated chunks
- No runtime dependencies
- Runs locally; does not transmit, save, or log passwords

## Requirements

- Node.js 18 or later

## Installation

```bash
npm install password-inspector
```

## Usage

```js
import { inspectPassword } from "password-inspector";

const result = inspectPassword("hello123");

console.log(result);
```

Example output (the exact score is determined by the package's heuristic):

```js
{
  score: 19,
  strength: "Very Weak",
  length: 8,
  characterTypes: {
    lowercase: true,
    uppercase: false,
    numbers: true,
    symbols: false,
    spaces: false
  },
  estimatedEntropyBits: 41.4,
  issues: [
    "Password is shorter than the recommended 12 characters.",
    "No uppercase letters detected.",
    "No symbols detected.",
    "Password contains a common word or predictable term.",
    "Password contains a predictable sequence such as 123 or abc."
  ],
  suggestions: [
    "Increase the password length to at least 12 characters.",
    "Consider including uppercase letters.",
    "Consider including symbols if the service allows them.",
    "Avoid common words, names, and predictable substitutions.",
    "Avoid consecutive letters or numbers."
  ]
}
```

## API

### `inspectPassword(password)`

Accepts a string and returns:

| Property | Description |
| --- | --- |
| `score` | Heuristic score from 0 to 100 |
| `strength` | Strength label |
| `length` | Number of Unicode code points |
| `characterTypes` | Boolean checks for lowercase, uppercase, numbers, symbols, and spaces |
| `estimatedEntropyBits` | Theoretical character-pool entropy estimate |
| `issues` | Detected weaknesses |
| `suggestions` | Improvement suggestions |

Throws a `TypeError` if the input is not a string.

### `getStrengthLabel(score)`

Converts a numeric score into a strength label.

```js
import { getStrengthLabel } from "password-inspector";

console.log(getStrengthLabel(85)); // Very Strong
```

## Score labels

| Score | Label |
| --- | --- |
| 0–19 | Very Weak |
| 20–39 | Weak |
| 40–59 | Fair |
| 60–79 | Strong |
| 80–100 | Very Strong |

## Development

Clone the repository, then run:

```bash
npm install
npm test
```

## Important security note

This package is a lightweight heuristic checker, not a complete password-security audit. Its score is not a guarantee that a password is safe, and its entropy estimate is a theoretical character-pool estimate—not a prediction of real-world cracking time.

The built-in common-password and dictionary-term lists are intentionally small. They do not replace checks against a comprehensive compromised-password dataset. Do not send real user passwords to third-party services for analysis.

For production authentication systems, use a modern password-hashing algorithm such as Argon2id or scrypt, enforce secure transport, and follow current authentication security guidance. Password strength checking is not a substitute for secure password storage.

## License

MIT
