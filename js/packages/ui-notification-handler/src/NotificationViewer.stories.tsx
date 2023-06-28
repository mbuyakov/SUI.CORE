import type {ComponentStory, Meta} from '@storybook/react';
import {NotificationViewer as _NotificationViewer} from "./NotificationViewer";
import React from "react";
import {Button, Stack} from '@sui/deps-material';
import {Container} from '@sui/deps-ioc';
import {NotificationDispatcher} from "@sui/lib-notification-dispatcher";

const meta: Meta<typeof _NotificationViewer> = {
  title: 'notification handler/NotificationViewer',
  component: _NotificationViewer,
};

export default meta;

type Story = ComponentStory<typeof _NotificationViewer>;

const Template: Story = (args) => (
  <Stack spacing={2} alignItems="start">
    <Button variant="outlined" onClick={() => Container.get(NotificationDispatcher).success("title", "message")}>Success</Button>
    <Button variant="outlined" onClick={() => Container.get(NotificationDispatcher).info("title", "message")}>Info</Button>
    <Button variant="outlined" onClick={() => Container.get(NotificationDispatcher).info("title", "message", {key: "static", duration: 60})}>Info with static key</Button>
    <Button variant="outlined" onClick={() => Container.get(NotificationDispatcher).close("static")}>Close info with static key</Button>
    <Button variant="outlined" onClick={() => Container.get(NotificationDispatcher).warning("title", "message")}>Warn</Button>
    <Button variant="outlined" onClick={() => Container.get(NotificationDispatcher).error("title", "message")}>Error</Button>
    <Button variant="outlined" onClick={() => Container.get(NotificationDispatcher).handleError(new Error("Ашипка"))}>Throw</Button>
  </Stack>
);

export const NotificationViewer = Template.bind({});
