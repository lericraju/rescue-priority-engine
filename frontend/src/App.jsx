import PriorityTable from "./components/PriorityTable";

const demoData = [
  { id: "Worker A", survival_probability: 0.82, priority: 1 },
  { id: "Worker B", survival_probability: 0.51, priority: 2 },
];

function App() {
  return (
    <div>
      <h2>Rescue Priority Dashboard</h2>
      <PriorityTable data={demoData} />
    </div>
  );
}

export default App;
