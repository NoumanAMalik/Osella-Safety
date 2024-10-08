CREATE TABLE
    company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        contact TEXT
    );

CREATE INDEX idx_company_name ON company (name);

CREATE TABLE
    company_file (
        file_key TEXT NOT NULL UNIQUE,
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_filename TEXT,
        file_type TEXT,
        file_size TEXT,
        upload_date TEXT,
        expiration_date TEXT,
        file_category TEXT,
        company_id INTEGER NOT NULL,
        FOREIGN KEY (company_id) REFERENCES company (id)
    );

CREATE TABLE
    job (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        location TEXT,
        map_link TEXT,
        contact TEXT,
    );

CREATE TABLE
    job_company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        FOREIGN KEY (job_id) REFERENCES job (id),
        FOREIGN KEY (company_id) REFERENCES company (id)
    );

CREATE TABLE
    employee (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        company_id INTEGER NOT NULL,
        FOREIGN KEY (company_id) REFERENCES company (id)
    );

CREATE INDEX idx_employee_company_id ON employee (company_id);

CREATE INDEX idx_employee_phone_number ON employee (phone_number);

CREATE TABLE
    employee_file (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_filename TEXT,
        file_key TEXT NOT NULL UNIQUE,
        file_type TEXT,
        file_size TEXT,
        upload_date DATETIME,
        expiration_date DATETIME,
        employee_id INTEGER NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employee (id)
    );

CREATE TABLE
    company_contact (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        company_id INTEGER NOT NULL,
        FOREIGN KEY (company_id) REFERENCES company (id)
    );

CREATE INDEX idx_employee_file_employee_id ON employee_file (employee_id);

CREATE INDEX idx_employee_file_upload_date ON employee_file (upload_date);

CREATE INDEX idx_employee_file_expiration_date ON employee_file (expiration_date);