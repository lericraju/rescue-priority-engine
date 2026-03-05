export default function PriorityTable({ data }) {
  return (
    <table border="1" cellPadding="8">
      <thead>
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
  );
}
