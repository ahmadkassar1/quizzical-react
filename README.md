# Quizzical React

[Live demo](https://quizzical-react-chi.vercel.app/) · [Source](https://github.com/ahmadkassar1/quizzical-react)

A small React quiz that loads five multiple-choice questions from [Open Trivia Database](https://opentdb.com/). Choose one answer per question, check your score and start another round.

## Run locally

Use Node.js 24 or later and npm:

```sh
git clone https://github.com/ahmadkassar1/quizzical-react.git
cd quizzical-react
npm ci
npm run dev
```

Open the local URL printed by Vite. An internet connection is required to load questions; there is no API key or environment-variable setup.

```sh
npm run lint
npm test
npm run build
npm run preview
```

`preview` serves the production build locally after `build`; it is not a deployment command.

## Quiz flow

- Start Quiz requests a new set of questions and shows a loading state.
- Select an answer for each question. Check Answers remains disabled until every question has a selection.
- Checking answers displays the score, locks the answers and labels correct answers and your incorrect choices in text as well as color.
- Play Again requests a fresh round and clears previous selections.
- A failed, incomplete, malformed or timed-out request shows an error and a Try Again action. Rate limiting asks you to wait five seconds; requests are not automatically retried.
- Tab, Space and arrow keys work with native radio controls. Focus moves to the new view heading, and reduced-motion preferences disable animations.

Answers and scores are held in React state for the current round. Reloading clears them. There are no accounts, saved results or backend services.

## Structure

| File                    | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `src/main.jsx`          | React entry point                                                  |
| `src/QuizzicalApp.jsx`  | Quiz state, request lifecycle and view transitions                 |
| `src/components`        | Controlled question group and result summary                       |
| `src/lib/quiz.js`       | Response validation, text decoding, unbiased shuffling and scoring |
| `src/lib/trivia-api.js` | HTTP, timeout and provider error handling                          |
| `src/QuizicalApp.css`   | Quiz layout, answer states and responsive styles                   |
| `src/index.css`         | Global base styles                                                 |
| `vite.config.js`        | Vite and React configuration                                       |
| `eslint.config.js`      | JavaScript and React lint configuration                            |

## Verification and limits

Seven Node tests cover response validation, encoded text, duplicate choices, shuffle immutability, scoring and request failures. Run them with `npm test`. The production build and lint checks are separate commands; a successful build does not prove that the external question service is available.

The app has no session token, so a later round may repeat questions. Questions come from a third-party, user-contributed service; availability and content are controlled by that provider. There is no offline fallback, moderation, saved history or cross-device sync. Browser checks do not constitute physical-device or assistive-technology certification.

## Attribution

Application code uses the existing MIT license; the previously truncated license file has been completed, retaining its copyright notice. Trivia data is supplied by [Open Trivia Database](https://opentdb.com/) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Its [API documentation](https://opentdb.com/api_config.php) describes encoding, response codes and rate limits.
