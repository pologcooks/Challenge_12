async function getAllDepartments(connection, returnArray) {
    const query = 'SELECT id, name FROM department';
    let [results] = await connection.promise().query(query);

    if (returnArray) {
        return results;
    } else {
        console.table(results);
    }
}

async function getAllRoles(connection, returnArray) {
    const query = 'SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;';
    let [results] = await connection.promise().query(query);

    if (returnArray) {
        return results;
    } else {
        console.table(results);
    }
}

async function getAllEmployees(connection, returnArray) {
    const query = `
    SELECT
    e.id,
    e.first_name,
    e.last_name,
    r.title AS role_name,
    d.name AS department,
    r.salary AS salary,
    CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN employee m ON e.manager_id = m.id
    LEFT JOIN department d ON r.department_id = d.id
    `;
    let [results] = await connection.promise().query(query);

    if (returnArray) {
        return results;
    } else {
        console.table(results);
    }
}

async function insertDepartment(connection, name) {
    try {
        const query = 'INSERT INTO department (name) VALUES (?)';
        const [result] = await connection.promise().query(query, [name]);
        console.log('Department added to database!');
    } catch (error) {
        console.error('Error inserting department:', error);
        throw error;
    }
}

async function insertRole(connection, name, salary, department_id) {
    try {
        const query = 'INSERT INTO role (title,salary,department_id) VALUES (?, ?, ?)';
        const [result] = await connection.promise().query(query, [name, parseFloat(salary), parseInt(department_id)]);
        console.log('Role added to database!');
    } catch (error) {
        console.error('Error inserting role:', error);
        throw error;
    }
}

async function updateEmployeeRole(connection, roleid, employeeid) {
    try {
        const query = 'Update employee set role_id = ? where id = ?';
        const [result] = await connection.promise().query(query, [roleid, employeeid]);
        console.log('Updated employees role!');
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
}

async function insertEmployee(connection, first, last, role, manager) {
    try {
        const query = 'INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?, ?, ?,?)';
        const [result] = await connection.promise().query(query, [first, last, role, manager]);
        console.log('Employee added to database!');
    } catch (error) {
        console.error('Error inserting employee:', error);
        throw error;
    }
}


module.exports = {
    getAllDepartments,
    getAllEmployees,
    getAllRoles,
    insertDepartment,
    insertRole,
    insertEmployee,
    updateEmployeeRole
};