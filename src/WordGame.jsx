// WordGame.js
import React, { useState, useEffect, useRef } from "react";
import { easyWords, mediumWords, hardWords } from "./words";

const shuffle = (word) => {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
};

const DIFFICULTY_SETTINGS = {
  easy: { words: easyWords, time: 15 },
  medium: { words: mediumWords, time: 10 },
  hard: { words: hardWords, time: 7 },
};

const WordGame = ({ difficulty }) => {
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState({ word: "", hints: [] });
  const [scrambled, setScrambled] = useState("");
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [maxShuffle, setMaxShuffle] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [statusClass, setStatusClass] = useState("");
  const [showUnscrambledBeforeGameOver, setShowUnscrambledBeforeGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setWords(DIFFICULTY_SETTINGS[difficulty].words);
    resetGame();
  }, [difficulty]);

  useEffect(() => {
    if (gameOver || !current.word) return;
    if (timer === 0) {
      setMessage("Time's up! -1 point");
      setScore((prev) => prev - 1);
      setStreak(0);
      setShowAnswer(true);
      clearTimeout(timerRef.current);
      setTimeout(() => {
        setShowAnswer(false);
        getNewWord(true);
      }, 2000);
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timer, gameOver, current.word]);

  useEffect(() => {
    if (score < 0 && !gameOver) {
      setShowUnscrambledBeforeGameOver(true);
      setTimeout(() => {
        setShowUnscrambledBeforeGameOver(false);
        setGameOver(true);
      }, 3000);
    }
  }, [score, gameOver]);

  const getNewWord = (deductPoint = false) => {
    if (gameOver) return;
    if (deductPoint) setScore((prev) => prev - 1);
    const random = words[Math.floor(Math.random() * words.length)];
    setCurrent(random);
    setScrambled(shuffle(random.word));
    setGuess("");
    setMessage("");
    setShowAnswer(false);
    setFadeKey((prev) => prev + 1);
    setShuffleCount(0);
    setHintIndex(0);
    setStatusClass("");
    setTimer(DIFFICULTY_SETTINGS[difficulty].time);
  };

  const reshuffleWord = () => {
    if (shuffleCount >= maxShuffle) return;
    setScrambled(shuffle(current.word));
    setShuffleCount((prev) => prev + 1);
    setFadeKey((prev) => prev + 1);
    setTimer(DIFFICULTY_SETTINGS[difficulty].time);
  };

  const checkGuess = () => {
    const trimmed = guess.trim().toLowerCase();
    const correct = current.word.toLowerCase();

    if (trimmed === correct) {
      const newStreak = streak + 1;
      if (newStreak >= 3) {
        setMessage("🔥 Streak Bonus! +10 Points");
        setScore((prev) => prev + 10);
        setStreak(0);
      } else {
        setMessage("Correct!");
        setScore((prev) => prev + 3);
        setStreak(newStreak);
      }

      setMaxShuffle((prev) => prev + 1);
      setStatusClass("correct");
      clearTimeout(timerRef.current);

      setTimeout(() => {
        setStatusClass("");
        getNewWord();
      }, 800);
    } else {
      setMessage("Try again.");
      setScore((prev) => prev - 1);
      setStreak(0);
      setStatusClass("wrong");

      setTimeout(() => setStatusClass(""), 800);
    }
  };

  const revealAnswer = () => {
    if (gameOver) return;
    setShowAnswer(true);
    setScore((prev) => prev - 1);
    setStreak(0);
    clearTimeout(timerRef.current);
    setTimeout(() => {
      getNewWord();
    }, 2000);
  };

  const nextHint = () => {
    if (gameOver) return;
    if (hintIndex < current.hints.length - 1) {
      setHintIndex((prev) => prev + 1);
      setScore((prev) => prev - 1);
      setMessage("");
      setTimer(DIFFICULTY_SETTINGS[difficulty].time);
    }
  };

  const resetGame = () => {
    setScore(0);
    setMaxShuffle(3);
    setShuffleCount(0);
    setGameOver(false);
    setStreak(0);
    setStatusClass("");
    setMessage("");
    getNewWord();
  };

  if (showUnscrambledBeforeGameOver) {
    return (
      <div>
        <h1 className="scrambled wrong">{current.word}</h1>
        <p className="message">Game over incoming...</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div>
        <h1 className="game-over">GAME OVER</h1>
        <button className="button" onClick={resetGame}>
          Restart
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="score">
        Score: {score} <span> Streak: {streak} </span> <span> Time: {timer}s </span>
      </h3>
      <h1 className="title">Guess The Word</h1>
      <div key={fadeKey} className={`fadeIn ${statusClass}`}>
        <h1 className="scrambled">{scrambled}</h1>
        <p className="hint">
          <strong>Hint:</strong> {current.hints[hintIndex]}
        </p>
      </div>

      {message && <p className="message">{message}</p>}
      {showAnswer && (
        <h2 className="answer">
          <strong>Answer:</strong> {current.word}
        </h2>
      )}

      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Type your guess"
        className="input"
      />

      <div className="buttonRow">
        <button onClick={checkGuess} className="button">
          Submit
        </button>

        {maxShuffle - shuffleCount > 0 && (
          <button onClick={reshuffleWord} className="button">
            Shuffle Again ({maxShuffle - shuffleCount} left)
          </button>
        )}

        <button onClick={nextHint} className="button">
          Hint (-1 point)
        </button>

        <button onClick={revealAnswer} className="button">
          Reveal (-1 point)
        </button>

        <button onClick={() => getNewWord(true)} className="button">
          Next (-1 point)
        </button>
      </div>
    </div>
  );
};

export default WordGame;