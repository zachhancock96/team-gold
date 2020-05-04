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
    api.loadGameAndActionAndHistoryAndSubscription(gameId)
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

  subscribe = () => {
    const { actions, gameId } = this.props;

    api.subscribeGameUpdate(gameId)
      .then(() => {
        actions.showSuccess('You will recieve email notification for any changes to the game');
        this._loadGame(gameId);
      })
      .catch(err => actions.showError(err.message || err));
  }

  unsubscribe = () => {
    const { actions, gameId } = this.props;
    const subscriptionId = this.state.gameDetail.subscription.subscriptionId;

    api.unsubscribeGameUpdate(subscriptionId)
      .then(() => {
        actions.showSuccess('Unsubscribed from email notifications');
        this._loadGame(gameId);
      })
      .catch(err => actions.showError(err.message || err));
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
    
    return gameDetail?
      (<View
          gameDetail={gameDetail}
          canSubscribe={!gameDetail.subscription}
          onSubscribe={this.subscribe}
          onUnsubscribe={this.unsubscribe}
          onEdit={this.handleEdit}
          onReject={this.handleReject}
          onAccept={this.handleAccept} />)
      : null;
  }
}

GameDetail.propTypes = {
  gameId: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
}