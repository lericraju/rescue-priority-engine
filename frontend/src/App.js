import PriorityTable from "./components/PriorityTable";

function App() {

  const workers = [
    { id: "Worker_A", survival_probability: 0.75, priority: 1 },
    { id: "Worker_B", survival_probability: 0.60, priority: 2 },
    { id: "Worker_C", survival_probability: 0.42, priority: 3 }
  ];

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Mine Rescue Priority Dashboard</h1>
      <PriorityTable data={workers} />
    </div>
  );
}

export default App;
