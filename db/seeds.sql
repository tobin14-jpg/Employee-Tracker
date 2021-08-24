INSERT INTO department (name)
VALUES
('Finance & Accounting'),
('Marketing'),
('IT'),
('Sales');

INSERT INTO role (id, title, salary, department_id)
VALUES
(001, 'Financial Accountant', 120000, 001),
(002, 'Marketing Manager', 100000, 002),
(003, 'Software Engineer', 150000, 003),
(004, 'Sales Manager', 90000, 004);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
(001, 'Wayne', 'Gretzky', NULL, 001),
(002, 'Michael', 'Jordan', 001, 002)
(003, 'Dumpty', 'Humpty', 001, 002),
(004, 'Stark', 'Tony', 001, 004),
