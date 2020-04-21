import React from 'react';
import { Select2, EditText, Select, DateTimePicker } from 'shared/widgets';
import { Container, Row, Col } from 'react-bootstrap';
import { Button } from 'shared/widgets';

const Label = props => <label style={{ fontWeight: 'bold' }}>{props.children}</label>

const rowMarginClass = 'mt-4';

const maxWidthInput = '400px';

const Layout = ({children}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '8px'
    }}>
      <h1 style={{
        fontSize: '1.4rem',
        fontWeight: 'bold',
        lineHeight: '3rem',
        borderBottom: '2px solid rgb(65, 43, 25)',
        marginBottom: '8px'
      }}>Add Game</h1>
      {children}
    </div>
  );
}

export function View({
  homeTeams,
  awayTeams,
  location,
  start,
  selectedHomeId,
  selectedAwayId,
  canSubmit,
  onSubmit,
  onHomeSelect,
  onLocationChange,
  onStartChange,
  onAwaySelect,

  isAddingSchool,
  isAddingSchoolChange,
  
  schoolNameToAdd,
  schoolNameToAddChange
}) {

  return (
    <Layout>
      <form onSubmit={e => {
        e.preventDefault();
        if (canSubmit) {
          onSubmit(); 
        }
      }}>
        <Row className={rowMarginClass}>
          <Col xs={12}>
            <Label>Choose home team</Label>
          </Col>
          <Col xs={12}>
            {/* <Select
              style={{ maxWidth: maxWidthInput }}
              value={selectedHomeId}
              onChange={e => onHomeSelect(parseInt(e.target.value))}>
              <option value={-1}>Select Home Team</option>
              {
                homeTeams.map(ht => (
                  <option key={ht.id} value={ht.id}>{ht.name}</option>
                ))
              }
            </Select> */}
              <TeamSelect 
                onChange={onHomeSelect}
                teams={homeTeams} 
                selectedTeamId={selectedHomeId} />
          </Col>
        </Row>

        <Row className={rowMarginClass}>
          <Col xs={12}>
            <Label>Choose away team</Label>
          </Col>
          <Col xs={12}>

            {
              isAddingSchool
                ? <EditText
                    style={{maxWidth: maxWidthInput}}
                    value={schoolNameToAdd} 
                    onChange={e => schoolNameToAddChange(e.target.value) }/>
                : <TeamSelect 
                    onChange={onAwaySelect}
                    teams={awayTeams} 
                    selectedTeamId={selectedAwayId} />
            }
          </Col>
          <Col xs={12}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <input type='checkbox' value='addSchool' 
                checked={isAddingSchool} 
                onChange={e => isAddingSchoolChange(e.target.checked)}  />{' '}
              <label style={{fontSize: '.9em', fontStyle: 'italic'}}>Could not find away school? Check to add</label>
            </div>
          </Col>
        </Row>

        <Row className={rowMarginClass}>
          <Col xs={12}>
            <Label>When is the game?</Label>
          </Col>
          <Col xs={12}>
            <DateTimePicker value={start} onChange={d => onStartChange(d)} />
          </Col>
        </Row>

        <Row className={rowMarginClass}>
          <Col xs={12}>
            <Label>Where is the game?</Label>
          </Col>
          <Col xs={12}>
            <EditText 
              value={location}
              style={{ maxWidth: maxWidthInput }}
              onChange={e => onLocationChange(e.target.value)} />
          </Col>
        </Row>

        <Row className={rowMarginClass}>
          <Col xs={12}>
            <Button disabled={!canSubmit} type='submit'>Add Game</Button>
          </Col>
        </Row>
      </form>
    </Layout>);
}

const TeamSelect = ({teams, selectedTeamId, onChange}) => {
  const options = teams.map(t => ({value: t.id, label: t.name}));
  const value = options.find(o => o.value === selectedTeamId) || null;

  return <Select2 
    value={value}
    options={options}
    styles={{
      container: currStyles => {
        return { ...currStyles, maxWidth: maxWidthInput };
      }
    }}
    onChange={(a, b) => {
      if (a.value !== selectedTeamId) {
        return onChange(a.value);
      }
    }} />
}