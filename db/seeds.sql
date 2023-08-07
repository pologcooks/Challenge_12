INSERT INTO department (name) VALUES
  ('Men''s Shoes'),
  ('Women''s Shoes');

INSERT INTO role (title, salary, department_id) VALUES
  ('Sales Associate', 35000, 1),
  ('Sales Associate', 35000, 2),
  ('Store Manager', 60000, 1),
  ('Store Manager', 60000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('Ralph', 'Recinto', 4, NULL),
  ('Polo', 'Cooks', 1, 1);
