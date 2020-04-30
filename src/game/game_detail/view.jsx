import React from 'react';
import { Button, ButtonRed, CurvedButton } from 'shared/widgets';
import { brownBorder } from 'shared/color';
import { dtFormat } from 'shared/dtFormat';

/////// TODO - format game date/time?? ///////

/*
  @param gameDetail: GameDetail
  @param onEdit: Call this, when user edits and hits done
  @param onReject: Call this, when user hits reject and accepts confirmation
  @param onAccept: Call this, when user hits accept (no need confirmation)

  NOTE: thiese onEdit, onReject, onAccept callback do nothing for now (might even throw error)
  once you are done, message me
*/

const Header = ({ children }) => (
  <h3
    style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
    }}>
    {children}
  </h3>
);

export const View = ({ gameDetail, onEdit, onReject, onAccept }) => {
  if (!gameDetail) return <div className='game-detail-empty'></div>;

  const history = prettyHistory(gameDetail);

  const gameHistory = displayHistory(history);

  const status = formatStatus(gameDetail.game.status)

  return (
    <div className='game-detail'>
      <div style={{
        borderBottom: brownBorder,
        marginBottom: '8px',
        display: 'flex'
      }}>
        <div style={{ flex: 1 }}>
          <Header>{title(gameDetail.game)}</Header>
          <Header>{dtFormat(gameDetail.game.start)}</Header>
          <Header>{gameDetail.game.location}</Header>
        </div>
        <div>
          {
            gameDetail.actions.indexOf('edit') >= 0
              ? <CurvedButton
                style={{ paddingLeft: '20px', paddingRight: '20px', margin: '8px' }}
                onClick={e => onEdit(gameDetail.game.id)}>Edit</CurvedButton>
              : null
          }
        </div>
      </div>
      <div>
        <p className='game-detail-header'>Status</p>
        <p style={{ paddingTop: '15px', paddingBottom: '10px' }}>{status}</p>
        <hr />
      </div>
      <div style={{
        borderBottom: brownBorder,
        marginBottom: '8px',
      }}>
        <p className='game-detail-header'>Game History</p>
        <div className='game-history-box'>{gameHistory}</div>
      </div>
      <div>
        {
          gameDetail.actions.indexOf('accept') >= 0
            ? <Button onClick={e => { onAccept(gameDetail.game.id) }}>Accept</Button>
            : null
        }{' '}
        {
          gameDetail.actions.indexOf('reject') >= 0
            ? <ButtonRed onClick={e => { onReject(gameDetail.game.id) }}>Reject</ButtonRed>
            : null
        }
      </div>
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

    let dateCheck = 0;

    let bodyList = e.body.map(attribute => {
      dateCheck += 1;
      
      if (dateCheck == 3){
        return <p>
          {dtFormat(attribute)}
        </p>
      }

      else{
        return <p>
          {attribute}
        </p>
      };

    });

    return <div className='game-history-block'>
      <p className='game-display-timestamp'>{dtFormat(e.timestamp)}</p>
      <div className='game-display-body'>{bodyList}</div>
    </div>
  });

  return historyList;
}

const formatStatus = status =>{
  if (status === 'pending_away_team'){
    return <span style={{fontWeight:'bold'}}>Pending (Away Team)</span>
  }
  else if (status === 'pending_home_team'){
    return <span style={{fontWeight:'bold'}}>Pending (Home Team)</span>
  }
  else if (status === 'pending_assignor'){
    return <span style={{fontWeight:'bold'}}>Pending (Assingor)</span>
  }
  else if (status === 'accepted'){
    return <span style={{color: 'green', fontWeight:'bold'}}>Accepted</span>
  }
  else if (status === 'rejected'){
    return <span style={{color:'red', fontWeight:'bold'}}>Rejected</span>
  }
}