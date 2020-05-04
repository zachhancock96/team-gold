import React from 'react';

/*

  ----NOT IMPLEMENTED YET----
  Should display links like:

  My School / All Schools

  Not sure how to determine exactly which school belongs to the user
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