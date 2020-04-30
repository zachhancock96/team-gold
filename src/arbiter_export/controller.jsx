import React from 'react';
import moment, { API_DATE_FORMAT } from 'shared/moment';
import { Row, Col } from 'react-bootstrap';
import { TextArea, Button, ButtonGrey, Switch, Datepicker, MultiSelect } from 'shared/widgets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCsv, faAngleDoubleDown, faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons'
import { brownBorder, green, grey, brown, white } from 'shared/color';
import * as api from 'shared/api';

const mt5 = 'mt-5';
const mt4 = 'mt-4';
const mt2 = 'mt-2';

const maxWidthInput = '400px';

export class ArbiterExport extends React.Component {

  state = { 
    schools: [],
    exports: [],
    highlightExportId: null
  }

  async componentDidMount() {
    const { actions } = this.props;
    actions.showLoading('ArbiterExport');
    try {
      const schools = await api.getSchools();
      const exports = await api.getArbiterExports();
      this.setState({schools, exports});
    } catch(error) {
      actions.showError(error.message || error);
    }
    actions.hideLoading('ArbiterExport');
  }

  onExportCreated = async (id) => {
    const { actions } = this.props;

    actions.showLoading('ArbiterExport');
    const arbiterExport = await api.getArbiterExport(id)
      .catch(err => actions.showError(err.message || err));

    if (arbiterExport) {
      const exports = [arbiterExport, ...this.state.exports];
      this.setState({exports, highlightExportId: id});
    }

    actions.hideLoading('ArbiterExport');
  }

  editNote = async (id, note) => {
    const { actions } = this.props;

    actions.showLoading('ArbiterExport');

    try {
      await api.editArbiterExportNote(id, note);

      const freshExport = await api.getArbiterExport(id)
        .catch(err => actions.showError(err.message || err));

      if (freshExport) {
        const exports = this.state.exports.reduce((exports, export_) => {
          exports.push(export_.id === freshExport.id? freshExport: export_);
          return exports;
        }, []);
        this.setState({exports, highlightExportId: id});
      }
    } catch(error) {
      actions.showError(error.message || error)
    }

    actions.hideLoading('ArbiterExport');
  }

  render() {
    const { actions } = this.props;
    const { schools, exports } = this.state;

    return (
      <div style={{
        height: '100%',

        paddingTop: '20px'
      }}>
        <div style={{
          height: '100%',
          padding: '20px',
          backgroundColor: 'white',
        }}>
          <First />
          <CreateExport 
            schools={schools}
            actions={actions}
            onCreated={this.onExportCreated} />
          {
            <Row>
              {
                exports.map(e => (
                  <Col xs={12} md={6} className={mt5}>
                    <ArbiterExportItem key={e.id} {...e} schools={schools} onEditNote={this.editNote} />
                  </Col>
                ))
              }
            </Row>
          }
        </div>
      </div>
    );
  }
}
ArbiterExport.showNavbar = true;


/*
  Props:
  schools: Array<School>
  onCreated: (id: number) => any
  actions: object
*/
class CreateExport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldFilterByDate: false,
      shouldFilterBySchool: false,
      startFilter: null,
      endFilter: null,
      note: '',
      options: props.schools.map(s => ({label: s.name, value: s.id})),
      selected: [],
      canCreate: true
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

  changeShouldFilterByDate = bool => {
    if (bool) {
      this.setState({shouldFilterByDate: true});
    } else {
      this.setState({
        shouldFilterByDate: false,
        startFilter: null,
        endFilter: null
      });
    }
  }

  changeShouldFilterBySchool = bool => {
    if (bool) {
      this.setState({shouldFilterBySchool: true});
    } else {
      this.setState({
        shouldFilterBySchool: false,
        selected: []
      });
    }
  }

  changeStartFilter = value => {
    const s = this.state;
    if (s.shouldFilterByDate) {
      this.setState({ startFilter: value });
    }
  }

  changeEndFilter = value => {
    const s = this.state;
    if (s.shouldFilterByDate) {
      this.setState({ endFilter: value });
    }
  }

  changeSchoolSelect = selected => {
    const s = this.state;
    if (s.shouldFilterBySchool) {
      this.setState({ selected });
    }
  }

  changeNote = note => {
    this.setState({ note });
  }

  createExport = async () => {
    const s = this.state;
    if (!s.canCreate) return;

    const hasSchoolIdsFilter = s.selected && s.selected.length > 0;
    const schoolIdsFilter = hasSchoolIdsFilter? [...s.selected]: null;

    const df = d => d? moment(d).format(API_DATE_FORMAT): null;
    const hasStartEndFilter = !!(s.startFilter && s.endFilter);
    const startFilter = df(s.startFilter);
    const endFilter = df(s.endFilter);

    const note = s.note || '';

    const { actions, onCreated } = this.props;

    actions.showLoading('CreateExport')
    await api.createArbiterExport({
      hasSchoolIdsFilter,
      schoolIdsFilter,
      hasStartEndFilter,
      startFilter,
      endFilter,
      note
    })
      .then(exportId => { 
        onCreated(exportId);
        this.reset();
        actions.showSuccess('Your export was succesfully created');
      })
      .catch(err => { actions.showError(err.message || err); })
      .finally(() => { actions.hideLoading('CreateExport')})
  }

  reset = () => {
    this.setState({
      shouldFilterByDate: false,
      shouldFilterBySchool: false,
      startFilter: null,
      endFilter: null,
      note: '',
      selected: [],
      canCreate: true
    });
  }

  render() {
    const { note, options, canCreate, selected, startFilter, 
      endFilter, shouldFilterByDate, shouldFilterBySchool } = this.state;

    return (
      <div style={{
        borderBottom: brownBorder,
        marginBottom: '8px',
        paddingBottom: '8px'
      }}>
        <form
          onSubmit={e => { e.preventDefault(); this.createExport(); }}>
          <Row className={mt4}>
            <Col xs={12}>
              <LabelWithSwitch isOn={shouldFilterByDate} onSwitchClick={this.changeShouldFilterByDate}>
                Filter by date
                </LabelWithSwitch>
            </Col>
            <Col xs={12}>
              <Datepicker 
                disabled={!shouldFilterByDate}
                value={startFilter}
                onChange={this.changeStartFilter}/> - 
                <Datepicker 
                  disabled={!shouldFilterByDate} 
                  value={endFilter}
                  onChange={this.changeEndFilter} />
            </Col>
          </Row>
  
          <Row className={mt4}>
            <Col xs={12}>
              <LabelWithSwitch isOn={shouldFilterBySchool} onSwitchClick={this.changeShouldFilterBySchool}>
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
                disabled={!shouldFilterBySchool} />
            </Col>
          </Row>

          <Row className={mt4}>
            <Col xs={12}>
              <Label>Attach a note to this export</Label>
            </Col>
            <Col xs={12}>
              <TextArea 
                value={note}
                onChange={e => this.changeNote(e.target.value)}
                style={{ maxWidth: maxWidthInput }} />
            </Col>
          </Row>
  
          <Row className={mt4}>
            <Col xs={12}>
              <Button disabled={!canCreate} type='submit'>Create</Button>{' '}
              <ButtonGrey onClick={this.reset}>Reset</ButtonGrey>
            </Col>
          </Row>
        </form>
      </div>);
  }


}


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
      Arbiter Export
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

const noop = () => { };


const GameCount = ({ gameCount }) => {
return <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: grey }}>{gameCount} games exported</p>
}

const Timestamp = ({ timestamp }) => {
  return <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: grey }}>Created at {timestamp}</p>
}

const Filename = ({ name }) => {
  return <p style={{ fontWeight: 'bold' }}>{name}</p>
}


const Note = ({ note }) => {

  console.log(note);
  return (
    <pre style={{ fontSize: '0.9rem', fontStyle: 'italic', fontFamily: 'inherit' }}>
      {note || 'N/A'}
    </pre>
  );  
}

const greenBoldLinkStyle = {
  cursor: 'pointer',
  fontSize: '0.8rem',
  color: green,
  fontWeight: 'bold'
};

const CsvLink = ({ link }) => {
  return (
    <div>
      <a href={link} download>
        <FontAwesomeIcon className='fa-file' icon={faFileCsv} />
      </a>
    </div>
  );
}

const noteShort = note => {
  if (!note || !note.length) return 'N/A';
  note = note.length > 100 ? note.substring(0, 100) + '...' : note;

  let splitted = note.split('\n');
  if (splitted.length > 3) {
    splitted.splice(3, 0, '...');
    splitted.splice(4);
    note = splitted.join('\n');
  }

  return note;
}

const ArbiterExportItemCollapsed = ({ timestamp, downloadUrl, filename, gameCount, note, onShowMore }) => (
  <div>
    <Row className={mt2}>
      <Col xs={12}>
        <Filename name={filename} />
        <Timestamp timestamp={timestamp} />
        <GameCount gameCount={gameCount} />
      </Col>
    </Row>

    <Row className={mt2}>
      <Col xs={12}>
        <CsvLink link={downloadUrl} />
      </Col>
    </Row>

    <Row className={mt2}>
      <Col xs={12}>
        <Note note={note} />
      </Col>
    </Row>

    <Row className={mt2}>
      <Col xs={12}>
        <p style={greenBoldLinkStyle} onClick={onShowMore}>More <FontAwesomeIcon className='fa' icon={faAngleDoubleDown} /></p>
      </Col>
    </Row>
  </div>
);

const ArbiterExportItemDetail = ({ 
  timestamp,
  downloadUrl,
  filename,
  gameCount,
  note,
  hasSchoolFilter,
  schools,
  hasStartEndFilter,
  startFilter,
  endFilter,
  isEditingNote,
  onStartEditingNote,
  onNoteChange,
  onShowLess,
  onNoteChangeSave,
  onNoteChangeCancel
 }) => {

  const FilterLabel = ({children}) => {
    return <span style={{fontSize: '0.9em', color: white, backgroundColor: brown, padding: '2px', borderRadius: '4px'}}>{children}</span>
  }

  const filterLabels = hasSchoolFilter && hasStartEndFilter
    ? (<React.Fragment><FilterLabel>Date</FilterLabel>{' '}<FilterLabel>Schools</FilterLabel></React.Fragment>)
    : hasSchoolFilter
    ? <FilterLabel>Schools</FilterLabel>
    : hasStartEndFilter
    ? <FilterLabel>Date</FilterLabel>
    : 'None';

  return (
    <div>
      <Row className={mt2}>
        <Col xs={12}>
          <Filename name={filename} />
          <Timestamp timestamp={timestamp} />
          <GameCount gameCount={gameCount} />
        </Col>
      </Row>

      <Row className={mt2}>
        <Col xs={12}>
          <CsvLink link={downloadUrl} />
        </Col>
      </Row>

      <Row className={mt2}>
        <Col xs={12}>
          <p style={{ fontWeight: 'bold' }}>Filters</p>
          <p>{filterLabels}</p>
        </Col>
      </Row>

      {
        hasStartEndFilter
          ? (
            <Row className={mt2}>
              <Col xs={12}>
                <p style={{ fontWeight: 'bold' }}>Date filter</p>
                <p>{startFilter} - {endFilter}</p>
              </Col>
            </Row>
          )
          : null
      }

      {
        hasSchoolFilter
          ? (
            <Row className={mt2}>
              <Col xs={12}>
                <p style={{ fontWeight: 'bold' }}>School filter({schools.length})</p>
                {schools.map(s => (<p key={s.id}>{s.name}</p>))}
              </Col>
            </Row>
          )
          : null
      }

      {
        isEditingNote
          ? (
            <Row className={mt2}>
              <Col xs={12}>
                <p style={{ fontWeight: 'bold' }}>Note </p>
                <TextArea 
                  value={note}
                  onChange={e => onNoteChange(e.target.value)} 
                  style={{ maxWidth: maxWidthInput }} />
              </Col>
              <Col className={mt2} xs={12}>
                <Button onClick={onNoteChangeSave} style={{ paddingTop: '4px 0px' }}>Save</Button>{' '}
                <ButtonGrey onClick={onNoteChangeCancel} style={{ paddingTop: '4px 0px' }}>Cancel</ButtonGrey>
              </Col>
            </Row>     
          )
          : (
            <Row className={mt2}>
              <Col xs={12}>
                <p style={{ fontWeight: 'bold' }}>
                  Note {' '}
                  <span onClick={onStartEditingNote} style={greenBoldLinkStyle}>Edit</span>
                </p>
                <Note note={note} />
              </Col>
          </Row>
          )
      }

      <Row className={mt2}>
        <Col xs={12}>
          <p onClick={onShowLess} style={greenBoldLinkStyle}>Less <FontAwesomeIcon className='fa' icon={faAngleDoubleUp} /></p>
        </Col>
      </Row>
   </div>
  );
 }
   
class ArbiterExportItem extends React.Component {

  constructor(props) {
    super(props);

    const schools = props.hasSchoolIdsFilter
      ? props.schools.filter(s => props.schoolIdsFilter.indexOf(s.id) >= 0)
      : [];
    
    const k = s => props.hasStartEndFilter? moment(s).format('MM/DD/YYYY'): null;

    this.state = {
      id: 1,
      timestamp: moment(props.timestamp).format('MMM DD, hh:mm A'),
      downloadUrl: props.downloadUrl,
      filename: props.filename,
      gameCount: props.gameCount,
      hasSchoolFilter: props.hasSchoolIdsFilter,
      schools,
      hasStartEndFilter: props.hasStartEndFilter,
      startFilter: k(props.startFilter),
      endFilter: k(props.endFilter),
      note: props.note,
      activeNote: null,
      noteShort: noteShort(props.note),

      collapsed: true,
      isEditingNote: false
    }
  }

  showMore = () => {
    this.setState({ collapsed: false });
  }

  showLess = () => {
    this.setState({ collapsed: true });
  }

  startEditingNote = () => {
    this.setState({ isEditingNote: true, activeNote: this.state.note });
  }

  handleNoteChange = note => {
    this.setState({ activeNote: note });
  }

  handleNoteChangeCancel = () => {
    this.setState({ activeNote: null, isEditingNote: false });
  }

  handleNoteChangeSave = () => {
    //TODO: make request
    const { activeNote, id } = this.state;

    this.setState({
      isEditingNote: false, 
      note: activeNote, 
      activeNote: null, 
      noteShort: noteShort(activeNote) 
    }, () => {
      this.props.onEditNote(id, activeNote);
    });
  }

  render() {
    const { collapsed, isEditingNote } = this.state;
    const s = this.state;
    const note = collapsed
      ? s.noteShort
      : isEditingNote ? s.activeNote: s.note;

    return (
      <div className='arbiter-export-item'>
        {
          collapsed
            ? <ArbiterExportItemCollapsed
                timestamp={s.timestamp}
                downloadUrl={s.downloadUrl}
                filename={s.filename}
                gameCount={s.gameCount}
                note={note}
                onShowMore={this.showMore} />
            : <ArbiterExportItemDetail
                timestamp={s.timestamp}
                downloadUrl={s.downloadUrl}
                filename={s.filename}
                gameCount={s.gameCount}
                note={note}
                hasSchoolFilter={s.hasSchoolFilter}
                schools={s.schools}
                hasStartEndFilter={s.hasStartEndFilter}
                startFilter={s.startFilter}
                endFilter={s.endFilter}
                isEditingNote={isEditingNote}
                onStartEditingNote={this.startEditingNote}
                onShowLess={this.showLess}
                onNoteChange={this.handleNoteChange}
                onNoteChangeCancel={this.handleNoteChangeCancel}
                onNoteChangeSave={this.handleNoteChangeSave} />
        }
      </div>
    );
  }
}