import Leaderboards from './Leaderboards';

const Modal = (props) => {
  const {
    isCompleted,
    wpm,
    isLeader,
    handleSubmit,
    handleUsername,
    username,
    leaderArray,
    clearData,
  } = props;

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
        {isLeader ? (
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
        <button onClick={clearData}>Play again!!</button>
      </div>
    </aside>
  );
};

export default Modal;
