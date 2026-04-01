import { useEffect, useState } from 'react'
import { getTotalWinnings, getDrawHistory } from '../services/dashboardService'

const Dashboard = ({ userId }) => {
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState([])

  const fetchData = async () => {
    const totalAmount = await getTotalWinnings(userId)
    const drawHistory = await getDrawHistory(userId)

    setTotal(totalAmount)
    setHistory(drawHistory)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Total Winnings: ₹{total}</h3>

      <h3>Draw History</h3>

      {history.length === 0 && <p>No draws yet</p>}

      <ul>
        {history.map((item) => (
          <li key={item.id}>
            Date: {item.draws?.draw_date} |
            Numbers: {item.draws?.numbers?.join(', ')} |
            Matches: {item.match_count}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard