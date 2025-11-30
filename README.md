# Employee Management System

Full-stack application with React frontend and GraphQL backend with JWT Authentication & Role-Based Access Control.

## Live Demo

- **Frontend (Netlify)**: [Your Netlify URL]
- **Backend (Render/Railway)**: [Your Backend URL]

---

## Authentication & Authorization

### Login Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| ADMIN | admin@company.com | admin123 | Full access (View, Add, Edit, Delete, Flag) |
| EMPLOYEE | employee@company.com | employee123 | View only |

### Role-Based Features

**ADMIN can:**
- View all employees
- Add new employees
- Update employee details
- Delete employees
- Flag/Change employee status

**EMPLOYEE can:**
- View all employees (read-only)

---

## Quick Start - Local Development

```bash
cd employee-management

# Install all dependencies (root, server, and client)
npm run install-all

# Run both server and client together
npm run dev
```

- **Backend GraphQL**: http://localhost:4000/graphql
- **Frontend React**: http://localhost:3000

---

## Deployment

### Frontend - Netlify

The frontend is configured for Netlify deployment:

1. Connect your GitHub repo to Netlify
2. Set build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
3. Add environment variable:
   - `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.onrender.com/graphql`)

### Backend - Render/Railway

Deploy the backend to Render, Railway, or any Node.js hosting:

1. Set root directory to `server`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables:
   - `JWT_SECRET` = Your secret key
   - `PORT` = 4000

---

## Backend Features (GraphQL API)

### Data Model
```graphql
type Employee {
  id: ID!
  name: String!
  age: Int!
  email: String!
  department: String!
  position: String!
  class: String!           # Class A or B
  subjects: [String!]!     # Skills/Subjects
  attendance: Int!         # Percentage
  salary: Int!
  joinDate: String!
  status: String!
  phone: String!
  address: String!
}

type User {
  id: ID!
  email: String!
  name: String!
  role: Role!              # ADMIN or EMPLOYEE
}
```

### Authentication Mutations

#### Login
```graphql
mutation {
  login(email: "admin@company.com", password: "admin123") {
    token
    user {
      id
      name
      role
    }
  }
}
```

#### Register (Creates EMPLOYEE role)
```graphql
mutation {
  register(email: "new@company.com", password: "password123", name: "New User") {
    token
    user {
      id
      name
      role
    }
  }
}
```

### Queries (Requires Authentication)

#### 1. Get Current User
```graphql
query {
  me {
    id
    name
    email
    role
  }
}
```

#### 2. List All Employees
```graphql
query {
  employees {
    id
    name
    department
    attendance
  }
}
```

#### 3. Get Single Employee by ID
```graphql
query {
  employee(id: "1") {
    id
    name
    email
    subjects
    attendance
    address
  }
}
```

#### 4. List Employees with Optional Filters
```graphql
query {
  employeesFiltered(filter: {
    department: "Engineering"
    class: "A"
    minAttendance: 90
    search: "John"
  }) {
    id
    name
    department
    attendance
  }
}
```

**Available Filters:**
- `department` - Filter by department name
- `class` - Filter by class (A or B)
- `status` - Filter by status (Active, On Leave, etc.)
- `minAge` / `maxAge` - Filter by age range
- `minAttendance` - Filter by minimum attendance
- `search` - Search in name, email, department, position

#### 5. List Employees with Pagination & Sorting
```graphql
query {
  employeesPaginated(
    page: 1
    limit: 5
    filter: { department: "Engineering" }
    sort: { field: NAME, order: ASC }
  ) {
    employees {
      id
      name
      department
      attendance
    }
    pageInfo {
      totalCount
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
}
```

**Sort Fields:** `NAME`, `AGE`, `DEPARTMENT`, `ATTENDANCE`, `SALARY`, `JOIN_DATE`
**Sort Order:** `ASC`, `DESC`

### Mutations (ADMIN Only)

#### 1. Add New Employee
```graphql
mutation {
  addEmployee(
    name: "New Employee"
    age: 30
    email: "new@company.com"
    department: "Engineering"
    position: "Developer"
    class: "A"
    subjects: ["JavaScript", "React"]
    attendance: 95
    salary: 75000
    phone: "+1-555-0199"
    address: "123 New St, City, ST"
  ) {
    id
    name
    status
  }
}
```

#### 2. Update Employee
```graphql
mutation {
  updateEmployee(
    id: "1"
    name: "John Smith Updated"
    attendance: 98
    salary: 90000
  ) {
    id
    name
    attendance
    salary
  }
}
```

#### 3. Delete Employee
```graphql
mutation {
  deleteEmployee(id: "1") {
    id
    name
  }
}
```

#### 4. Flag/Change Status
```graphql
mutation {
  flagEmployee(id: "1", status: "On Leave") {
    id
    name
    status
  }
}
```

---

## Frontend Features

- **Login Page** - Secure authentication with demo credentials displayed
- **Role-Based UI** - Admin sees action buttons, Employee sees view-only
- **Hamburger Menu** - Collapsible sidebar with one-level deep submenus
- **Horizontal Menu** - Top navigation with Dashboard, Employees, Reports, Settings
- **Grid View** - Table with 10 columns + Actions (Admin only)
- **Tile View** - Card layout showing essential employee info
- **Bun Button** - Each tile has action menu (Edit, Flag, Mark Leave, Delete) - Admin only
- **Detail Modal** - Click any employee to see full details in popup
- **Pagination** - Navigate through pages with First, Prev, Next, Last buttons
- **Filtering** - Filter by department
- **Sorting** - Sort by name, age, department, attendance, salary, join date
- **User Info** - Shows current user and role in header with logout button

---

## Project Structure

```
employee-management/
├── package.json              # Root - runs both with concurrently
├── netlify.toml              # Netlify deployment config
├── README.md
├── server/                   # GraphQL Backend
│   ├── package.json
│   └── src/
│       └── index.js          # Apollo Server + Auth + Schema + Resolvers
└── client/                   # React Frontend
    ├── package.json
    ├── vite.config.js
    ├── netlify.toml          # Client Netlify config
    ├── _redirects             # SPA routing for Netlify
    ├── index.html
    └── src/
        ├── main.jsx          # Apollo Client setup with Auth
        ├── index.css         # All styles
        └── App.jsx           # Main component with Login
```

---

## API Summary Table

| Feature | Query/Mutation | Auth Required | Admin Only |
|---------|---------------|---------------|------------|
| Login | `login(email, password)` | No | No |
| Register | `register(email, password, name)` | No | No |
| Current User | `me` | Yes | No |
| List all | `employees` | Yes | No |
| Get one | `employee(id)` | Yes | No |
| Filter | `employeesFiltered(filter)` | Yes | No |
| Paginate & Sort | `employeesPaginated(...)` | Yes | No |
| Add | `addEmployee(...)` | Yes | Yes |
| Update | `updateEmployee(id, ...)` | Yes | Yes |
| Delete | `deleteEmployee(id)` | Yes | Yes |
| Flag | `flagEmployee(id, status)` | Yes | Yes |

---

## Tech Stack

**Frontend:**
- React 18
- Vite
- Apollo Client
- CSS3

**Backend:**
- Node.js
- Express
- Apollo Server 4
- GraphQL
- JWT (jsonwebtoken)
- bcryptjs
