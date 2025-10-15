import "./QuizicalApp.css";
import { useState } from "react";

// API Service
const quizAPI = {
  async fetchQuestions(amount = 5) {
    try {
      const res = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&type=multiple`
      );
      const data = await res.json();

      return data.results.map((q) => ({
        ...q,
        allAnswers: this.shuffleAnswers([
          ...q.incorrect_answers,
          q.correct_answer,
        ]),
        id: crypto.randomUUID(),
      }));
    } catch (err) {
      console.error("Error fetching questions:", err);
      throw err;
    }
  },

  shuffleAnswers(answers) {
    return answers.sort(() => Math.random() - 0.5);
  },
};

// Decode HTML entities utility
const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// StartPage Component
function StartPage({ onStart }) {
  return (
    <section className="start-page">
      <h1>Quizzical</h1>
      <p>
        Test your knowledge with fun, random trivia questions! Click below to
        start a new quiz and see how many you can get right.
      </p>
      <button onClick={onStart}>Start Quiz</button>
    </section>
  );
}

// Question Component
function Question({
  question,
  questionIndex,
  selectedAnswer,
  onSelect,
  showResults,
}) {
  const getAnswerClassName = (answer) => {
    if (!showResults) return "";

    if (answer === question.correct_answer) return "correct";
    if (answer === selectedAnswer && answer !== question.correct_answer)
      return "incorrect";
    return "dimmed";
  };

  return (
    <div className="question-wrapper">
      <h3>{decodeHTML(question.question)}</h3>
      <div className="answers-wrapper">
        {question.allAnswers.map((answer, index) => {
          const answerId = `answer${index}-${questionIndex}`;
          const answerClass = getAnswerClassName(answer);

          return (
            <div key={index}>
              <input
                type="radio"
                name={`answer-${questionIndex}`}
                id={answerId}
                value={answer}
                checked={selectedAnswer === answer}
                onChange={(e) => onSelect(e, questionIndex)}
                disabled={showResults}
              />
              <label htmlFor={answerId} className={answerClass}>
                {decodeHTML(answer)}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Results Component
function Results({ score, total, onPlayAgain }) {
  return (
    <div className="results-section">
      <h2>
        You scored {score}/{total} correct answers!
      </h2>
      <button onClick={onPlayAgain}>Play Again</button>
    </div>
  );
}

// Loading Component
function Loading() {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading questions...</p>
    </div>
  );
}

// Main App Component
function QuizzicalApp() {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function startNewQuiz() {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedQuestions = await quizAPI.fetchQuestions(5);
      setQuestions(fetchedQuestions);
      setIsQuizStarted(true);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    } catch (err) {
      setError("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function selectAnswer(event, questionIndex) {
    if (showResults) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: event.target.value,
    }));
  }

  function checkAnswers() {
    let correctCount = 0;

    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);
  }

  function playAgain() {
    setIsQuizStarted(false);
    setQuestions([]);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  }

  const allQuestionsAnswered =
    questions.length > 0 &&
    Object.keys(selectedAnswers).length === questions.length;

  return (
    <main>
      <div className="right-corner"></div>
      <div className="left-corner"></div>

      {!isQuizStarted && !isLoading && <StartPage onStart={startNewQuiz} />}

      {isLoading && <Loading />}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={startNewQuiz}>Try Again</button>
        </div>
      )}

      {isQuizStarted && !isLoading && (
        <div className="quiz-container">
          <div className="questions-section">
            {questions.map((q, index) => (
              <Question
                key={q.id}
                question={q}
                questionIndex={index}
                selectedAnswer={selectedAnswers[index]}
                onSelect={selectAnswer}
                showResults={showResults}
              />
            ))}
          </div>

          {!showResults ? (
            <button
              type="button"
              onClick={checkAnswers}
              disabled={!allQuestionsAnswered}
              className={!allQuestionsAnswered ? "disabled" : ""}
            >
              Check Answers
            </button>
          ) : (
            <Results
              score={score}
              total={questions.length}
              onPlayAgain={playAgain}
            />
          )}
        </div>
      )}
    </main>
  );
}

export default QuizzicalApp;
