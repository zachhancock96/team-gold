const prettyDate = s => 'Sunday 04/20';
const prettyDateAndTime = s => 'Sunday 04/20, 03:320';

const statusMap = {
  pending_home: { name: 'Pending Home Team', color: 'yellow' },
  pending_away: { name: 'Pending Away Team', color: 'yellow' },
  pending_assignor: { name: 'Waiting Assignor\'s Approval', color: 'yellow' },
  accepted: { name: 'Approved', color: 'green' },
  rejected: { name: 'Rejected', color: 'red' }
}

export const gameToView = g => ({
  id: g.id,
  title: `${g.homeTeam.school.name} ${g.homeTeam.teamKind} vs ${g.awayTeam.school.name} ${g.awayTeam.teamKind}`,
  start: prettyDateAndTime(g.start),
  location: `At ${g.location}`,
  status: statusMap[g.status].name,
  color: statusMap[g.status].color,

  //maintain reference to the original model
  raw: g
});

export const gameDetailToView = ({ game, actions, history }) => {
  const g = gameToView(game);    
  
  g.actions = actions;

  g.history = history.map(h => {
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

  return g;
}