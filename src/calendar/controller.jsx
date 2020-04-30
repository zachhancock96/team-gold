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
    const { actions } = this.props;
    actions.showLoading('Calendar');
    api.getSchools()
      .then(schools => {
        return api.getGames()
          .then(games => {
            const labels = games.map(g => ({ id: g.id, color: gameColor(g), at: g.start }));
            this.setState({ games, labels, schools });
          })
      })
      .then(() => {
        actions.hideLoading('Calendar');
      });
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
    
    const calendarMain = <CalendarMain
      schools={schools}
      onFilterFnChanged={this.filterGames}
      labels={labels}
      onChange={this.calendarChange} />;

    const calendarList = <CalendarList
      actions={m.actions}
      shouldHide={cls.games.length == 0}
      start={cls.start}
      end={cls.end}
      games={cls.games} />
    const desktopView = (
      <div style={{ 
        display: 'flex', 
        height: '100%', 
        justifyContent: 'space-around',
        paddingTop: '20px',
        paddingBottom: '20px'
        }}>
        <div style={{ flex: 1, maxWidth: '800px' }}>
          {calendarMain}
        </div>
        <CalendarList
          actions={m.actions}
          shouldHide={cls.games.length == 0}
          start={cls.start}
          end={cls.end}
          games={cls.games} />
      </div>
    );

    const mobileView = (
      <div className='mobile' style={{
        paddingTop: '20px',
        paddingBottom: '20px'
      }}>
        <div style={{ height: '680px' }}>
          <CalendarMain
            schools={schools}
            onFilterFnChanged={this.filterGames}
            labels={labels}
            onChange={this.calendarChange} />
        </div>
        {calendarList}
      </div>
    );
    return isDesktop ? desktopView : mobileView;
  }
}

class CalendarList extends Component {

  state = {
    ref: React.createRef()
  }

  exportCsv = async () => {
    const { games, actions } = this.props;
    
    const gameIds = games.map(g => g.id);

    actions.showLoading('exporting');
    await api.createArbiterExport({gameIds})
      .then(exportId => {
        actions.showSuccess('Export created');
        return api.getArbiterExport(exportId)
          .then(ex => {
            const a = document.createElement('a')
            a.setAttribute('download', true);
            a.href = ex.downloadUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          })
      })
      .catch(err => { actions.showError(err) })

    
    actions.hideLoading('exporting');
  }

  show({ start, end, games }) {
    const items = games.map(g => `
      <div class="items-body-content">
        <div class="d-flex">
          <div class="border ${gameColor(g)}"></div>
          <div class="flex-1">
            <div>${g.homeTeam.name}</div>
            <div>${g.awayTeam.name}</div>
            <div>${prettyDateTime(g.start)} @ ${g.location}</div>
          </div>                  
        </div>
      </div>
    `).join('');

    const el = `
    <div class="cal-list">
    <div class="items">
      <div class="items-head">
         <div class="horny-tamer">
          <p class="date">${prettyDate(start)}/${prettyDate(end)}</p>
          <p class="games">14 games</p>
           ${hornyDownloadBtn}           
        </div>
        <hr>
      </div>
      
      <div class="items-body">
        ${items}  
      </div>
      </div>
    </div>
  </div>`;


  $('#calendarList')
      .empty()
      .append(el)
      .show(500);

    $('#horny-download').on('click', this.exportCsv);
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


const prettyDate = date => {
  return moment(date).format('MMMM D');
}

const prettyDateTime = date => {
  return moment(date).format('MMMM D, hh:mm a');
}

const hornyDownloadBtn = `<span id="horny-download" class="horny-download"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download" class="svg-inline--fa fa-download fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg></span>`