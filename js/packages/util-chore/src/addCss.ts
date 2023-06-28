export const addCss = (name: string, content: string) => {
  const id = `css-${name}`;
  // Block may be duplicated in storybook hot reload mode
  document.getElementById(id)?.remove();
  const style = document.createElement("style");
  document.head.appendChild(style);
  style.id = id;
  style.appendChild(document.createTextNode(content));
};
