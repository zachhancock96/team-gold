import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import '../../node_modules/@fullcalendar/core/main.css';
import '../../node_modules/@fullcalendar/daygrid/main.css';
import {api} from 'shared';

export class Calendar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      games : []
    }
  }

  componentDidMount() {
    api.getGames().then((games) => {
      this.setState({games});
    })
  }

  render() {
    const games = this.state.games.map(g => ({
      title: g.homeTeam.name  + ' vs ' + g.awayTeam.name + ' @ ' + g.location,
      start: g.start,
      end: g.start
    }));

    return (
      <FullCalendar defaultView="dayGridMonth"
      plugins={[ dayGridPlugin ]} 
      events={games} />
    )
  }

}

Calendar.showNavbar = true;