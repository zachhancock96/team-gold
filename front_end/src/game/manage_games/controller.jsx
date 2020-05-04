import React from 'react';
import { Nav } from './nav_controller';
import { GameDetail } from '../game_detail';
import { ListView } from './list_view';
import { EditGame } from '../edit_game';
import { Route } from '../../routes';
import { api } from 'shared';

const getGameDetailId = routing => {
  if (isEditPage(routing) || isDetailPage(routing)) {
    return routing.next().childSegment.params.id;
  }
  return null;
}

const isEditPage = routing => {
  return routing.next() && routing.next().childSegment && routing.next().childSegment.id === 'EditGame';
}

const isDetailPage = routing => {
  return routing.next() && routing.next().childSegment && routing.next().childSegment.id === 'GameDetail';
}

const filterGamesByRoutingState = (games, routing) => {
  const s = routing.childSegment.id;

  const filterFn = s === 'AllGames'
    ? g => g
    : s === 'ApprovedGames'
      ? g => g.status === 'accepted'
      : s === 'PendingGames'
        ? g => ['pending_home_team', 'pending_assignor', 'pending_away_team'].indexOf(g.status) >= 0
        : g => g.status === 'rejected';

  return games.filter(filterFn);
}

//TODO: list view is not update right now when game is accepted or rejected
export class ManageGames extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      games: []
    }
  }

  componentDidMount() {
    this.refreshGames();
  }

  refreshGames = () => {
    const m = this.props;
    m.actions.showLoading('ManageGames');
    api.getMyGames()
      .then(games => {
        console.log(games);
        this.setState({games});
      })
      .finally(() => {
        m.actions.hideLoading('ManageGames');
      })
  }

  //edit button clicked from Detail page
  handleEditClick = id => {
    const { actions, routing } = this.props;
    const r = routing.next().childRoute(Route.EditGame({id}));
    actions.navigateTo(r);
  }

  //list item click from list view page
  handleGameClick = id => {
    const { actions, routing } = this.props;
    const r = routing.next().childRoute(Route.GameDetail({id}));
    actions.navigateTo(r);
  }

  //cancel clicked from edit page
  handleEditCancel = id => {
    const { actions, routing } = this.props;
    const r = routing.next().childRoute(Route.GameDetail({id}));
    actions.navigateTo(r);
  }

  handleEditSuccess = id => {
    this.refreshGames();
    const { actions, routing } = this.props;
    const r = routing.next().childRoute(Route.GameDetail({id}));
    actions.navigateTo(r);
  }

  render() {
    const m = this.props;
    const games = filterGamesByRoutingState(this.state.games, m.routing);

    const isEdit = isEditPage(m.routing);
    const isDetail = isDetailPage(m.routing);

    const activeGameId = getGameDetailId(m.routing);

    const list = <ListView
      games={games}
      activeGameId={activeGameId}
      onGameClick={this.handleGameClick} />;

    const detail = isDetail
      ? (
        <GameDetail
          actions={m.actions}
          gameId={activeGameId}
          onEdit={this.handleEditClick} />
      ): isEdit? (
        <EditGame
          actions={m.actions}
          gameId={activeGameId}
          onSuccess={this.handleEditSuccess}
          onCancel={this.handleEditCancel} />
      ): null;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <Nav state={m.state} actions={m.actions} routing={m.routing.next()} />
        {
          m.state.device === 'mobile' ?
            (
              <MobileLayout>
                {detail? detail: list}
              </MobileLayout>
            ) :
            (
              <DesktopLayout>
                {list}
                {detail}
              </DesktopLayout>
            )
        }
      </div>
    );
  }
}

const MobileLayout = ({ children }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      overflowY: 'scroll',
      overflowX: 'hidden',
      flex: 1,
      height: '100vh'
    }}>
      {children}
    </div>
  );
}

/*
  assumpiton: 2 or less child elements are passed
  firs child is attached to left,
  second to right
*/
const DesktopLayout = ({ children }) => {
  const left = children[0] || null;
  const right = children[1] || null;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'row'
    }}>
      <div style={{
        width: '400px',
        height: '750px',
        backgroundColor: 'white',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.19), 0 8px 17px 0 rgba(0, 0, 0, 0.2)'


      }}>
        {left}
      </div>
      <div style={{
        marginLeft: '20px',
        flex: 1,
        height: '750px',
        backgroundColor: 'white',
        overflowY: 'auto',
        borderRadius: '8px',
        boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.19), 0 8px 17px 0 rgba(0, 0, 0, 0.2)'
      }}>
        {right}
      </div>
    </div>
  );

}

