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
  avatar varchar(255) NOT NULL,
  PRIMARY KEY(namespace, username)
);

CREATE TABLE invitations (
  namespace_from varchar(15) NOT NULL,
  namespace_to varchar(15) NOT NULL,
  username_from varchar(50) NOT NULL,
  username_to varchar(50) NOT NULL,
  conference_id SERIAL NOT NULL,
  post_id varchar(31) NOT NULL
);

CREATE TABLE attendance (
  conference_id SERIAL NOT NULL,
  namespace varchar(15) NOT NULL,
  username varchar(50) NOT NULL
);