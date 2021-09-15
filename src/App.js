import axios from 'axios';
import { useState, useEffect } from 'react';
import './App.scss';
import Main from './Main';
import Modal from './Modal';
import Footer from './Footer';

function App() {
  // define initial states:
  // quote states
  const [wordsArray, setWordsArray] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [correctWordsArray, setCorrectWordsArray] = useState([]);
  // timer states
  const [timer, setTimer] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  // game states
  const [isCompleted, setIsCompleted] = useState(false);
  const [wpm, setWpm] = useState(0);

  // network request to the quotes API
  useEffect(() => {
    // only run if game has not been marked complete
    if (!isCompleted) {
      axios({
        url: 'https://api.quotable.io/random',
        method: 'GET',
        dataResponse: 'json',
        params: {
          minLength: '160',
          maxLength: '200',
          tags: 'famous-quotes',
        },
      })
        .then((res) => {
          // clear all previous game data
          clearData();

          // turn the new quote into an array of individual words and set in state
          setWordsArray(res.data.content.split(' '));
        })
        .catch(() => alert('The API failed to load :('));
    }
  }, [isCompleted]); // runs only when game completion state changes

  // helper function to clear all previous game data
  const clearData = () => {
    setWordsArray([]);
    setUserInput('');
    setCorrectWordsArray([]);
    setTimer(0);
    setTimerStarted(false);
    setIsCompleted(false);
    setWpm(0);
  };

  // input handler
  const handleChange = (event) => {
    // store user input as it is typed
    setUserInput(event.target.value);

    // start timer on initial entry
    if (!timer) {
      setTimerStarted(true);
    }
  };

  // ***************** TIMER MECHANIC *****************
  // internal timer
  useEffect(() => {
    let stopwatch; // declare in block scope to allow clearing later

    // start timer (ticks every second)
    if (timerStarted) {
      stopwatch = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    }

    // clear timer on dismount
    return () => {
      clearInterval(stopwatch);
    };
  }, [timerStarted]);

  // ***************** WORDS PER MINUTE MECHANIC *****************
  // words per minute (WPM) calculation
  useEffect(() => {
    const isEmpty = wordsArray.length === 0;
    // count the number of correctly typed characters (including spaces between words)
    // check if the whole quote has been typed; if so, don't insert/count a space at the end
    const numCorrectChars = isEmpty
      ? correctWordsArray.join(' ').length
      : (correctWordsArray.join(' ') + ' ').length;

    // calculate and display the WPM if at least one word has been typed, and at least one second has passed (to avoid infinity errors)
    if (correctWordsArray.length && timer) {
      setWpm(Math.floor(numCorrectChars / 5 / (timer / 60)));
    }
  }, [timer, correctWordsArray, wordsArray, isCompleted]);

  // logic to check if the whole word is typed correctly
  useEffect(() => {
    const isLastWord = wordsArray.length === 1;
    const currentWord = wordsArray[0];

    // only consider as correct once a space is entered, unless it's the last word
    if (userInput === (isLastWord ? currentWord : currentWord + ' ')) {
      // move the correctly typed word to the array of correct words
      setCorrectWordsArray(correctWordsArray.concat(currentWord));
      setWordsArray(wordsArray.slice(1));
      // reset input field
      setUserInput('');

      // stop timer on completion, mark game as complete
      if (isLastWord) {
        setTimerStarted(false);
        setIsCompleted(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, correctWordsArray]);

  return (
    <div className="App">
      <header>
        <h1>Typewriter</h1>
        <h2>Test your typing skills!</h2>
      </header>

      {/* main game, including quote and user input */}
      <Main
        wordsArray={wordsArray}
        correctWordsArray={correctWordsArray}
        handleChange={handleChange}
        userInput={userInput}
        timer={timer}
        wpm={wpm}
      />

      {/* game completion modal */}
      <Modal isCompleted={isCompleted} wpm={wpm} clearData={clearData} />

      <Footer />
    </div>
  );
}

export default App;
