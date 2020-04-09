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
   onClick={() => { onGameClick(g.id)}}
   >
  {/* {JSON.stringify(g)} */}


  <div class="game-box">
        {/* <div class="color">

        </div> */}

          <div class="contents">
              <p>{g.homeTeam.school.name}<br/>
              {g.awayTeam.school.name}

              <p class="school-type"><a class="font-before">Type: &emsp; &emsp;</a>{g.homeTeam.teamKind}</p>
                  <a class="field">
                  <a class="font-before">Location: &nbsp; </a> {g.location}
                  </a>
              </p>
              <p class="time"><a class="font-before">Time: &emsp; &emsp;</a>{g.start}</p>
              <p class="status"><a class="font-before">Status: &nbsp; &emsp;</a>{g.status}</p>
          </div>
    </div>
  </li>


)
// games.map(game => <button onClick={() => onGameClick(game.id)}>{game.id}</button>))

  return <ul>{gameItems}</ul>
 

}

