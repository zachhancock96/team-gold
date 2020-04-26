import React, { Component } from 'react'; 
import PropTypes from 'prop-types';
import { View } from './view';
import { api } from 'shared';

export class SchoolDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      schoolDetail: null
    };
  }

  async componentDidMount() {
    //TODO: do this on component update and when schoolId is different
    const m = this.props;
    this._loadSchool(m.schoolDetail);
  }

  _loadSchool = () => {
    const m = this.props;

    m.actions.showLoading('SchoolDetail');
    this.setState(m);
    m.actions.hideLoading('SchoolDetail');
  }

  async componentDidUpdate(prevProps) {
    const prevSchoolId = prevProps.schoolDetail.id;
    const newSchoolId = this.props.schoolDetail.id;

    if (newSchoolId != prevSchoolId) {
      this._loadSchool(newSchoolId);
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
    const { schoolDetail } = this.state;
    return (<View
        schoolDetail={schoolDetail}
        onAccept={this.handleAccept}
        onReject={this.handleReject}
        onEdit={this.handleEdit}
        onEditSchool={this.handleEditSchool}
         />);
  }
}

SchoolDetail.propTypes = {
  schoolDetail: PropTypes.array.isRequired
}