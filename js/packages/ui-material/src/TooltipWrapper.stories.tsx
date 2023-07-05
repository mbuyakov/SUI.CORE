import {Meta, ComponentStory} from "@storybook/react";
import {TooltipWrapper as _TooltipWrapper} from "./TooltipWrapper";
import React from "react";
import {Button, Stack} from "@sui/deps-material";

const meta: Meta<typeof _TooltipWrapper> = {
  title: "material/TooltipWrapper",
  component: _TooltipWrapper,
};

export default meta;

type Story = ComponentStory<typeof _TooltipWrapper>;

const Template: Story = (args) => (
  <Stack spacing={2} alignItems="start">
      <_TooltipWrapper {...args}>
        <Button variant="outlined">Default button</Button>
      </_TooltipWrapper>
      <_TooltipWrapper {...args}>
        <Button variant="outlined" disabled={true}>Disabled button</Button>
      </_TooltipWrapper>
    </Stack>
);

export const TooltipWrapper = Template.bind({});

TooltipWrapper.args = {
  title: "Default title",
};
