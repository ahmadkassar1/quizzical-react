export default function QuizResults({ score, total, onPlayAgain }) {
  return (
    <div className="results-section">
      <p>
        You scored{" "}
        <strong>
          {score} / {total}
        </strong>{" "}
        correct answers.
      </p>
      <button type="button" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
}
