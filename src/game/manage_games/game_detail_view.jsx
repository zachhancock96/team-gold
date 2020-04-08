import React from 'react';
import { prettyDate, prettyDateAndTime } from '../utils';

/*
  @param showLoading: boolean, show spinner instead of item in this case (do this later)
  @param gameDetail: GameDetail
  @param onEdit: Call this, when user edits and hits done
  @param onReject: Call this, when user hits reject and accepts confirmation
  @param onAccept: Call this, when user hits accept (no need confirmation)

  NOTE: thiese onEdit, onReject, onAccept callback do nothing for now (might even throw error)
  once you are done, message me
*/
export const GameDetail = ({ showLoading, gameDetail, onEdit, onReject, onAccept }) => {
  return <div><pre>{JSON.stringify(gameDetail, null, 2)}</pre></div>
}

//use this to pretty history
//@param history: Array<History>
//@return Array<{timestamp: string, body: Array[string]}
//console.log this value if not clear
const prettyHistory = (history) => {

  return history.map(h => {
    const by = h.updaterType === 'home'
      ? game.homeTeam.school.name
      : h.updaterType === 'away'
      ? game.awayTeam.school.name
      : h.updaterType === 'assignor'
      ? 'Assignor'
      : 'Admin';

    const ret = body => ({
      timestamp: prettyDateAndTime(g.timestamp),
      body
    });

    if (h.updateType === 'create' || h.updateType === 'update') {
      const k = h.updateType === 'create'
        ? 'Created'
        : 'Updated';

      return ret([
        `${k} by ${by} as: `,
        `${g.title}`,//game title is always the same
        `${prettyDateAndTime(h.start)}`,
        `At ${h.location}`
      ]);
    } else if (h.updateType === 'accept') {
      const k = h.updaterType === 'assignor' || h.updaterType === 'admin'
        ? 'Approved'
        : 'Accepted';
      
      return ret([ `${k} by ${by}` ]);
    } else {
      return ret([`Rejected by ${by}`]);
    }
  });
}