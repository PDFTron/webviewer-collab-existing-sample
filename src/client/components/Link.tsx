import React, { PropsWithChildren } from 'react';
import { Link as DOMLink } from 'react-router-dom';

interface LinkProps {
  to: string;
  children: any;
}

export default function Link (props: PropsWithChildren<LinkProps>) {
  return (
    <DOMLink to={props.to}>
      {props.children}
    </DOMLink>
  );
}
