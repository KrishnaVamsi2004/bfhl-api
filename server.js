import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(morgan("tiny"));

/**
 * -----------------------------
 * CONFIG: edit these 3 fields
 * -----------------------------
 * fullName must be lowercase in user_id
 * user_id format: full_name_ddmmyyyy
 */
const FULL_NAME = "john_doe";        // <-- change to your lowercase full name, e.g., "krishna_vamsi_bommireddy"
const DOB_DDMMYYYY = "17091999";     // <-- change to your DOB in ddmmyyyy
const EMAIL = "john@xyz.com";        // <-- change to your email
const ROLL_NUMBER = "ABCD123";       // <-- change to your roll number

// Helpers
const isPureIntegerString = (s) => /^\d+$/.test(s);
const isPureAlphaString = (s) => /^[A-Za-z]+$/.test(s);
const extractLetters = (s) => (s.match(/[A-Za-z]/g) || []).join("");

/**
 * Alternating caps after reversing the whole letters string.
 * Steps:
 * 1) gather all alphabetical characters from entire input (anywhere)
 * 2) reverse the whole string
 * 3) apply alternating caps across the whole reversed string (Upper, lower, Upper, ...)
 */
function buildAlternatingCapsReverseConcat(allLetters) {
  const reversed = allLetters.split("").reverse().join("");
  let out = "";
  for (let i = 0; i < reversed.length; i++) {
    const ch = reversed[i];
    out += i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
  }
  return out;
}

app.post("/bfhl", (req, res) => {
  try {
    const body = req.body ?? {};
    const data = Array.isArray(body.data) ? body.data : null;

    if (!data) {
      return res.status(200).json({
        is_success: false,
        user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
        email: EMAIL,
        roll_number: ROLL_NUMBER,
        odd_numbers: [],
        even_numbers: [],
        alphabets: [],
        special_characters: [],
        sum: "0",
        concat_string: ""
      });
    }

    const odd_numbers = [];
    const even_numbers = [];
    const alphabets = [];
    const special_characters = [];

    let numericSum = 0;
    let allLettersCollected = "";

    for (const item of data) {
      // Normalize every element to string for uniform processing
      const s = String(item);

      // For concat_string, collect letters from ALL items (even if mixed)
      allLettersCollected += extractLetters(s);

      if (isPureIntegerString(s)) {
        // numbers must be returned as strings
        const num = parseInt(s, 10);
        numericSum += num;
        if (num % 2 === 0) {
          even_numbers.push(s);
        } else {
          odd_numbers.push(s);
        }
      } else if (isPureAlphaString(s)) {
        // pure alphabets -> return uppercase token
        alphabets.push(s.toUpperCase());
      } else {
        // anything else (mixed, symbols, etc.) -> special characters
        special_characters.push(s);
      }
    }

    const concat_string = buildAlternatingCapsReverseConcat(allLettersCollected);
    const response = {
      is_success: true,
      user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(numericSum),
      concat_string
    };

    return res.status(200).json(response);
  } catch (err) {
    // Graceful error handling
    const response = {
      is_success: false,
      user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers: [],
      even_numbers: [],
      alphabets: [],
      special_characters: [],
      sum: "0",
      concat_string: ""
    };
    return res.status(200).json(response);
  }
});

// Health check / root info (not required, but handy for testing)
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "BFHL API running. Use POST /bfhl",
    route: "/bfhl",
    method: "POST",
    example_payload: { data: ["a", "1", "334", "4", "R", "$"] }
  });
});

// For local dev
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BFHL API listening on port ${PORT}`);
});

export default app; // for vercel
