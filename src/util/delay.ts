const delay = (ms: number) => {
  return new Promise(res => {
    setTimeout(() => {
      res(null);
    }, ms);
  });
};

export default delay;
