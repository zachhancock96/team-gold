import React from 'react';

export const Loading = ({ state }) => {
  const shouldShow = state.loading && Object.keys(state.loading)
    .reduce((shouldShow, k) => {
      if (shouldShow) return true;
      if (state.loading[k]) return true;
  
      return false;
    }, false);
  
  return shouldShow
    ? (
      <div className='modal'>
        <div style={{
          padding: "30px",
          background: "white",
          textAlgin: "center"
        }}>
          Loading...
        </div>
      </div>
    )
    : null;
}