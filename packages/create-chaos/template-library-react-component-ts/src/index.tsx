import { useState } from 'react';
import c from '@tinyfe/classnames/es';

import s from './index.module.scss';

export interface CounterProps {
  className?: string;
}

const Counter = ({ className }: CounterProps) => {
  const [counter, setCounter] = useState(0);

  return (
    <div
      className={c(s.counter, className)}
      onClick={() => {
        setCounter((c) => c + 1);
      }}
    >
      Counter: {counter}
    </div>
  );
};

export default Counter;
