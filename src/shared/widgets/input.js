import React from 'react';
import moment from 'shared/moment';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import ReactTimePicker from 'react-time-picker';
import ReactDatePicker from 'react-date-picker'
import './input.css';

/**
 * accepts style, className, onClick u name it.
 * also see react-bootstrap 4.3 docs for other props
 */
const EditText = React.forwardRef((props, ref) => (
  <Form.Control {...props} ref={ref} />
));

/**
 *
 * accepts style, className, onClick u name it.
 * also see react-bootstrap 4.3 docs for other props
 */
const TextArea = React.forwardRef((props, ref) => (
  <Form.Control {...props} as='textarea' ref={ref} />
));

/**
 *
 * accepts style, className, onClick u name it
 * children props ought to be <option> tags
 * also see react-bootstrap 4.3 docs for other props
 */
const Select = props => (
  <Form.Control {...props} as='select'>
    {props.children}
  </Form.Control>
);

/**
 * Props accepted:
 * ison: Boolean
 * onClick: function
 *
 * If `isOn` is provided then it is `Controlled Component`
 * onClick is only triggered if it is `Controlled Component`
 *
 * So, props accepted are all either both (on and onClick) or none
 */
class Switch extends React.Component {
 
  static propTypes = {
    isOn: PropTypes.bool,
    onClick: PropTypes.func
  };

  state = { isOn: true };

  isOn() {
    if (this.isControlled()) {
      return this.props.isOn;
    } else {
      return this.state.isOn;
    }
  }

  isControlled() {
    return !!this.props.onClick;
  }

  handleClick = () => {
    if (this.isControlled()) {
      this.props.onClick(!this.props.isOn);
    } else {
      this.setState({ isOn: !this.state.isOn });
    }
  };

  render() {
    const { 'aria-label': ariaLabel, ...props } = this.props;

    const isOn = this.isOn();

    const btnClassName =
      'sh-toggle-btn ' + (isOn ? 'sh-toggle-btn-on' : 'sh-toggle-btn-off');

    return (
      <label
        aria-label={ariaLabel || 'Toggle'}
        style={{ display: 'inline-block' }}>
        <input
          className='sh-toggle-input'
          type='checkbox'
          checked={isOn}
          onChange={() => {}} /*react warns otherwise*/
          onClick={this.handleClick}
        />
        <span className={btnClassName} />
      </label>
    );
  }
}

//props documentation at https://github.com/wojtekmaj/react-time-picker#props
const Timepicker = props => {
  return <ReactTimePicker {...props} disableClock={true} clearIcon={null} />
}

//props documentation at https://github.com/wojtekmaj/react-date-picker#datepicker
const Datepicker = props => {
  return <ReactDatePicker {...props} calendarIcon={null} clearIcon={null} />
}

//props { value: Date, onChange: callback that is eventually called with Date as a parameter }
const DateTimePicker = ({ value, onChange }) => {
  //default to 12 AM
  const time = value? moment(value).format('HH:mm'): '00:00';

  //default to present day
  const date = value? moment(value).toDate(): moment().toDate();

  const trigger = (dateString, timeString) => {
    onChange(moment(`${dateString} ${timeString}`).toDate());
  };

  return (
    <React.Fragment>
      <Datepicker
        onChange={e => {  
          if (e) {
            const dateString = moment(e).format('YYYY-MM-DD');
            const timeString = time;
            trigger(dateString, timeString);
          }
        }}
        value={date} />
      {' '}
      <Timepicker
        onChange={e => {
          if (e) {
            const dateString = moment(date).format('YYYY-MM-DD');
            const timeString = e;
            trigger(dateString, timeString);
          }
        }}
        value={time} />
    </React.Fragment>);
}

export { EditText, TextArea, Select, Switch, Timepicker, Datepicker, DateTimePicker };
