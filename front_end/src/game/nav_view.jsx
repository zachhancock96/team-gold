import React from 'react';

/*
  Should display links like:

  Add Game / Manage Games

  @see src/navbar/controller.jsx, src/navbar/view.jsx and src/game/nav_controller.jsx
  Unlike src/navbar/controller.jsx however, links doesnot have align property
*/
export const NavView = ({links, activeLinkId, onLinkClick}) => {
  //TODO: add style this, with classNames and paddings and spaces and what have you
  const linkItems = links.map(link => {
    return <span key={link.id}>
      <a 
      href="#"
      onClick={e => { e.preventDefault(); onLinkClick(link.id); }}>{link.name}</a> / </span>
  });

  return (
    <div className='nav1'>{linkItems}</div>
  );
}