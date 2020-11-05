import * as React from 'react';
import Tag, { TagProps } from 'antd/lib/tag';

export default function PickerTag(props: TagProps) {
  return <Tag color="blue" {...props} />;
}
