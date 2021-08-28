  
//const sequelize = require('./config/connection');
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();


// Connect to db
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log("Successfully connected to employee_db database")
);

// Run funciton on connection to db
db.connect(err => {
    if (err) throw err;
    afterConnection();
});

afterConnection = () => {
    console.log(`
    ********************
    ******Employee******
    ******Tracker*******
    ********************`)
    startQuestions()
};

function startQuestions() {
    inquirer.prompt({
        type: 'list',
        name: 'task',
        message: 'What would you like to do?',
        choices: Object.keys(operations)
    })
    .then(({ task }) => operations[task]())
}

// Choices for the user to select which function they want
const operations = {
    "View Employees": viewEmployees,
	"View Employees By Manager": viewEmployeesByManager,
	"View Employees By Department": viewEmployeesByDept,
	"View Roles": viewRoles,
	"View Departments": viewDepartments,
	"View Utilized Budget of a Department": departmentBudget,
	"Add Employee": addEmployees,
	"Add Department": addDepartments,
	"Add Roles": addRoles,
	"Update Employee Role": updateEmployees,
	"Update Employee's Manager": updateEmployeeManager,
	"Delete Department": deleteDept,
	"Delete Employee": deleteEmployee,
	"Delete Role": deleteRoles,
	"Exit App": process.exit
}

// ------------------Views---------------------
// View all employees
function viewEmployees() {
    let query = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Role Title", r.salary AS "Salary", d.name AS "Department Name", IFNULL(CONCAT (em.first_name,' ',em.last_name),"No Manager") AS Manager
    FROM employee e
    LEFT OUTER JOIN employee em ON e.manager_id = em.id
    JOIN roles r ON e.roles_id = r.id
    JOIN department d ON r.department_id = d.id`
    db.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        startQuestions();
    });

}

// View all roles
function viewRoles() {
    let query = `SELECT r.id, r.title, r.salary, d.name AS "Department Name"
    FROM roles r
    JOIN department d ON r.department_id = d.id`
    db.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        startQuestions();
    });
}

// View all departments
function viewDepartments() {
    let query = `SELECT * FROM department`
    db.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        startQuestions();
    });
}

// View employees by manager
function viewEmployeesByManager() {
    let query = `SELECT * FROM employee`
    db.query(query, function (err, res) {
        if (err) throw err;
        const managerOptions = res.map(manager => ({
            value: manager.id, name: manager.first_name
        }))
        viewEmployeesByManagerPrompt(managerOptions)
    });
}

function viewEmployeesByManagerPrompt(managerOptions) {
    inquirer.prompt([
        {
            type: "list",
            message: "Which managers employees would you like to see?",
            name: "manager_id",
            choices: managerOptions
        },
    ])
    .then(function (answer) {
        let query = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Role Title", r.salary AS Salary, d.name AS "Department Name", IFNULL(CONCAT (em.first_name,' ',em.last_name),"No Manager") AS Manager
        FROM employee e
        LEFT OUTER JOIN employee em ON e.manager_id = em.id
        JOIN roles r ON e.roles_id = r.id
        JOIN department d ON r.department_id = d.id
        WHERE e.manager_id = ?`
        db.query(query, [answer.manager_id], function (err, results) {
            if (err) throw err;
            console.table(results);
            startQuestions()
        });
    })
}


// View employees by department
function viewEmployeesByDept() {
    let query = `SELECT * FROM department`
	db.query(query, function (err, res) {
		if (err) throw err;
		const departmentOptions = res.map(department => ({
			value: department.id, name: department.name
		}))
		viewEmployeesByDeptPrompt(departmentOptions)
	});
}

function viewEmployeesByDeptPrompt(departmentOptions) {
	inquirer.prompt([
		{
			type: 'list',
			message: 'Which Departments employees would you like to view?',
			name: 'department_id',
			choices: departmentOptions
		},
	])
	.then(function (answer) {
		let query = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Role Title", r.salary AS Salary, d.name AS "Department Name", IFNULL(CONCAT (em.first_name,' ',em.last_name),"No Manager") AS Manager
		FROM employee e
		LEFT OUTER JOIN employee em ON e.manager_id = em.id
		JOIN roles r ON e.roles_id = r.id
		JOIN department d ON r.department_id = d.id
		WHERE d.id = ?`

		db.query(query, [answer.department_id], function (err, results) {
			if (err) throw err;
			console.table(results);
			startQuestions()
		});
	})
}

// View department budget
function departmentBudget() {
    let query = `SELECT d.name, SUM(r.salary) AS "Utilized Budget"
	FROM employee e
	JOIN roles r on e.roles_id = r.id
	JOIN department d ON r.department_id = d.id
	GROUP BY d.id`
	db.query(query, function (err, results) {
		if (err) throw err;
		console.table(results);
		startQuestions();
	});
}

// ------------------Adds---------------------
// Add employee
function addEmployees() {
    let query = `SELECT * FROM roles`
	db.query(query, function (err, res) {
		if (err) throw err;
		const roleOptions = res.map(role => ({
			value: role.id, name: role.title
		}))
		getManager(roleOptions)
	});
}

function getManager(roleOptions) {
	let query1 = `SELECT * FROM Employee`
	db.query(query1, function (err, res) {
		if (err) throw err;
		let employeeOptions = res.map(employee => ({
			value: employee.id, name: employee.first_name
		}))
		employeePromptAdd(employeeOptions, roleOptions)
	});
}

function employeePromptAdd(employeeOptions, roleOptions) {
	inquirer.prompt([
		{
			type: 'input',
			message: 'Employee first name',
			name: 'first_name',
		},
		{
			type: 'input',
			message: 'Employee last name',
			name: 'last_name',
		},
		{
			type: 'list',
			message: 'Who is the employees manager?',
			name: 'manager_id',
			choices: employeeOptions
		},
		{
			type: 'list',
			message: 'What role does this employee hold?',
			name: 'roles_id',
			choices: roleOptions
		},
	])
	.then(function (answer) {
		let query = `INSERT INTO employee (first_name, last_name, manager_id, roles_id) values (?, ?, ?, ?)`
		db.query(query, [answer.first_name, answer.last_name, answer.manager_id, answer.roles_id,], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}

// Add department
function addDepartments() {
	inquirer.prompt([
		{
			type: 'input',
			message: 'What department do you want to add?',
			name: 'department',
		},
	])
	.then(function (answer) {
		let query = `INSERT INTO department (name) VALUES (?)`
		db.query(query, [answer.department], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}

// Add role
function addRoles() {
	let query = `SELECT * FROM department`
	db.query(query, function (err, res) {
		if (err) throw err;
		let departmentOptions = res.map(department => ({
			value: department.id, name: department.name
		}))
		rolesPromptAdd(departmentOptions)
	});
}


function rolesPromptAdd(departmentOptions) {
	inquirer.prompt([
		{
			type: 'input',
			message: 'What role do you want to add?',
			name: 'title',
		},
		{
			type: 'input',
			message: 'What is the salary for role?',
			name: 'salary',
		},
		{
			type: 'list',
			message: 'What department does this role belong too?',
			name: 'department_id',
			choices: departmentOptions
		},
	])
	.then(function (answer) {
		let query = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`
		db.query(query, [answer.title, answer.salary, answer.department_id], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}

// ------------------Update---------------------
// Update employee role
function updateEmployees() {
	let query = `SELECT * FROM roles`
	db.query(query, function (err, res) {
		if (err) throw err;
		const roleOptions = res.map(role => ({
			value: role.id, name: role.title
		}))
		getEmployees(roleOptions)
	});
}

function getEmployees(roleOptions) {
	let query = `SELECT * FROM employee`
	db.query(query, function (err, res) {
		if (err) throw err;
		const employeeOptions = res.map(employee => ({
			value: employee.id, name: employee.first_name
		}))
		updatePromptEmployees(roleOptions, employeeOptions)
	});
}

function updatePromptEmployees(roleOptions, employeeOptions) {
	inquirer.prompt([
		{
			type: 'list',
			message: 'Which employee has changed roles?',
			name: 'employee_id',
			choices: employeeOptions
		},
		{
			type: 'list',
			message: 'What role does this employee hold?',
			name: 'roles_id',
			choices: roleOptions
		},
	])
	.then(function (answer) {
		let query = `UPDATE employee SET roles_id = ? WHERE id = ?`
		db.query(query, [answer.roles_id, answer.employee_id,], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}

// Update manager
function updateEmployeeManager() {
	let query = `SELECT * FROM employee`
	db.query(query, function (err, res) {
		if (err) throw err;
		const managerOptions = res.map(manager => ({
			value: manager.id, name: manager.first_name
		}))
		getEmployees(managerOptions)
	});
}

function getEmployees(managerOptions) {
	let query = `SELECT * FROM employee`
	db.query(query, function (err, res) {
		if (err) throw err;
		const employeeOptions = res.map(employee => ({
			value: employee.id, name: employee.first_name
		}))
		updatePromptEmployees(managerOptions, employeeOptions)
	});
}

function updatePromptEmployees(managerOptions, employeeOptions) {
	inquirer.prompt([
		{
			type: 'list',
			message: 'Which employee has changed manager?',
			name: 'employee_id',
			choices: employeeOptions
		},
		{
			type: 'list',
			message: 'Who does the employee now report to?',
			name: 'manager_id',
			choices: managerOptions
		},
	])
	.then(function (answer) {
		let query = `UPDATE employee SET manager_id = ? WHERE id = ?`
		db.query(query, [answer.manager_id, answer.employee_id,], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}


// ------------------Delete---------------------
// Delete department
function deleteDept() {
	let query = `SELECT * FROM department`
	db.query(query, function (err, res) {
		if (err) throw err;
		const departmentOptions = res.map(department => ({
			value: department.id, name: department.name
		}))
		deleteDeptPrompt(departmentOptions)
	})
}

function deleteDeptPrompt(departmentOptions) {
	inquirer.prompt([
		{
			type: 'list',
			message: 'Which Department do you want to delete?',
			name: 'department_id',
			choices: departmentOptions
		},
	])
	.then(function (answer) {
		let query = `DELETE FROM department
		WHERE department.id = ?`
		db.query(query, [answer.department_id], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}

// Delete employee
function deleteEmployee() {
	let query = `SELECT * FROM employee`
	db.query(query, function (err, res) {
		if (err) throw err;
		const employeeOptions = res.map(employee => ({
			value: employee.id, name: employee.first_name
		}))
		deleteEmployeePrompt(employeeOptions)
	});
}

function deleteEmployeePrompt(employeeOptions) {
	inquirer.prompt([
		{
			type: 'list',
			message: 'Which employee do you want to delete?',
		    name: 'employee_id',
			choices: employeeOptions
		},
	])
	.then(function (answer) {
		let query = `DELETE FROM employee
		WHERE employee.id = ?`
		db.query(query, [answer.employee_id], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}

// Delete role
function deleteRoles() {
	let query = `SELECT * FROM roles`
	db.query(query, function (err, res) {
		if (err) throw err;
		const roleOptions = res.map(role => ({
			value: role.id, name: role.title
		}))
		deleterolePrompt(roleOptions)
	});
}

function deleterolePrompt(roleOptions) {
	inquirer.prompt([
		{
			type: 'list',
			message: 'Which role do you want to delete?',
			name: 'roles_id',
			choices: roleOptions
		},
	])
	.then(function (answer) {
		let query = `DELETE FROM roles
		WHERE roles.id = ?`
		db.query(query, [answer.roles_id], function (err, results) {
			if (err) throw err;
			startQuestions()
		});
	})
}