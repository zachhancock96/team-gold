import React from 'react';
import { ManageGames } from './manage_games';
import { AddGame } from './add_game';
import { Nav } from './nav_controller';

const componentMap = {
  ManageGames,
  AddGame
}
export const Game = ({state, actions, routing}) => {
  const Component = componentMap[routing.childSegment.id];

  return (
    <div>
      <Nav state={state} actions={actions} routing={routing.next()} />
      <Component state={state} actions={actions} routing={routing.next()} />
    </div>
  )  
}

Game.showNavbar = true;