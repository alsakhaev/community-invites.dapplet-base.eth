DROP TABLE posts;
DROP TABLE conferences;
DROP TABLE users;
DROP TABLE invitations;
DROP TABLE attendance;

CREATE TABLE posts (
  id VARCHAR(31) PRIMARY KEY,
  namespace varchar(15) NOT NULL,
  username VARCHAR(255) NOT NULL,
  text TEXT NOT NULL
);

CREATE TABLE conferences (
  id SERIAL PRIMARY KEY,
  short_name VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  date_from DATE NULL,
  date_to DATE NULL
);

CREATE TABLE users (
  namespace varchar(15) NOT NULL,
  username varchar(50) NOT NULL,
  fullname varchar(255) NOT NULL,
  img varchar(255) NOT NULL,
  main_conference_id INTEGER NULL,
  PRIMARY KEY(namespace, username)
);

CREATE TABLE invitations (
  namespace_from varchar(15) NOT NULL,
  namespace_to varchar(15) NOT NULL,
  username_from varchar(50) NOT NULL,
  username_to varchar(50) NOT NULL,
  conference_id INTEGER NOT NULL,
  post_id varchar(31) NOT NULL
);

CREATE TABLE attendance (
  conference_id INTEGER NOT NULL,
  namespace varchar(15) NOT NULL,
  username varchar(50) NOT NULL
);

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon6', 'Devcon 6', 'Bogota, Colombia'||chr(10)||'https://archive.devcon.org', '2021-04-21T10:00:00Z', '2021-04-28T10:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon5', 'Devcon 5', 'Osaka, Japan'||chr(10)||'https://archive.devcon.org/devcon-5/details', '2019-10-08T10:00:00Z', '2019-10-11T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon4', 'Devcon 4', 'Prague, Czech Republic'||chr(10)||'https://archive.devcon.org/devcon-4/details', '2018-10-30T10:00:00Z', '2018-11-02T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon3', 'Devcon 3', 'Cancun, Mexico'||chr(10)||'https://archive.devcon.org/devcon-3/details', '2017-11-01T10:00:00Z', '2017-11-04T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon2', 'Devcon 2', 'Shanghai, China'||chr(10)||'https://archive.devcon.org/devcon-2/details', '2016-09-19T10:00:00Z', '2016-09-21T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon1', 'Devcon 1', 'London, United Kingdom'||chr(10)||'https://archive.devcon.org/devcon-1/details', '2015-11-09T10:00:00Z', '2015-11-13T10:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon0', 'Devcon 0', 'Kreuzberg, Berlin'||chr(10)||'https://archive.devcon.org/devcon-0/details', '2014-11-24T10:00:00Z', '2014-11-28T10:00:00Z');
