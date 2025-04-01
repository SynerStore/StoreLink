export const updateRootStyleProperty = (property: string, value: string) => {
  const root = document.documentElement;
  root.style.setProperty(property, value);
};
