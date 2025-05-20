import React, { useState, useEffect, useRef } from 'react';

const words = [
  'react', 'javascript', 'coding', 'keyboard', 'performance',
  'function', 'variable', 'component', 'state', 'props'
];

const WORD_TIME = 10; // seconds per word

function TypingGame() {
  const [currentWord, setCurrentWord] = useState('');
  const [input, setInput] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WORD_TIME);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentWord(words[wordIndex]);
    setInput('');
    setTimeLeft(WORD_TIME);
    if (!finished) inputRef.current.focus();
  }, [wordIndex, finished]);

  // Timer countdown effect
  useEffect(() => {
    if (finished) return;

    if (timeLeft === 0) {
      // Time's up, move to next word or finish
      if (wordIndex + 1 === words.length) {
        setFinished(true);
      } else {
        setWordIndex(wordIndex + 1);
      }
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, wordIndex, finished]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    if (val.length > currentWord.length) return; // prevent typing beyond word length

    setInput(val);

    // Move to next word if fully typed and enter or space pressed
    if ((val === currentWord) || (val.endsWith(' ') || val.endsWith('\n'))) {
      if (wordIndex + 1 === words.length) {
        setFinished(true);
      } else {
        setWordIndex(wordIndex + 1);
      }
    }
  };

  const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm = elapsedMinutes > 0 ? (input.length / 5) / elapsedMinutes : 0;

  const renderColoredText = () => {
    return currentWord.split('').map((char, i) => {
      let color = 'black';
      if (input[i]) {
        color = input[i] === char ? 'green' : 'red';
      }
      return (
        <span key={i} style={{ color, fontWeight: 'bold' }}>
          {char}
        </span>
      );
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', textAlign: 'center', fontFamily: 'monospace' }}>
      <h2>Typing Game</h2>
      {finished ? (
        <div>
          <h3>Finished!</h3>
          <p>WPM: {wpm.toFixed(2)}</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '24px', letterSpacing: '3px' }}>{renderColoredText()}</p>
          <input
            ref={inputRef}
            value={input}
            onChange={handleChange}
            style={{
              fontSize: '24px',
              padding: '10px',
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'monospace',
            }}
            autoComplete="off"
            spellCheck="false"
          />
          <p>Time left: {timeLeft}s</p>
          <p>WPM: {wpm.toFixed(2)}</p>
        </>
      )}
    </div>
  );
}

export default TypingGame;