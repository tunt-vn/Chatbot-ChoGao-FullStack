import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/esm/People'
import EditIcon from '@mui/icons-material/esm/Edit'
import DeleteIcon from '@mui/icons-material/esm/Delete'
import VisibilityIcon from '@mui/icons-material/esm/Visibility'
import BlockIcon from '@mui/icons-material/esm/Block'
import CheckCircleIcon from '@mui/icons-material/esm/CheckCircle'
import { useNavigate } from 'react-router-dom'
import type { Role } from '../types/roles'
import { RoleLabels, RoleColors } from '../types/roles'
import AdminFilter from '../components/AdminFilter'
import type { FilterField } from '../components/AdminFilter'
import ActionDropdown from '../components/ActionDropdown'

interface User {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastLogin: string | null
  avatar?: string
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@school.edu',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2024-01-15T08:30:00Z',
    lastLogin: '2024-11-17T09:00:00Z'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@school.edu',
    role: 'STAFF',
    status: 'active',
    createdAt: '2024-02-20T10:15:00Z',
    lastLogin: '2024-11-16T14:30:00Z'
  },
  {
    id: '3',
    name: 'Lê Hoàng Cường',
    email: 'cuong.le@school.edu',
    role: 'MEMBER',
    status: 'active',
    createdAt: '2024-03-10T16:45:00Z',
    lastLogin: '2024-11-15T11:20:00Z'
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@school.edu',
    role: 'MEMBER',
    status: 'inactive',
    createdAt: '2024-04-05T13:20:00Z',
    lastLogin: '2024-10-20T16:45:00Z'
  },
  {
    id: '5',
    name: 'Hoàng Minh Đức',
    email: 'duc.hoang@school.edu',
    role: 'MEMBER',
    status: 'pending',
    createdAt: '2024-11-10T11:30:00Z',
    lastLogin: null
  }
]

const roleLabels = RoleLabels

const statusLabels = {
  active: 'Hoạt động',
  inactive: 'Ngưng hoạt động',
  pending: 'Chờ duyệt'
}

const statusColors = {
  active: 'success',
  inactive: 'error',
  pending: 'warning'
} as const

export default function UserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterValues, setFilterValues] = useState({ role: 'all', status: 'all' })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [tabValue, setTabValue] = useState(0)

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'MEMBER' as User['role'],
    status: 'active' as User['status']
  })

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'role',
      label: 'Vai trò',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'ADMIN', label: 'Quản trị viên' },
        { value: 'STAFF', label: 'Nhân viên' },
        { value: 'MEMBER', label: 'Thành viên' }
      ],
      defaultValue: 'all'
    },
    {
      key: 'status',
      label: 'Trạng thái',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Ngưng hoạt động' },
        { value: 'pending', label: 'Chờ duyệt' }
      ],
      defaultValue: 'all'
    }
  ]

  // Filter users based on search term, role, and status
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterValues.role === 'all' || user.role === filterValues.role
      const matchesStatus = filterValues.status === 'all' || user.status === filterValues.status
      
      return matchesSearch && matchesRole && matchesStatus
    })

    setFilteredUsers(filtered)
    setPage(0)
  }, [searchTerm, filterValues, users])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ))
      setSnackbar({ open: true, message: 'Cập nhật thông tin người dùng thành công', severity: 'success' })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(user => user.id !== selectedUser.id))
      setSnackbar({ open: true, message: 'Xóa người dùng thành công', severity: 'success' })
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleAddUser = () => {
    const newId = String(Date.now())
    const userToAdd: User = {
      ...newUser,
      id: newId,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
    
    setUsers([...users, userToAdd])
    setSnackbar({ open: true, message: 'Thêm người dùng mới thành công', severity: 'success' })
    setIsAddDialogOpen(false)
    setNewUser({ name: '', email: '', role: 'MEMBER', status: 'active' })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa đăng nhập'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={3}>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin')}
          startIcon={<Box component="span" sx={{ fontSize: '1.2em' }}>←</Box>}
          sx={{ 
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.50',
              borderColor: 'primary.600'
            }
          }}
        >
          Quay lại bảng điều khiển
        </Button>
        
        <Chip
          icon={<PeopleIcon />}
          label="Quản lý hệ thống"
          sx={{ bgcolor: 'rgba(76,175,80,0.08)', color: 'success.main' }}
        />
      </Stack>
      
      <Box>
        <Typography variant="h4" gutterBottom>
          Quản lý người dùng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin người dùng, phân quyền và theo dõi hoạt động của các tài khoản trong hệ thống.
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Danh sách người dùng" />
          <Tab label="Thống kê" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Search and Filter Controls */}
            <AdminFilter
              searchPlaceholder="Tìm kiếm theo tên hoặc email..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              filterFields={filterFields}
              filterValues={filterValues}
              onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
              addButtonText="Thêm người dùng"
              onAdd={() => setIsAddDialogOpen(true)}
              onClearFilters={() => setFilterValues({ role: 'all', status: 'all' })}
            />

            {/* Users Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Người dùng</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Đăng nhập cuối</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{user.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={roleLabels[user.role]}
                            size="small"
                            color={RoleColors[user.role]}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabels[user.status]}
                            size="small"
                            color={statusColors[user.status]}
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(user.lastLogin)}
                        </TableCell>
                        <TableCell align="center">
                          <ActionDropdown
                            actions={[
                              {
                                id: 'view',
                                label: 'Xem hồ sơ',
                                icon: <VisibilityIcon fontSize="small" />,
                                color: 'primary',
                                onClick: () => console.log('View user', user.id)
                              },
                              {
                                id: 'edit',
                                label: 'Chỉnh sửa',
                                icon: <EditIcon fontSize="small" />,
                                onClick: () => handleEditUser(user)
                              },
                              {
                                id: 'block',
                                label: user.status === 'active' ? 'Chặn người dùng' : 'Bỏ chặn',
                                icon: user.status === 'active' ? 
                                  <BlockIcon fontSize="small" /> : 
                                  <CheckCircleIcon fontSize="small" />,
                                color: user.status === 'active' ? 'error' : 'success',
                                onClick: () => {
                                  const newStatus = user.status === 'active' ? 'inactive' : 'active'
                                  setUsers(users.map(u => 
                                    u.id === user.id ? { ...u, status: newStatus } : u
                                  ))
                                  setSnackbar({ 
                                    open: true, 
                                    message: user.status === 'active' ? 'Đã chặn người dùng' : 'Đã bỏ chặn người dùng', 
                                    severity: 'success' 
                                  })
                                },
                                divider: true
                              },
                              {
                                id: 'delete',
                                label: 'Xóa người dùng',
                                icon: <DeleteIcon fontSize="small" />,
                                color: 'error',
                                onClick: () => handleDeleteUser(user)
                              }
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số dòng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                }
              />
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê người dùng
            </Typography>
            <Stack spacing={2}>
              <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1">Tổng số người dùng: {users.length}</Typography>
              </Paper>
              <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1">Đang hoạt động: {users.filter(u => u.status === 'active').length}</Typography>
              </Paper>
              <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1">Chờ duyệt: {users.filter(u => u.status === 'pending').length}</Typography>
              </Paper>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tên"
              value={selectedUser?.name || ''}
              onChange={(e) => selectedUser && setSelectedUser({ ...selectedUser, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={selectedUser?.email || ''}
              onChange={(e) => selectedUser && setSelectedUser({ ...selectedUser, email: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={selectedUser?.role || 'MEMBER'}
                onChange={(e) => selectedUser && setSelectedUser({ ...selectedUser, role: e.target.value as User['role'] })}
                label="Vai trò"
              >
                <MenuItem value="MEMBER">Thành viên</MenuItem>
                <MenuItem value="STAFF">Nhân viên</MenuItem>
                <MenuItem value="ADMIN">Quản trị viên</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={selectedUser?.status || 'active'}
                onChange={(e) => selectedUser && setSelectedUser({ ...selectedUser, status: e.target.value as User['status'] })}
                label="Trạng thái"
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                <MenuItem value="pending">Chờ duyệt</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm người dùng mới</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tên"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                label="Vai trò"
              >
                <MenuItem value="MEMBER">Thành viên</MenuItem>
                <MenuItem value="STAFF">Nhân viên</MenuItem>
                <MenuItem value="ADMIN">Quản trị viên</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value as User['status'] })}
                label="Trạng thái"
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                <MenuItem value="pending">Chờ duyệt</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained"
            disabled={!newUser.name || !newUser.email}
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.name}</strong>?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}