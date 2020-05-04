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

const adminLinks = [
  {id: Route.Game().id, align: 'left', name: 'Game'},
  {id: Route.School().id, align: 'left', name: 'School'},
  {id: Route.Calendar().id, align: 'left', name: 'Calendar'},
  {id: Route.SqlExecute().id, align: 'left', name: 'Execute sql'},
  {id: 'logout', align: 'right', name: 'Logout' }
];

const assignorLinks = [
  {id: Route.Game().id, align: 'left', name: 'Game'},
  {id: Route.School().id, align: 'left', name: 'School'},
  {id: Route.ArbiterExport().id, align: 'left', name: 'Arbiter'},
  {id: Route.Calendar().id, align: 'left', name: 'Calendar'},
  {id: 'logout', align: 'right', name: 'Logout' }
];

const idToRouteMap = {
  [Route.Game().id]: [Route.Game(), Route.ManageGames(), Route.AllGames()],
  [Route.ArbiterExport().id]: Route.ArbiterExport(),
  [Route.School().id]: Route.School(),
  [Route.Calendar().id]: Route.Calendar(),
  [Route.SqlExecute().id]: Route.SqlExecute()
};

export const Navbar = ({ state, actions, routing }) => {
  const ls = state && state.user.role === 'admin'
    ? adminLinks
    : state.user.role === 'assignor'
    ? assignorLinks
    : links;

  return <NavbarView
    activeLinkId={routing.localSegment.id}
    links={ls}
    onLinkClick={linkId => {
      if (linkId == 'logout') {
        actions.logout();
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