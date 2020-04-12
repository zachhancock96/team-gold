import React, { Component } from 'react';
import { Button as BSButton } from 'react-bootstrap';
import './button.css';

const Button = props => <BSButton {...props}>{props.children}</BSButton>;

const ButtonGrey = props => (
  <BSButton variant='secondary' {...props}>
    {props.children}
  </BSButton>
);

const CurvedButton = props => {
  return (
    <Button {...props} className={'sh-button-curve ' + (props.className || '')}>
      {props.children}
    </Button>
  );
};

const CurvedButtonGrey = props => {
  return (
    <ButtonGrey
      {...props}
      className={'sh-button-curve ' + (props.className || '')}>
      {props.children}
    </ButtonGrey>
  );
};

const OutlineButton = props => (
  <Button variant='outline-primary' {...props}>
    {props.children}
  </Button>
);

const CurvedOutlineButton = props => (
  <OutlineButton
    {...props}
    className={'sh-button-curve ' + (props.className || '')}>
    {props.children}
  </OutlineButton>
);

const OutlineButtonRed = props => (
  <Button variant='outline-danger' {...props}>
    {props.children}
  </Button>
);

const CurvedOutlineButtonRed = props => (
  <OutlineButtonRed
    {...props}
    className={'sh-button-curve ' + (props.className || '')}>
    {props.children}
  </OutlineButtonRed>
);

export {
  Button,
  CurvedButton,
  ButtonGrey,
  CurvedButtonGrey,
  OutlineButton,
  CurvedOutlineButton,
  OutlineButtonRed,
  CurvedOutlineButtonRed
};
