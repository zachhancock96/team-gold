import React, { Component} from 'react';
import { Button, ButtonRed, CurvedButton } from 'shared/widgets';
import { brownBorder } from 'shared/color';
import { Table } from '../../shared/ui';
import { getSchoolRepsOfSchool } from 'shared/api';
import { api } from 'shared';
import { API_DATE_FORMAT } from 'shared/moment';
import { school } from 'school';
import { MultiSelect } from 'shared/widgets';

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

const jsonLog = user => {
  console.log(JSON.stringify(user, null, 2));
}
//teams is like teams: Array<{ abbrevName: string, name: string, teamKind: string, id: number}>
/*e.g.
  "abbrevName": "vb",
  "name": "Acadiana HomeSchool - VB",
  "id": 1,
  "teamKind": "vb" (i formatted this way in controller.jsx line 66)
*/

export const View = ({ schoolDetail, schoolReps, schoolAdmins, onAccept, onReject, onEdit, onSubscribe, onDelete }) => {
  if (!schoolDetail) return <div className='school-detail-empty'></div>;
  
  const admins = createAdminView({
    schoolId: schoolDetail.id,
    schoolAdmins,
    onAccept,
    onReject,
    onDelete
  });

  const reps = createRepView({
    schoolId: schoolDetail.id,
    schoolTeams: schoolDetail.teams,
    schoolReps,
    onAccept,
    onReject,
    onDelete,
    onEdit
  })

  const district = checkDistrict(schoolDetail.district);
  const assignor = checkAssignor(schoolDetail.assignor);
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

class RepRow extends Component {
  state = {
    isEditing: false,
    options: [],
    selected: [],
    canConfirm: false    
  }

  cancelEditing = () => {
    this.setState({
      editTeamForm: [],
      isEditing: false,
      options: [],
      selected: [],
      canConfirm: false
    })
  }

  confirmEditing = () => {
    const { canConfirm } = this.state;
    if (!canConfirm) return;

    const { selected } = this.state;
    const { schoolId, user  } = this.props;

    const teamIds = [...selected];
    const repId = user.id;
    
    this.props.onEdit(schoolId, repId, teamIds);
    this.cancelEditing();
  }

  changeTeamSelected = selected => {
    const canConfirm = selected.length > 0;
    this.setState({selected, canConfirm});
  }

  startEditing = () => {
    const m = this.props;
    const options = m.schoolTeams.map(t => ({label: t.teamKind, value: t.id}));
    const selected = m.teams.map(t => t.id);

    this.setState({
      isEditing: true,
      options,
      selected,
      canConfirm: true
    })
  }

  render() {
    const m = this.props;
    const { user, teams, schoolId } = m;

    const teams_ = teams.map(t => t.abbrevName).join(' , ');

    if (user.status === 'pending'){
      return (<tr className='user-pending'>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{teams_}</td>
        <td>
          <button onClick={() => m.onAccept(schoolId, user.id, user.role)}>Accept</button>
          <button onClick={() => m.onReject(schoolId, user.id, user.role)}>Reject</button>
        </td>
      </tr>);
    }
    else {
      const { options, selected, canConfirm } = this.state;
      const teamsRow = this.state.isEditing?  <div style={{width: '175px'}}><MultiSelect onSelectedChanged={this.changeTeamSelected} itemType='team' options={options} selected={selected} /></div>: teams_;

      const buttons = this.state.isEditing? (
        <>
          <button disabled={!canConfirm} onClick={this.confirmEditing}>Confirm</button>  
          <button onClick={this.cancelEditing}>Cancel</button>
        </>
      ): (
        <>
        <button onClick={this.startEditing}>Edit</button>  
        <button onClick={() => m.onDelete(schoolId, user.id, user.role)}>Delete</button>  
        </>
      )
      return (<tr className='user-accepted'>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{teamsRow}</td>
        <td>
          {buttons}
        </td>
      </tr>);
    }
  }
}

const createRepView = ({
  schoolId,
  schoolTeams,
  schoolReps,
  onAccept,
  onReject,
  onDelete,
  onEdit,
}) => {
    
  const header = ['Name', 'Email', 'Teams', 'Options'];
  return (
    <Table>
      <thead>
        <tr>
          {header.map((title) => (
            <th>{title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {schoolReps.map(r =>{
            return <RepRow
              user={r}
              teams={r.teams}
              schoolTeams={schoolTeams}
              schoolId={schoolId}
              onAccept={onAccept}
              onReject={onReject}
              onEdit={onEdit}
              onDelete={onDelete} />
          })}
      </tbody>
    </Table>);  
}

class AdminRow extends Component {
  static defaultProps = {
    user: {
      id: -1,
      name: '',
      email: '',
      role: '',
      status: ''
    },
    onAccept: (() => {}),
    onReject: (() => {}),
    onDelete: (() => {}),
    schoolId: -1 
  };

  render() {
    const { schoolId, user } = this.props;
    const m = this.props;

    if (user.status === 'pending'){
      return (<tr className='user-pending'>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          <button onClick={() => m.onAccept(schoolId, user.id, user.role)}>Accept</button>
          <button onClick={() => m.onReject(schoolId, user.id, user.role)}>Reject</button>
        </td>
      </tr>);
    }
    else {
      return (<tr className='user-accepted'>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          <button onClick={() => m.onDelete(schoolId, user.id, user.role)}>Delete</button>
        </td>
      </tr>);
    }
  }
}

const createAdminView = ({schoolId, schoolAdmins, onAccept, onReject, onDelete}) => {
  const header = ['Name', 'Email', 'Options'];
  return (
    <Table>
      <thead>
        <tr>
          {header.map((title) => (
            <th>{title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {schoolAdmins.map(user =>{
            return <AdminRow
            user={user}
            onAccept={onAccept}
            onReject={onReject}
            onDelete={onDelete}
            schoolId={schoolId} />
          })}
      </tbody>
    </Table>);
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
  return <button}>Delete</button>
}
*/
