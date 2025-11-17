import { useState, useEffect } from 'react'
import * as React from 'react'
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import HistoryIcon from '@mui/icons-material/esm/History'
import SearchIcon from '@mui/icons-material/esm/Search'
import DownloadIcon from '@mui/icons-material/esm/Download'
import RefreshIcon from '@mui/icons-material/esm/Refresh'
import PersonIcon from '@mui/icons-material/esm/Person'
import LoginIcon from '@mui/icons-material/esm/Login'
import LogoutIcon from '@mui/icons-material/esm/Logout'
import EditIcon from '@mui/icons-material/esm/Edit'
import DeleteIcon from '@mui/icons-material/esm/Delete'
import AddIcon from '@mui/icons-material/esm/Add'
import ExpandMoreIcon from '@mui/icons-material/esm/ExpandMore'
import ErrorIcon from '@mui/icons-material/esm/Error'
import WarningIcon from '@mui/icons-material/esm/Warning'
import InfoIcon from '@mui/icons-material/esm/Info'
import VisibilityIcon from '@mui/icons-material/esm/Visibility'
import { useNavigate } from 'react-router-dom'
import { vi } from 'date-fns/locale'
import type { Role } from '../types/roles'
import { RoleLabels, RoleColors } from '../types/roles'

interface ActivityLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: Role | 'system'  // Allow system role for system processes
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  level: 'info' | 'warning' | 'error'
  module: 'auth' | 'user' | 'notification' | 'qa' | 'system' | 'admin'
  success: boolean
}

// Mock data
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: '2024-11-17T14:30:00Z',
    userId: 'usr001',
    userName: 'Nguyễn Văn An',
    userRole: 'ADMIN',
    action: 'CREATE_NOTIFICATION',
    resource: 'notification/123',
    details: 'Tạo thông báo "Thông báo nghỉ lễ Quốc khánh 2/9"',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    level: 'info',
    module: 'notification',
    success: true
  },
  {
    id: '2',
    timestamp: '2024-11-17T14:25:00Z',
    userId: 'usr002',
    userName: 'Trần Thị Bình',
    userRole: 'STAFF',
    action: 'UPDATE_QA',
    resource: 'qa/456',
    details: 'Cập nhật Q&A "Làm thế nào để đăng ký môn học mới?"',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    level: 'info',
    module: 'qa',
    success: true
  },
  {
    id: '3',
    timestamp: '2024-11-17T14:20:00Z',
    userId: 'usr003',
    userName: 'Lê Hoàng Cường',
    userRole: 'MEMBER',
    action: 'LOGIN',
    resource: 'auth/session',
    details: 'Đăng nhập thành công vào hệ thống',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    level: 'info',
    module: 'auth',
    success: true
  },
  {
    id: '4',
    timestamp: '2024-11-17T14:15:00Z',
    userId: 'usr004',
    userName: 'Phạm Thị Dung',
    userRole: 'MEMBER',
    action: 'FAILED_LOGIN',
    resource: 'auth/session',
    details: 'Thử đăng nhập với mật khẩu sai 3 lần liên tiếp',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    level: 'warning',
    module: 'auth',
    success: false
  },
  {
    id: '5',
    timestamp: '2024-11-17T14:10:00Z',
    userId: 'usr001',
    userName: 'Nguyễn Văn An',
    userRole: 'ADMIN',
    action: 'DELETE_USER',
    resource: 'user/789',
    details: 'Xóa tài khoản người dùng "test@school.edu"',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    level: 'warning',
    module: 'user',
    success: true
  },
  {
    id: '6',
    timestamp: '2024-11-17T14:05:00Z',
    userId: 'system',
    userName: 'System',
    userRole: 'system',
    action: 'BACKUP_FAILED',
    resource: 'system/backup',
    details: 'Sao lưu dữ liệu tự động thất bại - Không đủ dung lượng ổ đĩa',
    ipAddress: '127.0.0.1',
    userAgent: 'System Process',
    level: 'error',
    module: 'system',
    success: false
  },
  {
    id: '7',
    timestamp: '2024-11-17T13:55:00Z',
    userId: 'usr002',
    userName: 'Trần Thị Bình',
    userRole: 'STAFF',
    action: 'CREATE_QA',
    resource: 'qa/999',
    details: 'Tạo Q&A mới "Hướng dẫn sử dụng hệ thống chatbot"',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    level: 'info',
    module: 'qa',
    success: true
  },
  {
    id: '8',
    timestamp: '2024-11-17T13:50:00Z',
    userId: 'usr005',
    userName: 'Hoàng Minh Đức',
    userRole: 'MEMBER',
    action: 'CHANGE_PASSWORD',
    resource: 'user/profile',
    details: 'Thay đổi mật khẩu tài khoản',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    level: 'info',
    module: 'user',
    success: true
  },
  {
    id: '9',
    timestamp: '2024-11-17T13:45:00Z',
    userId: 'usr001',
    userName: 'Nguyễn Văn An',
    userRole: 'ADMIN',
    action: 'UPDATE_USER_ROLE',
    resource: 'user/456',
    details: 'Thay đổi quyền người dùng từ "MEMBER" thành "STAFF"',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    level: 'warning',
    module: 'user',
    success: true
  },
  {
    id: '10',
    timestamp: '2024-11-17T13:40:00Z',
    userId: 'usr003',
    userName: 'Lê Hoàng Cường',
    userRole: 'MEMBER',
    action: 'LOGOUT',
    resource: 'auth/session',
    details: 'Đăng xuất khỏi hệ thống',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    level: 'info',
    module: 'auth',
    success: true
  }
]

const actionLabels: Record<string, string> = {
  'LOGIN': 'Đăng nhập',
  'LOGOUT': 'Đăng xuất',
  'FAILED_LOGIN': 'Đăng nhập thất bại',
  'CREATE_USER': 'Tạo người dùng',
  'UPDATE_USER': 'Cập nhật người dùng',
  'DELETE_USER': 'Xóa người dùng',
  'UPDATE_USER_ROLE': 'Thay đổi quyền',
  'CHANGE_PASSWORD': 'Đổi mật khẩu',
  'CREATE_NOTIFICATION': 'Tạo thông báo',
  'UPDATE_NOTIFICATION': 'Sửa thông báo',
  'DELETE_NOTIFICATION': 'Xóa thông báo',
  'SEND_NOTIFICATION': 'Gửi thông báo',
  'CREATE_QA': 'Tạo Q&A',
  'UPDATE_QA': 'Cập nhật Q&A',
  'DELETE_QA': 'Xóa Q&A',
  'BACKUP_SUCCESS': 'Sao lưu thành công',
  'BACKUP_FAILED': 'Sao lưu thất bại',
  'SYSTEM_ERROR': 'Lỗi hệ thống'
}

const moduleLabels = {
  auth: 'Xác thực',
  user: 'Người dùng',
  notification: 'Thông báo',
  qa: 'Q&A',
  system: 'Hệ thống',
  admin: 'Quản trị'
}

const levelLabels = {
  info: 'Thông tin',
  warning: 'Cảnh báo',
  error: 'Lỗi'
}

const levelColors = {
  info: 'info',
  warning: 'warning',
  error: 'error'
} as const

const levelIcons = {
  info: InfoIcon,
  warning: WarningIcon,
  error: ErrorIcon
}

const getActionIcon = (action: string) => {
  if (action === 'LOGIN') return LoginIcon
  if (action === 'LOGOUT') return LogoutIcon
  if (action.includes('CREATE')) return AddIcon
  if (action.includes('UPDATE') || action.includes('CHANGE')) return EditIcon
  if (action.includes('DELETE')) return DeleteIcon
  return PersonIcon
}

export default function ActivityLogs() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<ActivityLog[]>(mockActivityLogs)
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>(mockActivityLogs)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  // Filter logs
  useEffect(() => {
    let filtered = logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter
      const matchesRole = roleFilter === 'all' || log.userRole === roleFilter
      
      const logDate = new Date(log.timestamp)
      const matchesDateFrom = !dateFrom || logDate >= dateFrom
      const matchesDateTo = !dateTo || logDate <= dateTo
      
      return matchesSearch && matchesModule && matchesLevel && matchesRole && matchesDateFrom && matchesDateTo
    })

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setFilteredLogs(filtered)
    setPage(0)
  }, [searchTerm, moduleFilter, levelFilter, roleFilter, dateFrom, dateTo, logs])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getUniqueRoles = () => {
    const roles = [...new Set(logs.map(log => log.userRole))]
    return roles.filter(role => role)
  }

  const getRecentActivity = () => {
    return logs
      .filter(log => log.level !== 'error')
      .slice(0, 10)
  }

  const getErrorLogs = () => {
    return logs.filter(log => log.level === 'error')
  }

  const getActivityStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayLogs = logs.filter(log => new Date(log.timestamp) >= today)
    const errorCount = logs.filter(log => log.level === 'error').length
    const warningCount = logs.filter(log => log.level === 'warning').length
    
    return {
      totalToday: todayLogs.length,
      totalErrors: errorCount,
      totalWarnings: warningCount,
      totalLogs: logs.length
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ['Thời gian', 'Người dùng', 'Hành động', 'Mô tả', 'Mức độ', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        formatDate(log.timestamp),
        log.userName,
        actionLabels[log.action] || log.action,
        log.details,
        levelLabels[log.level],
        log.ipAddress
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    // Reset all filters
    setSearchTerm('')
    setModuleFilter('all')
    setLevelFilter('all')
    setRoleFilter('all')
    setDateFrom(null)
    setDateTo(null)
    
    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real app, you would refetch data from API here
    // For now, we'll just reload the mock data
    setLogs(mockActivityLogs)
    
    setIsRefreshing(false)
  }

  const handleViewDetail = (log: ActivityLog) => {
    setSelectedLog(log)
    setIsViewDetailOpen(true)
  }

  const stats = getActivityStats()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
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
            icon={<HistoryIcon />}
            label="Hệ thống giám sát"
            sx={{ bgcolor: 'rgba(97,97,97,0.08)', color: 'text.primary' }}
          />
        </Stack>
        
        <Box>
          <Typography variant="h4" gutterBottom>
            Nhật ký hoạt động
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi và kiểm soát tất cả hoạt động của người dùng trong hệ thống.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">{stats.totalToday}</Typography>
                <Typography variant="body2">Hoạt động hôm nay</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">{stats.totalErrors}</Typography>
                <Typography variant="body2">Lỗi hệ thống</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">{stats.totalWarnings}</Typography>
                <Typography variant="body2">Cảnh báo</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">{stats.totalLogs}</Typography>
                <Typography variant="body2">Tổng nhật ký</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Tất cả nhật ký" />
            <Tab label="Lỗi & Cảnh báo" />
            <Tab label="Hoạt động gần đây" />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {/* Filter Controls */}
              <Stack spacing={2} mb={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    placeholder="Tìm kiếm theo hành động, người dùng, mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Module</InputLabel>
                    <Select
                      value={moduleFilter}
                      onChange={(e) => setModuleFilter(e.target.value)}
                      label="Module"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      {Object.entries(moduleLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Mức độ</InputLabel>
                    <Select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      label="Mức độ"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      {Object.entries(levelLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      {getUniqueRoles().map(role => (
                        <MenuItem key={role} value={role}>
                          {RoleLabels[role as Role] || (role === 'system' ? 'Hệ thống' : role)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <DatePicker
                    label="Từ ngày"
                    value={dateFrom}
                    onChange={(newValue) => setDateFrom(newValue)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="Đến ngày"
                    value={dateTo}
                    onChange={(newValue) => setDateTo(newValue)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  
                  <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                    <Button
                      variant="outlined"
                      startIcon={
                        <RefreshIcon 
                          sx={{ 
                            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                            '@keyframes spin': {
                              '0%': {
                                transform: 'rotate(0deg)',
                              },
                              '100%': {
                                transform: 'rotate(360deg)',
                              },
                            },
                          }} 
                        />
                      }
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? 'Đang tải...' : 'Làm mới'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={exportLogs}
                    >
                      Xuất file
                    </Button>
                  </Stack>
                </Stack>
              </Stack>

              {/* Logs Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Người dùng</TableCell>
                      <TableCell>Hành động</TableCell>
                      <TableCell>Chi tiết</TableCell>
                      <TableCell>Mức độ</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((log) => {
                        const ActionIcon = getActionIcon(log.action)
                        const LevelIcon = levelIcons[log.level]
                        return (
                          <TableRow 
                            key={log.id}
                            sx={{ 
                              '&:hover': { bgcolor: 'action.hover' },
                              bgcolor: log.level === 'error' ? 'error.50' : 
                                      log.level === 'warning' ? 'warning.50' : 'inherit'
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {formatDate(log.timestamp)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                  {log.userName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2">{log.userName}</Typography>
                                  <Chip 
                                    label={log.userRole === 'system' ? 'Hệ thống' : (RoleLabels[log.userRole as Role] || log.userRole)} 
                                    size="small" 
                                    variant="outlined"
                                    color={log.userRole === 'system' ? 'info' : (RoleColors[log.userRole as Role] || 'default')}
                                    sx={{ fontSize: '0.7rem', height: 16 }}
                                  />
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ActionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {actionLabels[log.action] || log.action}
                                </Typography>
                                <Chip 
                                  label={moduleLabels[log.module]} 
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 16 }}
                                />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 400, whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                {log.details}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <LevelIcon sx={{ fontSize: 16 }} color={log.level === 'info' ? 'info' : log.level} />
                                <Chip
                                  label={levelLabels[log.level]}
                                  size="small"
                                  color={levelColors[log.level]}
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                {log.ipAddress}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Xem chi tiết">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetail(log)}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
                
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={filteredLogs.length}
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
                Lỗi và cảnh báo hệ thống
              </Typography>
              
              {getErrorLogs().length === 0 ? (
                <Alert severity="success">Không có lỗi nào được ghi nhận!</Alert>
              ) : (
                <Stack spacing={2}>
                  {getErrorLogs().map((log) => {
                    const LevelIcon = levelIcons[log.level]
                    return (
                      <Accordion key={log.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <LevelIcon color={log.level} />
                            <Typography sx={{ flexGrow: 1 }}>{log.details}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(log.timestamp)}
                            </Typography>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={1}>
                            <Typography variant="body2">
                              <strong>Người dùng:</strong> {log.userName} ({log.userRole === 'system' ? 'Hệ thống' : (RoleLabels[log.userRole as Role] || log.userRole)})
                            </Typography>
                            <Typography variant="body2">
                              <strong>Hành động:</strong> {actionLabels[log.action] || log.action}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Module:</strong> {moduleLabels[log.module]}
                            </Typography>
                            <Typography variant="body2">
                              <strong>IP Address:</strong> {log.ipAddress}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                              {log.userAgent}
                            </Typography>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </Stack>
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>
              <List>
                {getRecentActivity().map((log, index) => {
                  const ActionIcon = getActionIcon(log.action)
                  return (
                    <ListItem key={log.id} divider={index < getRecentActivity().length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ActionIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2">
                              {log.userName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {actionLabels[log.action] || log.action}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2">{log.details}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(log.timestamp)} • {log.ipAddress}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  )
                })}
              </List>
            </Box>
          )}
        </Paper>

        {/* View Detail Dialog */}
        <Dialog open={isViewDetailOpen} onClose={() => setIsViewDetailOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {selectedLog && (
                <>
                  {React.createElement(getActionIcon(selectedLog.action), { 
                    sx: { fontSize: 24, color: 'primary.main' } 
                  })}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {actionLabels[selectedLog.action] || selectedLog.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(selectedLog.timestamp)}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedLog && (
              <Stack spacing={2.5}>
                {/* User Info Card */}
                <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {selectedLog.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {selectedLog.userName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={RoleLabels[selectedLog.userRole as Role] || (selectedLog.userRole === 'system' ? 'Hệ thống' : selectedLog.userRole)}
                            size="small"
                            color={selectedLog.userRole === 'system' ? 'info' : (RoleColors[selectedLog.userRole as Role] || 'default')}
                          />
                          <Typography variant="body2" color="text.secondary">
                            ID: {selectedLog.userId}
                          </Typography>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {React.createElement(levelIcons[selectedLog.level], { 
                          sx: { fontSize: 18 }, 
                          color: selectedLog.level === 'info' ? 'info' : selectedLog.level 
                        })}
                        <Chip
                          label={levelLabels[selectedLog.level]}
                          size="small"
                          color={levelColors[selectedLog.level]}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Description */}
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {selectedLog.details}
                  </Typography>
                </Box>

                {/* Technical Details */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 4, height: 4, bgcolor: 'primary.main', borderRadius: '50%' }} />
                        Thông tin kỹ thuật
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Module:</Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            <Chip 
                              label={moduleLabels[selectedLog.module]} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">IP Address:</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                            {selectedLog.ipAddress}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Resource:</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', mt: 0.5 }}>
                            {selectedLog.resource}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 4, height: 4, bgcolor: 'success.main', borderRadius: '50%' }} />
                        Trạng thái
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Kết quả:</Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            <Chip 
                              label={selectedLog.success ? 'Thành công' : 'Thất bại'}
                              size="small"
                              color={selectedLog.success ? 'success' : 'error'}
                            />
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">ID Log:</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                            {selectedLog.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                {/* User Agent - Collapsible */}
                <Accordion variant="outlined">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      User Agent & Browser Info
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.8rem',
                        wordBreak: 'break-all',
                        lineHeight: 1.4,
                        color: 'text.secondary'
                      }}
                    >
                      {selectedLog.userAgent}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setIsViewDetailOpen(false)} 
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </LocalizationProvider>
  )
}