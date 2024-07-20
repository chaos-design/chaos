import React, { useState } from 'react';

import c from 'classnames';

import s from './index.module.scss';

export interface ComponentNameProps {
  className?: string;
}

const ComponentName = ({ className }: ComponentNameProps) => {
  const [counter, setCounter] = useState<number>(0);

  return (
    <div
      className={c(s.ComponentNameContainer, className)}
      onClick={() => {
        setCounter((counter: number) => counter + 1);
      }}
    >
      Counter: {counter}
    </div>
  );
};

export default ComponentName;
