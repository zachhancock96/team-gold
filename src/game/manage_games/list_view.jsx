import React from 'react';
import { dtFormat } from 'shared/dtFormat';

/* 
  @param games: Array<Game>
  @param onGameClick: function, call this with game id, whenever clicked,
  @param activeGameId: number, if this matches with one of the games in the games array, highlight that game
*/
export const ListView = ({ games, onGameClick, activeGameId }) => {
  const getClassName = game => {
    return game.id === activeGameId
      ? `game-list-item active`
      : `game-list-item`;
  }

  const gameItems = games.map(g =>
    <li style={{
      padding: '10px',
      cursor: 'pointer'
    }}
      className={getClassName(g)}
      key={g.id}
      onClick={() => { onGameClick(g.id) }}
    >
      <div className="game-box">

        <div className="contents">
          <p>{g.homeTeam.school.name}<br />{g.awayTeam.school.name}</p>
          <p className="school-type"><a className="font-before">Type: &emsp; &emsp;</a>{g.homeTeam.teamKind}</p>
          <p className="field"><a className="font-before">Location: &nbsp;</a>{g.location}</p>
          <p className="time"><a className="font-before">Date: &emsp; &emsp;</a>{dtFormat(g.start)}</p>
          <p className="status"><a className="font-before">Status: &nbsp; &emsp;</a>{g.status}</p>
        </div>
      </div>
    </li>
  );

  return <ul>{gameItems}</ul>
}