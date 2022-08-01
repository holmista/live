const catchAsync = (func: Function) => {
  try {
    func();
  } catch {}
};
