--schoolId 1: Acadiana HomeSchool
--schoolId 2: Adams County Christian School

--teamId 1: Acadiana HomeSchool - VB','Acadiana HomeSchool',1,'vb',1),
--teamId 2: Acadiana HomeSchool - VG','Acadiana HomeSchool',1,'vg',1),
--teamId 3: Acadiana HomeSchool - JVG','Acadiana HomeSchool',1,'jvb',1),
--teamId 4: Acadiana HomeSchool - JVB','Acadiana HomeSchool',1,'jvg',1),
--teamId 5: Adams County Christian School - VB','Adams County Christian School - VB',1,'vb',2),
--teamId 6: Adams County Christian School - VG','Adams County Christian School - VG',1,'vg',2),
--teamId 7: Adams County Christian School - JVG','Adams County Christian School',1,'jvb',2),
--teamId 8: Adams County Christian School - JVB','Adams County Christian School',1,'jvg',2)

INSERT INTO USER (id, email, password, name, role, status, schoolId) VALUES
  (3,'rep1@a.net','password','rep1a','school_rep', 'accepted',1),
  (4,'rep2@a.net','password','rep2a','school_rep', 'accepted',1),
  (5,'rep3@a.net','password','rep3a','school_rep', 'pending',1),
  (6,'sad1@a.net','password', 'sad1a','school_admin','accepted',1),

  (7,'rep1@b.net','password','rep1b','school_rep', 'accepted',2),
  (8,'rep2@b.net','password','rep2b','school_rep', 'accepted',2),
  (9,'rep3@b.net','password','rep3b','school_rep', 'pending',2),
  (10,'sad1@b.net','password', 'sad1b','school_admin','accepted',2);

UPDATE School set schoolAdminId=6 where id=1;
UPDATE School set schoolAdminId=10 where id=2;

--rep1a teams (1, 2, 3, 4)
--rep2a teams 1
--rep3a teams 2
--rep1b teams (5, 6, 7, 8)
--rep2b teams 5
--rep3b teams 6

INSERT INTO SCHOOL_REP_TEAM_ASSN (schoolRepId, teamId) VALUES
  (3, 1),
  (3, 2),
  (3, 3),
  (3, 4),
  (4, 1),

  (7, 5),
  (7, 6),
  (7, 7),
  (7, 8),
  (8, 5);