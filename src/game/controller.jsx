import React from 'react';
import { ManageGames } from './manage_games';
import { AddGame } from './add_game';
import { Nav } from './nav_controller';

const componentMap = {
  ManageGames,
  AddGame
}

/*
  routing
  locaSegment Game
  childSegment AddGame or ManageGames
*/
export const Game = ({state, actions, routing}) => {
  const Component = componentMap[routing.childSegment.id];

  return (
    <div className="flex-col-100">
      <Nav state={state} actions={actions} routing={routing.next()} />
      <div className="flex-1">
        <Component state={state} actions={actions} routing={routing.next()} />
      </div>
    </div>
  )  
}

Game.showNavbar = true;