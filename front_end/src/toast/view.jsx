import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import './style.css';

export const Toast = function ({ state }) {
  const { toasts } = state;

  return (
    <div style={{
      width: '400px',
      right: '8px',
      bottom: 0,
      position: 'fixed',
      zIndex: 999
    }}>
      {
        toasts.map(({ type, message }, i) => (
          <MessageItem key={i} type={type} message={message} />
        ))
      }
    </div>
  )
}

const MessageItem = ({ message, type }) => {
  const className = `my-toast ${type}`;

  return <div className={className}>
    <div style={{
      display: 'flex',
      flexDirection: 'row'
    }}>
      <div>
        <FontAwesomeIcon
          icon={faExclamationCircle} className='fa' />
      </div>

      <div style={{ flex: 1, marginLeft: '4px' }}>
        {message}
      </div>
    </div>
  </div>
}