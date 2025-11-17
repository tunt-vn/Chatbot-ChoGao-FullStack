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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Card,
  CardContent,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import NotificationsIcon from '@mui/icons-material/esm/Notifications'
import EditIcon from '@mui/icons-material/esm/Edit'
import DeleteIcon from '@mui/icons-material/esm/Delete'
import AddIcon from '@mui/icons-material/esm/Add'
import SearchIcon from '@mui/icons-material/esm/Search'
import SendIcon from '@mui/icons-material/esm/Send'
import ScheduleIcon from '@mui/icons-material/esm/Schedule'
import GroupIcon from '@mui/icons-material/esm/Group'
import PersonIcon from '@mui/icons-material/esm/Person'
import CampaignIcon from '@mui/icons-material/esm/Campaign'
import AnnouncementIcon from '@mui/icons-material/esm/Announcement'
import { useNavigate } from 'react-router-dom'
import { vi } from 'date-fns/locale'
import type { Recipients } from '../types/roles'
import { RecipientLabels } from '../types/roles'

interface Notification {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'high' | 'medium' | 'low'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  recipients: Recipients
  customRecipients?: string[]
  createdAt: string
  scheduledAt?: string
  sentAt?: string
  readCount: number
  totalRecipients: number
  author: string
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Thông báo nghỉ lễ Quốc khánh 2/9',
    content: 'Nhà trường thông báo lịch nghỉ lễ Quốc khánh từ ngày 2/9 đến 4/9. Sinh viên chú ý điều chỉnh lịch học phù hợp.',
    type: 'info',
    priority: 'high',
    status: 'sent',
    recipients: 'all',
    createdAt: '2024-08-25T09:00:00Z',
    scheduledAt: '2024-08-26T08:00:00Z',
    sentAt: '2024-08-26T08:00:00Z',
    readCount: 1256,
    totalRecipients: 1500,
    author: 'Nguyễn Văn An'
  },
  {
    id: '2',
    title: 'Cập nhật lịch thi cuối kỳ',
    content: 'Lịch thi cuối kỳ học kỳ I năm học 2024-2025 đã được cập nhật. Sinh viên vui lòng kiểm tra lịch thi trên hệ thống.',
    type: 'warning',
    priority: 'high',
    status: 'sent',
    recipients: 'MEMBER',
    createdAt: '2024-11-10T14:30:00Z',
    scheduledAt: '2024-11-11T08:00:00Z',
    sentAt: '2024-11-11T08:00:00Z',
    readCount: 890,
    totalRecipients: 1200,
    author: 'Trần Thị Bình'
  },
  {
    id: '3',
    title: 'Bảo trì hệ thống vào cuối tuần',
    content: 'Hệ thống sẽ được bảo trì từ 23:00 thứ 7 đến 6:00 chủ nhật. Trong thời gian này, một số tính năng có thể bị gián đoạn.',
    type: 'warning',
    priority: 'medium',
    status: 'scheduled',
    recipients: 'all',
    createdAt: '2024-11-15T16:20:00Z',
    scheduledAt: '2024-11-18T22:00:00Z',
    readCount: 0,
    totalRecipients: 1500,
    author: 'Lê Hoàng Cường'
  },
  {
    id: '4',
    title: 'Hội thảo công nghệ AI trong giáo dục',
    content: 'Nhà trường tổ chức hội thảo về ứng dụng AI trong giáo dục vào ngày 25/11. Đăng ký tham gia tại phòng Đào tạo.',
    type: 'success',
    priority: 'medium',
    status: 'draft',
    recipients: 'STAFF',
    createdAt: '2024-11-16T10:15:00Z',
    readCount: 0,
    totalRecipients: 200,
    author: 'Phạm Thị Dung'
  },
  {
    id: '5',
    title: 'Lỗi hệ thống thanh toán học phí',
    content: 'Hiện tại hệ thống thanh toán học phí đang gặp sự cố. Kỹ thuật viên đang khắc phục, dự kiến hoạt động trở lại trong 2 giờ tới.',
    type: 'error',
    priority: 'high',
    status: 'failed',
    recipients: 'MEMBER',
    createdAt: '2024-11-17T11:30:00Z',
    scheduledAt: '2024-11-17T12:00:00Z',
    readCount: 0,
    totalRecipients: 1200,
    author: 'Hoàng Minh Đức'
  }
]

const typeLabels = {
  info: 'Thông tin',
  warning: 'Cảnh báo',
  success: 'Thành công',
  error: 'Lỗi'
}

const typeColors = {
  info: 'info',
  warning: 'warning',
  success: 'success',
  error: 'error'
} as const

const statusLabels = {
  draft: 'Bản nháp',
  scheduled: 'Đã lên lịch',
  sent: 'Đã gửi',
  failed: 'Gửi thất bại'
}

const statusColors = {
  draft: 'default',
  scheduled: 'warning',
  sent: 'success',
  failed: 'error'
} as const

const priorityLabels = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp'
}

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'info'
} as const

const recipientLabels = RecipientLabels

export default function NotificationManagement() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(mockNotifications)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [tabValue, setTabValue] = useState(0)

  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    type: 'info' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    recipients: 'all' as Notification['recipients'],
    customRecipients: [] as string[],
    scheduledAt: null as Date | null,
    sendNow: false
  })

  // Filter notifications
  useEffect(() => {
    let filtered = notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          notification.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || notification.type === typeFilter
      const matchesStatus = statusFilter === 'all' || notification.status === statusFilter
      
      return matchesSearch && matchesType && matchesStatus
    })

    setFilteredNotifications(filtered)
    setPage(0)
  }, [searchTerm, typeFilter, statusFilter, notifications])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEditNotification = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsEditDialogOpen(true)
  }

  const handleDeleteNotification = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (selectedNotification) {
      setNotifications(notifications.map(notif => 
        notif.id === selectedNotification.id ? selectedNotification : notif
      ))
      setSnackbar({ open: true, message: 'Cập nhật thông báo thành công', severity: 'success' })
      setIsEditDialogOpen(false)
      setSelectedNotification(null)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedNotification) {
      setNotifications(notifications.filter(notif => notif.id !== selectedNotification.id))
      setSnackbar({ open: true, message: 'Xóa thông báo thành công', severity: 'success' })
      setIsDeleteDialogOpen(false)
      setSelectedNotification(null)
    }
  }

  const handleAddNotification = () => {
    const newId = String(Date.now())
    const notificationToAdd: Notification = {
      id: newId,
      title: newNotification.title,
      content: newNotification.content,
      type: newNotification.type,
      priority: newNotification.priority,
      status: newNotification.sendNow ? 'sent' : (newNotification.scheduledAt ? 'scheduled' : 'draft'),
      recipients: newNotification.recipients,
      customRecipients: newNotification.customRecipients,
      createdAt: new Date().toISOString(),
      scheduledAt: newNotification.scheduledAt?.toISOString(),
      sentAt: newNotification.sendNow ? new Date().toISOString() : undefined,
      readCount: 0,
      totalRecipients: newNotification.recipients === 'all' ? 1500 : 
                      newNotification.recipients === 'MEMBER' ? 1200 :
                      newNotification.recipients === 'STAFF' ? 200 : 100,
      author: 'Admin'
    }
    
    setNotifications([notificationToAdd, ...notifications])
    setSnackbar({ 
      open: true, 
      message: newNotification.sendNow ? 'Gửi thông báo thành công' : 'Tạo thông báo thành công', 
      severity: 'success' 
    })
    setIsAddDialogOpen(false)
    setNewNotification({
      title: '',
      content: '',
      type: 'info',
      priority: 'medium',
      recipients: 'all',
      customRecipients: [],
      scheduledAt: null,
      sendNow: false
    })
  }

  const handleSendNow = (notification: Notification) => {
    const updatedNotification = {
      ...notification,
      status: 'sent' as const,
      sentAt: new Date().toISOString()
    }
    setNotifications(notifications.map(notif => 
      notif.id === notification.id ? updatedNotification : notif
    ))
    setSnackbar({ open: true, message: 'Gửi thông báo thành công', severity: 'success' })
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Không có'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReadRate = (notification: Notification) => {
    return notification.totalRecipients > 0 
      ? ((notification.readCount / notification.totalRecipients) * 100).toFixed(1)
      : '0'
  }

  const getRecentNotifications = () => {
    return notifications
      .filter(n => n.status === 'sent')
      .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())
      .slice(0, 5)
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
            icon={<NotificationsIcon />}
            label="Hệ thống thông báo"
            sx={{ bgcolor: 'rgba(33,150,243,0.08)', color: 'info.main' }}
          />
        </Stack>
        
        <Box>
          <Typography variant="h4" gutterBottom>
            Quản lý thông báo hệ thống
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tạo, gửi và quản lý thông báo hệ thống tới người dùng về các sự kiện quan trọng.
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Danh sách thông báo" />
            <Tab label="Thống kê" />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {/* Search and Filter Controls */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
                <TextField
                  placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ flexGrow: 1 }}
                />
                
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Loại</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Loại"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="info">Thông tin</MenuItem>
                    <MenuItem value="warning">Cảnh báo</MenuItem>
                    <MenuItem value="success">Thành công</MenuItem>
                    <MenuItem value="error">Lỗi</MenuItem>
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
                    <MenuItem value="draft">Bản nháp</MenuItem>
                    <MenuItem value="scheduled">Đã lên lịch</MenuItem>
                    <MenuItem value="sent">Đã gửi</MenuItem>
                    <MenuItem value="failed">Gửi thất bại</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddDialogOpen(true)}
                  sx={{ minWidth: 'max-content' }}
                >
                  Tạo thông báo
                </Button>
              </Stack>

              {/* Notifications Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Thông báo</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Đối tượng</TableCell>
                      <TableCell>Tỷ lệ đọc</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredNotifications
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {notification.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                {notification.content}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                <Chip
                                  label={priorityLabels[notification.priority]}
                                  size="small"
                                  color={priorityColors[notification.priority]}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  bởi {notification.author}
                                </Typography>
                              </Stack>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={typeLabels[notification.type]}
                              size="small"
                              color={typeColors[notification.type]}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusLabels[notification.status]}
                              size="small"
                              color={statusColors[notification.status]}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {recipientLabels[notification.recipients]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.totalRecipients} người
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {notification.status === 'sent' ? (
                              <Typography variant="body2">
                                {getReadRate(notification)}%
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {notification.readCount}/{notification.totalRecipients}
                                </Typography>
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {notification.status === 'sent' ? formatDate(notification.sentAt) :
                               notification.status === 'scheduled' ? formatDate(notification.scheduledAt) :
                               formatDate(notification.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {notification.status === 'draft' && (
                                <Tooltip title="Gửi ngay">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleSendNow(notification)}
                                  >
                                    <SendIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditNotification(notification)}
                                  disabled={notification.status === 'sent'}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteNotification(notification)}
                                  disabled={notification.status === 'sent'}
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
                  count={filteredNotifications.length}
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
                Thống kê thông báo
              </Typography>
              <Stack spacing={3}>
                {/* General Stats */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1 }}>
                    <Typography variant="subtitle1">Tổng thông báo: {notifications.length}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1 }}>
                    <Typography variant="subtitle1">Đã gửi: {notifications.filter(n => n.status === 'sent').length}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1 }}>
                    <Typography variant="subtitle1">Đang lên lịch: {notifications.filter(n => n.status === 'scheduled').length}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1 }}>
                    <Typography variant="subtitle1">Bản nháp: {notifications.filter(n => n.status === 'draft').length}</Typography>
                  </Paper>
                </Stack>

                {/* Recent Notifications */}
                <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                  <Typography variant="h6" gutterBottom>
                    Thông báo gần đây
                  </Typography>
                  <List>
                    {getRecentNotifications().map((notification) => (
                      <ListItem key={notification.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${typeColors[notification.type]}.main` }}>
                            <AnnouncementIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.title}
                          secondary={`${formatDate(notification.sentAt)} - Tỷ lệ đọc: ${getReadRate(notification)}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Add Notification Dialog */}
        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Tạo thông báo mới</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Tiêu đề"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Nội dung"
                value={newNotification.content}
                onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Loại thông báo</InputLabel>
                  <Select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as Notification['type'] })}
                    label="Loại thông báo"
                  >
                    <MenuItem value="info">Thông tin</MenuItem>
                    <MenuItem value="warning">Cảnh báo</MenuItem>
                    <MenuItem value="success">Thành công</MenuItem>
                    <MenuItem value="error">Lỗi</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Độ ưu tiên</InputLabel>
                  <Select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value as Notification['priority'] })}
                    label="Độ ưu tiên"
                  >
                    <MenuItem value="high">Cao</MenuItem>
                    <MenuItem value="medium">Trung bình</MenuItem>
                    <MenuItem value="low">Thấp</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Đối tượng</InputLabel>
                  <Select
                    value={newNotification.recipients}
                    onChange={(e) => setNewNotification({ ...newNotification, recipients: e.target.value as Notification['recipients'] })}
                    label="Đối tượng"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="MEMBER">Thành viên</MenuItem>
                    <MenuItem value="STAFF">Nhân viên</MenuItem>
                    <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={newNotification.sendNow}
                    onChange={(e) => setNewNotification({ ...newNotification, sendNow: e.target.checked })}
                  />
                }
                label="Gửi ngay"
              />
              
              {!newNotification.sendNow && (
                <DateTimePicker
                  label="Lên lịch gửi"
                  value={newNotification.scheduledAt}
                  onChange={(newValue) => setNewNotification({ ...newNotification, scheduledAt: newValue })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleAddNotification} 
              variant="contained"
              disabled={!newNotification.title || !newNotification.content}
            >
              {newNotification.sendNow ? 'Tạo và gửi' : 'Tạo thông báo'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Notification Dialog */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Chỉnh sửa thông báo</DialogTitle>
          <DialogContent>
            {selectedNotification && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  label="Tiêu đề"
                  value={selectedNotification.title}
                  onChange={(e) => setSelectedNotification({ ...selectedNotification, title: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Nội dung"
                  value={selectedNotification.content}
                  onChange={(e) => setSelectedNotification({ ...selectedNotification, content: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Loại thông báo</InputLabel>
                    <Select
                      value={selectedNotification.type}
                      onChange={(e) => setSelectedNotification({ ...selectedNotification, type: e.target.value as Notification['type'] })}
                      label="Loại thông báo"
                    >
                      <MenuItem value="info">Thông tin</MenuItem>
                      <MenuItem value="warning">Cảnh báo</MenuItem>
                      <MenuItem value="success">Thành công</MenuItem>
                      <MenuItem value="error">Lỗi</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Độ ưu tiên</InputLabel>
                    <Select
                      value={selectedNotification.priority}
                      onChange={(e) => setSelectedNotification({ ...selectedNotification, priority: e.target.value as Notification['priority'] })}
                      label="Độ ưu tiên"
                    >
                      <MenuItem value="high">Cao</MenuItem>
                      <MenuItem value="medium">Trung bình</MenuItem>
                      <MenuItem value="low">Thấp</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Đối tượng</InputLabel>
                    <Select
                      value={selectedNotification.recipients}
                      onChange={(e) => setSelectedNotification({ ...selectedNotification, recipients: e.target.value as Notification['recipients'] })}
                      label="Đối tượng"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="MEMBER">Thành viên</MenuItem>
                      <MenuItem value="STAFF">Nhân viên</MenuItem>
                      <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveEdit} variant="contained">Lưu</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.
            </Typography>
            {selectedNotification && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">{selectedNotification.title}</Typography>
              </Box>
            )}
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
    </LocalizationProvider>
  )
}