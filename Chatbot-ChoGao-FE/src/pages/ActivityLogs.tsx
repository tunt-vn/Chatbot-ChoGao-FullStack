//activity-logs
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
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import HistoryIcon from '@mui/icons-material/esm/History'
import DownloadIcon from '@mui/icons-material/esm/Download'
import RefreshIcon from '@mui/icons-material/esm/Refresh'
import PersonIcon from '@mui/icons-material/esm/Person'
import LoginIcon from '@mui/icons-material/esm/Login'
import LogoutIcon from '@mui/icons-material/esm/Logout'
import EditIcon from '@mui/icons-material/esm/Edit'
import DeleteIcon from '@mui/icons-material/esm/Delete'
import AddIcon from '@mui/icons-material/esm/Add'
import ErrorIcon from '@mui/icons-material/esm/Error'
import WarningIcon from '@mui/icons-material/esm/Warning'
import InfoIcon from '@mui/icons-material/esm/Info'
import VisibilityIcon from '@mui/icons-material/esm/Visibility'
import ReportIcon from '@mui/icons-material/esm/Report'
import ExpandMoreIcon from '@mui/icons-material/esm/ExpandMore'
import { useNavigate } from 'react-router-dom'
import { vi } from 'date-fns/locale'
import type { Role } from '../types/roles'
import { RoleLabels, RoleColors } from '../types/roles'
import AdminFilter from '../components/AdminFilter'
import type { FilterField } from '../components/AdminFilter'
import ActionDropdown from '../components/ActionDropdown'
import StatisticsCards, { ActivityLogStats } from '../components/StatisticsCards'

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
    timestamp: '2025-11-17T14:30:00Z',
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
    timestamp: '2025-11-17T14:25:00Z',
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
    timestamp: '2025-11-18T14:15:00Z',
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
    timestamp: '2025-11-18T14:10:00Z',
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
    timestamp: '2025-11-17T14:05:00Z',
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
    timestamp: '2025-11-17T13:55:00Z',
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
    timestamp: '2025-11-16T13:50:00Z',
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
    timestamp: '2025-11-16T13:45:00Z',
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
    timestamp: '2025-11-15T13:40:00Z',
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
  const [filterValues, setFilterValues] = useState({ 
    module: 'all', 
    level: 'all', 
    role: 'all' 
  })
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  // Filter logs
  useEffect(() => {
    let filtered = logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesModule = filterValues.module === 'all' || log.module === filterValues.module
      const matchesLevel = filterValues.level === 'all' || log.level === filterValues.level
      const matchesRole = filterValues.role === 'all' || log.userRole === filterValues.role
      
      const logDate = new Date(log.timestamp)
      const matchesDateFrom = !dateFrom || logDate >= dateFrom
      const matchesDateTo = !dateTo || logDate <= dateTo
      
      return matchesSearch && matchesModule && matchesLevel && matchesRole && matchesDateFrom && matchesDateTo
    })

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setFilteredLogs(filtered)
    setPage(0)
  }, [searchTerm, filterValues, dateFrom, dateTo, logs])

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
    setFilterValues({ module: 'all', level: 'all', role: 'all' })
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

  // Get unique roles for filter
  const uniqueRoles = [...new Set(logs.map(log => log.userRole))].filter(Boolean)

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'module',
      label: 'Phân hệ',
      options: [
        { value: 'all', label: 'Tất cả' },
        ...Object.entries(moduleLabels).map(([key, label]) => ({ value: key, label }))
      ],
      defaultValue: 'all'
    },
    {
      key: 'level',
      label: 'Mức độ',
      options: [
        { value: 'all', label: 'Tất cả' },
        ...Object.entries(levelLabels).map(([key, label]) => ({ value: key, label }))
      ],
      defaultValue: 'all'
    },
    {
      key: 'role',
      label: 'Vai trò',
      options: [
        { value: 'all', label: 'Tất cả' },
        ...uniqueRoles.map(role => ({
          value: role,
          label: RoleLabels[role as Role] || (role === 'system' ? 'Hệ thống' : role)
        }))
      ],
      defaultValue: 'all'
    }
  ]

  // Custom buttons for date filters and actions
  const customButtons = [
    <Button
      key="refresh"
      variant="outlined"
      startIcon={
        <RefreshIcon 
          sx={{ 
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }} 
        />
      }
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      {isRefreshing ? 'Đang tải...' : 'Làm mới'}
    </Button>,
    <Button
      key="export"
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={exportLogs}
    >
      Xuất file
    </Button>
  ]

  // Date range filter configuration
  const dateRangeFilter = {
    fromKey: 'dateFrom',
    toKey: 'dateTo',
    fromLabel: 'Từ ngày',
    toLabel: 'Đến ngày'
  }

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

        {/* Statistics Cards */}
        <StatisticsCards cards={ActivityLogStats(logs)} />

        {/* Main Content */}
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 3 }}>
            {/* Filter Controls */}
            <AdminFilter
              searchPlaceholder="Tìm kiếm theo hành động, người dùng, mô tả..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              filterFields={filterFields}
              filterValues={filterValues}
              onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
              dateRangeFilter={dateRangeFilter}
              dateValues={{ from: dateFrom, to: dateTo }}
              onDateChange={(key, value) => {
                if (key === 'from') setDateFrom(value)
                else setDateTo(value)
              }}
              showAddButton={false}
              customButtons={customButtons}
              onClearFilters={() => {
                setFilterValues({ module: 'all', level: 'all', role: 'all' })
                setDateFrom(null)
                setDateTo(null)
              }}
            />

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
                              <ActionDropdown
                                actions={[
                                  {
                                    id: 'view',
                                    label: 'Xem chi tiết',
                                    icon: <VisibilityIcon fontSize="small" />,
                                    color: 'primary',
                                    onClick: () => handleViewDetail(log)
                                  },
                                  {
                                    id: 'export',
                                    label: 'Xuất log này',
                                    icon: <DownloadIcon fontSize="small" />,
                                    onClick: () => {
                                      const csvContent = [
                                        ['Thời gian', 'Người dùng', 'Hành động', 'Mô tả', 'Mức độ', 'IP Address'].join(','),
                                        [
                                          formatDate(log.timestamp),
                                          log.userName,
                                          actionLabels[log.action] || log.action,
                                          log.details,
                                          levelLabels[log.level],
                                          log.ipAddress
                                        ].join(',')
                                      ].join('\n')
                                      
                                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                                      const link = document.createElement('a')
                                      const url = URL.createObjectURL(blob)
                                      link.setAttribute('href', url)
                                      link.setAttribute('download', `activity-log-${log.id}.csv`)
                                      link.style.visibility = 'hidden'
                                      document.body.appendChild(link)
                                      link.click()
                                      document.body.removeChild(link)
                                    }
                                  },
                                  ...(log.level === 'error' ? [{
                                    id: 'report',
                                    label: 'Báo cáo lỗi',
                                    icon: <ReportIcon fontSize="small" />,
                                    color: 'error' as const,
                                    onClick: () => {
                                      // Add error reporting logic
                                      console.log('Report error', log.id)
                                    }
                                  }] : [])
                                ]}
                              />
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