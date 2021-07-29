const Leaderboards = (props) => {
  const { leaderArray } = props;

  return (
    <div className="leaderboards">
      <h2>Leaderboards</h2>
      <ul className="leader-container">
        <li className="leaderboard-header">
          <p className="rank">Rank</p>
          <p className="leader-name">Name</p>
          <p>Score</p>
        </li>
        {/* map through the (sorted) leader array and display the name and score */}
        {leaderArray.map((personObj, index) => {
          return (
            <li key={personObj.key}>
              <p className="rank">{index + 1}</p>
              {/* if the user is ranked #1, add some highlight styles */}
              {index + 1 === 1 ? (
                <p className="leader-name congrats">👑 {personObj.name} 👑</p>
              ) : (
                // otherwise, just display their name and score
                <p className="leader-name">{personObj.name}</p>
              )}
              <p>{personObj.score} WPM</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Leaderboards;
