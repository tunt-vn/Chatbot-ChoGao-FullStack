import { Box, Grid, Paper, Stack, Typography, Chip, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/esm/Dashboard'
import AnalyticsIcon from '@mui/icons-material/esm/Analytics'
import SettingsIcon from '@mui/icons-material/esm/SettingsApplications'
import PeopleIcon from '@mui/icons-material/esm/People'
import QuizIcon from '@mui/icons-material/esm/Quiz'

export default function Admin() {
  const navigate = useNavigate()

  const adminCards = [
    {
      icon: <AnalyticsIcon color="primary" />,
      title: 'Báo cáo & Thống kê',
      description: 'Phân tích mức độ sử dụng, lượt câu hỏi phổ biến và chất lượng phản hồi của trợ lý.',
      action: () => console.log('Coming soon'),
      buttonText: 'Khám phá thêm'
    },
    {
      icon: <SettingsIcon color="secondary" />,
      title: 'Quản lý nội dung',
      description: 'Điều chỉnh, cập nhật FAQ, kịch bản hội thoại và thiết lập chính sách trả lời.',
      action: () => console.log('Coming soon'),
      buttonText: 'Khám phá thêm'
    },
    {
      icon: <PeopleIcon color="success" />,
      title: 'Quản lý người dùng',
      description: 'Quản lý thông tin người dùng, phân quyền và theo dõi hoạt động của các tài khoản.',
      action: () => navigate('/admin/users'),
      buttonText: 'Quản lý ngay'
    },
    {
      icon: <QuizIcon color="warning" />,
      title: 'Quản lý Q&A',
      description: 'Quản lý câu hỏi thường gặp, câu trả lời và cập nhật cơ sở tri thức của hệ thống.',
      action: () => navigate('/admin/qa'),
      buttonText: 'Quản lý ngay'
    }
  ]

  return (
    <Stack spacing={3}>
      <Box>
        <Chip
          icon={<DashboardIcon />}
          label="Không gian dành cho quản trị viên"
          sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: 'primary.main', mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Bảng điều khiển - Quản trị
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi hiệu suất trợ lý, quản lý nội dung FAQ và thống kê tương tác trong một giao diện trực quan.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {adminCards.map((card) => (
          <Grid key={card.title} item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(226,232,240,0.9)',
                backgroundColor: 'rgba(255,255,255,0.92)',
                height: '100%',
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(79,70,229,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6">{card.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={card.action}
                >
                  {card.buttonText}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
