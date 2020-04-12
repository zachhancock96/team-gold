import React from 'react';
import { ListView } from './list_view';
import { Nav } from './nav_controller';
import { GameDetail } from './game_detail_view';
import { EditGame } from '../edit_game';
import { api } from 'shared';
import { Route } from '../../routes';

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

/*
  TODO: refactor needed for mobile view; ugly code already

  routing
  localSegment ManageGames
  childSegment AllGames, ApprovedGames, PendingGames, RejectedGames, EditGame
*/
export class ManageGames extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameDetail: null,

      games: [],
      
      isEditing: false,

      editGameId: null
    }
  }

  componentWillMount() {
    const m = this.props;

    loadGames()
      .then(games => {
        this.setState({
          games
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
      gameDetail: null
    }, () => {

      loadGameDetail(gameId)
        .then(gameDetail => {

          this.setState({
            gameDetail
          }, cb);
        });
    });
  }

  //@param gameId, non null, number
  handleGameClick = gameId => {
    this.loadGameDetail(gameId);
  }

  handleEdit = gameId => {
    this.setState({
      isEditing: true,
      editGameId: gameId
    });
  }

  handleEditCancel = () => {
    this.setState({
      isEditing: false,
      editGameId: null
    });
  }

  handleEditSuccess = () => {
    this.setState({
      isEditing: false,
      editGameId: null
    })
  }

  handleReject = gameId => {
    alert(`rejecting game id ${gameId}`);
  }

  handleAccept = gameId => {
    alert(`accepting game id ${gameId}`);
  }

  render() {
    const m = this.props;
    const { gameDetail, games: unFilteredGames, isEditing, editGameId } = this.state;

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

    const gameToEdit = (isEditing && unFilteredGames.find(g => g.id === editGameId)) || null;

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
            {
              gameToEdit?
              (
                <EditGame
                  game={gameToEdit}
                  onCancel={this.handleEditCancel}
                  onSuccess={this.handleEditSuccess} />
              )
              : (
                <GameDetail 
                  gameDetail={gameDetail}
                  onEdit={this.handleEdit}
                  onReject={this.handleReject}
                  onAccept={this.handleAccept} />
              )
            }
          </div>
        </div>
      </div>);
  }
}