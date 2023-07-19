export function setupCounter(initial: number = 0) {
  let counter = initial;

  return {
    increase: () => (counter += 1),
    decrease: () => (counter -= 1),
    get: () => counter,
  };
}

const counter = setupCounter();

export default counter;
