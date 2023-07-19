import { useState } from 'react';
import c from 'classnames';

import s from './index.module.scss';

export interface ComponentNameProps {
  className?: string;
}

const ComponentName = ({ className }: ComponentNameProps) => {
  const [counter, setCounter] = useState(0);

  return (
    <div
      className={c(s.ComponentName, className)}
      onClick={() => {
        setCounter((c) => c + 1);
      }}
    >
      Counter: {counter}
    </div>
  );
};

export default ComponentName;
