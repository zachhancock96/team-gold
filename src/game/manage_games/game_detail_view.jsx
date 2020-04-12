import React from 'react';

/////// TODO - add functionality to edit button ///////
///////      - change buttons to universal style ///////
///////      - check if multiple edits in history display and are spaced correctly ///////
///////      - format game date/time?? ///////

/*
  @param gameDetail: GameDetail
  @param onEdit: Call this, when user edits and hits done
  @param onReject: Call this, when user hits reject and accepts confirmation
  @param onAccept: Call this, when user hits accept (no need confirmation)

  NOTE: thiese onEdit, onReject, onAccept callback do nothing for now (might even throw error)
  once you are done, message me
*/
export const GameDetail = ({ gameDetail, onEdit, onReject, onAccept }) => {
  if (!gameDetail) return <div className='game-detail-empty'>Click on a game for more details</div>;

  const history = prettyHistory(gameDetail);

  const gameHistory = displayHistory(history);

  return (
    <div className='game-detail'>
      <button className='game-edit-button'>Edit</button>
      <div>
        <p className='game-detail-header'>Game</p>
        <p>{title(gameDetail.game)}</p>
        <p>{gameDetail.game.start}</p>
        <p>{gameDetail.game.location}</p>
      </div>
      <div>
        <p className='game-detail-header'>Game History</p>
        <div>{gameHistory}</div>
      </div>
      <div>
        <p className='game-detail-header'>Status</p>
        <p style={{paddingBottom: '10px'}}>{gameDetail.game.status}</p>
      </div>
      <div>
        <button className='game-accept-button' onClick={e => {e.preventDefault(); onAccept(gameDetail.game.id)}}>Accept</button>
        <button className='game-reject-button' onClick={e => {e.preventDefault(); onReject(gameDetail.game.id)}}>Reject</button>
      </div>
      <button onClick={e => onEdit(gameDetail.game.id)}>Edit</button>
    </div>
  );
  
}

const prettyHistory = gameDetail => {
  const { history, game } = gameDetail;

  return history.map(h => {
    const by = h.updaterType === 'home'
      ? game.homeTeam.school.name
      : h.updaterType === 'away'
        ? game.awayTeam.school.name
        : h.updaterType === 'assignor'
          ? 'Assignor'
          : 'Admin';

    const ret = body => ({
      timestamp: h.timestamp,
      body
    });

    if (h.updateType === 'create' || h.updateType === 'update') {
      const k = h.updateType === 'create'
        ? 'Created'
        : 'Updated';

      return ret([
        `${k} by ${by} as: `,
        `${title(game)}`,//game title is always the same
        `${h.start}`,
        `At ${h.location}`
      ]);
    } else if (h.updateType === 'accept') {
      const k = h.updaterType === 'assignor' || h.updaterType === 'admin'
        ? 'Approved'
        : 'Accepted';

      return ret([`${k} by ${by}`]);
    } else {
      return ret([`Rejected by ${by}`]);
    }
  });
}

const title = game => {
  return game.homeTeam.school.name + ' ' + game.homeTeam.teamKind + ' vs '
    + game.awayTeam.school.name + ' ' + game.awayTeam.teamKind;
}

const displayHistory = history => { 
  let historyList = history.map(e => {

    let bodyList = e.body.map(attribute =>{
      return <p>
        {attribute}
      </p>
    });

    return <div className='game-history-block'>
      <p className='game-display-timestamp'>{e.timestamp}</p>
      <div className='game-display-body'>{bodyList}</div>
    </div>
  });

  return historyList;
}

// JSON.stringify(history, null, 2)