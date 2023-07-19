import Counter from '../src/index.jsx';

import s from './index.module.scss';

function App() {
  return (
    <>
      <h1>React Component Demo</h1>
      <div className={s.card}>
        <Counter className={s.counter} />
      </div>
      <div className={s.card}>
        <Counter />
      </div>
    </>
  );
}

export default App;
