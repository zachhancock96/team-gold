import React from 'react';
import { Route } from '../routes';
import { NavView } from './nav_view';

const links_ = [
  { id: Route.AddGame().id, name: 'Add Game' },
  { id: Route.ManageGames().id, name: 'Manage Games' }
];

const idToRouteMap_ = {
  [Route.AddGame().id]: Route.AddGame(),
  [Route.ManageGames().id]: [Route.ManageGames(), Route.AllGames()],
}

export const Nav = ({state, actions, routing}) => {

  return <NavView
    links={links_}
    activeLinkId={routing.localSegment.id}
    onLinkClick={linkId => {
      actions.navigateTo(routing.siblingRoute(idToRouteMap_[linkId]))
    }} />
}