import { Empty as EmptyD } from 'antd';
import React from 'react';

type Props = {
  description: string;
};

const Empty: React.FC<Props> = ({ description }) => {
  return <EmptyD description={description} />;
};

export default Empty;
