import React, { Component} from 'react';
import { Button, ButtonRed, CurvedButton } from 'shared/widgets';
import { brownBorder } from 'shared/color';
import { Table } from '../../shared/ui';
import { getSchoolRepsOfSchool } from 'shared/api';
import { api } from 'shared';
import { API_DATE_FORMAT } from 'shared/moment';
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

//teams is like teams: Array<{ abbrevName: string, name: string, teamKind: string, id: number}>
/*e.g.
  "abbrevName": "vb",
  "name": "Acadiana HomeSchool - VB",
  "id": 1,
  "teamKind": "vb" (i formatted this way in controller.jsx line 66)
*/
class UserRow extends Component {
  static defaultProps = {
    schoolId: [],
    id: [],
    name: [],
    email: [],
    role: [],
    teams: [],
    status: [],
    buttons: [],
    onAccept: () => {},
    onReject: () => {},
    onDelete: () => {},
    onEdit: () => {}
  };

  render() {
    const {
      schoolId,
      id,
      name,
      email,
      role,
      teams,
      status,
      buttons,
      onAccept,
      onReject,
      onDelete,
      onEdit
    } = this.props;
    
    if (status === 'pending'){
      return (<tr className='user-pending'>
        <td>{name}</td>
        <td>{email}</td>
        <td>{teams}</td>
        <td><button onClick={(e) => onAccept(schoolId, id, role)}>Accept</button><button onClick={(e) => onReject(schoolId, id, role)}>Reject</button></td>
      </tr>);
    }
    else{
      return (<tr className='user-accepted'>
        <td>{name}</td>
        <td>{email}</td>
        <td>{teams}</td>
        <td><button onClick={(e) => onEdit()}>Edit</button><button onClick={(e) => onDelete(schoolId, id, role)}>Delete</button></td>
      </tr>);
    }
  }
}

// const fmTeams = teams =>{
//   let t = teams.length
//     ? teams.map(t => t.abbrevName).join(', ')
//     : ''; 

//   return <span>{t}</span>;
// }

export const View = ({ schoolDetail, schoolReps, schoolAdmins, onAccept, onReject, onEdit, onEditSchool, onRemove }) => {
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
  
  const admins = checkAdmin(schoolDetail.id, schoolAdmins, onAccept, onReject, onEdit, onRemove);
  const district = checkDistrict(schoolDetail.district);
  const assignor = checkAssignor(schoolDetail.assignor);
  const reps = checkReps(schoolDetail.id, schoolReps, onAccept, onReject, onEdit, onRemove);
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
                  onClick={null}>Subscribe</CurvedButton>
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

const checkReps = (schoolId, schoolReps, onAccept, onReject, onEdit, onRemove) => {
    
    const header = ['Name', 'Email', 'Teams', 'Options'];
    
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
                    id={user.rep.id}
                    name={user.rep.name}
                    email={user.rep.email}
                    role={user.rep.role}
                    teams={user.teamIds}
                    status={user.rep.status}
                    buttons={ [] }
                    onAccept={onAccept}
                    onReject={onReject}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    schoolId={schoolId} />
                  })}
              </tbody>
           </Table>
  
}

const checkAdmin = (schoolId, schoolAdmins, onAccept, onReject, onEdit, onRemove) => {
    
    const header = ['Name', 'Email', 'Options'];

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
                    id={user.o.id}
                    name={user.o.name}
                    email={user.o.email}
                    role={user.o.role}
                    status={user.o.status}
                    buttons={ [] }
                    onAccept={onAccept}
                    onReject={onReject}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    schoolId={schoolId} />
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
/*
  standard buttons are being created and used up above when UserRow renders
  Just turn these into whatever you need them to be and plug in the pieces

const AcceptButton = onClick => {
  return <button>Accept</button>
}

const RejectButton = onClick => {
  return <button>Reject</button>
}

const EditButton = onClick => {
  return <button>Edit</button>
}

const DeleteButton = onClick => {
  return <button>Delete</button>
}
*/