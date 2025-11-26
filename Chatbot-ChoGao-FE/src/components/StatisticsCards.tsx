import { Box, Grid, Paper, Stack, Typography, useTheme } from '@mui/material'
import PeopleIcon from '@mui/icons-material/esm/People'
import PersonAddIcon from '@mui/icons-material/esm/PersonAdd'
import BlockIcon from '@mui/icons-material/esm/Block'
import CheckCircleIcon from '@mui/icons-material/esm/CheckCircle'
import QuizIcon from '@mui/icons-material/esm/Quiz'
import VisibilityIcon from '@mui/icons-material/esm/Visibility'
import ThumbUpIcon from '@mui/icons-material/esm/ThumbUp'
import DraftsIcon from '@mui/icons-material/esm/Drafts'
import NotificationsIcon from '@mui/icons-material/esm/Notifications'
import SendIcon from '@mui/icons-material/esm/Send'
import ScheduleIcon from '@mui/icons-material/esm/Schedule'
import HistoryIcon from '@mui/icons-material/esm/History'
import LoginIcon from '@mui/icons-material/esm/Login'
import AdminPanelSettingsIcon from '@mui/icons-material/esm/AdminPanelSettings'

export interface StatCard {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
  description?: string
}

interface StatisticsCardsProps {
  cards: StatCard[]
  title?: string
}

const colorConfig = {
  primary: {
    bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    iconBg: '#1976d2',
    color: '#1976d2',
    textColor: '#1976d2'
  },
  success: {
    bg: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%)',
    iconBg: '#388e3c',
    color: '#388e3c',
    textColor: '#2e7d32'
  },
  warning: {
    bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    iconBg: '#f57c00',
    color: '#f57c00',
    textColor: '#ef6c00'
  },
  error: {
    bg: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
    iconBg: '#d32f2f',
    color: '#d32f2f',
    textColor: '#c62828'
  },
  info: {
    bg: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
    iconBg: '#0288d1',
    color: '#0288d1',
    textColor: '#0277bd'
  }
}

export default function StatisticsCards({ cards, title }: StatisticsCardsProps) {
  const theme = useTheme()

  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.secondary' }}>
          {title}
        </Typography>
      )}
      <Grid container spacing={3}>
        {cards.map((card, index) => {
          const config = colorConfig[card.color]
          return (
            <Grid key={index} item xs={12} sm={6} md={4} lg={12/Math.min(cards.length, 6)} xl={12/Math.min(cards.length, 6)}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: config.bg,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: `radial-gradient(circle at center, ${config.iconBg}20 0%, transparent 70%)`,
                    opacity: 0.6
                  }
                }}
              >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ height: '100%' }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      backgroundColor: config.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: `0 4px 12px ${config.iconBg}40`,
                      mb: 2
                    }}
                  >
                    {card.icon}
                  </Box>
                  
                  {/* Content */}
                  <Box sx={{ flexGrow: 1, ml: 2 }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700,
                        color: config.textColor,
                        mb: 0.5,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      {typeof card.value === 'number' ? card.value.toLocaleString('vi-VN') : card.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        lineHeight: 1.2
                      }}
                    >
                      {card.title}
                    </Typography>
                    {card.description && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.8
                        }}
                      >
                        {card.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

// Predefined icon exports for convenience
export const StatIcons = {
  People: <PeopleIcon />,
  PersonAdd: <PersonAddIcon />,
  Block: <BlockIcon />,
  CheckCircle: <CheckCircleIcon />,
  Quiz: <QuizIcon />,
  Visibility: <VisibilityIcon />,
  ThumbUp: <ThumbUpIcon />,
  Drafts: <DraftsIcon />,
  Notifications: <NotificationsIcon />,
  Send: <SendIcon />,
  Schedule: <ScheduleIcon />,
  History: <HistoryIcon />,
  Login: <LoginIcon />,
  AdminPanelSettings: <AdminPanelSettingsIcon />
}

// Predefined stat card configurations for different admin pages
export const UserManagementStats = (users: any[] = []): StatCard[] => [
  {
    title: 'Tổng số người dùng',
    value: users.length,
    icon: StatIcons.People,
    color: 'primary'
  },
  {
    title: 'Người dùng hoạt động',
    value: users.filter(u => u.status === 'active').length,
    icon: StatIcons.CheckCircle,
    color: 'success'
  },
  {
    title: 'Chờ phê duyệt',
    value: users.filter(u => u.status === 'pending').length,
    icon: StatIcons.Schedule,
    color: 'warning'
  },
  {
    title: 'Người dùng bị chặn',
    value: users.filter(u => u.status === 'inactive').length,
    icon: StatIcons.Block,
    color: 'error'
  }
]

export const QAManagementStats = (qaItems: any[] = []): StatCard[] => [
  {
    title: 'Tổng câu hỏi',
    value: qaItems.length,
    icon: StatIcons.Quiz,
    color: 'primary'
  },
  {
    title: 'Đang hoạt động',
    value: qaItems.filter(q => q.status === 'active').length,
    icon: StatIcons.CheckCircle,
    color: 'success'
  },
  {
    title: 'Bản nháp',
    value: qaItems.filter(q => q.status === 'draft').length,
    icon: StatIcons.Drafts,
    color: 'warning'
  },
  {
    title: 'Ngưng hoạt động',
    value: qaItems.filter(q => q.status === 'inactive').length,
    icon: StatIcons.Block,
    color: 'error'
  },
  {
    title: 'Tổng lượt xem',
    value: qaItems.reduce((sum, q) => sum + (q.views || 0), 0),
    icon: StatIcons.Visibility,
    color: 'info'
  }
]

export const NotificationStats = (notifications: any[] = []): StatCard[] => [
  {
    title: 'Tổng thông báo',
    value: notifications.length,
    icon: StatIcons.Notifications,
    color: 'primary'
  },
  {
    title: 'Đã gửi',
    value: notifications.filter(n => n.status === 'sent').length,
    icon: StatIcons.Send,
    color: 'success'
  },
  {
    title: 'Đang chờ',
    value: notifications.filter(n => n.status === 'pending').length + notifications.filter(n => n.status === 'scheduled').length,
    icon: StatIcons.Schedule,
    color: 'warning'
  },
  {
    title: 'Bản nháp',
    value: notifications.filter(n => n.status === 'draft').length,
    icon: StatIcons.Drafts,
    color: 'info'
  },
  {
    title: 'Thất bại',
    value: notifications.filter(n => n.status === 'failed').length,
    icon: StatIcons.Block,
    color: 'error'
  }
]

export const ActivityLogStats = (logs: any[] = []): StatCard[] => [
  {
    title: 'Tổng hoạt động',
    value: logs.length,
    icon: StatIcons.History,
    color: 'primary'
  },
  {
    title: 'Số lỗi',
    value: logs.filter(l => l.level === 'error').length,
    icon: StatIcons.AdminPanelSettings,
    color: 'error'
  },
  {
    title: 'Cảnh báo',
    value: logs.filter(l => l.level === 'warning').length,
    icon: StatIcons.Notifications,
    color: 'warning'
  },
  {
    title: 'Đăng nhập hôm nay',
    value: logs.filter(l => l.action === 'LOGIN' && isToday(l.timestamp)).length,
    icon: StatIcons.Login,
    color: 'success'
  },
  {
    title: 'Người dùng hoạt động',
    value: new Set(logs.filter(l => isToday(l.timestamp)).map(l => l.userId)).size,
    icon: StatIcons.People,
    color: 'info'
  }
]

function isToday(timestamp: string): boolean {
  if (!timestamp) return false
  const today = new Date()
  const date = new Date(timestamp)
  return date.toDateString() === today.toDateString()
}