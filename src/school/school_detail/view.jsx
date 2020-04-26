import React from 'react';
import { Button, ButtonRed, CurvedButton } from 'shared/widgets';
import { brownBorder } from 'shared/color';
import { school } from 'school';

/*
  Edit button is commented out at the moment, need to create an api to edit the users for a school
*/

const Header = ({ children }) => (
  <h3
    style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
    }}>
    {children}
  </h3>
);

export const View = ({ schoolDetail, onAccept, onReject, onEdit, onEditSchool }) => {
  if (!schoolDetail) return <div className='school-detail-empty'>Click on a school for more details</div>;

  // const history = prettyHistory(gameDetail);

  // const reps = checkReps(schoolDetail.schoolReps);
  // const admin = checkAdmin(schoolDetail);
  // const district = checkDistrict(schoolDetail);
  // const assignor = checkAssignor(schoolDetail);

  const test = {
    name: 'Test High School',
    district: {name: 'Test District'},
    assignor: {name: 'Test Assignor'},
    schoolAdmin: {name: 'Test Admin'},
    teams: [{name: 'Test High Eagles', type: 'vb'}, {name: 'Test High Tigers', type: 'vg'}],
    reps: [{name: 'Rep 1', email: 'rep1@test.com', teams: [], state: 'pending'}, {name: 'Rep 2', email: 'rep2@test.com', teams: ['VB', 'JVB'], state: 'accepted'}]
  };

  const admin = checkAdmin(test);
  const district = checkDistrict(test);
  const assignor = checkAssignor(test);
  const reps = checkReps(test.reps);
  const teams = checkTeams(test.teams);

  return (
    <div className='game-detail'>
      <div style={{
        borderBottom: brownBorder,
        marginBottom: '8px',
        display: 'flex'
      }}>
        <div style={{ flex: 1 }}>
          <CurvedButton
                  style={{ paddingLeft: '5px', paddingRight: '5px', margin: '8px', float: 'right'}}
                  onClick={null}>Edit School</CurvedButton>
          <Header>{test.name}</Header>
        </div>
        {/* <div>
          {
            schoolDetail.actions.indexOf('edit') >= 0
              ? <CurvedButton
                style={{ paddingLeft: '20px', paddingRight: '20px', margin: '8px' }}
                onClick={null}>Edit</CurvedButton>
              : null
          }
        </div> */}
      </div>
      <div>
        <p className='game-detail-header'>General</p>
        <p className='school-detail-comp'>{district}</p>
        <p>{assignor}</p>
        <hr />
      </div>
      <div>
        <p className='game-detail-header'>Teams</p>
        <p className='school-detail-comp'>{teams}</p>
        <hr />
      </div>
      <div>
        <p className='game-detail-header'>School Admin</p>
        <p className='school-detail-comp'>{admin}</p>
        <hr />
      </div>
      <div style={{
        borderBottom: brownBorder,
        marginBottom: '8px',
      }}>
        <p className='game-detail-header'>Users</p>
        <div style={{ marginBottom: '5px' }}>{reps}</div>
      </div>
    </div>
  );

}

const checkReps = reps => {
  if (reps.length === 0){
    return <p>---Reps Not Assigned---</p>
  }
  else{
    let repList = reps.map(e => {
          if (e.state === 'pending'){
            return <div>
              <span style={{fontWeight: 'bold', color: 'red'}}> -PENDING- </span>
              Name: {e.name} 
              <span style={{position: 'relative', left: '20px'}}>Email: {e.email}</span>
              <Button
                  style={{ paddingLeft: '5px', paddingRight: '5px', margin: '8px', position: 'relative', left: '20px' }}
                  onClick={null}>Accept</Button>
              <ButtonRed
                  style={{ paddingLeft: '10px', paddingRight: '10px', margin: '8px', fontWeight: 'bold', position: 'relative', left: '20px'}}
                  onClick={null}>Reject</ButtonRed>
            </div>
          }
          else if (e.state === 'accepted'){
            let teams = getTeams(e.teams);
            return <div>
              - Name: {e.name}
              <span style={{position: 'relative', left: '20px'}}>Email: {e.email}</span>
              <span style={{position: 'relative', left: '30px'}}> Teams: {teams}</span>
              <Button
                  style={{ paddingLeft: '5px', paddingRight: '5px', margin: '8px', backgroundColor: '#168ed3', borderColor: '#1378b3', position: 'relative', left: '30px'}}
                  onClick={null}>Edit</Button>
            </div>
          }
          else{
            return <div>
              whateva
            </div>
          }
        }
    );

    return repList;
  }
}

const checkAdmin = schoolDetail => {
  if (!schoolDetail.schoolAdmin){
    return <p>---Admin Not Assigned---</p>
  }
  else{
    return <p>- Name: {schoolDetail.schoolAdmin.name}</p>
  }
} 

const checkDistrict = schoolDetail => {
  if (!schoolDetail.district){
    return <p>---District Not Assigned---</p>
  }
  else{
    return <p>- District: {schoolDetail.district.name}</p>
  }
}

const checkAssignor = schoolDetail => {
  if (!schoolDetail.assignor){
    return <p>---Assignor Not Assigned---</p>
  }
  else{
    return <p>- Assignor: {schoolDetail.assignor.name}</p>
  }
}

const getTeams = teams => {

  if (!teams){
    return <span>Unassigned</span>
  }
  else{
    let teamList = teams.map(e =>{
      return <span> {e} </span>
    })

    return teamList;
  }
}

const checkTeams = teams =>{
  if (!teams){
    return <p>---Teams Not Assigned--- </p>
  }
  else{
    let teamList = teams.map(e => {
    return <p style={{marginBottom:'5px'}}>- {e.name} ({e.type})</p>
    });

    return teamList;
  }
}