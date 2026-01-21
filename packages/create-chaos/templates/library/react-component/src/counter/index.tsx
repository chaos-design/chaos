import { useState } from 'react';

import c from '@chaos-design/classnames';

import s from './index.module.scss';

export interface CounterProps {
  className?: string;
}

const Counter = ({ className }: CounterProps) => {
  const [count, setCount] = useState(0);

  return (
    <div
      className={c(s.counter, className)}
      onClick={() => {
        setCount((count: number) => count + 1)
      }}
    >
      Counter: {count}
    </div>
  );
};

export default Counter;
