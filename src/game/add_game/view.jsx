import React from 'react';
import { EditText, Select, DateTimePicker } from 'shared/widgets';
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
  onAwaySelect
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
            <Select
              style={{ maxWidth: maxWidthInput }}
              value={selectedHomeId}
              onChange={e => onHomeSelect(parseInt(e.target.value))}>
              <option value={-1}>Select Home Team</option>
              {
                homeTeams.map(ht => (
                  <option key={ht.id} value={ht.id}>{ht.name}</option>
                ))
              }
            </Select>
          </Col>
        </Row>

        <Row className={rowMarginClass}>
          <Col xs={12}>
            <Label>Choose away team</Label>
          </Col>
          <Col xs={12}>
            <Select
              value={selectedAwayId}
              style={{ maxWidth: maxWidthInput }}
              onChange={e => onAwaySelect(parseInt(e.target.value))}>
              <option value={-1}>Select Away Team</option>
              {
                awayTeams.map(at => (
                  <option key={at.id} value={at.id}>{at.name}</option>
                ))
              }
            </Select>
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