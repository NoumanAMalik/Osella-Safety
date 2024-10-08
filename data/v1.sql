PRAGMA foreign_keys = ON;

CREATE TABLE
    department (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        manager_id INTEGER,
        FOREIGN KEY (manager_id) REFERENCES employee (id)
    );

CREATE TABLE
    employee (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        department_id INTEGER,
        FOREIGN KEY (department_id) REFERENCES department (id)
    );

CREATE TABLE
    certification (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );

CREATE TABLE
    employee_certification (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        certification_id INTEGER NOT NULL,
        expiration_date TEXT,
        notification_email TEXT,
        FOREIGN KEY (employee_id) REFERENCES employee (id),
        FOREIGN KEY (certification_id) REFERENCES certification (id)
    );

CREATE INDEX idx_departments_manager_id ON department (manager_id);

CREATE INDEX idx_employees_department_id ON employee (department_id);

CREATE INDEX idx_employee_certifications_employee_id ON employee_certification (employee_id);

CREATE INDEX idx_employee_certifications_certification_id ON employee_certification (certification_id);

CREATE INDEX idx_employee_certifications_expiration_date ON employee_certification (expiration_date);