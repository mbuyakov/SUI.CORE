import type {ComponentMeta, ComponentStory} from "@storybook/react";
import {Button as _SuiButton} from "./Button";
import React from "react";
import {Stack} from "@sui/deps-material";
import {sleep} from "@sui/util-chore";

const meta: ComponentMeta<typeof _SuiButton> = {
  title: "actions/Button",
  component: _SuiButton,
};

export default meta;

type Story = ComponentStory<typeof _SuiButton>;

const Template: Story = (args) => (
  <Stack spacing={2} alignItems="start">
      <_SuiButton
        {...args}
        onClick={() => sleep(1000)}
        variant="outlined"
      >
        Default button
      </_SuiButton>
      <_SuiButton
        {...args}
        onClick={() => sleep(1000)}
        variant="contained"
        color="primary"
      >
        Primary button
      </_SuiButton>
      <_SuiButton
        {...args}
        onClick={() => sleep(1000)}
        variant="outlined"
        popconfirmSettings={{
          title: "Are use sure?"
        }}
      >
        With popconfirm button
      </_SuiButton>
      <_SuiButton
        {...args}
        onClick={() => sleep(1000)}
        variant="outlined"
        disabled={true}
      >
        Disabled button
      </_SuiButton>
    </Stack>
);

export const Button = Template.bind({});

Button.args = {
  size: "medium"
};

Button.argTypes = {
  size: {
    control: "select",
      options: ["small", "medium", "large"]
  }
};
