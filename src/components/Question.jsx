export default function Question({
  question,
  number,
  selection,
  onSelect,
  reviewed,
}) {
  return (
    <fieldset className="question-wrapper" disabled={reviewed}>
      <legend>
        {number}. {question.question}
      </legend>
      <div className="answers-wrapper">
        {question.answers.map((answer, index) => {
          const id = `${question.id}-answer-${index}`;
          const correct = reviewed && answer === question.correctAnswer;
          const incorrect = reviewed && answer === selection && !correct;
          return (
            <div key={answer} className="answer-option">
              <input
                type="radio"
                name={question.id}
                id={id}
                value={answer}
                checked={selection === answer}
                onChange={() => onSelect(question.id, answer)}
              />
              <label
                htmlFor={id}
                className={correct ? "correct" : incorrect ? "incorrect" : ""}
              >
                {answer}
                {correct && (
                  <span className="answer-feedback">
                    Correct answer{selection === answer ? " · Your choice" : ""}
                  </span>
                )}
                {incorrect && (
                  <span className="answer-feedback">
                    Your choice · Incorrect
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
