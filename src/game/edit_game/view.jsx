import React from 'react';
import { EditText, Button, ButtonGrey, DateTimePicker  } from 'shared/widgets';
import { Row, Col } from 'react-bootstrap';

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
      }}>Edit Game</h1>
      {children}
    </div>
  );
}
export function View({
  homeTeamName,
  awayTeamName,
  start,
  location,
  canSubmit,
  onSubmit,
  onCancel,
  onLocationChange,
  onStartChange
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
          <Label>Home team</Label>
        </Col>
        <Col xs={12}>
          <EditText
            disabled={true}
            style={{ maxWidth: maxWidthInput }}
            value= {homeTeamName}
            />
          
        </Col>
      </Row>

      <Row className={rowMarginClass}>
        <Col xs={12}>
          <Label>Away team</Label>
        </Col>
        <Col xs={12}>
          <EditText
            disabled={true}
            style={{ maxWidth: maxWidthInput }}
            value={awayTeamName}
            />
          
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
            onChange={e => onLocationChange(e.target.value)}
            />
        </Col>
      </Row>

      <Row className={rowMarginClass}>
        <Col xs={12}>
          <Button type='submit' disabled={!canSubmit}>Submit</Button>{' '}
          <ButtonGrey onClick={e => onCancel()}>Cancel</ButtonGrey>
        </Col>
      </Row>
    </form>
  </Layout>
);
}