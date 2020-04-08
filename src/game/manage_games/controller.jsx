import React from 'react';
import { ListView } from './list_view';
import { Nav } from './nav_controller';
import { GameDetail } from './game_detail_view';
import { api } from 'shared';

const loadGames = () => {
  return api.getGames();
}

const loadGameDetail = gameId => {
  return api.loadGameAndActionAndHistory(gameId);
}

const getGameDetailId = routing => {
  const g = routing.next().next();
  let id = g && g.localSegment.params.id
  return id = id? parseInt(id): null;
}

export class ManageGames extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //show spinner on listView if this is true
      isListViewLoading: true,

      isDetailViewLoading: false,

      gameDetail: null,

      games: []
    }
  }

  componentWillMount() {
    const m = this.props;

    loadGames()
      .then(games => {
        this.setState({
          games,
          isListViewLoading: false
        }, () => {
          const gameId = getGameDetailId(m.routing);

          if (gameId) {
            this.loadGameDetail(gameId);
          }
        });
      })
  }

  //@param gameId, non null, number
  loadGameDetail = (gameId, cb = () => {}) => {

    this.setState({
      isDetailViewLoading: true,
      gameDetail: null
    }, () => {

      loadGameDetail(gameId)
        .then(gameDetail => {

          this.setState({
            isDetailViewLoading: false,
            gameDetail
          }, cb);
        });
    });
  }

  //@param gameId, non null, number
  handleGameClick = gameId => {
    this.loadGameDetail(gameId);
  }

  handleEdit = ({ gameId, start, location }) => {
    alert(`editing game: ${JSON.stringify({gameId, start, location})}`);
  }

  handleReject = gameId => {
    alert(`rejecting game id ${gameId}`);
  }

  handleAccept = gameId => {
    alert(`accepting game id ${gameId}`);
  }

  render() {
    const m = this.props;
    const { isListViewLoading, isDetailViewLoading, gameDetail, games: unFilteredGames } = this.state;

    const filterFn = (() => {
      const s = m.routing.childSegment.id;

      const fn = s === 'AllGames'
        ? g => g
        : s === 'ApprovedGames'
          ? g => g.status === 'accepted'
          : s === 'PendingGames'
            ? g => ['pending_home', 'pending_assignor', 'pending_away'].indexOf(g.status) >= 0
            : g => g.status === 'rejected';

      return fn;
    })();

    const games = unFilteredGames.filter(filterFn);

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <Nav state={m.state} actions={m.actions} routing={m.routing.next()} />
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
            {/*TODO: pass in activeGameId */}
            <ListView
              showLoading={isListViewLoading}
              games={games}
              activeGameId={gameDetail? gameDetail.id: null}
              onGameClick={this.handleGameClick} />
          </div>
          <div style={{
            marginLeft: '20px',
            flex: 1,
            backgroundColor: 'white',
            overflowY: 'scroll'
          }}>
            <GameDetail 
              showLoading={isDetailViewLoading}
              gameDetail={gameDetail}
              onEdit={this.handleEdit}
              onReject={this.handleReject}
              onAccept={this.handleAccept} />
          </div>
        </div>
      </div>);
  }
}