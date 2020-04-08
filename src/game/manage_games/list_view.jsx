import React from 'react';
import { prettyDate, prettyDateAndTime } from '../utils';

/* 
  @param showLoading: boolean, show spinner instead of item in this case (do this later)
  @param games: Array<Game>
  @param onGameClick: function, call this with game id, whenever clicked,
  @param activeGameId: number, if this matches with one of the games in the games array, highlight that game
*/
export const ListView = ({ showLoading, games, onGameClick, activeGameId }) => {
  const gameItems = games.map(g => <li style={{ padding: '10px' }} key={g.id}>{JSON.stringify(g)}</li>)
  return <ul>{gameItems}</ul>
}

