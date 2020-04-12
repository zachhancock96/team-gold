import React, { Component, FC } from 'react';

export interface SwitchProps {
  isOn?: boolean,
  onClick?: (b: boolean) => any
}

export class Switch extends Component<SwitchProps> {}
export const EditText: FC;
export const TextArea: FC;
export const Select: FC;
export const Timepicker: FC;
export const Datepicker: FC;
export const DateTimePicker: FC;