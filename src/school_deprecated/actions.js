export const Actions = update => {

  return {
    selectSchool: (state, schoolId) => {
      const school = state.schools.find(s => s.id === schoolId);
      update({ selectedSchool: { ...school } });      
    }
  }
}