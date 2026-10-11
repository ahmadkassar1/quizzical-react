import test from "node:test";
import assert from "node:assert/strict";
import { parseQuestions, scoreQuiz, shuffle } from "../src/lib/quiz.js";
import { fetchQuestions } from "../src/lib/trivia-api.js";

const validQuestion = {
  type: "multiple",
  question: "What%20is%202%20%2B%202%3F",
  correct_answer: "4",
  incorrect_answers: ["1", "2", "3"],
};
const payload = () => ({
  response_code: 0,
  results: Array.from({ length: 5 }, () => ({ ...validQuestion })),
});

test("decodes question text and preserves four distinct choices", () => {
  const questions = parseQuestions(payload());
  assert.equal(questions.length, 5);
  assert.equal(questions[0].question, "What is 2 + 2?");
  assert.equal(new Set(questions.map((question) => question.id)).size, 5);
  assert.deepEqual([...questions[0].answers].sort(), ["1", "2", "3", "4"]);
});

test("rejects empty, partial, malformed and duplicate answer sets", () => {
  assert.throws(
    () => parseQuestions({ response_code: 0, results: [] }),
    /complete quiz/,
  );
  assert.throws(() => parseQuestions({ response_code: 1 }), /complete quiz/);
  for (const patch of [
    { incorrect_answers: {} },
    { incorrect_answers: ["1", "2", "4"] },
    { question: "%invalid" },
    { question: "" },
  ]) {
    const data = payload();
    data.results[0] = { ...validQuestion, ...patch };
    assert.throws(() => parseQuestions(data));
  }
});

test("handles provider rate limiting without treating it as an empty quiz", () => {
  assert.throws(
    () => parseQuestions({ response_code: 5, results: [] }),
    /five seconds/,
  );
});

test("shuffle swaps all positions without mutating its input", () => {
  const original = ["a", "b", "c", "d"];
  assert.deepEqual(
    shuffle(original, () => 0),
    ["b", "c", "d", "a"],
  );
  assert.deepEqual(original, ["a", "b", "c", "d"]);
});

test("scores only matching answers for the current question IDs", () => {
  const questions = parseQuestions(payload());
  assert.equal(
    scoreQuiz(questions, {
      "question-0": "4",
      "question-1": "1",
      unknown: "4",
    }),
    1,
  );
  assert.equal(scoreQuiz(questions, {}), 0);
  assert.equal(
    scoreQuiz(
      questions,
      Object.fromEntries(questions.map((question) => [question.id, "4"])),
    ),
    5,
  );
});

test("fetch requests encoded choices and validates the response", async () => {
  const questions = await fetchQuestions(async (url, options) => {
    assert.match(url, /encode=url3986/);
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, status: 200, json: async () => payload() };
  });
  assert.equal(questions.length, 5);
});

test("reports HTTP errors, invalid JSON, timeout and network failures", async () => {
  await assert.rejects(
    fetchQuestions(async () => ({ ok: false, status: 429 })),
    /five seconds/,
  );
  await assert.rejects(
    fetchQuestions(async () => ({ ok: false, status: 503 })),
    /unavailable/,
  );
  await assert.rejects(
    fetchQuestions(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError();
      },
    })),
    /unreadable data/,
  );
  await assert.rejects(
    fetchQuestions(async () => {
      throw new DOMException("", "TimeoutError");
    }),
    /too long/,
  );
  await assert.rejects(
    fetchQuestions(async () => {
      throw new TypeError();
    }),
    /connection/,
  );
});
