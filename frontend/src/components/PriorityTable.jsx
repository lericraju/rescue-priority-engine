export default function PriorityTable({ data }) {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Rescue Priority Dashboard</h2>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th>Worker ID</th>
            <th>Survival Probability</th>
            <th>Priority</th>
          </tr>
        </thead>

        <tbody>
          {data.map((worker) => (
            <tr key={worker.id}>
              <td>{worker.id}</td>
              <td>{worker.survival_probability.toFixed(2)}</td>
              <td>{worker.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
