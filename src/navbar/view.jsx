import React from 'react';

/*
  -------------------------------------
  |  Game  School              Logout  |
  -------------------------------------

  @param links Array<{id: number, name: string}>
    e.g.  [{id: 'game', name: 'Game', align: 'left' },{id: 'logout', name: 'Logout', align: 'right'}]
    display the `name` on the navigation bar
    pass the `id` to onLinkClick whenever that name is clicked
    align property may be `left` or `right`, e.g. For Logout link it is 'right'

  @param activeLinkId: string,
    links with id equal to activeLinkId should be highlighted

  @param onLinkClick: callback function of type (linkId: string) => void
    whenever a link is clicked, pass the id of that link to this callback
*/
export const NavbarView = ({ links, activeLinkId, onLinkClick }) => {

  //NOTE: this is just to give you an idea of how to implement
  //you might have your own idea
  //specify the css in the style.css file in out folder

  const linkClass = link => {
    let className = link.align === 'left'
      ? 'navbar-link-left'
      : 'navbar-link-right';

    if (link.id === activeLinkId) {
      return className + ' active';
    }
  }

  const linkItems = links.map(link => {
    return <a 
      key={link.id}
      href="#" className={linkClass(link)} 
      onClick={e => { e.preventDefault(); onLinkClick(link.id); }}>{link.name}</a>
  });
  
  return (
    <nav style={{
      padding: '20px',
      backgroundColor: 'brown'
    }}>
      {linkItems}
    </nav>
  );
}