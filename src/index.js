var COMMON_PASSWORDS = [
  "123456", "123456789", "12345678", "12345", "1234567",
  "password", "password1", "password123", "qwerty", "qwerty123",
  "111111", "123123", "abc123", "iloveyou", "admin",
  "welcome", "letmein", "monkey", "dragon", "football",
  "baseball", "sunshine", "princess", "master", "login", "passw0rd"
];

var DICTIONARY_TERMS = [
  "password", "welcome", "admin", "letmein", "qwerty", "iloveyou",
  "monkey", "dragon", "football", "baseball", "hello", "sunshine",
  "princess", "secret", "login", "trustno", "computer"
];

var KEYBOARD_SEQUENCES = [
  "qwerty", "asdfgh", "zxcvbn", "qwert", "asdf", "zxcv", "poiuy", "lkjhg", "mnbvc"
];

function isCommon(password) {
  var p = password.toLowerCase();
  for (var i = 0; i < COMMON_PASSWORDS.length; i++) {
    if (COMMON_PASSWORDS[i] == p) {
      return true;
    }
  }
  return false;
}

function normalizeForPatternChecks(password) {
  var p = password.toLowerCase();
  p = p.replace(/@/g, "a");
  p = p.replace(/0/g, "o");
  p = p.replace(/1/g, "i");
  p = p.replace(/!/g, "i");
  p = p.replace(/\|/g, "i");
  p = p.replace(/3/g, "e");
  p = p.replace(/4/g, "a");
  p = p.replace(/5/g, "s");
  p = p.replace(/7/g, "t");
  p = p.replace(/\$/g, "s");
  p = p.replace(/[^a-z0-9]/g, "");
  return p;
}

function getCharacterTypes(password) {
  var lower = false;
  var upper = false;
  var nums = false;
  var syms = false;
  var spaces = false;

  if (/[a-z]/.test(password)) lower = true;
  if (/[A-Z]/.test(password)) upper = true;
  if (/\d/.test(password)) nums = true;
  if (/[^A-Za-z0-9\s]/u.test(password)) syms = true;
  if (/\s/u.test(password)) spaces = true;

  return {
    lowercase: lower,
    uppercase: upper,
    numbers: nums,
    symbols: syms,
    spaces: spaces
  };
}

function getCharacterPoolSize(types) {
  var pool = 0;
  if (types.lowercase == true) {
    pool = pool + 26;
  }
  if (types.uppercase == true) {
    pool = pool + 26;
  }
  if (types.numbers == true) {
    pool = pool + 10;
  }
  if (types.symbols == true) {
    pool = pool + 33;
  }
  if (types.spaces == true) {
    pool = pool + 1;
  }
  return pool;
}

function containsSequentialRun(password, minimumLength) {
  if (minimumLength == undefined) {
    minimumLength = 3;
  }
  var value = password.toLowerCase();

  for (var i = 0; i <= value.length - minimumLength; i++) {
    var ascending = 1;
    var descending = 1;

    for (var j = i + 1; j < value.length; j++) {
      var previous = value.charCodeAt(j - 1);
      var current = value.charCodeAt(j);

      if (current == previous + 1 && ascending == j - i) {
        ascending = ascending + 1;
      } else if (current != previous + 1) {
        break;
      }
    }

    for (var k = i + 1; k < value.length; k++) {
      var prev2 = value.charCodeAt(k - 1);
      var curr2 = value.charCodeAt(k);

      if (curr2 == prev2 - 1 && descending == k - i) {
        descending = descending + 1;
      } else if (curr2 != prev2 - 1) {
        break;
      }
    }

    if (ascending >= minimumLength || descending >= minimumLength) {
      return true;
    }
  }

  return false;
}

function hasRepeatedCharacter(password, minimumLength) {
  if (minimumLength == undefined) {
    minimumLength = 3;
  }
  var re = new RegExp("(.)\\1{" + (minimumLength - 1) + ",}", "u");
  return re.test(password);
}

function hasRepeatedChunk(password) {
  var value = password.toLowerCase();

  for (var chunkLength = 2; chunkLength <= Math.floor(value.length / 2); chunkLength++) {
    for (var i = 0; i + chunkLength * 2 <= value.length; i++) {
      var first = value.slice(i, i + chunkLength);
      var second = value.slice(i + chunkLength, i + chunkLength * 2);

      if (first == second) {
        return true;
      }
    }
  }

  return false;
}

function hasKeyboardSequence(password) {
  var value = password.toLowerCase();
  for (var i = 0; i < KEYBOARD_SEQUENCES.length; i++) {
    var seq = KEYBOARD_SEQUENCES[i];
    var reversed = seq.split("").reverse().join("");
    if (value.indexOf(seq) != -1 || value.indexOf(reversed) != -1) {
      return true;
    }
  }
  return false;
}

function hasDictionaryTerm(password) {
  var normalized = normalizeForPatternChecks(password);
  for (var i = 0; i < DICTIONARY_TERMS.length; i++) {
    if (normalized.indexOf(DICTIONARY_TERMS[i]) != -1) {
      return true;
    }
  }
  return false;
}

function calculateBaseScore(length) {
  if (length == 0) {
    return 0;
  }
  if (length < 8) {
    return length * 2.5;
  }
  if (length < 12) {
    return 20 + (length - 8) * 3;
  }
  if (length < 16) {
    return 32 + (length - 12) * 3;
  }
  var extra = length - 16;
  if (extra > 12) {
    extra = 12;
  }
  return 44 + extra * 1.5;
}

function getStrengthLabel(score) {
  if (score < 20) {
    return "Very Weak";
  } else if (score < 40) {
    return "Weak";
  } else if (score < 60) {
    return "Fair";
  } else if (score < 80) {
    return "Strong";
  } else {
    return "Very Strong";
  }
}

function inspectPassword(password) {
  if (typeof password != "string") {
    throw new TypeError("Password must be a string.");
  }

  var length = [...password].length;
  var characterTypes = getCharacterTypes(password);

  var activeTypes = 0;
  if (characterTypes.lowercase) activeTypes = activeTypes + 1;
  if (characterTypes.uppercase) activeTypes = activeTypes + 1;
  if (characterTypes.numbers) activeTypes = activeTypes + 1;
  if (characterTypes.symbols) activeTypes = activeTypes + 1;
  if (characterTypes.spaces) activeTypes = activeTypes + 1;

  var poolSize = getCharacterPoolSize(characterTypes);

  var estimatedEntropyBits = 0;
  if (length > 0 && poolSize > 0) {
    estimatedEntropyBits = Math.round(length * Math.log2(poolSize) * 10) / 10;
  }

  var issues = [];
  var suggestions = [];
  var score = calculateBaseScore(length);

  score = score + activeTypes * 7;

  var entropyBonus = estimatedEntropyBits / 8;
  if (entropyBonus > 15) {
    entropyBonus = 15;
  }
  score = score + entropyBonus;

  if (length < 8) {
    issues.push("Password is shorter than 8 characters.");
    suggestions.push("Use at least 12 characters; longer passwords are generally safer.");
  } else if (length < 12) {
    issues.push("Password is shorter than the recommended 12 characters.");
    suggestions.push("Increase the password length to at least 12 characters.");
  }

  if (characterTypes.lowercase == false) {
    issues.push("No lowercase letters detected.");
    suggestions.push("Consider including lowercase letters.");
  }

  if (characterTypes.uppercase == false) {
    issues.push("No uppercase letters detected.");
    suggestions.push("Consider including uppercase letters.");
  }

  if (characterTypes.numbers == false) {
    issues.push("No numbers detected.");
    suggestions.push("Consider including numbers, without using predictable sequences.");
  }

  if (characterTypes.symbols == false) {
    issues.push("No symbols detected.");
    suggestions.push("Consider including symbols if the service allows them.");
  }

  var common = isCommon(password);

  if (common) {
    issues.push("This password matches a commonly used password.");
    suggestions.push("Avoid common passwords and choose a unique passphrase.");
    score = score - 45;
  }

  if (hasDictionaryTerm(password)) {
    if (common == false) {
      issues.push("Password contains a common word or predictable term.");
      suggestions.push("Avoid common words, names, and predictable substitutions.");
      score = score - 12;
    }
  }

  if (containsSequentialRun(password)) {
    issues.push("Password contains a predictable sequence such as 123 or abc.");
    suggestions.push("Avoid consecutive letters or numbers.");
    score = score - 8;
  }

  if (hasKeyboardSequence(password)) {
    issues.push("Password contains a predictable keyboard sequence.");
    suggestions.push("Avoid keyboard patterns such as qwerty or asdf.");
    score = score - 12;
  }

  if (hasRepeatedCharacter(password)) {
    issues.push("Password contains repeated characters.");
    suggestions.push("Avoid repeating the same character several times.");
    score = score - 12;
  }

  if (hasRepeatedChunk(password)) {
    issues.push("Password contains a repeated character pattern.");
    suggestions.push("Avoid repeating chunks such as abcabc or 1212.");
    score = score - 10;
  }

  score = Math.round(score);
  if (score < 0) {
    score = 0;
  }
  if (score > 100) {
    score = 100;
  }

  if (issues.length == 0) {
    suggestions.push("No obvious issues were detected by these basic checks.");
  }

  var result = {
    score: score,
    strength: getStrengthLabel(score),
    length: length,
    characterTypes: characterTypes,
    estimatedEntropyBits: estimatedEntropyBits,
    issues: issues,
    suggestions: suggestions
  };

  return result;
}

export { inspectPassword, getStrengthLabel };