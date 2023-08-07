const fs = require('fs');
const path = require('path');
const credentials = require('./db/connection.json');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const { getAllDepartments, getAllRoles, getAllEmployees, insertDepartment, insertRole, insertEmployee, updateEmployeeRole } = require('./db/util');

function readSQL(filePath) {
    const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    return sql.replace(/(\r\n|\n|\r)/gm, ' ');
}

function splitSQLStatements(sql) {
    return sql.split(';');
}

const schemaSQL = splitSQLStatements(readSQL('db/schema.sql'));
const seedsSQL = splitSQLStatements(readSQL('db/seeds.sql'));
const intializeSQL = [...schemaSQL, ...seedsSQL];

async function initialize() {
    const connection = mysql.createConnection(credentials);

    try {
        for (const sql of intializeSQL) {
            if (sql.trim() !== "") {
                await connection.promise().query(sql);
            }
        }
        main(connection);
    }
    catch (error) {
        console.log(error);
    }
}

async function getInput(question) {
    return await inquirer
        .prompt([
            {
                type: 'input',
                name: 'value',
                message: question,
            },
        ])
        .then((input) => {
            return input.value;
        })
        .catch((error) => {
            console.error(error);
        });
}

async function getInputWithOptions(question, choices) {
    return await inquirer
        .prompt([
            {
                type: 'list',
                name: 'value',
                message: question,
                choices: choices,
            },
        ])
        .then((input) => {
            return input.value;
        })
        .catch((error) => {
            console.error(error);
        });
}


async function main(connection) {
    await inquirer
        .prompt([
            {
                type: 'list',
                name: 'option',
                message: 'What would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role'
                ],
            },
        ])
        .then(async (answers) => {
            switch (answers.option) {
                case 'View all departments':
                    await getAllDepartments(connection);
                    break;
                case 'View all roles':
                    await getAllRoles(connection);
                    break;
                case 'View all employees':
                    await getAllEmployees(connection);
                    break;
                case 'Add a department':
                    const name = await getInput("What would you like the Department name to be?")
                    await insertDepartment(connection, name);
                    break;
                case 'Add a role':
                    const newRoleName = await getInput("What would you like the Role name to be?")
                    const newSalary = await getInput("What would you like the Salary to be?")
                    const departmentOptions = await getAllDepartments(connection, true);
                    const departmentChoice = await getInputWithOptions(
                        "What department will this role be assigned to?",
                        departmentOptions.map(item => item.name)
                    );
                    const departmentId = departmentOptions.find((option) => option.name === departmentChoice).id;
                    await insertRole(connection, newRoleName, newSalary, departmentId)
                    break;
                case 'Add an employee':
                    const newFirstName = await getInput("What will be the employees first name?")
                    const newLastName = await getInput("What will be the employees last name?")
                    //Get Roles
                    const roleOptions = await getAllRoles(connection, true);
                    const roleChoice = await getInputWithOptions(
                        "What role will this employee be assigned to?",
                        roleOptions.map(item => item.title)
                    );
                    const roleId = roleOptions.find((option) => option.title === roleChoice).id;
                    //Get Employees
                    const managerOptions = await getAllEmployees(connection, true);
                    const managerChoice = await getInputWithOptions(
                        "Who will be this employees manager?",
                        ["None", ...managerOptions.map(manager => `${manager.first_name} ${manager.last_name}`)]
                    );
                    const managerId = managerChoice == "None" ? null : managerOptions.find((option) => (option.first_name + " " + option.last_name) === managerChoice).id;
                    await insertEmployee(connection, newFirstName, newLastName, roleId, managerId)
                    break;
                case 'Update an employee role':
                    const updateableEmployees = await getAllEmployees(connection, true);
                    const updateableRoles = await getAllRoles(connection, true);
                    const employeeChoice = await getInputWithOptions(
                        "Which employee would you like to update?",
                        updateableEmployees.map(employee => `${employee.first_name} ${employee.last_name}`)
                    );
                    const employeeId = updateableEmployees.find((option) => (option.first_name + " " + option.last_name) === employeeChoice).id;
                    const roleUpdateChoice = await getInputWithOptions(
                        "What role will this employee be assigned to?",
                        updateableRoles.map(item => item.title)
                    );
                    const updateRoleId = updateableRoles.find((option) => option.title === roleUpdateChoice).id;
                    await updateEmployeeRole(connection, updateRoleId, employeeId);
                    break;
                default:
                    console.log('Invalid option. Please try again.');
                    main(connection);
            }
            main(connection);
        })
        .catch((error) => {
            console.error(error);
            connection.end();
        });
}

initialize();