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
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import QuizIcon from '@mui/icons-material/esm/Quiz'
import EditIcon from '@mui/icons-material/esm/Edit'
import DeleteIcon from '@mui/icons-material/esm/Delete'
import ExpandMoreIcon from '@mui/icons-material/esm/ExpandMore'
import VisibilityIcon from '@mui/icons-material/esm/Visibility'
import VisibilityOffIcon from '@mui/icons-material/esm/VisibilityOff'
import { useNavigate } from 'react-router-dom'
import AdminFilter from '../components/AdminFilter'
import type { FilterField } from '../components/AdminFilter'
import ActionDropdown from '../components/ActionDropdown'

interface QAItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  status: 'active' | 'inactive' | 'draft'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  updatedAt: string
  views: number
  isHelpful: number
  isNotHelpful: number
}

// Mock data
const mockQAData: QAItem[] = [
  {
    id: '1',
    question: 'Làm thế nào để đăng ký môn học mới?',
    answer: 'Để đăng ký môn học mới, bạn cần:\n1. Đăng nhập vào hệ thống quản lý học tập\n2. Chọn mục "Đăng ký môn học"\n3. Tìm kiếm và chọn môn học phù hợp\n4. Kiểm tra lịch học và xác nhận đăng ký\n5. Thanh toán học phí (nếu có)',
    category: 'Học vụ',
    tags: ['đăng ký', 'môn học', 'hướng dẫn'],
    status: 'active',
    priority: 'high',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-11-01T10:15:00Z',
    views: 245,
    isHelpful: 89,
    isNotHelpful: 5
  },
  {
    id: '2',
    question: 'Làm sao để xem điểm số và kết quả học tập?',
    answer: 'Bạn có thể xem điểm số và kết quả học tập bằng cách:\n1. Truy cập vào hệ thống với tài khoản sinh viên\n2. Vào mục "Kết quả học tập"\n3. Chọn học kỳ cần xem\n4. Xem chi tiết điểm từng môn học và GPA',
    category: 'Điểm số',
    tags: ['điểm', 'kết quả', 'GPA'],
    status: 'active',
    priority: 'high',
    createdAt: '2024-02-10T14:20:00Z',
    updatedAt: '2024-10-15T16:30:00Z',
    views: 189,
    isHelpful: 76,
    isNotHelpful: 3
  },
  {
    id: '3',
    question: 'Quy trình nộp đơn xin nghỉ học như thế nào?',
    answer: 'Quy trình nộp đơn xin nghỉ học:\n1. Tải mẫu đơn từ website của trường\n2. Điền đầy đủ thông tin và lý do\n3. Xin chữ ký của phụ huynh (nếu chưa đủ 18 tuổi)\n4. Nộp đơn tại phòng Đào tạo\n5. Chờ phê duyệt từ Ban Giám hiệu',
    category: 'Thủ tục',
    tags: ['nghỉ học', 'đơn từ', 'thủ tục'],
    status: 'active',
    priority: 'medium',
    createdAt: '2024-03-05T09:45:00Z',
    updatedAt: '2024-09-20T11:00:00Z',
    views: 67,
    isHelpful: 23,
    isNotHelpful: 2
  },
  {
    id: '4',
    question: 'Tôi quên mật khẩu đăng nhập, làm sao để lấy lại?',
    answer: 'Để lấy lại mật khẩu:\n1. Vào trang đăng nhập của hệ thống\n2. Nhấp vào "Quên mật khẩu?"\n3. Nhập email hoặc mã số sinh viên\n4. Kiểm tra email để nhận liên kết đặt lại mật khẩu\n5. Tạo mật khẩu mới và đăng nhập lại',
    category: 'Kỹ thuật',
    tags: ['mật khẩu', 'đăng nhập', 'khôi phục'],
    status: 'active',
    priority: 'medium',
    createdAt: '2024-04-12T13:15:00Z',
    updatedAt: '2024-11-10T09:20:00Z',
    views: 134,
    isHelpful: 45,
    isNotHelpful: 8
  },
  {
    id: '5',
    question: 'Thông tin về học bổng và trợ cấp cho sinh viên?',
    answer: 'Thông tin về học bổng và trợ cấp:\n1. Học bổng khuyến khích học tập cho sinh viên xuất sắc\n2. Trợ cấp xã hội cho sinh viên có hoàn cảnh khó khăn\n3. Học bổng tài trợ từ các doanh nghiệp đối tác\n4. Thời gian nộp hồ sơ: đầu mỗi học kỳ\n5. Liên hệ phòng Công tác sinh viên để biết thêm chi tiết',
    category: 'Học bổng',
    tags: ['học bổng', 'trợ cấp', 'hỗ trợ'],
    status: 'draft',
    priority: 'low',
    createdAt: '2024-05-18T16:30:00Z',
    updatedAt: '2024-11-15T14:45:00Z',
    views: 78,
    isHelpful: 28,
    isNotHelpful: 4
  }
]

const categories = ['Tất cả', 'Học vụ', 'Điểm số', 'Thủ tục', 'Kỹ thuật', 'Học bổng']

const statusLabels = {
  active: 'Hoạt động',
  inactive: 'Ngưng hoạt động',
  draft: 'Bản nháp'
}

const statusColors = {
  active: 'success',
  inactive: 'error',
  draft: 'warning'
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

export default function QAManagement() {
  const navigate = useNavigate()
  const [qaItems, setQaItems] = useState<QAItem[]>(mockQAData)
  const [filteredItems, setFilteredItems] = useState<QAItem[]>(mockQAData)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterValues, setFilterValues] = useState({ category: 'Tất cả', status: 'all' })
  const [selectedItem, setSelectedItem] = useState<QAItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [tabValue, setTabValue] = useState(0)

  // New QA item form state
  const [newItem, setNewItem] = useState({
    question: '',
    answer: '',
    category: 'Học vụ',
    tags: '',
    status: 'draft' as QAItem['status'],
    priority: 'medium' as QAItem['priority']
  })

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'category',
      label: 'Danh mục',
      options: categories.map(cat => ({ value: cat, label: cat })),
      defaultValue: 'Tất cả'
    },
    {
      key: 'status',
      label: 'Trạng thái',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Ngưng hoạt động' },
        { value: 'draft', label: 'Bản nháp' }
      ],
      defaultValue: 'all'
    }
  ]

  // Filter items based on search term, category, and status
  useEffect(() => {
    let filtered = qaItems.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterValues.category === 'Tất cả' || item.category === filterValues.category
      const matchesStatus = filterValues.status === 'all' || item.status === filterValues.status
      
      return matchesSearch && matchesCategory && matchesStatus
    })

    setFilteredItems(filtered)
    setPage(0)
  }, [searchTerm, filterValues, qaItems])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEditItem = (item: QAItem) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  const handleViewItem = (item: QAItem) => {
    setSelectedItem(item)
    setIsViewDialogOpen(true)
  }

  const handleDeleteItem = (item: QAItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (selectedItem) {
      const updatedItem = {
        ...selectedItem,
        updatedAt: new Date().toISOString()
      }
      setQaItems(qaItems.map(item => 
        item.id === selectedItem.id ? updatedItem : item
      ))
      setSnackbar({ open: true, message: 'Cập nhật câu hỏi thành công', severity: 'success' })
      setIsEditDialogOpen(false)
      setSelectedItem(null)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setQaItems(qaItems.filter(item => item.id !== selectedItem.id))
      setSnackbar({ open: true, message: 'Xóa câu hỏi thành công', severity: 'success' })
      setIsDeleteDialogOpen(false)
      setSelectedItem(null)
    }
  }

  const handleAddItem = () => {
    const newId = String(Date.now())
    const itemToAdd: QAItem = {
      ...newItem,
      id: newId,
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      isHelpful: 0,
      isNotHelpful: 0
    }
    
    setQaItems([...qaItems, itemToAdd])
    setSnackbar({ open: true, message: 'Thêm câu hỏi mới thành công', severity: 'success' })
    setIsAddDialogOpen(false)
    setNewItem({ 
      question: '', 
      answer: '', 
      category: 'Học vụ', 
      tags: '', 
      status: 'draft', 
      priority: 'medium' 
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTopQuestions = () => {
    return [...qaItems]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }

  const getHelpfulnessRate = (item: QAItem) => {
    const total = item.isHelpful + item.isNotHelpful
    return total > 0 ? ((item.isHelpful / total) * 100).toFixed(1) : '0'
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
          icon={<QuizIcon />}
          label="Hệ thống hỗ trợ"
          sx={{ bgcolor: 'rgba(255,152,0,0.08)', color: 'warning.main' }}
        />
      </Stack>
      
      <Box>
        <Typography variant="h4" gutterBottom>
          Quản lý Q&A
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý câu hỏi thường gặp, câu trả lời và cập nhật cơ sở tri thức của hệ thống trợ lý ảo.
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Danh sách Q&A" />
          <Tab label="Thống kê" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Search and Filter Controls */}
            <AdminFilter
              searchPlaceholder="Tìm kiếm câu hỏi, câu trả lời hoặc tags..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              filterFields={filterFields}
              filterValues={filterValues}
              onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
              addButtonText="Thêm Q&A"
              onAdd={() => setIsAddDialogOpen(true)}
              onClearFilters={() => setFilterValues({ category: 'Tất cả', status: 'all' })}
            />

            {/* Q&A Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Câu hỏi</TableCell>
                    <TableCell>Danh mục</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Độ ưu tiên</TableCell>
                    <TableCell>Lượt xem</TableCell>
                    <TableCell>Hữu ích</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 300 }}>
                              {item.question}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {item.tags.map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabels[item.status]}
                            size="small"
                            color={statusColors[item.status]}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={priorityLabels[item.priority]}
                            size="small"
                            color={priorityColors[item.priority]}
                          />
                        </TableCell>
                        <TableCell>{item.views}</TableCell>
                        <TableCell>{getHelpfulnessRate(item)}%</TableCell>
                        <TableCell align="center">
                          <ActionDropdown
                            actions={[
                              {
                                id: 'view',
                                label: 'Xem chi tiết',
                                icon: <VisibilityIcon fontSize="small" />,
                                color: 'primary',
                                onClick: () => handleViewItem(item)
                              },
                              {
                                id: 'edit',
                                label: 'Chỉnh sửa',
                                icon: <EditIcon fontSize="small" />,
                                onClick: () => handleEditItem(item)
                              },
                              {
                                id: 'toggle',
                                label: item.status === 'active' ? 'Ẩn Q&A' : 'Hiển thị Q&A',
                                icon: item.status === 'active' ? 
                                  <VisibilityOffIcon fontSize="small" /> : 
                                  <VisibilityIcon fontSize="small" />,
                                color: item.status === 'active' ? 'warning' : 'success',
                                onClick: () => {
                                  const newStatus = item.status === 'active' ? 'inactive' : 'active'
                                  setQaItems(qaItems.map(qa => 
                                    qa.id === item.id ? { ...qa, status: newStatus, updatedAt: new Date().toISOString() } : qa
                                  ))
                                  setSnackbar({ 
                                    open: true, 
                                    message: item.status === 'active' ? 'Đã ẩn Q&A' : 'Đã hiển thị Q&A', 
                                    severity: 'success' 
                                  })
                                },
                                divider: true
                              },
                              {
                                id: 'delete',
                                label: 'Xóa Q&A',
                                icon: <DeleteIcon fontSize="small" />,
                                color: 'error',
                                onClick: () => handleDeleteItem(item)
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
                count={filteredItems.length}
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
              Thống kê Q&A
            </Typography>
            <Stack spacing={3}>
              {/* General Stats */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1 }}>
                  <Typography variant="subtitle1">Tổng số câu hỏi: {qaItems.length}</Typography>
                </Paper>
                <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1 }}>
                  <Typography variant="subtitle1">Đang hoạt động: {qaItems.filter(q => q.status === 'active').length}</Typography>
                </Paper>
                <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1 }}>
                  <Typography variant="subtitle1">Bản nháp: {qaItems.filter(q => q.status === 'draft').length}</Typography>
                </Paper>
              </Stack>

              {/* Top Questions */}
              <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom>
                  Top 5 câu hỏi được xem nhiều nhất
                </Typography>
                {getTopQuestions().map((item, index) => (
                  <Accordion key={item.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                        <Chip label={`#${index + 1}`} size="small" color="primary" />
                        <Typography sx={{ flexGrow: 1 }}>{item.question}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.views} lượt xem
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Danh mục:</strong> {item.category}<br />
                        <strong>Tỉ lệ hữu ích:</strong> {getHelpfulnessRate(item)}%<br />
                        <strong>Cập nhật cuối:</strong> {formatDate(item.updatedAt)}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* View Item Dialog */}
      <Dialog open={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết Q&A</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Câu hỏi</Typography>
                <Typography variant="body1">{selectedItem.question}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Câu trả lời</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedItem.answer}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Danh mục</Typography>
                  <Chip label={selectedItem.category} size="small" color="primary" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                  <Chip label={statusLabels[selectedItem.status]} size="small" color={statusColors[selectedItem.status]} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Độ ưu tiên</Typography>
                  <Chip label={priorityLabels[selectedItem.priority]} size="small" color={priorityColors[selectedItem.priority]} />
                </Box>
              </Stack>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tags</Typography>
                <Box sx={{ mt: 0.5 }}>
                  {selectedItem.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
              </Box>
              <Stack direction="row" spacing={4}>
                <Typography variant="body2">
                  <strong>Lượt xem:</strong> {selectedItem.views}
                </Typography>
                <Typography variant="body2">
                  <strong>Hữu ích:</strong> {selectedItem.isHelpful}
                </Typography>
                <Typography variant="body2">
                  <strong>Không hữu ích:</strong> {selectedItem.isNotHelpful}
                </Typography>
                <Typography variant="body2">
                  <strong>Tỉ lệ hữu ích:</strong> {getHelpfulnessRate(selectedItem)}%
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
          <Button onClick={() => {
            setIsViewDialogOpen(false)
            selectedItem && handleEditItem(selectedItem)
          }} variant="contained">
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa Q&A</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Câu hỏi"
              value={selectedItem?.question || ''}
              onChange={(e) => selectedItem && setSelectedItem({ ...selectedItem, question: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Câu trả lời"
              value={selectedItem?.answer || ''}
              onChange={(e) => selectedItem && setSelectedItem({ ...selectedItem, answer: e.target.value })}
              fullWidth
              multiline
              rows={6}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={selectedItem?.category || ''}
                  onChange={(e) => selectedItem && setSelectedItem({ ...selectedItem, category: e.target.value })}
                  label="Danh mục"
                >
                  {categories.filter(cat => cat !== 'Tất cả').map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={selectedItem?.status || ''}
                  onChange={(e) => selectedItem && setSelectedItem({ ...selectedItem, status: e.target.value as QAItem['status'] })}
                  label="Trạng thái"
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  value={selectedItem?.priority || ''}
                  onChange={(e) => selectedItem && setSelectedItem({ ...selectedItem, priority: e.target.value as QAItem['priority'] })}
                  label="Độ ưu tiên"
                >
                  <MenuItem value="high">Cao</MenuItem>
                  <MenuItem value="medium">Trung bình</MenuItem>
                  <MenuItem value="low">Thấp</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Tags (phân cách bằng dấu phẩy)"
              value={selectedItem?.tags.join(', ') || ''}
              onChange={(e) => selectedItem && setSelectedItem({ 
                ...selectedItem, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              fullWidth
              helperText="Ví dụ: đăng ký, môn học, hướng dẫn"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm Q&A mới</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Câu hỏi"
              value={newItem.question}
              onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Câu trả lời"
              value={newItem.answer}
              onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
              fullWidth
              multiline
              rows={6}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  label="Danh mục"
                >
                  {categories.filter(cat => cat !== 'Tất cả').map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value as QAItem['status'] })}
                  label="Trạng thái"
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as QAItem['priority'] })}
                  label="Độ ưu tiên"
                >
                  <MenuItem value="high">Cao</MenuItem>
                  <MenuItem value="medium">Trung bình</MenuItem>
                  <MenuItem value="low">Thấp</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Tags (phân cách bằng dấu phẩy)"
              value={newItem.tags}
              onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
              fullWidth
              helperText="Ví dụ: đăng ký, môn học, hướng dẫn"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained"
            disabled={!newItem.question || !newItem.answer}
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
            Bạn có chắc chắn muốn xóa câu hỏi này?
            Hành động này không thể hoàn tác.
          </Typography>
          {selectedItem && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">{selectedItem.question}</Typography>
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
  )
}