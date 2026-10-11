export function shuffle(answers, random = Math.random) {
  const result = [...answers];
  for (let index = result.length - 1; index > 0; index--) {
    const next = Math.floor(random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

export function parseQuestions(data, amount = 5) {
  if (data?.response_code === 5) {
    throw new Error(
      "The question service is busy. Wait five seconds before trying again.",
    );
  }
  if (
    data?.response_code !== 0 ||
    !Array.isArray(data.results) ||
    data.results.length !== amount
  ) {
    throw new Error(
      "The question service did not return a complete quiz. Please try again.",
    );
  }

  return data.results.map((item, index) => {
    if (
      item?.type !== "multiple" ||
      !Array.isArray(item.incorrect_answers) ||
      item.incorrect_answers.length !== 3
    ) {
      throw new Error(
        "The question service returned an invalid question. Please try again.",
      );
    }
    const values = [
      item.question,
      item.correct_answer,
      ...item.incorrect_answers,
    ];
    if (values.some((value) => typeof value !== "string" || !value.trim())) {
      throw new Error(
        "The question service returned an invalid question. Please try again.",
      );
    }
    let decoded;
    try {
      decoded = values.map((value) => decodeURIComponent(value));
    } catch {
      throw new Error(
        "The question service returned unreadable text. Please try again.",
      );
    }
    const [question, correctAnswer, ...incorrectAnswers] = decoded;
    const answers = [correctAnswer, ...incorrectAnswers];
    if (new Set(answers).size !== 4) {
      throw new Error(
        "The question service returned duplicate choices. Please try again.",
      );
    }
    return {
      id: `question-${index}`,
      question,
      correctAnswer,
      answers: shuffle(answers),
    };
  });
}

export function scoreQuiz(questions, selectedAnswers) {
  return questions.filter(
    (question) => selectedAnswers[question.id] === question.correctAnswer,
  ).length;
}
