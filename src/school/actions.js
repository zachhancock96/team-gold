import { Route, navigateTo } from '../routes';

export const Actions = update => {
  const setSchoolFilter = filter => {
    update({
      school: {
        filter: filter.toLowerCase()
      }
    })
  }

  const selectSchool = schoolId => {
    update(navigateTo(Route.School({ id: schoolId })));
  }

  return {
    setSchoolFilter,
    selectSchool
  }
}