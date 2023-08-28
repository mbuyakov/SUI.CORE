import type {Meta, StoryObj} from "@storybook/react";
import {Exception403} from "./Exception403";
import {Exception404} from "./Exception404";

const meta: Meta = {
  title: "layout/Pages/Exception",
};

export default meta;

export const Story403: StoryObj = {
  name: "403",
  render: () => <Exception403/>
};

export const Story404: StoryObj = {
  name: "404",
  render: () => <Exception404/>
};
