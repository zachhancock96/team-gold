import { Route, redirect } from '../routes';
import { api } from 'shared';

export const service = ({state}) => {
  if (state.routeTransition.arrive.School) {
    if (!state.user) {
      return redirect(Route.Login());
    }

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
    update({ loading: true });

    const schools = await api.getSchools();

    update({ loading: false, school: { schools } });
  }
}