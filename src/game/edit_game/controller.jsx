import React from 'react';
import PropTypes from 'prop-types';

export class EditGame extends React.Component {

  constructor(props) {
    super(props);

    const { start, location, id, homeTeam, awayTeam } = props.game;

    this.state = {
      id,
      location,
      start,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
    };
  }

  handleEdit = () => {
    //TODO: do api.edit(id, { start, location }) leave this for now
    this.props.onSuccess();
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  render() {
    const { location, start, homeTeamName, awayTeamName } = this.state;
    
    //TODO: extract this in view just like in AddGame controller
    return (
      <div>
        <h1>Edit Game</h1>
        <p>---------------------------------</p>
        <p>---------------------------------</p>
        <br />
        <br />
        <br />
        <p>Home: {homeTeamName} </p>
        <p>Away: {awayTeamName} </p>
        <p>Location: {location} </p>
        <p>Start: {start} </p>
        <button onClick={this.handleEdit}>Edit</button> <button onClick={this.handleCancel}>Cancel</button>
      </div>
    );
  }
}

EditGame.propTypes = {
  game: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}