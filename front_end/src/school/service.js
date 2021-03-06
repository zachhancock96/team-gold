import { Route, redirect } from '../routes';
import { api } from 'shared';

export const service = ({state}) => {
  if (state.routeTransition.arrive.School) {

    //initializing state upon entering school
    return {
      school: {
        filter: '',
        schools: []
      }
    }
  }

  //clearing state upon leaving school
  if (state.routeTransition.leave.School) {
    return {
      school: null
    }
  }
};

//prefills school
export const effect = async ({state, update}) => {
  if (state.routeTransition.arrive.School) {
    update({ loading: { school: true } });

    const schools = await api.getSchools();

    update({ loading: { school: false }, school: { schools } });
  }
}