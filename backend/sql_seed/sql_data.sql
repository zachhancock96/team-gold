DELETE FROM Game;
DELETE FROM Team;
DELETE FROM School;

INSERT INTO School (id, name, abbrevName) VALUES
  (1, 'Neville High School', 'Neville H.S'),
  (2, 'Ginsburg High School', 'Ginsburg H.S'),
  (3, 'West Monroe High School', 'West Monroe H.S');

INSERT INTO Team (id, name, abbrevName, schoolId) VALUES
  (1, 'Neville High School Jr. Varsity', 'Neville H.S.J.V', 1),
  (2, 'Ginsburg High School Jr. Varsity', 'Ginsburg H.S.J.V', 2),
  (3, 'West Monroe High School Jr. Varsity', 'West Monroe H.S.J.V', 3);

INSERT INTO Game (id, homeTeamId, awayTeamId, start, location) VALUES
  (1, 1, 2, '2020-03-15T08:00:00.000Z', 'Trump Tower, Monroe, LA, 71293'),
  (2, 2, 1, '2020-03-16T08:00:00.000Z', 'Trump Tower, Monroe, LA, 71293'),
  (3, 1, 3, '2020-03-17T08:00:00.000Z', 'Trump Tower, Monroe, LA, 71293');