
DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;


DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS employee;


CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  department_id INT NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE CASCADE
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  manager_id INT ,
  roles_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (roles_id)
  REFERENCES roles(id)
  ON DELETE CASCADE,
  FOREIGN KEY (manager_id)
  REFERENCES employee(id)
  ON DELETE CASCADE
);
