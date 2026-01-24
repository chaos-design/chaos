import c from 'classnames';
import { useState } from 'react';

import s from './index.module.scss';

export interface ComponentNameProps {
  className?: string;
}

const ComponentName = ({ className }: ComponentNameProps) => {
  const [counter, setCounter] = useState<number>(0);

  return (
    <button
      className={c(s.ComponentNameContainer, className)}
      onClick={() => {
        setCounter((counter: number) => counter + 1);
      }}
      type="button"
    >
      Counter: {counter}
    </button>
  );
};

export default ComponentName;
