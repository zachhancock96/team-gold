import React from 'react';
import { Route } from '../routes';
import { NavView } from './nav_view';


/*
  ---NOT IMPLEMENTED YET---
*/
const links = [
  { id: Route.MySchool().id, name: 'My School' },
  { id: Route.AllSchools().id, name: 'All Schools' },
];

const idToRouteMap = {
  [Route.MySchool().id]: Route.MySchool(),
  [Route.AllSchools().id]: Route.AllSchools(),
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