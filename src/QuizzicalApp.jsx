import { useEffect, useRef, useState } from "react";
import Question from "./components/Question.jsx";
import QuizResults from "./components/QuizResults.jsx";
import { fetchQuestions } from "./lib/trivia-api.js";
import { scoreQuiz } from "./lib/quiz.js";
import "./QuizicalApp.css";

const phaseTitles = {
  start: "Ready for a round?",
  loading: "Loading questions…",
  quiz: "Five questions",
  results: "Your results",
  error: "Could not load your quiz",
};

export default function QuizzicalApp() {
  const [phase, setPhase] = useState("start");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const heading = useRef(null);
  const requestPending = useRef(false);

  useEffect(() => {
    if (phase !== "start") heading.current?.focus();
  }, [phase]);

  async function startQuiz() {
    if (requestPending.current) return;
    requestPending.current = true;
    setPhase("loading");
    setError("");
    try {
      const nextQuestions = await fetchQuestions();
      setQuestions(nextQuestions);
      setAnswers({});
      setPhase("quiz");
    } catch (failure) {
      setError(failure.message);
      setPhase("error");
    } finally {
      requestPending.current = false;
    }
  }

  function selectAnswer(id, answer) {
    setAnswers((previous) => ({ ...previous, [id]: answer }));
  }

  const complete =
    questions.length > 0 && questions.every((question) => answers[question.id]);
  const score = scoreQuiz(questions, answers);
  const reviewed = phase === "results";

  return (
    <main>
      <div className="right-corner" aria-hidden="true" />
      <div className="left-corner" aria-hidden="true" />
      <div className="app-content">
        <header className="quiz-header">
          <h1>Quizzical</h1>
          <h2 ref={heading} tabIndex={-1}>
            {phaseTitles[phase]}
          </h2>
        </header>

        {phase === "start" && (
          <section className="start-page" aria-label="Start a quiz">
            <p>
              Test your knowledge with five random trivia questions. Choose your
              answers, then see how you did.
            </p>
            <button type="button" onClick={startQuiz}>
              Start Quiz
            </button>
          </section>
        )}

        {phase === "loading" && (
          <div className="loading" role="status">
            <div className="spinner" aria-hidden="true" />
            <p>Fetching questions from Open Trivia Database.</p>
          </div>
        )}

        {phase === "error" && (
          <section
            className="error-message"
            aria-label="Question service error"
          >
            <p role="alert">{error}</p>
            <button type="button" onClick={startQuiz}>
              Try Again
            </button>
          </section>
        )}

        {(phase === "quiz" || reviewed) && (
          <div className="quiz-container">
            <div className="questions-section">
              {questions.map((question, index) => (
                <Question
                  key={question.id}
                  question={question}
                  number={index + 1}
                  selection={answers[question.id]}
                  onSelect={selectAnswer}
                  reviewed={reviewed}
                />
              ))}
            </div>
            {reviewed ? (
              <QuizResults
                score={score}
                total={questions.length}
                onPlayAgain={startQuiz}
              />
            ) : (
              <>
                <p className="answer-progress" aria-live="polite">
                  {Object.keys(answers).length} of {questions.length} answered
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (complete) setPhase("results");
                  }}
                  disabled={!complete}
                >
                  Check Answers
                </button>
              </>
            )}
          </div>
        )}

        <footer className="quiz-footer">
          Questions by <a href="https://opentdb.com/">Open Trivia Database</a> ·{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">
            CC BY-SA 4.0
          </a>
          <span>
            Round results stay on this page and reset when you reload.
          </span>
        </footer>
      </div>
    </main>
  );
}
