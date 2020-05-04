import * as helper from './test-helper';

describe('test setup works', () => {
  it ('helper has initialized db with assignor', async () => {
    const repo = helper.getServerInstance().repository;
    const assignor = await repo.getAssignor();
    expect(assignor).toBeTruthy();
  });

  it ('helper has initialized db with admin', async () => {
    const repo = helper.getServerInstance().repository;
    const admin = await repo.getAdmin();
    expect(admin).toBeTruthy();
  });

  it ('repository and resetDatabase should sync', async () => {
    const repo = helper.getServerInstance().repository;
    const name = 'Random School name';

    //adding school
    const schoolId = await repo.addSchool({name, isLhsaa: false, schoolAdminId: null, districtId: null});

    //school should exist
    const school = await repo.getSchool(schoolId);
    expect(school!.name).toEqual(name);

    //reseting school
    await helper.resetDatabase();

    //school shouldn't exist
    const school_ = await repo.getSchool(schoolId);
    expect(school_).toBeFalsy();
  });
})