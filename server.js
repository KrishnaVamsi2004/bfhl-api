import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(morgan("tiny"));

/**
 * -----------------------------
 * CONFIG: your details
 * -----------------------------
 */
const FULL_NAME = "krishna_vamsi_bommireddy";   // lowercase with underscores
const DOB_DDMMYYYY = "08092004";                // ddmmyyyy
const EMAIL = "krishnavamsi@gmail.com";
const ROLL_NUMBER = "22BCE3041";

// Helpers
const isPureIntegerString = (s) => /^\d+$/.test(s);
const isPureAlphaString = (s) => /^[A-Za-z]+$/.test(s);
const extractLetters = (s) => (s.match(/[A-Za-z]/g) || []).join("");

// Alternating caps reverse concat
function buildAlternatingCapsReverseConcat(allLetters) {
  const reversed = allLetters.split("").reverse().join("");
  let out = "";
  for (let i = 0; i < reversed.length; i++) {
    const ch = reversed[i];
    out += i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
  }
  return out;
}

// POST /bfhl
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
      const s = String(item);

      // Collect letters for concat_string
      allLettersCollected += extractLetters(s);

      if (isPureIntegerString(s)) {
        const num = parseInt(s, 10);
        numericSum += num;
        if (num % 2 === 0) {
          even_numbers.push(s);
        } else {
          odd_numbers.push(s);
        }
      } else if (isPureAlphaString(s)) {
        alphabets.push(s.toUpperCase());
      } else {
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
});

// Health check route
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

export default app; // required for Vercel
