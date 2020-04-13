import React from 'react';
import PropTypes from 'prop-types';
import { View } from './view';
import { api } from 'shared';

export class EditGame extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,

      id: -1,
      location: '',
      start: null,
      homeTeamName: '',
      awayTeamName: '',
      canSubmit: false,
    };
  }

  componentDidMount() {
    const { gameId, actions } = this.props;

    actions.showLoading('EditGame');
    api.getGame(gameId)
      .then(game => {
        this.setState({
          ready: true,

          id: gameId,
          location: game.location,
          start: game.start,
          homeTeamName: game.homeTeam.name,
          awayTeamName: game.awayTeam.name
        })
      })
      .finally(() => {
        actions.hideLoading('EditGame');
      })
  }

  handleSubmit = () => {
    const { actions } = this.props;

    //TODO: do api.edit(id, { start, location }) leave this for now
    const s = this.state;
    if (s.canSubmit) {

      actions.showLoading('EditGame');
      api.editGame(s.id, { start: s.start, location: s.location })
        .then(() => {
          actions.showSuccess('Game Edit succesfull');
          this.props.onSuccess(this.props.gameId);
        })
        .catch(err => {
          actions.showError(err.message || err);
        })
        .finally(() => {
          actions.hideLoading('EditGame');
        });
    }
  }

  handleLocationChange = location => {
    this.setState({location}, () => this.postFormUpdate());
  }

  handleStartChange = start => {
    this.setState({start}, () => this.postFormUpdate());
  }

  postFormUpdate = () => {
    const { start, location } = this.state;
    const canSubmit = !!(start && location);
    this.setState({canSubmit});
  }

  handleCancel = () => {
    this.props.onCancel(this.props.gameId);
  }

  render() {
    const { location, start, homeTeamName, awayTeamName, canSubmit, ready } = this.state;
    
    return (
      ready
      ? <View
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          start={start}
          location={location}
          canSubmit={canSubmit}
          onSubmit={this.handleSubmit}
          onLocationChange={this.handleLocationChange}
          onCancel={this.handleCancel}
          onStartChange={this.handleStartChange} />
      : null
    );
}
}

EditGame.propTypes = {
  actions: PropTypes.object.isRequired,
  gameId: PropTypes.number.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}





// <div>
//   <h1>Edit Game</h1>
//   <p>---------------------------------</p>
//   <p>---------------------------------</p>
//   <br />
//   <br />
//   <br />
//   <p>Home: {homeTeamName} </p>
//   <p>Away: {awayTeamName} </p>
//   <p>Location: {location} </p>
//   <p>Start: {start} </p>
//   <button onClick={this.handleEdit}>Edit</button> <button onClick={this.handleCancel}>Cancel</button>
// </div>