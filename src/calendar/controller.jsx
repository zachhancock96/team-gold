import React, { Component } from 'react';
import './style.css';
import RCalendar from 'react-calendar'
import moment from 'shared/moment';
import { api } from 'shared';
import $ from 'jquery';
import { Filter } from 'shared/widgets/filter';

const createRenderer = labels => ({ activeStartDate, date, view }) => {
  if (view === 'month') {
    //TODO: optimize by narrowing labels to only
    //this month (this will be called 30 times atleast)
    date = moment(date);
    const labels_ = labels.filter(label => date.isSame(label.at, 'day'));
    return <div className='dots'>{labels_.map(l => <span className={l.color} key={l.id}>.</span>)}</div>
  }
}

const gameColor = game => {
  const p = [
    'pending_home_team',
    'pending_away_team',
    'pending_assignor'
  ];
  return p.indexOf(game.status) >= 0
    ? 'yellow'
    : game.status === 'accepted'
      ? 'green'
      : 'red';
}

export class Calendar extends Component {

  state = {
    ready: false,
    games: [],
    schools: [],
    labels: [],
    calendarListState: { start: null, end: null, games: [] }
  }

  componentDidMount() {
    //actions.showLoading('Calendar');
    api.getSchools()
      .then(schools => {
        api.getGames()
          .then(games => {
            const labels = games.map(g => ({ id: g.id, color: gameColor(g), at: g.start }));
            this.setState({ games, labels, schools });
          })
      })
    //actions.showLoading('Calendar');
  }

  //after label changes, calendar triggers calendar change
  //and this clears calendar list as well
  //so it all works out in the end. i you tell me how ugly this is,
  //preaching to the preacher that would be
  calendarChange = (o) => {
    const { games } = this.state;

    const games_ = o && o.ids
      ? games.filter(g => o.ids.indexOf(g.id) >= 0)
      : [];

    const calendarListState = games_.length ? ({
      start: o.start,
      end: o.end,
      games: games_
    }) : { start: null, end: null, games: [] };

    this.setState({ calendarListState });
  }

  filterGames = fn => {
    const { games } = this.state;
    const labels = games
      .filter(g => fn(g))
      .map(g => ({ id: g.id, color: gameColor(g), at: g.start }));
    
    this.setState({ labels });
  }

  render() {
    const { labels, schools, calendarListState: cls } = this.state;
    const m = this.props;
    const isDesktop = m.state.device === 'desktop';

    const desktopView = (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'space-around' }}>
        <div style={{ flex: 1, maxWidth: '800px' }}>
          <CalendarMain
            schools={schools}
            onFilterFnChanged={this.filterGames}
            labels={labels}
            onChange={this.calendarChange} />
        </div>
        <CalendarList
          onFilter
          shouldHide={cls.games.length == 0}
          start={cls.start}
          end={cls.end}
          games={cls.games} />
      </div>
    );

    const mobileView = (
      <div style={{ height: '100%' }}>

        <div style={{ height: '80%' }}>
          <CalendarMain
            labels={labels}
            onChange={this.calendarChange} />
        </div>

        <CalendarList
          shouldHide={cls.games.length == 0}
          start={cls.start}
          end={cls.end}
          games={cls.games} />
      </div>
    )

    // const mobileView = (
    //   <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-around'}}>
    //   <div style={{flex: 1, maxWidth: '800px'}}>
    //     <CalendarMain
    //         labels={labels}
    //         onChange={this.calendarChange} />
    //   </div>
    //   <CalendarList
    //     shouldHide={cls.games.length == 0}
    //     start={cls.start}
    //     end={cls.end}
    //     games={cls.games} />
    // </div>
    //   <CalendarMain
    //       labels={labels}
    //       onChange={this.calendarChange} />);

    return isDesktop ? desktopView : mobileView;
  }
}

class CalendarList extends Component {

  state = {
    ref: React.createRef()
  }

  show({ start, end, games }) {
    $('#calendarList')
      .empty()
      .append(`
        <div>${start.toISOString()} - ${end.toISOString()}</div>
        <ul>
          ${
        games.map(g => `<li>${g.homeTeam.name}</li>`).join('')
        }
        </ul>`)
      .show(500);
  }

  hide() {
    $('#calendarList').hide(500);
  }

  componentDidUpdate() {
    const { shouldHide, start, end, games } = this.props;

    if (shouldHide) {
      this.hide();
      return;
    }

    this.show({ start, end, games });
  }

  render() {

    return <div id="calendarList"></div>
  }
}


export class CalendarMain extends Component {
  state = {
    labelRenderer: () => [],
    range: null,
    isFilterOpen: false
  }

  static defaultProps = {
    labels: [],

    //called with {start: moment, end: moment, ids: any[]}
    //when selection happens
    //else called with null when selection is cleared
    //selection is cleared whenever labels prop is changed
    onChange: () => {},
    onFilterFnChanged: () => {},
    schools: [],
  }

  onFilterClick = () => {
    const bool = this.state.isFilterOpen;

    this.setState({isFilterOpen: !bool});
  }

  componentDidMount() {
    //BEGIN filter button to the calendar
    const navLabel = $('.react-calendar__navigation__label');
    const btn = $(filterBtn);
    btn.insertBefore(navLabel);
    btn.on('click', this.onFilterClick);
    //END filter button to the calendar

    const m = this.props;
    const labelRenderer = createRenderer(m.labels);
    this.setState({ labelRenderer });    
  }

  componentDidUpdate(prevProps) {
    const m = this.props;
    if (m.labels === prevProps.labels) return;
    const labelRenderer = createRenderer(m.labels);

    this.setState({ labelRenderer, range: null }, () => {
      this.props.onChange(null);
    });
  }

  onChange = (range) => {
    this.setState({ range }, () => {
      const start = moment(range[0]);
      const end = moment(range[1]);

      let ids = this.props.labels
        .filter(l => start.isSameOrBefore(l.at) && end.isSameOrAfter(l.at))
        .map(l => l.id);

      this.props.onChange({ start, end, ids });
    })
  }

  cancelFilter = () => {
    this.setState({isFilterOpen: false});
  }

  handleFilterFnChange = fn => {
    this.setState({isFilterOpen: false}, () => {
      this.props.onFilterFnChanged(fn);
    });
  }

  render() {
    const { labelRenderer, range, isFilterOpen } = this.state;
    const m = this.props;

    return (
      <>
      <div style={{position: 'absolute', marginTop: '65px'}}>
        <Filter 
          isOpened={isFilterOpen} 
          onFilterFnChanged={this.handleFilterFnChange}
          onCancel={this.cancelFilter}
          schools={m.schools}></Filter>
      </div>
      
      <div stye={{height: '100%', width: '100%'}} className='main-calendar'>
        <RCalendar
          className="main-calendar"
          showDoubleView={false}
          onChange={this.onChange}
          selectRange={true}
          maxDetail='month'
          minDetail='year'
          value={range}
          tileContent={labelRenderer} />
      </div>
      </>
    );
  }
}

Calendar.showNavbar = true;

const filterBtn = `<button aria-label="" class="filter" type="button">
  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="filter" class="svg-inline--fa fa-filter fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"></path></svg>
</button>`;