import React from 'react';
import { router } from '../router';
import { Route } from '../routes';
import { NavbarView } from './view';

const links = [
  {id: Route.Game().id, align: 'left', name: 'Game'},
  {id: Route.School().id, align: 'left', name: 'School'},
  {id: Route.Calendar().id, align: 'left', name: 'Calendar'},
  {id: 'logout', align: 'right', name: 'Logout' }
];

const idToRouteMap = {
  [Route.Game().id]: [Route.Game(), Route.ManageGames(), Route.AllGames()],
  [Route.School().id]: Route.School(),
  [Route.Calendar().id]: Route.Calendar()
}

export const Navbar = ({ state, actions, routing }) => {
  return <NavbarView
    activeLinkId={routing.localSegment.id}
    links={links}
    onLinkClick={linkId => {
      if (linkId == 'logout') {
        alert('logging out');
        return;
      }

      actions.navigateTo(idToRouteMap[linkId]);
    }} />
};

// return (
//   <div>
//     <nav>
//       <a
//         href={router.toPath(Route.School())}
//         class={className('School')}>
//         School
//       </a>
//       <a
//         href={router.toPath([Route.Game(), Route.ManageGames(), Route.AllGames()])}
//         class={className('Game')}>
//         Game
//       </a>
//       <a
//         href={router.toPath(Route.Calendar())}
//         class={className('Calendar')}>
//         Calendar
//       </a>
//       <a class='navbar-links'
//         style={{ marginLeft: '20px' }}
//         onclick={e => {
//           e.preventDefault();
//           actions.logout();
//         }}>Logout</a>
//     </nav>
//   </div>
// );