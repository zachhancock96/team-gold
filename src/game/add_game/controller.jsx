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
      location: '',
      isAddingSchool: false,
      schoolNameToAdd: ''
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
    const { homeTeams, canSubmit, isAddingSchool, schoolNameToAdd, selectedHomeId, selectedAwayId, start, location } = this.state;
    const { actions } = this.props;

    if (!canSubmit) return;

    if (isAddingSchool) {
      const teamKind = homeTeams.find(ht => ht.id === selectedHomeId).teamKind;

      actions.showLoading('AddGame');
      api.addNonLhsaaSchool({name: schoolNameToAdd })
        .then(async schoolId => {
          console.log(`non lhsaa school added: ${schoolId}`);
          const school = await api.getSchool(schoolId);

          const awayTeamId = school.teams.find(t => t.teamKind === teamKind).id;
          
          const body = {
            homeTeamId: selectedHomeId,
            awayTeamId,
            start: start,
            location
          };

          return body;
        })
          .then(async body => {
            console.log(`adding game... ${JSON.stringify(body, null, 2)}`);
            
            await api.addGame(body);
            console.log(`game added`);
            this.reset();
            actions.showSuccess('Game added sucessfully');
          })
          .catch(err => {
            console.log(err);
            actions.showError(err.message || err);
          })
          .finally(() => {
            actions.hideLoading('AddGame');
          });

    } else {
      const body = {
        homeTeamId: selectedHomeId,
        awayTeamId: selectedAwayId,
        start: start,
        location
      };
      
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
  }

  reset = (cb) => {
    cb = cb || (() => {});

    this.setState({
      ready: false
    }, async () => {
      let homeTeams  = await api.getMyTeams().catch(err => []);
      homeTeams = homeTeams.filter(ht => ht.isLhsaa);
      const awayTeams = await api.getTeams().catch(err => []);
  
      this.setState({
        ready: true,
        selectedHomeId: -1,
        selectedAwayId: -1,
        canSubmit: false,
        start: null,
        location: '',
        homeTeams,
        awayTeams,
        isAddingSchool: false,
        schoolNameToAdd: ''
      }, cb);
    });
  }

    //by post we mean after form update
    postFormUpdate = () => {
      console.log(this.state);
      const { isAddingSchool, homeTeams, awayTeams } = this.state;
      let illegal;

      if (isAddingSchool) {

        const { selectedHomeId, schoolNameToAdd, location, start } = this.state;
        const home = homeTeams.find(h => h.id === selectedHomeId);

        illegal = !home || !location.length || !schoolNameToAdd.length || !start;
      } else {
        const { selectedHomeId, selectedAwayId, location, start } = this.state;
  
        const home = homeTeams.find(h => h.id === selectedHomeId);
        const away = awayTeams.find(a => a.id === selectedAwayId);
  
        illegal = !home || !away || home.teamKind !== away.teamKind || home.id === away.id;
        illegal = illegal || !location.length || !start;
      }

      this.setState({ canSubmit: !illegal });
    }

  async componentWillMount() {
    const { actions } = this.props;
    actions.showLoading('AddGame');

    this.reset(() => {
      actions.hideLoading('AddGame');
    });
  }

  changeIsAdding = bool => {
    this.setState({isAddingSchool: bool}, () => { this.postFormUpdate(); });
  }

  changeSchoolNameToAdd = schoolName => {
    schoolName = schoolName || '';
    this.setState({schoolNameToAdd: schoolName}, () => { this.postFormUpdate(); });
  }

  render() {
    const { ready, homeTeams, awayTeams, selectedHomeId, selectedAwayId, start, location, canSubmit,
      isAddingSchool, schoolNameToAdd } = this.state;
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
        onAwaySelect={this.handleAwaySelect} 
        
        isAddingSchool={isAddingSchool}
        isAddingSchoolChange={this.changeIsAdding}
        schoolNameToAdd={schoolNameToAdd}
        schoolNameToAddChange={this.changeSchoolNameToAdd}
        />
    );
  }
}