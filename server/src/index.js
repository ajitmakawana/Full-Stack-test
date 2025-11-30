const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'your-secret-key-change-in-production';

// ============ MOCK DATA ============

// Users with roles
let users = [
  {
    id: '1',
    email: 'admin@company.com',
    password: '$2a$10$rQEY9zS8rnXPZKxK8XK8XOQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', // admin123
    name: 'Admin User',
    role: 'ADMIN',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    email: 'employee@company.com',
    password: '$2a$10$rQEY9zS8rnXPZKxK8XK8XOQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', // employee123
    name: 'Employee User',
    role: 'EMPLOYEE',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    email: 'john@company.com',
    password: '$2a$10$rQEY9zS8rnXPZKxK8XK8XOQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', // john123
    name: 'John Manager',
    role: 'EMPLOYEE',
    createdAt: '2024-01-15'
  }
];

// Employee Data
let employees = [
  {
    id: '1',
    name: 'John Smith',
    age: 28,
    email: 'john.smith@company.com',
    department: 'Engineering',
    position: 'Senior Developer',
    class: 'A',
    subjects: ['JavaScript', 'React', 'Node.js'],
    attendance: 95,
    salary: 85000,
    joinDate: '2021-03-15',
    status: 'Active',
    phone: '+1-555-0101',
    address: '123 Tech Street, San Francisco, CA'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    age: 32,
    email: 'sarah.j@company.com',
    department: 'Design',
    position: 'UI/UX Lead',
    class: 'A',
    subjects: ['Figma', 'Adobe XD', 'CSS'],
    attendance: 98,
    salary: 90000,
    joinDate: '2020-07-22',
    status: 'Active',
    phone: '+1-555-0102',
    address: '456 Design Ave, New York, NY'
  },
  {
    id: '3',
    name: 'Michael Brown',
    age: 35,
    email: 'michael.b@company.com',
    department: 'Management',
    position: 'Project Manager',
    class: 'B',
    subjects: ['Agile', 'Scrum', 'Leadership'],
    attendance: 92,
    salary: 95000,
    joinDate: '2019-01-10',
    status: 'Active',
    phone: '+1-555-0103',
    address: '789 Manager Blvd, Chicago, IL'
  },
  {
    id: '4',
    name: 'Emily Davis',
    age: 26,
    email: 'emily.d@company.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    class: 'B',
    subjects: ['React', 'Vue', 'TypeScript'],
    attendance: 88,
    salary: 70000,
    joinDate: '2022-05-01',
    status: 'Active',
    phone: '+1-555-0104',
    address: '321 Code Lane, Austin, TX'
  },
  {
    id: '5',
    name: 'David Wilson',
    age: 40,
    email: 'david.w@company.com',
    department: 'HR',
    position: 'HR Director',
    class: 'A',
    subjects: ['Recruitment', 'Training', 'Policy'],
    attendance: 96,
    salary: 88000,
    joinDate: '2018-09-05',
    status: 'Active',
    phone: '+1-555-0105',
    address: '654 People St, Seattle, WA'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    age: 29,
    email: 'lisa.a@company.com',
    department: 'Marketing',
    position: 'Marketing Specialist',
    class: 'B',
    subjects: ['SEO', 'Content', 'Analytics'],
    attendance: 91,
    salary: 65000,
    joinDate: '2021-11-20',
    status: 'Active',
    phone: '+1-555-0106',
    address: '987 Market Way, Boston, MA'
  },
  {
    id: '7',
    name: 'James Taylor',
    age: 33,
    email: 'james.t@company.com',
    department: 'Engineering',
    position: 'Backend Developer',
    class: 'A',
    subjects: ['Python', 'GraphQL', 'PostgreSQL'],
    attendance: 94,
    salary: 82000,
    joinDate: '2020-02-14',
    status: 'Active',
    phone: '+1-555-0107',
    address: '147 Server Rd, Denver, CO'
  },
  {
    id: '8',
    name: 'Jennifer Martinez',
    age: 27,
    email: 'jennifer.m@company.com',
    department: 'Design',
    position: 'Graphic Designer',
    class: 'B',
    subjects: ['Illustrator', 'Photoshop', 'Branding'],
    attendance: 89,
    salary: 60000,
    joinDate: '2022-08-30',
    status: 'On Leave',
    phone: '+1-555-0108',
    address: '258 Art Blvd, Portland, OR'
  },
  {
    id: '9',
    name: 'Robert Garcia',
    age: 45,
    email: 'robert.g@company.com',
    department: 'Finance',
    position: 'Financial Analyst',
    class: 'A',
    subjects: ['Accounting', 'Excel', 'Forecasting'],
    attendance: 97,
    salary: 92000,
    joinDate: '2017-04-18',
    status: 'Active',
    phone: '+1-555-0109',
    address: '369 Finance Dr, Miami, FL'
  },
  {
    id: '10',
    name: 'Amanda White',
    age: 31,
    email: 'amanda.w@company.com',
    department: 'Engineering',
    position: 'DevOps Engineer',
    class: 'A',
    subjects: ['AWS', 'Docker', 'Kubernetes'],
    attendance: 93,
    salary: 88000,
    joinDate: '2020-10-12',
    status: 'Active',
    phone: '+1-555-0110',
    address: '741 Cloud Ave, San Jose, CA'
  },
  {
    id: '11',
    name: 'Chris Thompson',
    age: 38,
    email: 'chris.t@company.com',
    department: 'Engineering',
    position: 'Tech Lead',
    class: 'A',
    subjects: ['Architecture', 'Java', 'Microservices'],
    attendance: 96,
    salary: 105000,
    joinDate: '2018-03-20',
    status: 'Active',
    phone: '+1-555-0111',
    address: '852 Lead Way, San Diego, CA'
  },
  {
    id: '12',
    name: 'Michelle Lee',
    age: 29,
    email: 'michelle.l@company.com',
    department: 'Marketing',
    position: 'Content Manager',
    class: 'B',
    subjects: ['Copywriting', 'Social Media', 'Strategy'],
    attendance: 94,
    salary: 72000,
    joinDate: '2021-06-15',
    status: 'Active',
    phone: '+1-555-0112',
    address: '963 Content Blvd, Los Angeles, CA'
  },
  {
    id: '13',
    name: 'Daniel Harris',
    age: 34,
    email: 'daniel.h@company.com',
    department: 'Engineering',
    position: 'Full Stack Developer',
    class: 'A',
    subjects: ['Node.js', 'React', 'MongoDB'],
    attendance: 91,
    salary: 87000,
    joinDate: '2020-08-10',
    status: 'Active',
    phone: '+1-555-0113',
    address: '111 Stack St, Phoenix, AZ'
  },
  {
    id: '14',
    name: 'Jessica Clark',
    age: 28,
    email: 'jessica.c@company.com',
    department: 'HR',
    position: 'Recruiter',
    class: 'B',
    subjects: ['Sourcing', 'Interviewing', 'Onboarding'],
    attendance: 95,
    salary: 58000,
    joinDate: '2022-01-15',
    status: 'Active',
    phone: '+1-555-0114',
    address: '222 Talent Ave, Atlanta, GA'
  },
  {
    id: '15',
    name: 'Kevin Rodriguez',
    age: 42,
    email: 'kevin.r@company.com',
    department: 'Finance',
    position: 'Senior Accountant',
    class: 'A',
    subjects: ['Tax', 'Auditing', 'Compliance'],
    attendance: 98,
    salary: 95000,
    joinDate: '2016-05-20',
    status: 'Active',
    phone: '+1-555-0115',
    address: '333 Ledger Ln, Dallas, TX'
  },
  {
    id: '16',
    name: 'Ashley Moore',
    age: 26,
    email: 'ashley.m@company.com',
    department: 'Design',
    position: 'Motion Designer',
    class: 'B',
    subjects: ['After Effects', 'Cinema 4D', 'Animation'],
    attendance: 87,
    salary: 62000,
    joinDate: '2023-02-01',
    status: 'Active',
    phone: '+1-555-0116',
    address: '444 Motion Blvd, Nashville, TN'
  },
  {
    id: '17',
    name: 'Brandon King',
    age: 36,
    email: 'brandon.k@company.com',
    department: 'Engineering',
    position: 'Security Engineer',
    class: 'A',
    subjects: ['Cybersecurity', 'Penetration Testing', 'SIEM'],
    attendance: 94,
    salary: 98000,
    joinDate: '2019-07-08',
    status: 'Active',
    phone: '+1-555-0117',
    address: '555 Secure Way, Washington, DC'
  },
  {
    id: '18',
    name: 'Stephanie Wright',
    age: 31,
    email: 'stephanie.w@company.com',
    department: 'Marketing',
    position: 'Brand Manager',
    class: 'A',
    subjects: ['Brand Strategy', 'Market Research', 'Campaign Management'],
    attendance: 92,
    salary: 78000,
    joinDate: '2020-11-30',
    status: 'Active',
    phone: '+1-555-0118',
    address: '666 Brand St, Minneapolis, MN'
  },
  {
    id: '19',
    name: 'Ryan Lopez',
    age: 29,
    email: 'ryan.l@company.com',
    department: 'Engineering',
    position: 'Mobile Developer',
    class: 'B',
    subjects: ['React Native', 'Swift', 'Kotlin'],
    attendance: 89,
    salary: 82000,
    joinDate: '2021-04-12',
    status: 'Active',
    phone: '+1-555-0119',
    address: '777 Mobile Dr, San Antonio, TX'
  },
  {
    id: '20',
    name: 'Nicole Hill',
    age: 33,
    email: 'nicole.h@company.com',
    department: 'Management',
    position: 'Operations Manager',
    class: 'A',
    subjects: ['Process Optimization', 'Logistics', 'Team Management'],
    attendance: 96,
    salary: 88000,
    joinDate: '2019-09-15',
    status: 'Active',
    phone: '+1-555-0120',
    address: '888 Operations Blvd, Philadelphia, PA'
  },
  {
    id: '21',
    name: 'Justin Scott',
    age: 27,
    email: 'justin.s@company.com',
    department: 'Engineering',
    position: 'QA Engineer',
    class: 'B',
    subjects: ['Selenium', 'Jest', 'Cypress'],
    attendance: 90,
    salary: 68000,
    joinDate: '2022-06-20',
    status: 'Active',
    phone: '+1-555-0121',
    address: '999 Test Lane, Columbus, OH'
  },
  {
    id: '22',
    name: 'Rachel Green',
    age: 30,
    email: 'rachel.g@company.com',
    department: 'Design',
    position: 'Product Designer',
    class: 'A',
    subjects: ['User Research', 'Prototyping', 'Design Systems'],
    attendance: 93,
    salary: 85000,
    joinDate: '2020-03-25',
    status: 'Active',
    phone: '+1-555-0122',
    address: '1010 Design Circle, San Jose, CA'
  },
  {
    id: '23',
    name: 'Tyler Adams',
    age: 38,
    email: 'tyler.a@company.com',
    department: 'Finance',
    position: 'Budget Analyst',
    class: 'B',
    subjects: ['Budgeting', 'Financial Planning', 'Cost Analysis'],
    attendance: 94,
    salary: 75000,
    joinDate: '2018-12-01',
    status: 'On Leave',
    phone: '+1-555-0123',
    address: '1111 Budget Blvd, Charlotte, NC'
  },
  {
    id: '24',
    name: 'Samantha Baker',
    age: 25,
    email: 'samantha.b@company.com',
    department: 'Marketing',
    position: 'Social Media Specialist',
    class: 'B',
    subjects: ['Instagram', 'TikTok', 'Content Creation'],
    attendance: 88,
    salary: 52000,
    joinDate: '2023-01-10',
    status: 'Active',
    phone: '+1-555-0124',
    address: '1212 Social St, Orlando, FL'
  },
  {
    id: '25',
    name: 'Eric Nelson',
    age: 44,
    email: 'eric.n@company.com',
    department: 'Management',
    position: 'VP of Engineering',
    class: 'A',
    subjects: ['Strategic Planning', 'Team Building', 'Technical Vision'],
    attendance: 97,
    salary: 150000,
    joinDate: '2015-06-01',
    status: 'Active',
    phone: '+1-555-0125',
    address: '1313 Executive Way, Palo Alto, CA'
  },
  {
    id: '26',
    name: 'Laura Mitchell',
    age: 32,
    email: 'laura.m@company.com',
    department: 'HR',
    position: 'Training Coordinator',
    class: 'B',
    subjects: ['Learning Development', 'Workshop Facilitation', 'E-Learning'],
    attendance: 91,
    salary: 62000,
    joinDate: '2021-08-15',
    status: 'Active',
    phone: '+1-555-0126',
    address: '1414 Training Terrace, Raleigh, NC'
  },
  {
    id: '27',
    name: 'Andrew Perez',
    age: 29,
    email: 'andrew.p@company.com',
    department: 'Engineering',
    position: 'Data Engineer',
    class: 'A',
    subjects: ['Spark', 'Airflow', 'Data Pipelines'],
    attendance: 92,
    salary: 95000,
    joinDate: '2020-05-18',
    status: 'Active',
    phone: '+1-555-0127',
    address: '1515 Data Drive, Austin, TX'
  },
  {
    id: '28',
    name: 'Megan Roberts',
    age: 27,
    email: 'megan.r@company.com',
    department: 'Design',
    position: 'UX Researcher',
    class: 'B',
    subjects: ['User Testing', 'Surveys', 'Analytics'],
    attendance: 89,
    salary: 70000,
    joinDate: '2022-03-07',
    status: 'Active',
    phone: '+1-555-0128',
    address: '1616 Research Rd, Portland, OR'
  },
  {
    id: '29',
    name: 'Christopher Turner',
    age: 41,
    email: 'chris.t2@company.com',
    department: 'Finance',
    position: 'Controller',
    class: 'A',
    subjects: ['Financial Reporting', 'Internal Controls', 'GAAP'],
    attendance: 99,
    salary: 120000,
    joinDate: '2017-02-14',
    status: 'Active',
    phone: '+1-555-0129',
    address: '1717 Controller Ct, Chicago, IL'
  },
  {
    id: '30',
    name: 'Amanda Phillips',
    age: 35,
    email: 'amanda.p@company.com',
    department: 'Engineering',
    position: 'Solutions Architect',
    class: 'A',
    subjects: ['Cloud Architecture', 'System Design', 'Integration'],
    attendance: 95,
    salary: 125000,
    joinDate: '2018-10-22',
    status: 'Active',
    phone: '+1-555-0130',
    address: '1818 Architecture Ave, Seattle, WA'
  }
];

// ============ GRAPHQL SCHEMA ============

const typeDefs = `#graphql
  enum Role {
    ADMIN
    EMPLOYEE
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Employee {
    id: ID!
    name: String!
    age: Int!
    email: String!
    department: String!
    position: String!
    class: String!
    subjects: [String!]!
    attendance: Int!
    salary: Int!
    joinDate: String!
    status: String!
    phone: String!
    address: String!
  }

  type PageInfo {
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type EmployeesResponse {
    employees: [Employee!]!
    pageInfo: PageInfo!
  }

  input EmployeeFilter {
    department: String
    class: String
    status: String
    minAge: Int
    maxAge: Int
    minAttendance: Int
    search: String
  }

  enum SortField {
    NAME
    AGE
    DEPARTMENT
    ATTENDANCE
    SALARY
    JOIN_DATE
  }

  enum SortOrder {
    ASC
    DESC
  }

  input SortInput {
    field: SortField!
    order: SortOrder!
  }

  type Query {
    # Auth
    me: User

    # Employees - Available to both ADMIN and EMPLOYEE
    employees: [Employee!]!
    employee(id: ID!): Employee
    employeesFiltered(filter: EmployeeFilter): [Employee!]!
    employeesPaginated(
      page: Int = 1
      limit: Int = 5
      filter: EmployeeFilter
      sort: SortInput
    ): EmployeesResponse!
  }

  type Mutation {
    # Auth - Public
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!

    # Employee Management - ADMIN ONLY
    addEmployee(
      name: String!
      age: Int!
      email: String!
      department: String!
      position: String!
      class: String!
      subjects: [String!]!
      attendance: Int!
      salary: Int!
      phone: String!
      address: String!
    ): Employee!

    updateEmployee(
      id: ID!
      name: String
      age: Int
      email: String
      department: String
      position: String
      class: String
      subjects: [String!]
      attendance: Int
      salary: Int
      status: String
      phone: String
      address: String
    ): Employee

    deleteEmployee(id: ID!): Employee

    # Flag - ADMIN ONLY
    flagEmployee(id: ID!, status: String!): Employee
  }
`;

// ============ HELPER FUNCTIONS ============

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const applyFilters = (employeeList, filter) => {
  if (!filter) return employeeList;
  let filtered = [...employeeList];

  if (filter.department) {
    filtered = filtered.filter(emp =>
      emp.department.toLowerCase() === filter.department.toLowerCase()
    );
  }
  if (filter.class) {
    filtered = filtered.filter(emp => emp.class === filter.class);
  }
  if (filter.status) {
    filtered = filtered.filter(emp =>
      emp.status.toLowerCase() === filter.status.toLowerCase()
    );
  }
  if (filter.minAge !== undefined) {
    filtered = filtered.filter(emp => emp.age >= filter.minAge);
  }
  if (filter.maxAge !== undefined) {
    filtered = filtered.filter(emp => emp.age <= filter.maxAge);
  }
  if (filter.minAttendance !== undefined) {
    filtered = filtered.filter(emp => emp.attendance >= filter.minAttendance);
  }
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(emp =>
      emp.name.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower) ||
      emp.position.toLowerCase().includes(searchLower)
    );
  }
  return filtered;
};

const applySorting = (employeeList, sort) => {
  if (!sort) return employeeList;
  const sorted = [...employeeList];
  const multiplier = sort.order === 'ASC' ? 1 : -1;

  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sort.field) {
      case 'NAME': comparison = a.name.localeCompare(b.name); break;
      case 'AGE': comparison = a.age - b.age; break;
      case 'DEPARTMENT': comparison = a.department.localeCompare(b.department); break;
      case 'ATTENDANCE': comparison = a.attendance - b.attendance; break;
      case 'SALARY': comparison = a.salary - b.salary; break;
      case 'JOIN_DATE': comparison = new Date(a.joinDate) - new Date(b.joinDate); break;
      default: comparison = 0;
    }
    return comparison * multiplier;
  });
  return sorted;
};

// ============ AUTH HELPERS ============

const requireAuth = (context) => {
  if (!context.user) {
    throw new Error('Authentication required. Please login.');
  }
  return context.user;
};

const requireAdmin = (context) => {
  const user = requireAuth(context);
  if (user.role !== 'ADMIN') {
    throw new Error('Access denied. Admin privileges required.');
  }
  return user;
};

// ============ RESOLVERS ============

const resolvers = {
  Query: {
    // Get current user
    me: (_, __, context) => {
      if (!context.user) return null;
      const user = users.find(u => u.id === context.user.id);
      if (!user) return null;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    // Employees - Requires authentication (both Admin and Employee can view)
    employees: (_, __, context) => {
      requireAuth(context);
      return employees;
    },

    employee: (_, { id }, context) => {
      requireAuth(context);
      return employees.find(emp => emp.id === id);
    },

    employeesFiltered: (_, { filter }, context) => {
      requireAuth(context);
      return applyFilters(employees, filter);
    },

    employeesPaginated: (_, { page = 1, limit = 5, filter, sort }, context) => {
      requireAuth(context);

      let result = applyFilters(employees, filter);
      result = applySorting(result, sort);

      const totalCount = result.length;
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.min(Math.max(1, page), totalPages || 1);
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEmployees = result.slice(startIndex, endIndex);

      return {
        employees: paginatedEmployees,
        pageInfo: {
          totalCount,
          totalPages,
          currentPage,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1
        }
      };
    }
  },

  Mutation: {
    // Login - Public
    login: async (parent, { email, password }) => {
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // For demo, accept simple passwords
      const validPasswords = {
        'admin@company.com': 'admin123',
        'employee@company.com': 'employee123',
        'john@company.com': 'john123'
      };

      if (validPasswords[email] !== password) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user);
      const { password: pwd, ...userWithoutPassword } = user;

      return { token, user: userWithoutPassword };
    },

    // Register - Public (creates EMPLOYEE role by default)
    register: async (parent, { email, password, name }) => {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: String(users.length + 1),
        email,
        password: hashedPassword,
        name,
        role: 'EMPLOYEE', // New users are employees by default
        createdAt: new Date().toISOString().split('T')[0]
      };

      users.push(newUser);
      const token = generateToken(newUser);
      const { password: pwd, ...userWithoutPassword } = newUser;

      return { token, user: userWithoutPassword };
    },

    // Add Employee - ADMIN ONLY
    addEmployee: (_, args, context) => {
      requireAdmin(context);

      const newEmployee = {
        id: String(Date.now()),
        ...args,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      employees.push(newEmployee);
      return newEmployee;
    },

    // Update Employee - ADMIN ONLY
    updateEmployee: (_, { id, ...updates }, context) => {
      requireAdmin(context);

      const index = employees.findIndex(emp => emp.id === id);
      if (index === -1) return null;

      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      employees[index] = { ...employees[index], ...cleanUpdates };
      return employees[index];
    },

    // Delete Employee - ADMIN ONLY
    deleteEmployee: (_, { id }, context) => {
      requireAdmin(context);

      const index = employees.findIndex(emp => emp.id === id);
      if (index === -1) return null;

      const deleted = employees.splice(index, 1)[0];
      return deleted;
    },

    // Flag Employee - ADMIN ONLY
    flagEmployee: (_, { id, status }, context) => {
      requireAdmin(context);

      const employee = employees.find(emp => emp.id === id);
      if (!employee) return null;

      employee.status = status;
      return employee;
    }
  }
};

// ============ SERVER SETUP ============

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.CLIENT_URL,
        /\.netlify\.app$/
      ].filter(Boolean),
      credentials: true
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '') || '';
        const user = verifyToken(token);
        return { user };
      }
    })
  );

  const PORT = process.env.PORT || 4000;
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`
  🚀 GraphQL Server ready at http://localhost:4000/graphql

  ========================================
  🔐 AUTHENTICATION & AUTHORIZATION
  ========================================

  LOGIN CREDENTIALS:

  👑 ADMIN (Full Access):
     Email: admin@company.com
     Password: admin123

  👤 EMPLOYEE (Limited Access):
     Email: employee@company.com
     Password: employee123

  ========================================
  📋 ROLE PERMISSIONS
  ========================================

  ADMIN can:
  ✅ View all employees
  ✅ Add new employees
  ✅ Update employees
  ✅ Delete employees
  ✅ Flag/Change employee status

  EMPLOYEE can:
  ✅ View all employees
  ❌ Cannot add employees
  ❌ Cannot update employees
  ❌ Cannot delete employees
  ❌ Cannot flag employees

  ========================================
  `);
}

startServer();
