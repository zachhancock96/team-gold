import React, { Component } from 'react'; 
import PropTypes from 'prop-types';
import { View } from './view';
import { api } from 'shared';

/*
    interface School {
      id: number;
      name: string;
      isLhsaa: boolean;
      schoolReps: {
        id: number,
        name: string
      }[];
      teams: {
        id: number;
        name: string;
        teamKind: TeamKind;
      }[];
      schoolAdmin: {
        id: number,
        name: string
      } | null;
      district: {
        id: number,
        name: string
      } | null;
      assignor: {
        id: number,
        name: string
      } | null;
    }
*/
const load = async schoolDetailid => {
  const school = await api.getSchool(schoolDetailid);
  const schoolAdmins = await api.getSchoolAdminsOfSchool(schoolDetailid);
  const schoolReps = await api.getSchoolRepsOfSchool(schoolDetailid);

  return {
    school,
    schoolAdmins,
    schoolReps
  };
}

//following props are recieved:
//schoolDetailId: number
//actions e.g. actions.showLoading
export class SchoolDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      schoolAdmins: [],
      schoolReps: [],
      school: null,
      ready: false,
    };
  }

  async componentDidMount() {
    //TODO: do this on component update and when schoolId is different
    this._load(this.props.schoolDetailId);
  }

  _load = async (schoolDetailId) => {
    //TODO: show loading
    const { schoolAdmins, schoolReps, school } = await load(schoolDetailId);
    this.setState({
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

  // handleEdit = id => {
  //   this.props.onEdit(id);
  // }

  // handleEditSchool = id => {
  //   this.props.onEdit(id);
  // }

  // handleAccept = async id => {
  //   await api.acceptGame(id);
  //   this._loadGame(id);
  // }

  // handleReject = async id => {
  //   const { actions } = this.props;
  //   api.rejectGame(id)
  //     .then(() => {
  //       actions.showSuccess('Game Rejected succesfully');
  //       this._loadGame(id);
  //     })
  //     .catch(err => actions.showError(err.message || err));
  // }

  render() {
    const { ready, school, schoolAdmins, schoolReps } = this.state;
    
    return ready ?
      (<View
          schoolAdmins={schoolAdmins}
          schoolReps={schoolReps}
          schoolDetail={school}
          onAccept={this.handleAccept}
          onReject={this.handleReject}
          onEdit={this.handleEdit}
          onEditSchool={this.handleEditSchool} />)
      : null;
  }
}

SchoolDetail.propTypes = {
  schoolDetailId: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired
}