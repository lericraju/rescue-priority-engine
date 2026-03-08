import React, { useEffect, useState } from "react";

function App() {

  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/priorities")
      .then(res => res.json())
      .then(data => setWorkers(data));
  }, []);

  return (
    <div>
      <h1>Rescue Priority Dashboard</h1>

      <table>
        <thead>
          <tr>
            <th>Worker</th>
            <th>Survival Probability</th>
            <th>Priority</th>
          </tr>
        </thead>

        <tbody>
          {workers.map((w, i) => (
            <tr key={i}>
              <td>{w.id}</td>
              <td>{w.survival_probability}</td>
              <td>{w.priority}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default App;
