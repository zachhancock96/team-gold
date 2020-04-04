import * as R from '../shared/roles';

export const filterEditableSchools = (user, schools) => {
  const role = user.role;

  if (role === R.ADMIN) {
    return [...schools];
  } else if (role === R.ASSIGNOR) {
    return schools.filter(s => s.assignor && s.assignor.id === user.id);
  } else if (role === R.SCHOOL_ADMIN) {
    return schools.filter(s => s.schoolAdmin && s.schoolAdmin.id === user.id);
  } else if (role === R.SCHOOL_REP) {
    return schools.filter(s => !!s.schoolReps.find(sr => sr.id === user.id));
  } else if (role === R.VISITOR) {
    return [];
  } else {
    console.warn('Unrecognized user roles');
    return [];
  }
}