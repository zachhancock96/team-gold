import React from 'react';
import { View } from './view';
import { api } from 'shared';

export class AddGame extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,

      homeTeams: [],
      awayTeams: [],
      selectedHomeId: -1,
      selectedAwayId: -1,
      canSubmit: false,
      start: null,
      location: ''
    }
  }

  handleHomeSelect = id => {
    const { homeTeams } = this.state;

    const home = homeTeams.find(h => h.id === id);
    const selectedHomeId = home? home.id: -1;

    this.setState({selectedHomeId}, () => { this.postFormUpdate(); });    
  }


  handleAwaySelect = id => {
    const { awayTeams } = this.state;

    const away = awayTeams.find(h => h.id === id);
    const selectedAwayId = away? away.id: -1;

    this.setState({ selectedAwayId }, () => { this.postFormUpdate();  });
  }

  handleLocationChange = location => {
    this.setState({ location }, () =>{ this.postFormUpdate(); });
  }

  handleStartChange = start => {
    this.setState({ start }, () => { this.postFormUpdate(); });
  }

  handleSubmit = () => {
    const { canSubmit } = this.state;
    if (!canSubmit) return;

    const { selectedHomeId, selectedAwayId, start, location } = this.state;

    const body = {
      homeTeamId: selectedHomeId,
      awayTeamId: selectedAwayId,
      start: start,
      location
    };

    const { actions } = this.props;
    
    actions.showLoading('AddGame');
    api.addGame(body)
      .then(() => {
        this.reset();
        actions.showSuccess('Game added sucessfully');
      })
      .catch(err => {
        actions.showError(err.message || err);
      })
      .finally(() => {
        actions.hideLoading('AddGame');
      })
  }

  reset = () => {
    this.setState({
      selectedHomeId: -1,
      selectedAwayId: -1,
      canSubmit: false,
      start: null,
      location: ''
    });
  }

    //by post we mean after form update
    postFormUpdate = () => {
      const { selectedHomeId, selectedAwayId, location, start } = this.state;

      const { homeTeams, awayTeams } = this.state;

      const home = homeTeams.find(h => h.id === selectedHomeId);
      const away = awayTeams.find(a => a.id === selectedAwayId);

      let illegal = !home || !away || home.teamKind !== away.teamKind || home.id === away.id;
      illegal = illegal || !location.length
      illegal = illegal || !start;

      this.setState({ canSubmit: !illegal });
    }

  async componentWillMount() {
    const { actions } = this.props;
    actions.showLoading('AddGame');

    const homeTeams  = await api.getMyTeams();
    const awayTeams = await api.getTeams();

    this.setState({
      ready: true,
      homeTeams: [...homeTeams],
      awayTeams: [...awayTeams]
    });

    actions.hideLoading('AddGame');
  }

  render() {
    const { ready, homeTeams, awayTeams, selectedHomeId, selectedAwayId, start, location, canSubmit } = this.state;
    if (!ready) return null;
    
    return (
      <View
        homeTeams={homeTeams}
        awayTeams={awayTeams}
        location={location}
        start={start}
        selectedHomeId={selectedHomeId}
        selectedAwayId={selectedAwayId}
        canSubmit={canSubmit}
        onSubmit={this.handleSubmit}
        onHomeSelect={this.handleHomeSelect}
        onLocationChange={this.handleLocationChange}
        onStartChange={this.handleStartChange}
        onAwaySelect={this.handleAwaySelect} />
    );
  }
}