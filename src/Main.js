const Main = (props) => {
  const { wordsArray, correctWordsArray, handleChange, userInput, timer, wpm } = props;

  return (
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
  );
};

export default Main;
