const fs = require('fs');

function sqlValues(matrix) {
  const last = matrix.length - 1;

  return matrix.map((v, index) => 
    '('
    + v.map(i => sqlValue(i)).join(',')
    + ')'
    + (index === last? ';\n': ',\n')).join('');
}

function sqlValue(v) {
  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'boolean') return v? '1': '0';
  if (v === null || v === undefined) return 'null';
  return v;
}

const env = s => {
  if (process.env[s]) return process.env[s];
  throw new Error(`Env variable ${s} not found`);
};

const districtToSql = district => {
  return `INSERT INTO DISTRICT (id, name, assignorId) VALUES
    ${sqlValues([ [district.id, district.name, district.assignorId] ])}`;
}

const usersToSql = users => {
  const userMatrix = users.map(u => [
    u.id,
    u.email,
    u.password,
    u.name,
    u.role,
    u.status,
    u.schoolId
  ]);

  return `INSERT INTO USER (id, email, password, name, role, status, schoolId) VALUES
    ${sqlValues(userMatrix)}`;  
}

const schoolsToSql = schools => {
  const schoolMatrix = schools.map(s => [
    s.id,
    s.name,
    s.isLhsaa,
    s.schoolAdminId,
    s.districtId
  ]);

  return `INSERT INTO SCHOOL (id, name, isLhsaa, schoolAdminId, districtId) VALUES
    ${sqlValues(schoolMatrix)}`;
}

const teamsToSql = teams => {
  const teamMatrix = teams.map(t => [
    t.id,
    t.name,
    t.exportName,
    t.isLhsaa,
    t.teamKind,
    t.schoolId
  ]);

  return `INSERT INTO TEAM (id, name, exportName, isLhsaa, teamKind, schoolId) VALUES
    ${sqlValues(teamMatrix)}`;
}

const schoolUpdatesToSql = schoolUpdates => {
  return schoolUpdates
    .map(su => `UPDATE School set schoolAdminId=${su.schoolAdminId} where id=${su.id};`)
    .join('\n');
}

const assnsToSql = assns => {
  const assnMatrix = assns.map(a => [
    a.id,
    a.schoolRepId,
    a.teamId
  ]);

  return `INSERT INTO SCHOOL_REP_TEAM_ASSN (id, schoolRepId, teamId) VALUES
    ${sqlValues(assnMatrix)}`;
}

const jsonReadSource = env('FILENAME_SEED_DATA_JSON');
const sqlWriteDestination = env('FILENAME_SEED_DATA_SQL');

const data = JSON.parse(fs.readFileSync(jsonReadSource));

const district = data.district;
const districtSql = districtToSql(district);

const users = data.users;
const usersSql = usersToSql(users);

const schools = data.schools;
const schoolsSql = schoolsToSql(schools);

const teams = data.teams;
const teamsSql = teamsToSql(teams);

const schoolUpdates = data.schoolUpdates;
const schoolUpdatesSql = schoolUpdatesToSql(schoolUpdates);

const assns = data.schoolRepTeamAssns;
const assnsSql = assnsToSql(assns);

const sql =
`
SET FOREIGN_KEY_CHECKS = 0;

${usersSql}

${assnsSql}

${districtSql}

${schoolsSql}

${schoolUpdatesSql}

${teamsSql}

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.writeFileSync(sqlWriteDestination, sql);