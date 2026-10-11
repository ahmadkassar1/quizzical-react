import { parseQuestions } from "./quiz.js";

export async function fetchQuestions(fetcher = fetch) {
  let response;
  try {
    response = await fetcher(
      "https://opentdb.com/api.php?amount=5&type=multiple&encode=url3986",
      {
        signal: AbortSignal.timeout(15000),
      },
    );
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error("The question service took too long. Please try again.", {
        cause: error,
      });
    }
    throw new Error(
      "Could not connect to the question service. Check your connection and try again.",
      { cause: error },
    );
  }
  if (response.status === 429) {
    throw new Error(
      "The question service is busy. Wait five seconds before trying again.",
    );
  }
  if (!response.ok) {
    throw new Error(
      "The question service is unavailable. Please try again later.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The question service returned unreadable data. Please try again.",
    );
  }
  return parseQuestions(data);
}
