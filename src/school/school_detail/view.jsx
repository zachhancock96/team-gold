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

export const View = ({ schoolDetail }) => {
  if (!schoolDetail) return <div className='school-detail-empty'>Click on a school for more details</div>;

  // const history = prettyHistory(gameDetail);

  const reps = displayReps(schoolDetail.schoolReps);

  const admin = getAdmin(schoolDetail);

  return (
    <div className='game-detail'>
      <div style={{
        borderBottom: brownBorder,
        marginBottom: '8px',
        display: 'flex'
      }}>
        <div style={{ flex: 1 }}>
          <Header>{schoolDetail.name}</Header>
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
        <p className='game-detail-header'>Information</p>
        <p>District: {schoolDetail.district.name}</p>
      <p style={{ paddingBottom: '10px' }}>Assignor: {schoolDetail.assignor.name}</p>
      </div>
      <div>
        <p className='game-detail-header'>School Admin</p>
        <p style={{ paddingBottom: '10px' }}>{admin}</p>
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

const displayReps = reps => {
  let repList = reps.map(e => {
        return <p>
          {e.name}
        </p>
      }
  );

  return repList;
}

const getAdmin = schoolDetail => {
  if (!schoolDetail.schoolAdmin){
    return <p>---No admin assigned---</p>
  }
  else{
    return <p>{schoolDetail.schoolAdmin.name}</p>
  }
} 