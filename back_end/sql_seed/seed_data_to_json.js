const fs = require('fs');

const idGeneratorFactory = start => () => start++;

const createUserId = idGeneratorFactory(1);
const createDistrictId = idGeneratorFactory(1);
const createTeamId = idGeneratorFactory(1);
const createSchoolId = idGeneratorFactory(1);
const createTeamAssnId = idGeneratorFactory(1);

const ADMIN_ID = createUserId(), ASSIGNOR_ID = createUserId(), DISTRICT_ID = createDistrictId();

const env = s => {
  if (process.env[s]) return process.env[s];
  throw new Error(`Env variable ${s} not found`);
}

//1. parse schools from list
console.log('parsing schools');
let schools = (() => {
  const parseLine = line => {
    line = line.trim();
  
    const split = line.split('-');
    if (split.length == 1) {
  
      return {
        school: line,
        raw: line
      };
    }
    if (split.length == 2) {
      const school = split[0].trim();
      const raw = line.trim();
  
      return {
        school,
        raw
      }
    }
    
    throw new Error('expected to have either 1 or 0 `-` per line but found: ' + line);  
  }
  const createSchool = (() => {
    const getExportNames = (schoolName, rawTeamNames) => {
      const isRawVB = s => (s.endsWith('VB') && !s.endsWith('JVB')) || s.endsWith('Boys');
      const isRawVG = s => (s.endsWith('VG') && !s.endsWith('JVG')) || s.endsWith('Girls');  
      const isRawJVB = s => s.endsWith('JVB') || s.endsWith('Boys');  
      const isRawJVG = s => s.endsWith('JVG') || s.endsWith('Girls');
  
      const fn = f => rawTeamNames.find(r => f(r)) || schoolName;
  
      return [fn(isRawVB), fn(isRawVG), fn(isRawJVB), fn(isRawJVG)];
    }
  
    const getTeamNames = schoolName => ['VB', 'VG', 'JVG', 'JVB'].map(name => `${schoolName} - ${name}`);
  
    /*
      @param schoolName, e.g. 'Farmerville High School'
      @param rawTeamNames, e.g. ['Bastrop High School', 'Bastrop High School - Boys', 'Bastrop High School - Girls']
      @return School object, along with 4 team objects attached
    */
    return (schoolName, rawTeamNames) => {
  
      const school = {
        id: createSchoolId(),
        name: schoolName,
        schoolAdminId: null,
        districtId: DISTRICT_ID,
        isLhsaa: true
      };
  
      const names = getTeamNames(school.name);
      const exportNames = getExportNames(school.name, rawTeamNames);
  
      school.teams = ['vb', 'vg', 'jvb', 'jvg']
        .map((teamKind, i) => {
          return {
            id: createTeamId(),
            schoolId: school.id,
            teamKind,
            name: names[i],
            exportName: exportNames[i],
            isLhsaa: school.isLhsaa
          };
        });
  
      return school;
    }
  })();
  

  const fname = env('FILENAME_SCHOOL_LIST');
  const lines = fs.readFileSync(fname, 'utf8').split('\n'); 

  /*
    Parses

    Farmerville High School
    Franklin Parish High School
    Glenmora High School - VB
    Glenmora High School - VG

    TO

    {
      'Farmerville High School': [ 'Farmerville High School' ],
      'Franklin Parish High School': [ 'Franklin Parish High School' ],
      'Glenmora High School': [ 'Glenmora High School - VB', 'Glenmora High School - VG' ],
    }
  */
  const schoolNameMap = lines.reduce((schoolNameMap, line) => {
    if (line) {
      const { school, raw } = parseLine(line);
      schoolNameMap[school] = schoolNameMap[school] || [];
      schoolNameMap[school].push(raw);
    }
    return schoolNameMap;
  }, {});

  return Object.keys(schoolNameMap)
    .map(schoolName => {
      const rawTeamNames = schoolNameMap[schoolName];
      return createSchool(schoolName, rawTeamNames);
    });
})();
console.log('schools parsed');

//2. extract teams from schools
console.log('extracting teams');
const teams = schools.reduce((teams, school) => [...teams, ...school.teams], []);
console.log('teams extracted');

//3. subtract teams from schools
schools = schools.map(s => ({
  id: s.id,
  name: s.name,
  isLhsaa: s.isLhsaa,
  schoolAdminId: s.schoolAdminId,
  districtId: s.districtId
}));

//4. admin
const admin = {
  id: ADMIN_ID,
  email: env('ADMIN_EMAIL'),
  password: env('ADMIN_PASSWORD'),
  name: env('ADMIN_NAME'),
  role: 'admin',
  status: 'accepted',
  schoolId: null
};
console.log('admin ready');

//5. assignor
const assignor = {
  id: ASSIGNOR_ID,
  email: env('ASSIGNOR_EMAIL'),
  password: env('ASSIGNOR_PASSWORD'),
  name: env('ASSIGNOR_NAME'),
  role: 'assignor',
  status: 'accepted',
  schoolId: null
};
console.log('assignor ready');

const [schoolAdmins, schoolUpdates, schoolReps, schoolRepTeamAssns] = (() => {
  const f = role => (k, schoolId) => status => {
    const id = createUserId();
    const name = `${k}${id}`;
    return {
      id,
      name: `${name}`,
      email: `${name}@test.net`,
      password: 'password', role,
      schoolId,
      status
    };
  }

  const sadminFactory = f('school_admin');
  const srepFactory = f('school_rep');

  const f1 = sadminFactory('acadiana', 1);
  const f2 = sadminFactory('adams', 2);

  const schoolAdmins = [f1('accepted'), f1('pending'), f2('accepted')];

  const schoolUpdates = [
    { id: 1, schoolAdminId: schoolAdmins[0].id},
    { id: 2, schoolAdminId: schoolAdmins[2].id}
  ];

  const f3 = srepFactory('acadiana', 1);
  const f4 = srepFactory('adams', 2);

  const schoolReps = [f3('accepted'), f3('accepted'), f3('pending'),
    f4('accepted')];

  const schoolRepTeamAssns = (() => {
    const rep1 = schoolReps[0];
    const rep2 = schoolReps[1];
    const rep4 = schoolReps[3];

    return [
      { id: createTeamAssnId(), schoolRepId: rep1.id, teamId: 1 },
      { id: createTeamAssnId(), schoolRepId: rep1.id, teamId: 2 },
      { id: createTeamAssnId(), schoolRepId: rep1.id, teamId: 3 },
      { id: createTeamAssnId(), schoolRepId: rep1.id, teamId: 4 },
      { id: createTeamAssnId(), schoolRepId: rep2.id, teamId: 1 },
      { id: createTeamAssnId(), schoolRepId: rep2.id, teamId: 2 },
      { id: createTeamAssnId(), schoolRepId: rep4.id, teamId: 5 },
      { id: createTeamAssnId(), schoolRepId: rep4.id, teamId: 6 },
      { id: createTeamAssnId(), schoolRepId: rep4.id, teamId: 7 },
      { id: createTeamAssnId(), schoolRepId: rep4.id, teamId: 8 }
    ];
  })();

  return [schoolAdmins, schoolUpdates, schoolReps, schoolRepTeamAssns];
})();

const users = [admin, assignor, ...schoolAdmins, ...schoolReps];
console.log('users ready');

const district = {
  id: DISTRICT_ID,
  name: 'District A',
  assignorId: assignor.id
};
console.log('district ready');

const jsonOutFilename = env('FILENAME_SEED_DATA_JSON');
console.log(`dumping json to ${jsonOutFilename}`);
const json = JSON.stringify({
  district,
  users,
  schools,
  teams,
  schoolUpdates,
  schoolRepTeamAssns
}, null, 2);
fs.writeFileSync(jsonOutFilename, json);
console.log(`finished dumping json`);