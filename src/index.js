/**
 * password-inspector
 *
 * Analyze password characteristics locally.
 * This package does not transmit, persist, or log passwords.
 */

const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "12345678",
  "12345",
  "1234567",
  "password",
  "password1",
  "password123",
  "qwerty",
  "qwerty123",
  "111111",
  "123123",
  "abc123",
  "iloveyou",
  "admin",
  "welcome",
  "letmein",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "sunshine",
  "princess",
  "master",
  "login",
  "passw0rd"
]);

const DICTIONARY_TERMS = [
  "password",
  "welcome",
  "admin",
  "letmein",
  "qwerty",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "hello",
  "sunshine",
  "princess",
  "secret",
  "login",
  "trustno",
  "computer"
];

const KEYBOARD_SEQUENCES = [
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "qwert",
  "asdf",
  "zxcv",
  "poiuy",
  "lkjhg",
  "mnbvc"
];

function normalizeForPatternChecks(password) {
  return password
    .toLowerCase()
    .replace(/@/g, "a")
    .replace(/0/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/\$/g, "s")
    .replace(/[^a-z0-9]/g, "");
}

function getCharacterTypes(password) {
  return {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9\s]/u.test(password),
    spaces: /\s/u.test(password)
  };
}

function getCharacterPoolSize(types) {
  let pool = 0;
  if (types.lowercase) pool += 26;
  if (types.uppercase) pool += 26;
  if (types.numbers) pool += 10;
  if (types.symbols) pool += 33;
  if (types.spaces) pool += 1;
  return pool;
}

function containsSequentialRun(password, minimumLength = 3) {
  const value = password.toLowerCase();

  for (let i = 0; i <= value.length - minimumLength; i += 1) {
    let ascending = 1;
    let descending = 1;

    for (let j = i + 1; j < value.length; j += 1) {
      const previous = value.charCodeAt(j - 1);
      const current = value.charCodeAt(j);

      if (current === previous + 1 && ascending === j - i) {
        ascending += 1;
      } else if (current !== previous + 1) {
        break;
      }
    }

    for (let j = i + 1; j < value.length; j += 1) {
      const previous = value.charCodeAt(j - 1);
      const current = value.charCodeAt(j);

      if (current === previous - 1 && descending === j - i) {
        descending += 1;
      } else if (current !== previous - 1) {
        break;
      }
    }

    if (ascending >= minimumLength || descending >= minimumLength) {
      return true;
    }
  }

  return false;
}

function hasRepeatedCharacter(password, minimumLength = 3) {
  return new RegExp(`(.)\\1{${minimumLength - 1},}`, "u").test(password);
}

function hasRepeatedChunk(password) {
  const value = password.toLowerCase();

  for (let chunkLength = 2; chunkLength <= Math.floor(value.length / 2); chunkLength += 1) {
    for (let i = 0; i + chunkLength * 2 <= value.length; i += 1) {
      const first = value.slice(i, i + chunkLength);
      const second = value.slice(i + chunkLength, i + chunkLength * 2);

      if (first === second) {
        return true;
      }
    }
  }

  return false;
}

function hasKeyboardSequence(password) {
  const value = password.toLowerCase();
  return KEYBOARD_SEQUENCES.some((sequence) =>
    value.includes(sequence) || value.includes([...sequence].reverse().join(""))
  );
}

function hasDictionaryTerm(password) {
  const normalized = normalizeForPatternChecks(password);
  return DICTIONARY_TERMS.some((term) => normalized.includes(term));
}

function calculateBaseScore(length) {
  if (length === 0) return 0;
  if (length < 8) return length * 2.5;
  if (length < 12) return 20 + (length - 8) * 3;
  if (length < 16) return 32 + (length - 12) * 3;
  return 44 + Math.min(length - 16, 12) * 1.5;
}

function getStrengthLabel(score) {
  if (score < 20) return "Very Weak";
  if (score < 40) return "Weak";
  if (score < 60) return "Fair";
  if (score < 80) return "Strong";
  return "Very Strong";
}

/**
 * Inspect a password and return a score, detected characteristics,
 * issues, and improvement suggestions.
 *
 * @param {string} password Password to inspect.
 * @returns {{
 *   score: number,
 *   strength: string,
 *   length: number,
 *   characterTypes: object,
 *   estimatedEntropyBits: number,
 *   issues: string[],
 *   suggestions: string[]
 * }}
 */
export function inspectPassword(password) {
  if (typeof password !== "string") {
    throw new TypeError("Password must be a string.");
  }

  const length = [...password].length;
  const characterTypes = getCharacterTypes(password);
  const activeTypes = Object.values(characterTypes).filter(Boolean).length;
  const poolSize = getCharacterPoolSize(characterTypes);

  // This is a theoretical character-pool estimate, not a cracking-time prediction.
  const estimatedEntropyBits =
    length > 0 && poolSize > 0
      ? Math.round(length * Math.log2(poolSize) * 10) / 10
      : 0;

  const issues = [];
  const suggestions = [];
  let score = calculateBaseScore(length);

  score += activeTypes * 7;
  score += Math.min(15, estimatedEntropyBits / 8);

  if (length < 8) {
    issues.push("Password is shorter than 8 characters.");
    suggestions.push("Use at least 12 characters; longer passwords are generally safer.");
  } else if (length < 12) {
    issues.push("Password is shorter than the recommended 12 characters.");
    suggestions.push("Increase the password length to at least 12 characters.");
  }

  if (!characterTypes.lowercase) {
    issues.push("No lowercase letters detected.");
    suggestions.push("Consider including lowercase letters.");
  }

  if (!characterTypes.uppercase) {
    issues.push("No uppercase letters detected.");
    suggestions.push("Consider including uppercase letters.");
  }

  if (!characterTypes.numbers) {
    issues.push("No numbers detected.");
    suggestions.push("Consider including numbers, without using predictable sequences.");
  }

  if (!characterTypes.symbols) {
    issues.push("No symbols detected.");
    suggestions.push("Consider including symbols if the service allows them.");
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    issues.push("This password matches a commonly used password.");
    suggestions.push("Avoid common passwords and choose a unique passphrase.");
    score -= 45;
  }

  if (hasDictionaryTerm(password) && !COMMON_PASSWORDS.has(password.toLowerCase())) {
    issues.push("Password contains a common word or predictable term.");
    suggestions.push("Avoid common words, names, and predictable substitutions.");
    score -= 12;
  }

  if (containsSequentialRun(password)) {
    issues.push("Password contains a predictable sequence such as 123 or abc.");
    suggestions.push("Avoid consecutive letters or numbers.");
    score -= 8;
  }

  if (hasKeyboardSequence(password)) {
    issues.push("Password contains a predictable keyboard sequence.");
    suggestions.push("Avoid keyboard patterns such as qwerty or asdf.");
    score -= 12;
  }

  if (hasRepeatedCharacter(password)) {
    issues.push("Password contains repeated characters.");
    suggestions.push("Avoid repeating the same character several times.");
    score -= 12;
  }

  if (hasRepeatedChunk(password)) {
    issues.push("Password contains a repeated character pattern.");
    suggestions.push("Avoid repeating chunks such as abcabc or 1212.");
    score -= 10;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (issues.length === 0) {
    suggestions.push("No obvious issues were detected by these basic checks.");
  }

  return {
    score,
    strength: getStrengthLabel(score),
    length,
    characterTypes,
    estimatedEntropyBits,
    issues,
    suggestions
  };
}

export { getStrengthLabel };
