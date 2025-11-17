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
  IconButton,
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
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/esm/People'
import EditIcon from '@mui/icons-material/esm/Edit'
import DeleteIcon from '@mui/icons-material/esm/Delete'
import AddIcon from '@mui/icons-material/esm/Add'
import SearchIcon from '@mui/icons-material/esm/Search'
import FilterListIcon from '@mui/icons-material/esm/FilterList'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
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
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T08:30:00Z',
    lastLogin: '2024-11-17T09:00:00Z'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@school.edu',
    role: 'moderator',
    status: 'active',
    createdAt: '2024-02-20T10:15:00Z',
    lastLogin: '2024-11-16T14:30:00Z'
  },
  {
    id: '3',
    name: 'Lê Hoàng Cường',
    email: 'cuong.le@school.edu',
    role: 'user',
    status: 'active',
    createdAt: '2024-03-10T16:45:00Z',
    lastLogin: '2024-11-15T11:20:00Z'
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@school.edu',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-04-05T13:20:00Z',
    lastLogin: '2024-10-20T16:45:00Z'
  },
  {
    id: '5',
    name: 'Hoàng Minh Đức',
    email: 'duc.hoang@school.edu',
    role: 'user',
    status: 'pending',
    createdAt: '2024-11-10T11:30:00Z',
    lastLogin: null
  }
]

const roleLabels = {
  admin: 'Quản trị viên',
  moderator: 'Điều hành viên',
  user: 'Người dùng'
}

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
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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
    role: 'user' as User['role'],
    status: 'active' as User['status']
  })

  // Filter users based on search term, role, and status
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      
      return matchesSearch && matchesRole && matchesStatus
    })

    setFilteredUsers(filtered)
    setPage(0)
  }, [searchTerm, roleFilter, statusFilter, users])

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
    setNewUser({ name: '', email: '', role: 'user', status: 'active' })
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
      <Box>
        <Button
          variant="text"
          onClick={() => navigate('/admin')}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          ← Quay lại bảng điều khiển
        </Button>
        <Chip
          icon={<PeopleIcon />}
          label="Quản lý hệ thống"
          sx={{ bgcolor: 'rgba(76,175,80,0.08)', color: 'success.main', mb: 2 }}
        />
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
              <TextField
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Vai trò"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                  <MenuItem value="moderator">Điều hành viên</MenuItem>
                  <MenuItem value="user">Người dùng</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                  <MenuItem value="pending">Chờ duyệt</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddDialogOpen(true)}
                sx={{ minWidth: 'max-content' }}
              >
                Thêm người dùng
              </Button>
            </Stack>

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
                            color={user.role === 'admin' ? 'error' : user.role === 'moderator' ? 'warning' : 'default'}
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
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleEditUser(user)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
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
                value={selectedUser?.role || 'user'}
                onChange={(e) => selectedUser && setSelectedUser({ ...selectedUser, role: e.target.value as User['role'] })}
                label="Vai trò"
              >
                <MenuItem value="user">Người dùng</MenuItem>
                <MenuItem value="moderator">Điều hành viên</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
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
                <MenuItem value="user">Người dùng</MenuItem>
                <MenuItem value="moderator">Điều hành viên</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
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