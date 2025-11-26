import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  Divider
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import StatisticsCards, { StatIcons } from '../components/StatisticsCards'
import TrendingUpIcon from '@mui/icons-material/esm/TrendingUp'
import ChatIcon from '@mui/icons-material/esm/Chat'
import QuestionAnswerIcon from '@mui/icons-material/esm/QuestionAnswer'

// Mock data
const mockDashboardStats = [
  {
    title: 'Tổng số người dùng',
    value: 2456,
    icon: StatIcons.People,
    color: 'primary' as const,
    description: '+12% so với tháng trước'
  },
  {
    title: 'Câu hỏi hôm nay',
    value: 189,
    icon: StatIcons.Quiz,
    color: 'success' as const,
    description: '+5% so với hôm qua'
  },
  {
    title: 'Tỷ lệ phản hồi',
    value: '94%',
    icon: StatIcons.CheckCircle,
    color: 'info' as const,
    description: 'Cải thiện 2% từ tuần trước'
  },
  {
    title: 'Người dùng hoạt động',
    value: 1234,
    icon: StatIcons.Visibility,
    color: 'warning' as const,
    description: 'Trong 7 ngày qua'
  }
]

const mockChatData = [
  { name: 'T2', cuoiHoi: 45, traLoi: 42 },
  { name: 'T3', cuoiHoi: 52, traLoi: 48 },
  { name: 'T4', cuoiHoi: 48, traLoi: 46 },
  { name: 'T5', cuoiHoi: 61, traLoi: 58 },
  { name: 'T6', cuoiHoi: 55, traLoi: 52 },
  { name: 'T7', cuoiHoi: 38, traLoi: 35 },
  { name: 'CN', cuoiHoi: 42, traLoi: 40 }
]

const mockUserGrowthData = [
  { month: 'T1', users: 800 },
  { month: 'T2', users: 1200 },
  { month: 'T3', users: 1600 },
  { month: 'T4', users: 2000 },
  { month: 'T5', users: 2200 },
  { month: 'T6', users: 2456 }
]

const mockTopicData = [
  { name: 'Đăng ký môn học', value: 35, color: '#8884d8' },
  { name: 'Lịch thi', value: 25, color: '#82ca9d' },
  { name: 'Học phí', value: 20, color: '#ffc658' },
  { name: 'Thủ tục hành chính', value: 15, color: '#ff7c7c' },
  { name: 'Khác', value: 5, color: '#8dd1e1' }
]

const mockActiveHours = [
  { hour: '6h', activity: 5 },
  { hour: '8h', activity: 25 },
  { hour: '10h', activity: 45 },
  { hour: '12h', activity: 60 },
  { hour: '14h', activity: 70 },
  { hour: '16h', activity: 55 },
  { hour: '18h', activity: 40 },
  { hour: '20h', activity: 30 },
  { hour: '22h', activity: 15 }
]

const mockRecentActivities = [
  { user: 'Nguyễn Văn A', action: 'Đặt câu hỏi về lịch thi', time: '2 phút trước', avatar: '👨‍🎓' },
  { user: 'Trần Thị B', action: 'Hỏi về thủ tục đăng ký môn học', time: '5 phút trước', avatar: '👩‍🎓' },
  { user: 'Lê Văn C', action: 'Kiểm tra kết quả học tập', time: '8 phút trước', avatar: '👨‍💼' },
  { user: 'Phạm Thị D', action: 'Hỏi về học phí học kỳ 2', time: '12 phút trước', avatar: '👩‍💻' },
  { user: 'Hoàng Văn E', action: 'Đặt câu hỏi về thời khóa biểu', time: '15 phút trước', avatar: '👨‍🔬' }
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Đang tải dashboard...</Typography>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Bảng điều khiển - Quản trị
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi hiệu suất trợ lý, quản lý nội dung FAQ và thống kê tương tác trong một giao diện trực quan.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <StatisticsCards cards={mockDashboardStats} />

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Chat Activity Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ChatIcon sx={{ mr: 1, color: 'primary.main' }} />
                Hoạt động Chat theo ngày
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={mockChatData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cuoiHoi" fill="#8884d8" name="Câu hỏi" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="traLoi" fill="#82ca9d" name="Trả lời" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Topics */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <QuestionAnswerIcon sx={{ mr: 1, color: 'success.main' }} />
                Chủ đề phổ biến
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={mockTopicData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  >
                    {mockTopicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '350px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'info.main' }} />
                Tăng trưởng người dùng
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={mockUserGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Hours */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '350px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Giờ cao điểm
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={mockActiveHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="#ff7c7c" 
                    strokeWidth={3}
                    dot={{ fill: '#ff7c7c', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities and Quick Stats */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>
              <Stack spacing={2}>
                {mockRecentActivities.map((activity, index) => (
                  <Box key={index}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {activity.avatar}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {activity.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.action}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Stack>
                    {index < mockRecentActivities.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Performance Stats */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hiệu suất hệ thống
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Thời gian phản hồi trung bình</Typography>
                    <Chip label="1.2s" size="small" color="success" />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Độ chính xác câu trả lời</Typography>
                    <Chip label="94%" size="small" color="info" />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={94}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    color="info"
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Tỷ lệ hài lòng</Typography>
                    <Chip 
                      label="92%" 
                      size="small" 
                      color="warning"
                      icon={<TrendingUpIcon />}
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={92}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    color="warning"
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Uptime hệ thống</Typography>
                    <Chip label="99.9%" size="small" color="success" />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={99.9}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}