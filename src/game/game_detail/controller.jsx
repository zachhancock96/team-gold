import React, { Component } from 'react'; 
import PropTypes from 'prop-types';
import { View } from './view';
import { api } from 'shared';

export class GameDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gameDetail: null
    };
  }

  async componentDidMount() {
    //TODO: do this on component update and when gameId is different
    const m = this.props;
    this._loadGame(m.gameId);
  }

  _loadGame = gameId => {
    const m = this.props;

    m.actions.showLoading('GameDetail');
    api.loadGameAndActionAndHistory(gameId)
      .then(gameDetail => {
        this.setState({gameDetail});
      })
      .finally(() => {
        m.actions.hideLoading('GameDetail');
      });
  }

  async componentDidUpdate(prevProps) {
    const prevGameId = prevProps.gameId;
    const newGameId = this.props.gameId;

    if (newGameId != prevGameId) {
      this._loadGame(newGameId);
    }
  }

  handleEdit = id => {
    this.props.onEdit(id);
  }

  handleAccept = async id => {
    await api.acceptGame(id);
    this._loadGame(id);
  }

  handleReject = async id => {
    const { actions } = this.props;
    api.rejectGame(id)
      .then(() => {
        actions.showSuccess('Game Rejected succesfully');
        this._loadGame(id);
      })
      .catch(err => actions.showError(err.message || err));
  }

  render() {
    const { gameDetail } = this.state;
    
    return (<View
        gameDetail={gameDetail}
        onEdit={this.handleEdit}
        onReject={this.handleReject}
        onAccept={this.handleAccept} />);
  }
}

GameDetail.propTypes = {
  gameId: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
}