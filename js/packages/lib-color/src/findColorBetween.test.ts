import {Color} from "./Color";
import {findColorBetween} from "./findColorBetween";

const black = new Color(0, 0, 0, 1);
const white = new Color(255, 255, 255, 1);
test("Mix Black white 50/50", () => {
  expect(findColorBetween(black, white).toRgba()).toBe("rgba(128,128,128,1)");
});

test("Mix Black white 20/80", () => {
  expect(findColorBetween(black, white, 80).toRgba()).toBe("rgba(204,204,204,1)");
});

test("Mix Black white 80/20", () => {
  expect(findColorBetween(black, white, 20).toRgba()).toBe("rgba(51,51,51,1)");
});
