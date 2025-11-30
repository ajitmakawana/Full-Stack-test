import { useState, useEffect } from 'react'
import { useQuery, useMutation, gql, useApolloClient } from '@apollo/client'

// GraphQL Auth Queries & Mutations
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`

const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
    }
  }
`

// GraphQL Queries
const GET_EMPLOYEES_PAGINATED = gql`
  query GetEmployeesPaginated($page: Int!, $limit: Int!, $filter: EmployeeFilter, $sort: SortInput) {
    employeesPaginated(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      employees {
        id
        name
        age
        email
        department
        position
        class
        subjects
        attendance
        salary
        joinDate
        status
        phone
        address
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
`

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id) {
      id
    }
  }
`

const FLAG_EMPLOYEE = gql`
  mutation FlagEmployee($id: ID!, $status: String!) {
    flagEmployee(id: $id, status: $status) {
      id
      status
    }
  }
`

function App() {
  const client = useApolloClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState('tile')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  // Filter & Sort state
  const [filterDepartment, setFilterDepartment] = useState('')
  const [sortField, setSortField] = useState('NAME')
  const [sortOrder, setSortOrder] = useState('ASC')

  const [login] = useMutation(LOGIN_MUTATION)
  const { data: meData, refetch: refetchMe } = useQuery(GET_ME, {
    skip: !localStorage.getItem('authToken'),
    onCompleted: (data) => {
      if (data?.me) {
        setCurrentUser(data.me)
        setIsAuthenticated(true)
      }
    },
    onError: () => {
      localStorage.removeItem('authToken')
      setIsAuthenticated(false)
      setCurrentUser(null)
    }
  })

  const { loading, error, data, refetch } = useQuery(GET_EMPLOYEES_PAGINATED, {
    variables: {
      page: currentPage,
      limit: itemsPerPage,
      filter: filterDepartment ? { department: filterDepartment } : null,
      sort: { field: sortField, order: sortOrder }
    },
    skip: !isAuthenticated
  })

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE)
  const [flagEmployee] = useMutation(FLAG_EMPLOYEE)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      refetchMe()
    }
  }, [refetchMe])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')

    try {
      const { data } = await login({
        variables: { email: loginEmail, password: loginPassword }
      })

      if (data?.login) {
        localStorage.setItem('authToken', data.login.token)
        setCurrentUser(data.login.user)
        setIsAuthenticated(true)
        setLoginEmail('')
        setLoginPassword('')
        // Reset Apollo cache and refetch
        await client.resetStore()
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed')
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
    setCurrentUser(null)
    setMenuOpen(false)
    await client.resetStore()
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    {
      id: 'employees',
      label: 'Employees',
      icon: '👥',
      submenu: [
        { id: 'all', label: 'All Employees' },
        { id: 'active', label: 'Active' },
        { id: 'onleave', label: 'On Leave' }
      ]
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: '🏢',
      submenu: [
        { id: 'engineering', label: 'Engineering' },
        { id: 'design', label: 'Design' },
        { id: 'hr', label: 'HR' }
      ]
    },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteEmployee({ variables: { id } })
      refetch()
    }
    setOpenDropdown(null)
  }

  const handleFlag = async (id, status, e) => {
    e.stopPropagation()
    await flagEmployee({ variables: { id, status } })
    refetch()
    setOpenDropdown(null)
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('')
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleFilterChange = (dept) => {
    setFilterDepartment(dept)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">👥</div>
            <h1>EmpManager</h1>
            <p>Employee Management System</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && <div className="login-error">{loginError}</div>}

            <button type="submit" className="login-btn">Sign In</button>
          </form>

          <div className="login-credentials">
            <h3>Demo Credentials</h3>
            <div className="credential-box admin">
              <span className="role-badge admin">ADMIN</span>
              <p><strong>Email:</strong> admin@company.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
            <div className="credential-box employee">
              <span className="role-badge employee">EMPLOYEE</span>
              <p><strong>Email:</strong> employee@company.com</p>
              <p><strong>Password:</strong> employee123</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading employees...</p>
    </div>
  )

  if (error) return <p>Error: {error.message}</p>

  const employees = data?.employeesPaginated?.employees || []
  const pageInfo = data?.employeesPaginated?.pageInfo || {}

  return (
    <div className="app">
      {/* Hamburger Menu */}
      <div className={`menu-overlay ${menuOpen ? 'visible' : ''}`} onClick={() => setMenuOpen(false)} />

      <nav className={`hamburger-menu ${menuOpen ? 'open' : ''}`}>
        {menuItems.map(item => (
          <div key={item.id} className="menu-section">
            <div
              className={`menu-item ${activeSubmenu === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.submenu) {
                  setActiveSubmenu(activeSubmenu === item.id ? null : item.id)
                } else {
                  setMenuOpen(false)
                }
              }}
            >
              <span>{item.icon} {item.label}</span>
              {item.submenu && <span>{activeSubmenu === item.id ? '▼' : '▶'}</span>}
            </div>
            {item.submenu && (
              <div className={`submenu ${activeSubmenu === item.id ? 'open' : ''}`}>
                {item.submenu.map(sub => (
                  <div key={sub.id} className="submenu-item" onClick={() => setMenuOpen(false)}>
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Horizontal Nav */}
      <header className="horizontal-nav">
        <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="logo">👥 EmpManager</div>

        <nav className="nav-items">
          <span className="nav-item active">Dashboard</span>
          <span className="nav-item">Employees</span>
          <span className="nav-item">Reports</span>
          <span className="nav-item">Settings</span>
        </nav>

        <div className="header-right">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              📋 Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'tile' ? 'active' : ''}`}
              onClick={() => setViewMode('tile')}
            >
              🎴 Tile
            </button>
          </div>

          <div className="user-info">
            <span className={`role-indicator ${isAdmin ? 'admin' : 'employee'}`}>
              {isAdmin ? '👑' : '👤'} {currentUser?.name}
            </span>
            <span className={`role-badge ${isAdmin ? 'admin' : 'employee'}`}>
              {currentUser?.role}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Employee Directory</h1>
            <p className="employee-count">
              Showing {employees.length} of {pageInfo.totalCount} employees
              (Page {pageInfo.currentPage} of {pageInfo.totalPages})
            </p>
          </div>
          {!isAdmin && (
            <div className="access-notice">
              <span>👤 View-only access. Contact admin for edit permissions.</span>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="filter-group">
            <label>Department:</label>
            <select value={filterDepartment} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
              <option value="NAME">Name</option>
              <option value="AGE">Age</option>
              <option value="DEPARTMENT">Department</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="SALARY">Salary</option>
              <option value="JOIN_DATE">Join Date</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Per page:</label>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid-view">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Class</th>
                  <th>Subjects</th>
                  <th>Attendance</th>
                  <th>Salary</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} onClick={() => setSelectedEmployee(emp)}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.age}</td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>{emp.class}</td>
                    <td>{emp.subjects.slice(0, 2).join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="attendance-bar">
                          <div className="attendance-fill" style={{ width: `${emp.attendance}%` }}></div>
                        </div>
                        {emp.attendance}%
                      </div>
                    </td>
                    <td>${emp.salary.toLocaleString()}</td>
                    <td>{emp.joinDate}</td>
                    <td>
                      <span className={`status-badge ${emp.status === 'Active' ? 'status-active' : 'status-leave'}`}>
                        {emp.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions">
                          <button
                            className="action-btn edit"
                            onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn flag"
                            onClick={(e) => handleFlag(emp.id, emp.status === 'Active' ? 'Flagged' : 'Active', e)}
                            title={emp.status === 'Active' ? 'Flag' : 'Unflag'}
                          >
                            🚩
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={(e) => handleDelete(emp.id, e)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tile View */}
        {viewMode === 'tile' && (
          <div className="tile-view">
            {employees.map(emp => (
              <div key={emp.id} className="employee-tile" onClick={() => setSelectedEmployee(emp)}>
                <div className="tile-header">
                  <div className="tile-avatar">{getInitials(emp.name)}</div>
                  {isAdmin && (
                    <div className="tile-actions">
                      <button
                        className="bun-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenDropdown(openDropdown === emp.id ? null : emp.id)
                        }}
                      >
                        ⋮
                      </button>
                      {openDropdown === emp.id && (
                        <div className="actions-dropdown">
                          <button className="action-item" onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); setOpenDropdown(null) }}>
                            ✏️ Edit
                          </button>
                          <button className="action-item" onClick={(e) => handleFlag(emp.id, emp.status === 'Active' ? 'Flagged' : 'Active', e)}>
                            🚩 {emp.status === 'Active' ? 'Flag' : 'Unflag'}
                          </button>
                          <button className="action-item" onClick={(e) => handleFlag(emp.id, 'On Leave', e)}>
                            📅 Mark Leave
                          </button>
                          <button className="action-item delete" onClick={(e) => handleDelete(emp.id, e)}>
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="tile-name">{emp.name}</h3>
                <p className="tile-position">{emp.position}</p>

                <div className="tile-info">
                  <div className="tile-info-item">
                    <span className="tile-label">Department</span>
                    <span className="tile-value">{emp.department}</span>
                  </div>
                  <div className="tile-info-item">
                    <span className="tile-label">Attendance</span>
                    <span className="tile-value">{emp.attendance}%</span>
                  </div>
                  <div className="tile-info-item">
                    <span className="tile-label">Class</span>
                    <span className="tile-value">{emp.class}</span>
                  </div>
                  <div className="tile-info-item">
                    <span className="tile-label">Status</span>
                    <span className={`status-badge ${emp.status === 'Active' ? 'status-active' : 'status-leave'}`}>
                      {emp.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="pagination">
          <div className="pagination-info">
            Showing {((pageInfo.currentPage - 1) * itemsPerPage) + 1} - {Math.min(pageInfo.currentPage * itemsPerPage, pageInfo.totalCount)} of {pageInfo.totalCount} employees
          </div>

          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => handlePageChange(1)}
              disabled={!pageInfo.hasPreviousPage}
            >
              ⟪ First
            </button>
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pageInfo.hasPreviousPage}
            >
              ◀ Prev
            </button>

            <div className="page-numbers">
              {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-num ${page === pageInfo.currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pageInfo.hasNextPage}
            >
              Next ▶
            </button>
            <button
              className="page-btn"
              onClick={() => handlePageChange(pageInfo.totalPages)}
              disabled={!pageInfo.hasNextPage}
            >
              Last ⟫
            </button>
          </div>
        </div>
      </main>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Employee Details</h2>
              <button className="close-btn" onClick={() => setSelectedEmployee(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-hero">
                <div className="detail-avatar">{getInitials(selectedEmployee.name)}</div>
                <div className="detail-hero-info">
                  <h2>{selectedEmployee.name}</h2>
                  <p>{selectedEmployee.position} • {selectedEmployee.department}</p>
                  <span className={`status-badge ${selectedEmployee.status === 'Active' ? 'status-active' : 'status-leave'}`}>
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Employee ID</label>
                  <span>EMP-{selectedEmployee.id.padStart(4, '0')}</span>
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <span>{selectedEmployee.age} years</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{selectedEmployee.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <span>{selectedEmployee.phone}</span>
                </div>
                <div className="detail-item">
                  <label>Class</label>
                  <span>Class {selectedEmployee.class}</span>
                </div>
                <div className="detail-item">
                  <label>Attendance</label>
                  <span>{selectedEmployee.attendance}%</span>
                </div>
                <div className="detail-item">
                  <label>Salary</label>
                  <span>${selectedEmployee.salary.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Join Date</label>
                  <span>{selectedEmployee.joinDate}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Address</label>
                  <span>{selectedEmployee.address}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Subjects / Skills</label>
                  <div className="subjects-list">
                    {selectedEmployee.subjects.map((subject, i) => (
                      <span key={i} className="subject-tag">{subject}</span>
                    ))}
                  </div>
                </div>
              </div>

              <button className="back-btn" onClick={() => setSelectedEmployee(null)}>
                ← Back to Employee List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
