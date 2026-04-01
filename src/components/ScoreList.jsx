const ScoreList = ({ scores }) => {
  return (
    <div>
      <h2>Your Scores</h2>

      {scores.length === 0 && <p>No scores yet</p>}

      <ul>
        {scores.map((s) => (
          <li key={s.id}>
            Score: {s.score} | Date: {s.date}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ScoreList