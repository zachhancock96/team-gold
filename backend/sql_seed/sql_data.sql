DELETE FROM Game;
DELETE FROM Team;

INSERT INTO Team (id, teamName) VALUES
  (1, 'Neville High School Jr. Varsity'),
  (2, 'Ginsburg High School Jr. Varsity'),
  (3, 'West Monroe High School Jr. Varsity');

INSERT INTO Game (id, homeTeamId, awayTeamId, start, end, location) VALUES
  (1, 1, 2, '2020-03-15T08:00:00.000Z', '2020-03-15T10:00:00.000Z', 'Trump Tower, Monroe, LA, 71293'),
  (2, 2, 1, '2020-03-16T08:00:00.000Z', '2020-03-16T10:00:00.000Z', 'Trump Tower, Monroe, LA, 71293'),
  (3, 1, 3, '2020-03-17T08:00:00.000Z', '2020-03-17T10:00:00.000Z', 'Trump Tower, Monroe, LA, 71293');
