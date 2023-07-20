import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState<number>(0);

  return (
    <>
      <h1>Vite + React + ts</h1>
      <h3>create by chaos</h3>
      <div className="card">
        <button onClick={() => setCount((count: number) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;
