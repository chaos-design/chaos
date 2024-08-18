import Counter from '../src/index.jsx';

import s from './index.module.scss';

function App() {
  const time = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

  return (
    <>
      <h1>React Component Demo</h1>
      <h3>create by chaos, Now is {time}</h3>
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
