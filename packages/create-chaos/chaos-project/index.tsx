import React, { useState } from 'react';
import c from 'classnames';

import s from './index.module.scss';

export interface ChaosProjectProps {
  className?: string;
}

const ChaosProject = ({ className }: ChaosProjectProps) => {
  const [counter, setCounter] = useState<number>(0);

  return (
    <div
      className={c(s.chaosProjectContainer, className)}
      onClick={() => {
        setCounter((counter: number) => counter + 1);
      }}
    >
      Counter: {counter}
    </div>
  );
};

export default ChaosProject;
