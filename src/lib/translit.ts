/**
 * Loose Devanagari -> Roman transliteration for search, so Nepali names can be
 * found by typing romanized text (e.g. "binod" finds बिनोद, "laxmi acharya"
 * finds लक्ष्मी आचार्य). This is phonetic and forgiving, not linguistically
 * strict — the goal is recall for a search box, not correct spelling.
 */

const CONS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ng",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "ny",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", ळ: "l", व: "w",
  श: "sh", ष: "sh", स: "s", ह: "h",
};

// Vowel signs (matras) that attach to a consonant, replacing its inherent "a".
const MATRA: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
};

// Independent vowels.
const VOWEL: Record<string, string> = {
  अ: "a", आ: "a", इ: "i", ई: "i", उ: "u", ऊ: "u", ऋ: "ri",
  ए: "e", ऐ: "ai", ओ: "o", औ: "au",
};

const HALANT = "्";
const ANUSVARA = "ं";
const CHANDRABINDU = "ँ";
const VISARGA = "ः";
const NE_DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

export function transliterate(text: string): string {
  const chars = [...text];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (CONS[c] !== undefined) {
      out += CONS[c];
      const next = chars[i + 1];
      if (next === HALANT) {
        i++; // consonant cluster: no vowel
      } else if (next !== undefined && MATRA[next] !== undefined) {
        out += MATRA[next];
        i++;
      } else {
        out += "a"; // inherent vowel
      }
    } else if (VOWEL[c] !== undefined) {
      out += VOWEL[c];
    } else if (MATRA[c] !== undefined) {
      out += MATRA[c];
    } else if (c === ANUSVARA || c === CHANDRABINDU) {
      out += "n";
    } else if (c === VISARGA) {
      out += "h";
    } else if (NE_DIGITS[c] !== undefined) {
      out += NE_DIGITS[c];
    } else {
      out += c; // latin / spaces / punctuation pass through
    }
  }
  return out;
}

/**
 * Normalise a roman string to a forgiving phonetic key that unifies common
 * Nepali spelling variants (x/ksh -> ks, sh/ss -> s, v/w/b -> b, ph -> f, …).
 */
export function phoneticKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/x/g, "ks")
    .replace(/ksh/g, "ks")
    .replace(/chh/g, "ch")
    .replace(/sh/g, "s")
    .replace(/ph/g, "f")
    .replace(/z/g, "j")
    .replace(/[wv]/g, "b")
    .replace(/\s+/g, " ")
    .trim();
}

/** Transliterate + phonetically normalise, ready for substring matching. */
export function romanKey(text: string): string {
  return phoneticKey(transliterate(text));
}
