import type {ComponentStory, Meta} from '@storybook/react';
import {ProgressIcon as _ProgressIcon} from "./ProgressIcon";

const meta: Meta<typeof _ProgressIcon> = {
  title: 'material/ProgressIcon',
  component: _ProgressIcon,
};

export default meta;

type Story = ComponentStory<typeof _ProgressIcon>;

const Template: Story = (args) => (<_ProgressIcon {...args}/>);

export const ProgressIcon = Template.bind({});

ProgressIcon.args = {
  size: "medium",
    type: "icon"
};
ProgressIcon.argTypes = {
  size: {
    control: "select",
      options: ["small", "medium", "large"]
  },
  type: {
    control: "select",
      options: ["icon", "iconButton"]
  }
};
