import React from 'react';

const headerStyle = {
  fontWeight: 'bold',
  fontSize: 'large'
};
/*
  @param showLoading: boolean, show spinner instead of item in this case (do this later)
  @param gameDetail: GameDetail
  @param onEdit: Call this, when user edits and hits done
  @param onReject: Call this, when user hits reject and accepts confirmation
  @param onAccept: Call this, when user hits accept (no need confirmation)

  NOTE: thiese onEdit, onReject, onAccept callback do nothing for now (might even throw error)
  once you are done, message me
*/
export const GameDetail = ({ gameDetail, onEdit, onReject, onAccept }) => {
  if (!gameDetail) return null;

  const history = prettyHistory(gameDetail);

  return (
    <div>
      <div>
        <p style={headerStyle}>Game</p>
        <div>{title(gameDetail.game)}</div>
        <div>{gameDetail.game.start}</div>
        <div>{gameDetail.game.location}</div>
      </div>
      <div>
        <p style={headerStyle}>Game History</p>
        <pre>{JSON.stringify(history, null, 2)}</pre>
      </div>
      <div>
        <p style={headerStyle}>Status</p>
        <p>{gameDetail.game.status}</p>
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