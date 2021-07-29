import axios from 'axios';
import { useState, useEffect } from 'react';
import './App.scss';
// import Leaderboards from './Leaderboards';
import firebase from './firebase';

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
  // leaderboard states
  const [isLeader, setIsLeader] = useState(false);
  const [username, setUsername] = useState('');

  // network request to the quotes API
  useEffect(() => {
    // only run if game has not been marked complete
    if (!isCompleted) {
      axios({
        url: 'https://api.quotable.io/random',
        method: 'GET',
        dataResponse: 'json',
        params: {
          minLength: '150',
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
    setIsLeader(false);
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
        setTimer((timer) => timer + 1); // WHY does this have to be a callback!!
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

    // only consider as correct once a space is entered (unless it's the last word)
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
  }, [userInput, correctWordsArray, wordsArray]);

  const [leaderArray, setLeaderArray] = useState([]);

  // ***************** LEADERBOARD MECHANIC *****************
  useEffect(() => {
    // initialize and define firebase database
    const dbRef = firebase.database().ref();

    dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const arrayToSort = [];

      // populate the array to be sorted by each person object in the database
      for (let personKey in data) {
        const newPersonObj = {
          key: personKey,
          name: data[personKey].name,
          score: data[personKey].score,
        };
        arrayToSort.push(newPersonObj);
      }

      // sort the array of person objects in descending order of score
      arrayToSort.sort((personA, personB) => personB.score - personA.score);

      // set sorted array into state
      setLeaderArray(arrayToSort);
    });
  }, []);

  // check if user should be on the leaderboards
  useEffect(() => {
    // only perform check if game state is completed
    if (isCompleted) {
      // do a compare of the current wpm to all of the leader scores
      for (let i in leaderArray) {
        const leaderScore = leaderArray[i].score;

        // set leader state to true if it beats any of the current leaders
        if (wpm > leaderScore && !isLeader) {
          setIsLeader(true);
        }
      }
    }
  }, [wpm]); // determined on wpm change (to prevent discrepancy in render timing)

  // handler for username submission
  const handleUsername = (event) => {
    setUsername(event.target.value);
  };

  // on username submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // reference firebase database
    const dbRef = firebase.database().ref();

    // define new leader object
    const newLeader = {
      name: username,
      score: wpm,
    };
    // push to the database
    dbRef.push(newLeader);

    // reference the key of the lowest-scoring leader, and remove it from the database
    const keyToDelete = leaderArray[leaderArray.length - 1].key;
    dbRef.child(keyToDelete).remove();

    // clear username and unmounts the submission form from the virtual DOM
    setUsername('');
    setIsLeader(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Typing Test</h1>
        <h2>Test your typing skills!</h2>
      </header>

      <main>
        <h3>Type the below quote. The timer will start once any key has been pressed.</h3>
        <blockquote className="quote">
          <span className="correct-words">{correctWordsArray.join(' ') + ' '}</span>
          <span className="current-word">{wordsArray[0]}</span>
          {' ' + wordsArray.slice(1).join(' ')}
        </blockquote>

        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="input-box">Enter text here:</label>
          <input id="input-box" type="text" onChange={handleChange} value={userInput} />
        </form>

        <div className="stats">
          <p>
            {/* display time in minutes and seconds */}
            Time: {Math.floor(timer / 60)}:{timer % 60 > 9 ? timer % 60 : '0' + (timer % 60)}
          </p>
          <p className="wpm">{wpm} words per minute (WPM)</p>
        </div>
      </main>

      <aside className={isCompleted ? 'completed' : ''}>
        <div className="inner-modal">
          <p>
            <span className="highlight">Nice!!</span> Your final score is{' '}
            <span className="wpm">{wpm} WPM</span>!
          </p>
          {isLeader ? (
            <div className="new-leader">
              <p className="congrats">Congrats, you're a top 5 player!</p>
              <form onSubmit={handleSubmit}>
                <label htmlFor="username">Enter your name to be added to the leaderboard:</label>
                <input
                  type="text"
                  id="username"
                  onChange={handleUsername}
                  value={username}
                  placeholder="Username"
                />
                <button>Submit</button>
              </form>
            </div>
          ) : null}

          {/* leaderboards */}
          <div className="leaderboards">
            <h2>Leaderboards</h2>
            <ul className="leader-container">
              <li className="leaderboard-header">
                <p className="rank">Rank</p>
                <p className="leader-name">Name</p>
                <p>Score</p>
              </li>
              {leaderArray.map((personObj, index) => {
                return (
                  <li key={personObj.key}>
                    <p className="rank">{index + 1}</p>
                    {index + 1 === 1 ? (
                      <p className="leader-name congrats">👑 {personObj.name} 👑</p>
                    ) : (
                      <p className="leader-name">{personObj.name}</p>
                    )}

                    <p>{personObj.score} WPM</p>
                  </li>
                );
              })}
            </ul>
          </div>
          <button onClick={clearData}>Play again!!</button>
        </div>
      </aside>

      <footer>
        <p>
          Quotes from the <a href="https://github.com/lukePeavey/quotable">Quoteable API</a>
        </p>
        <p>
          Created at <a href="https://junocollege.com/">Juno College</a>
        </p>
        <p>
          Photo by{' '}
          <a href="https://unsplash.com/@markusspiske?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
            Markus Spiske
          </a>{' '}
          on{' '}
          <a href="https://unsplash.com/collections/9013734/rustic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
            Unsplash
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

// leaderboard mechanic

// on game completion, compare the wpm to each leader on the leaderboard
// if the wpm is greater than any one leader, prompt the user to enter their username
// store username in state, and link to input form
// upon submission:
// -- push the username and the wpm to the database
// -- retrieve the key of the lowest-scoring leader
// -- remove the lowest-scorer from the database
