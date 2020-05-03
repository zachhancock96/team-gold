import React, { Component } from 'react'; 
import PropTypes from 'prop-types';
import { View } from './view';
import { api } from 'shared';

const load = async schoolDetailid => {
  const school = await api.getSchool(schoolDetailid);
  const schoolAdmins = await api.getSchoolAdminsOfSchool(schoolDetailid);
  let schoolReps = await api.getSchoolRepsOfSchool(schoolDetailid);

  /*
  formatting the return of getSchoolRepsOfSchool to
  Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    schoolId: number
    teams: Array<{ abbrevName: string, name: string, teamKind: string, id: number}>
  */
  schoolReps = schoolReps.map(({ rep, teamIds }) => {
    const teams = school
      .teams
      .filter(t => teamIds.indexOf(t.id) >= 0)
      .map(t => ({ abbrevName: t.teamKind, name: t.name, id: t.id, teamKind: t.teamKind}));
    rep.teams = teams;
    return rep;
  });

  return {
    school,
    schoolAdmins,
    schoolReps
  };
}

const isBoss = user => user.role === 'assignor' || user.role === 'admin';

//following props are recieved:
//schoolDetailId: number
//actions e.g. actions.showLoading,
//user
export class SchoolDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canEditSchoolRep: false,
      canEditSchoolAdmin: false,
      schoolAdmins: [],
      schoolReps: [],
      school: null,
      ready: false,
    };
  }

  async componentDidMount() {
    this._load(this.props.schoolDetailId);
  }

  _load = async (schoolDetailId) => {
    const { schoolAdmins, schoolReps, school } = await load(schoolDetailId);
    const { user } = this.props;

    const canEditSchoolRep = isBoss(user)
      ? true
      : user.role === 'school_admin'
      ? user.schoolId === schoolDetailId
      : false;

    const canEditSchoolAdmin = isBoss(user)

    this.setState({
      canEditSchoolRep,
      canEditSchoolAdmin,
      schoolAdmins,
      schoolReps,
      school,
      ready: true
    });

  }

  async componentDidUpdate(prevProps) {
    const prevSchoolId = prevProps.schoolDetailId;
    const newSchoolId = this.props.schoolDetailId;

    if (newSchoolId != prevSchoolId) {
      this._load(newSchoolId);
    }
  }

  sl = () => {
    const { actions } = this.props;
    actions.showLoading('school_detail');
  }
  
  hl = () => {
    const { actions } = this.props;
    actions.hideLoading('school_detail');
  }

  handleRepEdit = async (schoolId, repId, teamIds) => {
    this.sl();
    
    await api.editSchoolRep(schoolId, repId, teamIds);
    this._load(schoolId);

    this.hl();
    this.success('Edited like a true editor.');
  }

  success = s => {
    const { actions } = this.props;
    actions.showSuccess(s);
  }

  error = s => {
    const { actions } = this.props;
    actions.showError(s);
  }  

  handleAccept = async (schoolId, userId, userType) => {
    this.sl();

    if (userType === 'school_admin'){
      await api.acceptSchoolAdmin(schoolId, userId).catch(err => this.error(err));
      this._load(schoolId);
      this.success('User has been accepted.')
    }
    else if (userType === 'school_rep'){
      await api.acceptSchoolRep(schoolId, userId).catch(err => this.error(err));
      this._load(schoolId);
      this.success('User has been accepted.')
    }

    this.hl();
  }

  handleReject = async (schoolId, userId, userType) => {
    this.sl();

    if (userType === 'school_admin'){
      await api.rejectSchoolAdmin(schoolId, userId);
      this._load(schoolId);
      this.success('User has been rejected.')
    }
    else if (userType === 'school_rep'){
      await api.rejectSchoolRep(schoolId, userId);
      this._load(schoolId);
      this.success('User has been rejected.')
    }

    this.hl();
  }

  handleDelete = async (schoolId, userId, userType) => {
    this.sl();

    if (userType === 'school_admin'){
      await api.removeSchoolAdmin(schoolId, userId);
      this._load(schoolId);
      this.success('User has been deleted.')
    }
    else if (userType === 'school_rep'){
      await api.removeSchoolRep(schoolId, userId);
      this._load(schoolId);
      this.success('User has been deleted.')
    }

    this.hl();
  }

  render() {
    const { canEditSchoolRep, canEditSchoolAdmin, ready, school, schoolAdmins, schoolReps } = this.state;
    
    return ready ?
      (<View
          canEditSchoolRep={canEditSchoolRep}
          canEditSchoolAdmin={canEditSchoolAdmin}
          schoolAdmins={schoolAdmins}
          schoolReps={schoolReps}
          schoolDetail={school}
          onAccept={this.handleAccept}
          onReject={this.handleReject}
          onDelete={this.handleDelete}
          onEdit={this.handleRepEdit}
          onEditSchool={this.handleEditSchool} />)
      : null;
  }
}

SchoolDetail.propTypes = {
  schoolDetailId: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired
}