export const updateRootStyleProperty = (property: string, value: string) => {
  const root = document.body;
  root.style.setProperty(property, value);
};
