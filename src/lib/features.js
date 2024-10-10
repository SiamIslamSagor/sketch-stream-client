const handleInputChange = (e, setFunc) => {
  console.log(e);
  const inputValue = parseInt(e?.target?.value, 10);
  if (inputValue >= 1 && inputValue <= 1000) {
    setFunc(inputValue);
  }
};

export { handleInputChange };
