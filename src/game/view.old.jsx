import m from 'mithril';
import { router } from '../router';
import { Route } from '../routes';

const childLink = (routing, segment) => router.toPath(routing.childRoute(segment));

const AddGame = ({ actions, state }) => {
  const formType = 'addGame';

  const form = state.form[formType];
  const homeTeamId = form.homeTeamId || 0;
  const awayTeamId = form.awayTeamId || 0;
  const start = form.start || '';
  const location = form.location || '';

  const onHomeTeamChange = e => {
    const id = parseInt(e.target.value);
    actions.updateGameForm(formType, 'homeTeamId', id);
  }

  const onAwayTeamChange = e => {
    const id = parseInt(e.target.value);
    actions.updateGameForm(formType, 'awayTeamId', id);
  }
  
  const onStartChange = e => {
    const val = e.target.value;
    actions.updateGameForm(formType, 'start', val);
  }
  
  const onLocationChange = e => {
    const val = e.target.value;
    actions.updateGameForm(formType, 'location', val);
  }

  return (
    <form>
      <label>Home Team</label>
      <select value={homeTeamId} oninput={onHomeTeamChange}>
        <option value={0}>Select Home Team</option>
        {
          state.myTeams.map(t => ( <option value={t.id}>{t.name}</option> ))
        }
      </select>
      
      <label>Away Team</label>
      <select value={awayTeamId} oninput={onAwayTeamChange}>
        <option value={0}>Select Away Team</option>
        {
          state.teams.map(t => ( <option value={t.id}>{t.name}</option> ))
        }
      </select>

      <label>Start</label>
      <input type="text" value={start} oninput={onStartChange}/>

      <label>Location</label>
      <input type="text" value={location} oninput={onLocationChange} />

      <input 
        type="submit" 
        value="Add Game" 
        onclick={e => {e.preventDefault(); actions.addGame(state)}} />
    </form>
  )
}

//selectedGameId is null if nothing from the list is selecte
const GameList = ({ games, selectedGameId, actions, routing }) => {
  //local segment id AllGames or ApprovedGames or PendingGames or RejectedGames
  //child segment id :id or nothing

  const className = g => g.id === selectedGameId? 'game-list-item active': 'game-list-item'

  const gameItems = games.map(g => <li
    class={className(g)}
    key={g.id}
    onclick={e => { actions.navigateTo(routing.childRoute(Route.GameDetail({ id: g.id }))) }}>
    <div style={{
      border: 'solid',
      borderColor: g.color,
      backgroundColor: g.color,
      width: '10px'
    }}></div>
    <div style={{
      padding: '10px'
    }}>
      <p>{g.title}</p>
      <p>{g.start}</p>
      <p>{g.location}</p>
    </div>
  </li>);
  return <ul> {gameItems}</ul>;
}

const GameDetail = ({ state, actions }) => {
  const g = state.gameDetail;
  const mbl = {
    marginBottom: '24px'
  };
  const mbs = {
    marginBottom: '12px'
  };
  const header = {
    fontSize: '1.25em',
    fontWeight: 'bold'
  };
  const timestamp = {
    fontSize: '.9em',
    color: 'grey',
    fontStyle: 'italic'
  };

  const actionButtons = g.actions? (
    <div style={mbl}>
      <h2 style={header}>Actions</h2>
      {
        g.actions.indexOf('edit') >= 0? 
        (
          <button class='btn btn-yellow' onclick={() => actions.startEditing(state)}>Edit</button>
        ): []
      }
      {
        g.actions.indexOf('accept') >= 0? 
        (
          <button class='btn btn-green' onclick={() => actions.acceptGame(state)}>Accept</button>
        ): []
      }
      {
        g.actions.indexOf('reject') >= 0? 
        (
          <button class='btn btn-red' onclick={() => actions.rejectGame(state)}>Reject</button>
        ): []
      }
    </div>
  ): null;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      height: '100%',
      overflowY: 'scroll'
    }}>
      <div style={mbl}>
        <h2 style={header}>Game</h2>
        <p>{g.title}</p>
        <p>{g.start}</p>
        <p>{g.location}</p>
      </div>
      <div style={mbl}>
        <h2 style={header}>Game History</h2>
        {
          g.history.map(hist => {
            return (
              <div style={mbs}>
                <p style={timestamp}>{hist.timestamp}</p>
                {hist.body.map(k => <p>{k}</p>)}
              </div>
            )
          })
        }
      </div>
      <div style={mbl}>
        <h2 style={header}>Status</h2>
        <p>{g.status}</p>
      </div>
      {actionButtons}
    </div>
  )
}

const ManageGames = ({ state, actions, routing }) => {
  //local segment id ManageGames
  //child segment id AllGames or ApprovedGames or PendingGames or RejectedGames
  //grand child segment id GameDetail

  const id = routing.childSegment.id || 'AllGames';
  const games = id === 'AllGames'
    ? state.games
    : id === 'ApprovedGames'
      ? state.approvedGames
      : id === 'PendingGames'
        ? state.pendingGames
        : state.rejectedGames;

  const showGameDetail = (() => {
    const seg = routing.next().childSegment;
    return seg && seg.id === 'GameDetail' && state.gameDetail;
  })();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <nav>
        <a class="navbar-links" href={childLink(routing, Route.AllGames())}>All Games</a>
        <a class="navbar-links" href={childLink(routing, Route.ApprovedGames())}>Approved Games</a>
        <a class="navbar-links" href={childLink(routing, Route.PendingGames())}>Pending Games</a>
        <a class="navbar-links" href={childLink(routing, Route.RejectedGames())}>Rejected Games</a>
      </nav>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
      }}>
        <div style={{
          width: '400px',
          backgroundColor: 'white',
          overflowY: 'scroll'
        }}>
          {GameList({ 
            games: games, actions, 
            selectedGameId: showGameDetail? state.gameDetail.id: null,
            routing: routing.next() })}
        </div>
        <div style={{
          marginLeft: '20px',
          flex: 1,
        }}>
          {
            showGameDetail ? GameDetail({ state, actions }) : null
          }
        </div>
      </div>
    </div>);
}

const ComponentMap = {
  AddGame,
  ManageGames
};

export const Game = ({ state, actions, routing }) => {
  //local segment id Game
  //child segment id AddGame, ManageGames
  //grand-child segment id AllGames or ApprovedGames or PendingGames or RejectedGames
  const Component = ComponentMap[routing.childSegment.id];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '20px'
    }}>
      <h2 style={{fontSize: '1.5em', fontWeight: 'bold', padding: '10px 0px 10px 0px'}}>{state.game.title}</h2>
      <nav>
        <a class="navbar-links" href={childLink(routing, Route.AddGame())}>Add Game</a>
        <a class="navbar-links" href={childLink(routing, [Route.ManageGames(), Route.AllGames()])}>Manage Games</a>
      </nav>
      <div style={{
        flex: 1
      }}>
        {Component({ state: state.game, actions, routing: routing.next() })}
      </div>
    </div>
  );
};

Game.showNavbar = true; 