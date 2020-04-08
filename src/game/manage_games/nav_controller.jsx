import React from 'react';
import { Route } from '../../routes';
import { NavView } from './nav_view';

const links = [
  { id: Route.AllGames().id, name: 'All Games' },
  { id: Route.ApprovedGames().id, name: 'Approved Games' },
  { id: Route.PendingGames().id, name: 'Pending Games' },
  { id: Route.RejectedGames().id, name: 'Rejected Games' }
];

const idToRouteMap = {
  [Route.AllGames().id]: Route.AllGames(),
  [Route.ApprovedGames().id]: Route.ApprovedGames(),
  [Route.PendingGames().id]: Route.PendingGames(),
  [Route.RejectedGames().id]: Route.RejectedGames(),
}

export const Nav = ({state, actions, routing}) => {
  return <NavView
    links={links}
    activeLinkId={routing.localSegment.id}
    onLinkClick={linkId => {
      const route = idToRouteMap[linkId];
      actions.navigateTo(routing.siblingRoute(route));
    }} />    
}