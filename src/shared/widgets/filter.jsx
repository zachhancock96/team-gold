import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { EditText, MultiSelect, Datepicker } from 'shared/widgets';
import Collapse from 'react-collapse';
import './style.css';
import moment from 'shared/moment';

const maxInputWidth = '9999px';
const maxInputWidthSm = '9999px';

/*prop types: 
  {
    schools: Array<school>,//required
    isOpened: boolean,//required
    onFilterFnChanged : () => {} | null,
    onCancel: () => {} | null
  }
*/
export class Filter extends React.Component {
  state = {
    schoolOptions: [],
    homeSchools: [],
    awaySchools: [],
    sameAsHome: false,

    levelOptions: [],
    levels: [],
    
    start: null,
    end: null,
    toInfinityAndBeyond: false,

    statusOptions: [],
    status: []
  }

  componentDidUpdate(prevProps) {
    const { schools: newSchools } = this.props;
    const { schools } = prevProps;

    if (schools === newSchools) return;

    const schoolOptions = newSchools.map(s => ({label: s.name, value: s.id}));

    //TODO: clearing home/away schools instead of weeding out non existing ones, is it good?
    this.setState({
      homeSchools: [],
      awaySchools: [],
      schoolOptions
    });
  }

  componentDidMount() {
    const { schools } = this.props;
    const schoolOptions = schools.map(s => ({label: s.name, value: s.id}));

    const levelOptions = [
      { label: 'Varsity Boys', value: 'vb' },
      { label: 'Varsity Girls', value: 'vg' },
      { label: 'Junior Varsity Boys', value: 'jvb' },
      { label: 'Junior Varsity Girls', value: 'jvg' }
    ];
    
    const statusOptions = [
      { label: 'Pending', value: 'pending' },
      { label: 'Accepted', value: 'accepted' },
      { label: 'Rejected', value: 'rejected' }
    ];
    
    this.setState({
      schoolOptions,
      levelOptions,
      statusOptions
    });
  }

  changeHome = homeSchools => {
    this.setState({homeSchools})
  }

  changeAway = awaySchools => {
    this.setState({awaySchools})
  }

  changeSameAsHome = sameAsHome => {
    this.setState({sameAsHome});
  }

  changeLevels = levels => {
    this.setState({levels});
  }

  //start is of type Date and never null
  changeStart = start => {
    const s = this.state;
    
    start = moment(start);

    let end = !s.end
      ? null
      : s.end.isBefore(start)
      ? moment(start)
      : s.end;

    end = (end === null && !s.toInfinityAndBeyond)? moment(start): end;  
      
    this.setState({start, end});
  }

  changeEnd = end => {
    const s = this.state;
    if (s.toInfinityAndBeyond) return;

    end = moment(end);

    let start = !s.start
      ? moment(end)
      : s.start.isAfter(end)
      ? moment(end)
      : s.start;

    this.setState({start, end});
  }

  changeToInf = toInfinityAndBeyond => {
    const end = toInfinityAndBeyond? null: this.state.end;
    this.setState({toInfinityAndBeyond, end });
  }

  changeStatus = status => {
    this.setState({status});
  }

  filter = () => {
    const s = this.state;
    const homeIds = s.homeSchools;
    const awayIds = s.sameAsHome? [...homeIds]: s.awaySchools;

    const homeSchoolFilter = g => homeIds.length == 0? g: homeIds.indexOf(g.homeTeam.school.id) >= 0;
    const awaySchoolFilter = g => awayIds.length == 0? g: awayIds.indexOf(g.awayTeam.school.id) >= 0;
    
    const start = s.start? moment(s.start): null;
    const end = (s.end && !s.toInfinityAndBeyond)? moment(s.end): null;

    const startFilter = g => start ? start.isSameOrBefore(g.start, 'day') : g;
    const endFilter = g => end? end.isSameOrAfter(g.start, 'day'): g;

    const levels = s.levels;
    const levelFilter = g => levels.length === 0? g: levels.indexOf(g.homeTeam.teamKind) >= 0;

    console.log(s.status);
    const statusFilter = g => s.status.reduce((ok, status) => {
      if (ok) return true;
      
      return g.status.indexOf(status) >= 0;
    }, false);

    const filterFn_ = filters => g => filters.reduce((ok, filter) => ok && filter(g),  true);

    const filterFn = filterFn_([ homeSchoolFilter, awaySchoolFilter, 
      startFilter, endFilter, levelFilter, statusFilter]);

    const onFilterFnChanged = this.props.onFilterFnChanged || (() => {});
    onFilterFnChanged(filterFn);
  }

  reset = () => {
    this.setState({
      homeSchools: [],
      awaySchools: [],
      sameAsHome: false,
  
      levels: [],
      
      start: null,
      end: null,
      toInfinityAndBeyond: false,
  
      status: []
    });
  }

  cancel = () => {
    const onCancel = this.props.onCancel || (() => {});
    onCancel();
  }

  printState = () => {
    const { homeSchools, awaySchools, sameAsHome, levels, start, end, status } = this.state;
    const o = {homeSchools, awaySchools, sameAsHome, levels, start, end, status};
  }

  componentWillUnmount() {
    console.log('unmounting');
  }

  render() {
    const {
      schoolOptions,
      homeSchools,
      awaySchools,
      sameAsHome,
      levelOptions,
      levels,
      start,
      end,
      toInfinityAndBeyond,
      statusOptions,
      status
    } = this.state;

    const { isOpened } = this.props;

    this.printState();

    return <Collapse isOpened={isOpened}>
      <FilterView 
        homeOptions={schoolOptions}
        homeSelected={homeSchools}
        onHomeChange={this.changeHome}
        
        awayOptions={schoolOptions}
        awaySelected={awaySchools}
        onAwayChange={this.changeAway}
        sameAsHome={sameAsHome}
        
        levelsOptions={levelOptions}
        levelsSelected={levels}
        onLevelsChange={this.changeLevels}
    
        start={start? start.toDate(): null}
        onStartChange={this.changeStart}

        end={end? end.toDate(): null}
        onEndChange={this.changeEnd}
        toInfinityAndBeyond={toInfinityAndBeyond}
    
        statusOptions={statusOptions}
        statusSelected={status}
        onStatusChange={this.changeStatus}

        onSameAsHomeChange={this.changeSameAsHome}
        onToInfChange={this.changeToInf}
    
        onFilter={this.filter}
        onReset={this.reset}
        onCancel={this.cancel} />
    </Collapse>
  }
}

export class FilterView extends React.Component {
  state = {
    selected: []
  };

  changeSchoolSelect = selected => {
    this.setState({ selected });
  }

  render() {
    const {
      homeOptions,
      homeSelected,
      onHomeChange,
  
      awayOptions,
      awaySelected,
      onAwayChange,
      sameAsHome,
      
      levelsOptions,
      levelsSelected,
      onLevelsChange,
  
      start,
      onStartChange,

      end,
      onEndChange,
      toInfinityAndBeyond,
  
      statusOptions,
      statusSelected,
      onStatusChange,

      onSameAsHomeChange,
      onToInfChange,
  
      onFilter,
      onReset,
      onCancel
    } = this.props; 

    return (
      <FilterContainer>
        <MRow>
          <Label>Home</Label>
          <MultiSelect
            onSelectedChanged={onHomeChange}
            itemType='school'
            overrideStrings={{ selectSomeItems: 'All schools are selected by default' }}
            options={homeOptions}
            maxWidth={maxInputWidth}
            selected={homeSelected} />
        </MRow>

        <MRow>
          <div>
            <Label>Away</Label>
            <MultiSelect
              onSelectedChanged={onAwayChange}
              itemType='school'
              overrideStrings={{ selectSomeItems: 'All schools are selected by default' }}
              options={awayOptions}
              maxWidth={maxInputWidth}
              disabled={sameAsHome}
              selected={awaySelected} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type='checkbox' value='addSchool' onChange={e => onSameAsHomeChange(e.target.checked)}checked={sameAsHome} />
              <label className='font-sm' style={{ fontStyle: 'italic' }}>Same as home</label>
            </div>
          </div>
        </MRow>

        <MRow md={6}>
            <Label>Levels</Label>
            <MultiSelect
              onSelectedChanged={onLevelsChange}
              itemType='school'
              overrideStrings={{ selectSomeItems: 'All levels by default' }}
              options={levelsOptions}
              maxWidth={maxInputWidthSm}
              selected={levelsSelected} />
        </MRow>

        <MRow>
            <Label>Scheduled between</Label>
            <div style={{ display: 'flex' }}>
              <div><Datepicker value={start} onChange={onStartChange} /></div>
              <div style={{ padding: '8px 8px 0px 8px' }}> - </div>
              <div>
                <div><Datepicker value={end} onChange={onEndChange} disabled={toInfinityAndBeyond} /> </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type='checkbox' value='addSchool' onChange={e => onToInfChange(e.target.checked)} checked={toInfinityAndBeyond} />
                  <label className='font-sm' style={{ fontStyle: 'italic' }}>To infinity and beyond</label>
                </div>
              </div>
            </div>
        </MRow>

        <MRow md={6}>
          <Label>Status</Label>
          <MultiSelect
            onSelectedChanged={onStatusChange}
            itemType='status'
            overrideStrings={{ selectSomeItems: 'Any by default' }}
            options={statusOptions}
            maxWidth={maxInputWidthSm}
            selected={statusSelected} />
        </MRow>

        <MRow>
          <button onClick={e => onFilter()}>Filter</button>{' '}
          <button onClick={e => onReset()}>Reset</button>{' '}
          <button onClick={e => onCancel()}>Cancel</button>
        </MRow>
      </FilterContainer>
    )
  }
}

const FilterContainer = ({ children }) => {
  return <div className="filter-component">
    <div style={{maxWidth: '80%', margin: '0% auto'}}>
      {children}
    </div>
  </div>
}

const Label = ({ children }) => {
  return <label style={{ display: 'block', fontWeight: 'bold' }}>{children}</label>
}

const MRow = ({ children, md }) => {
  return <Row className='mt-3'><Col>{children}</Col></Row>
}