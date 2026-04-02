const ScoreList = ({ scores }) => {
  return (
    <div>
      <h2>Your Scores</h2>

      {scores.length === 0 && <p>No scores yet</p>}

      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {scores.map((s) => (
          <li key={s.id}>
            <span style={{ fontWeight: 650 }}>Score {s.score}</span>
            <span className="muted"> · {s.date}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ScoreList