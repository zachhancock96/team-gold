import * as api from '../shared/api';
import { filterEditableSchools } from './util';

export const Initial = async () => {
  const me = await api.getMe();
  const schools = await api.getSchools();

  const editableSchools = filterEditableSchools(me, schools);

  return {
    user: me,
    schools,
    editableSchools: editableSchools,
    selectedSchool: null,
    filteredText: ''
  }    
}