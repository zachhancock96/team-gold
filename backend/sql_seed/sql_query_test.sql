-- SELECT * FROM 

-- TEAM T JOIN SCHOOL S ON T.schoolId=S.id

-- JOIN SCHOOL_REP SR ON SR.schoolId=S.id

-- JOIN SCHOOL_REP_TEAM_ASSN SRTA ON SRTA.teamId=T.id

-- JOIN USER U ON U.id=SR.userId

-- WHERE T.id = 1;

SELECT T.id as teamId, T.name as teamName, T.teamKind as teamKind,
  SR.id as repId, SR.name as repName, SR.email as repEmail, SR.password as repPassword, SR.role as repRole,
  ASS.id as assignorId, ASS.name as assignorName, ASS.email as assignorEmail, ASS.password as assignorPassword, ASS.role as assignorRole,
  SADMIN.id as schoolAdminId, SADMIN.name as schoolAdminName, SADMIN.email as schoolAdminEmail, SADMIN.password as schoolAdminPassword, SADMIN.role as schoolAdminRole,
  D.id as districtId, D.name as districtName,
  S.id as schoolId, S.name as schoolName 
    FROM
  TEAM T JOIN SCHOOL S ON T.schoolId=S.id
  JOIN USER SADMIN ON SADMIN.id=S.schoolAdminId
  JOIN DISTRICT D ON D.id=S.districtId
  JOIN USER ASS ON ASS.id=D.assignorId
  JOIN SCHOOL_REP SR_ ON SR_.schoolId=S.id
  JOIN SCHOOL_REP_TEAM_ASSN SRTA ON SRTA.teamId=T.id
  JOIN USER SR ON SR.id=SR_.userId
  WHERE T.id = 1;