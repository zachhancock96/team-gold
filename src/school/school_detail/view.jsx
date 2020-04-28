import React, { Component} from 'react';
import { Button, ButtonRed, CurvedButton } from 'shared/widgets';
import { brownBorder } from 'shared/color';
import { Table } from '../../shared/ui';
import { getSchoolRepsOfSchool } from 'shared/api';
import { api } from 'shared';
import { API_DATE_FORMAT } from 'shared/moment';

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

//teams is like teams: Array<{ abbrevName: string, name: string, teamKind: string, id: number}>
/*e.g.
  "abbrevName": "vb",
  "name": "Acadiana HomeSchool - VB",
  "id": 1,
  "teamKind": "vb" (i formatted this way in controller.jsx line 66)
*/
class UserRow extends Component {
  static defaultProps = {
    name: [],
    email: [],
    teams: [],
    status: [],
    actions: [],
    onApprove: () => {},
    onReject: () => {},
    onRemove: () => {},
    onEdit: () => {},
    onEditSchool: () => {},
  };

  render() {
    const {
      name,
      email,
      teams,
      status,
      actions
    } = this.props;

    console.log(teams);

    if (status === 'pending'){
      return (<tr className='user-pending'>
        <td>{name}</td>
        <td>{email}</td>
        <td>{fmTeams(teams)}</td>
        <td>{actions[0]}{actions[1]}</td>
      </tr>);
    }
    else{
      return (<tr className='user-accepted'>
        <td>{name}</td>
        <td>{email}</td>
        <td>{fmTeams(teams)}</td>
        <td>{actions[2]}{actions[3]}</td>
      </tr>);
    }
  }
}
const fmTeams = teams =>{
  let t = teams.length
    ? teams.map(t => t.abbrevName).join(', ')
    : ''; 

  return <span>{t}</span>;
}

export const View = ({ schoolDetail, schoolReps, schoolAdmins, onAccept, onReject, onEdit, onEditSchool }) => {
  if (!schoolDetail) return <div className='school-detail-empty'></div>;

    // Example of schoolDetail format
    //
    // assignor: {id: 2, name: "Sir Birtleby Assignor"}
    // district: {id: 1, name: "District A"}
    // id: 1
    // isLhsaa: true
    // name: "Acadiana HomeSchool"
    // schoolAdmin: null
    // schoolReps: []
    // teams: Array(4)
    // 0: {id: 1, name: "Acadiana HomeSchool - VB", teamKind: "vb"}
    // 1: {id: 2, name: "Acadiana HomeSchool - VG", teamKind: "vg"}
    // 2: {id: 3, name: "Acadiana HomeSchool - JVG", teamKind: "jvb"}
    // 3: {id: 4, name: "Acadiana HomeSchool - JVB", teamKind: "jvg"}

  const admins = checkAdmin(schoolAdmins);
  const district = checkDistrict(schoolDetail.district);
  const assignor = checkAssignor(schoolDetail.assignor);
  const reps = checkReps(schoolReps);
  const teams = checkTeams(schoolDetail.teams);

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
        <p className='school-detail-comp'>{admins}</p>
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

const checkReps = schoolReps => {
    
    const header = ['Name', 'Email', 'Teams', 'Options'];
    
    console.log(JSON.stringify(schoolReps, null, 2))

    return <Table>
              <thead>
                <tr>
                  {header.map((title) => (
                    <th>{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schoolReps.map(user =>{
                    return <UserRow
                    name={user.name}
                    email={user.email}
                    teams={user.teams}
                    status={user.status}
                    actions={ [AcceptButton(), RejectButton(), EditButton(), DeleteButton()] } />
                  })}
              </tbody>
           </Table>
  
}

const checkAdmin = schoolAdmins => {
    
    const header = ['Name', 'Email', 'Options'];
    
    console.log(JSON.stringify(schoolAdmins, null, 2))

    return <Table>
              <thead>
                <tr>
                  {header.map((title) => (
                    <th>{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schoolAdmins.map(user =>{
                    return <UserRow
                    name={user.name}
                    email={user.email}
                    status={user.status}
                    actions={ [AcceptButton(), RejectButton(), EditButton(), DeleteButton()] } />
                  })}
              </tbody>
           </Table>
} 

const checkDistrict = district => {
  if (!district){
    return <p>---District Not Assigned---</p>
  }
  else{
    return <p>- District: {district.name}</p>
  }
}

const checkAssignor = assignor => {
  if (!assignor){
    return <p>---Assignor Not Assigned---</p>
  }
  else{
    return <p>- Assignor: {assignor.name}</p>
  }
}

const checkTeams = teams =>{
  if (!teams){
    return <p>---Teams Not Assigned--- </p>
  }
  else{
    let teamList = teams.map(e => {
    return <p style={{marginBottom:'5px'}}>- {e.name}</p>
    });

    return teamList;
  }
}

const AcceptButton = onClick => {
  return <button>Accept</button>
}

const RejectButton = onClick => {
  return <button>Reject</button>
}

const EditButton = onClick => {
  return <button>Edit</button>
}

const DeleteButton = onClick =>{
  return <button>Delete</button>
}