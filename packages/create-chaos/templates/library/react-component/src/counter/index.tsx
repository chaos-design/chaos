import c from '@chaos-design/classnames';
import { useState } from 'react';

import s from './index.module.scss';

export interface CounterProps {
  className?: string;
}

const Counter = ({ className }: CounterProps) => {
  const [count, setCount] = useState(0);

  return (
    <button
      className={c(s.counter, className)}
      onClick={() => {
        setCount((count: number) => count + 1);
      }}
      type="button"
    >
      Counter: {count}
    </button>
  );
};

export default Counter;
