const handleInputChange = (e, setFunc, min = 1, max = 1000) => {
  console.log(e);
  const inputValue = parseInt(e?.target?.value, 10);
  if (inputValue >= min && inputValue <= max) {
    setFunc(inputValue);
  }
};

export { handleInputChange };
