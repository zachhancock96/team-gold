import React from 'react';
import { prettyDate, prettyDateAndTime } from '../utils';

/* 
  @param showLoading: boolean, show spinner instead of item in this case (do this later)
  @param games: Array<Game>
  @param onGameClick: function, call this with game id, whenever clicked,
  @param activeGameId: number, if this matches with one of the games in the games array, highlight that game
*/
export const ListView = ({ showLoading, games, onGameClick, activeGameId }) => {

  const gameItems = games.map(g =>
    <li style={{
      padding: '10px',
      cursor: 'pointer'
    }}
      key={g.id}
      onClick={() => { onGameClick(g.id) }}
    >
      <div className="game-box">

        <div className="contents">
          <p>{g.homeTeam.school.name}<br />
            {g.awayTeam.school.name}

            <p className="school-type">
              <a className="font-before">
                Type: &emsp; &emsp;
              </a>
              {g.homeTeam.teamKind}
            </p>
            <p className="field">
              <a className="font-before">Location: &nbsp;</a>
              {g.location}
            </p>
          </p>
          <p className="time"><a className="font-before">Time: &emsp; &emsp;</a>{g.start}</p>
          <p className="status"><a className="font-before">Status: &nbsp; &emsp;</a>{g.status}</p>
        </div>
      </div>
    </li>
  );

  return <ul>{gameItems}</ul>


}

