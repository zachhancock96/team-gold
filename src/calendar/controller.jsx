import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';
import '../../node_modules/@fullcalendar/core/main.css';
import '../../node_modules/@fullcalendar/list/main.css';
import '../../node_modules/@fullcalendar/daygrid/main.css';
import '../../node_modules/@fullcalendar/timegrid/main.css';
import {api} from 'shared';
import { now } from 'moment-timezone'
import moment, { API_DATE_FORMAT } from 'shared/moment';
import { Row, Col } from 'react-bootstrap';
import { TextArea, Button, ButtonGrey, Switch, Datepicker, MultiSelect } from 'shared/widgets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCsv, faAngleDoubleDown, faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons'
import { brownBorder, green, grey, brown, white } from 'shared/color';

const mt5 = 'mt-5';
const mt4 = 'mt-4';
const mt2 = 'mt-2';

const maxWidthInput = '400px';

export class Calendar extends React.Component {

  state = {
    schools: []
  }
  
  constructor(props) {
    super(props);
    this.state = {
      schools: [],
      games: [],
    }
  }

  async componentDidMount() {
    const { actions } = this.props;
    try {
      const schools = await api.getSchools();
      const games = await api.getGames();
      this.setState({schools, games});
      console.log(games);
      console.log(schools);
    }

    catch(error) {
      actions.showError(error.message || error);
    }
  }

  render() {
    const { actions } = this.props;
    const schools = this.state.schools.map(s => {
      return ({
        id: s.id,
        name: s.name
      })
    });

    const games = this.state.games.map(g => {
      if (g.status == 'accepted') {
        return ({
          title: g.homeTeam.name  + ' vs ' + g.awayTeam.name + ' @ ' + g.location,
          start: g.start,
          end: g.start
        });
      } 
      
      else {
        return ({
          title: '(' + g.status + ') ' + g.homeTeam.name  + ' vs ' + g.awayTeam.name + ' @ ' + g.location,
          start: g.start,
          end: g.start
        });
      }
    });

    return (
      <div>
        <First />
        <CreateFilter />
        <End />
        <FullCalendar 
        defaultView="dayGridMonth"
        header={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear'
        }}
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin ]} 
        events={games} />
      </div>
    )
  }

}

Calendar.showNavbar = true;

const First = () => (
  <div style={{
    borderBottom: brownBorder,
    marginBottom: '8px',
    display: 'flex'
  }}>
    <h2 style={{
      fontSize: '1.4rem',
      fontWeight: 'bold',
      lineHeight: '3rem'
    }}>
      Filters
    </h2>
  </div>
);

const End = () => (
  <div style={{
    borderBottom: brownBorder,
    marginBottom: '8px',
    display: 'flex'
  }}>
    <h2 style={{
      fontSize: '1.4rem',
      fontWeight: 'bold',
      lineHeight: '3rem'
    }}>
      
    </h2>
  </div>
);

const LabelWithSwitch = ({ children, isOn, onSwitchClick }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
    <label style={{ fontWeight: 'bold', width: '200px' }}>{children}</label>
    <div>
      <Switch isOn={isOn} onClick={onSwitchClick} />
    </div>
  </div>
);

const Label = ({children}) => (
  <label style={{ fontWeight: 'bold', width: '200px' }}>{children}</label>
);

class CreateFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filterBySchool: false
    }
  }

  componentDidUpdate(prevProps) {
    const { schools } = this.props;
    if (prevProps.schools !== schools) {
      this.setState({options: schools.map(s => ({label: s.name, value: s.id}))})
    }
  }

  setState = (...args) => {
    //provide a dummy callback to not have postSetState triggered
    if (args.length >= 2 && typeof args[1] === 'function') {
      super.setState(...args);
    } else {
      super.setState(...args, () => {
        this.postSetState();
      })
    }
  }

  postSetState = () => {
    const s = this.state;
    const canCreate = !!(s.shouldFilterByDate 
      && s.startFilter
      && s.endFilter && moment(s.startFilter).isSameOrBefore(s.endFilter))
      || (!s.shouldFilterByDate);

    if (canCreate !== s.canCreate) {
      this.setState({canCreate}, () => {});
    }
  }

  filterBySchool = bool => {
    if (bool) {
      this.setState({shouldFilterBySchool: true});
    } else {
      this.setState({
        shouldFilterBySchool: false,
        selected: []
      });
    }
  }

  changeSchoolSelect = selected => {
    const s = this.state;
    if (s.shouldFilterBySchool) {
      this.setState({ selected });
    }
  }

  reset = () => {
    this.setState({
      filterBySchool: false
    });
  }

  render() {
    const { options, selected, maxWidth, onSelectedChanged,
      itemType, overrideStrings, disabled, filterBySchool} = this.state;

    return (
      <div>
        <form>
          <Row className={mt4}>
            <Col xs={12}>
              <LabelWithSwitch isOn={filterBySchool} onSwitchClick={this.changeShouldFilterBySchool}>
                Filter by school
                </LabelWithSwitch>
            </Col>
            <Col xs={12}>
              <MultiSelect
                options={options}
                selected={selected}
                maxWidth={maxWidthInput}
                onSelectedChanged={this.changeSchoolSelect}
                itemType='school'
                overrideStrings={{selectSomeItems: 'All schools are selected by default'}}
                disabled={!filterBySchool} />
            </Col>
          </Row>
        </form>
      </div>
    )
  }
};