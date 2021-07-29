import Leaderboards from './Leaderboards';
import firebase from './firebase';
import { useState, useEffect } from 'react';

const Modal = (props) => {
  const { isCompleted, wpm, clearData } = props;

  // leaderboard states
  const [leaderArray, setLeaderArray] = useState([]);
  const [isLeader, setIsLeader] = useState(false);
  const [username, setUsername] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
        if (wpm >= leaderScore && !isLeader) {
          setIsLeader(true);
        }
      }
    }
  }, [wpm, isCompleted, isLeader, leaderArray]);

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
    setHasSubmitted(true);
  };

  return (
    // only show the modal once the game is completed
    <aside className={isCompleted ? 'completed' : ''}>
      <div className="inner-modal">
        {/* display the user's WPM */}
        <p>
          <span className="highlight">Nice!!</span> Your final score is{' '}
          <span className="wpm">{wpm} WPM</span>!
        </p>
        {/* check if user is on the leaderboard */}
        {isLeader && !hasSubmitted ? (
          // if so, ask for their name
          <div className="new-leader">
            <p className="congrats">Congratulations, you're a top 5 player!</p>
            {/* call handleSubmit to update the leaderboard database */}
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
        ) : // otherwise, do not prompt the user to enter their name
        null}

        {/* call component to display the current leaderboards */}
        <Leaderboards leaderArray={leaderArray} />
        {/* play again button clears all data and resets relevant states */}
        <button
          onClick={() => {
            clearData();
            setHasSubmitted(false);
            setIsLeader(false);
          }}
        >
          Play again!!
        </button>
      </div>
    </aside>
  );
};

export default Modal;
