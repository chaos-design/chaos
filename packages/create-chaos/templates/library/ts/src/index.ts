export function setupCounter(initial: number = 0) {
  let counter = initial;

  return {
    increase: () => {
      counter += 1;
      return counter;
    },
    decrease: () => {
      counter -= 1;
      return counter;
    },
    get: () => counter,
  };
}

const counter = setupCounter();

export default counter;
