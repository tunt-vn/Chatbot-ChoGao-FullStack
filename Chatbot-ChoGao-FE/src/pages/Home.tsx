import { Box, Grid, Paper, Stack, Typography, Chip, Divider } from '@mui/material'
import SchoolIcon from '@mui/icons-material/esm/School'
import InsightsIcon from '@mui/icons-material/esm/Insights'
import MessageIcon from '@mui/icons-material/esm/ChatBubble'
import CalendarTodayIcon from '@mui/icons-material/esm/CalendarToday'

const highlights = [
  {
    icon: <MessageIcon />,
    title: 'Trò chuyện tức thời',
    description: 'Nhận giải đáp nhanh chóng cho câu hỏi của phụ huynh, học sinh và giáo viên.',
  },
  {
    icon: <CalendarTodayIcon />,
    title: 'Lịch trình thông minh',
    description: 'Theo dõi sự kiện, lịch học và hoạt động nổi bật của trường chỉ trong vài giây.',
  },
  {
    icon: <InsightsIcon />,
    title: 'Phân tích dữ liệu',
    description: 'Nắm bắt báo cáo, thống kê tương tác để cải thiện chất lượng hỗ trợ.',
  },
]

export default function Home() {
  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 1,
          background:
            'linear-gradient(135deg, rgba(79,70,229,0.16) 0%, rgba(236,72,153,0.12) 50%, rgba(14,116,144,0.18) 100%)',
          border: '1px solid rgba(79,70,229,0.12)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
          <Box flex={1}>
            <Chip
              icon={<SchoolIcon />}
              label="Nền tảng trợ lý ảo cho giáo dục"
              color="secondary"
              sx={{ bgcolor: 'rgba(236,72,153,0.16)', color: 'secondary.dark', mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              Chào mừng đến với Trợ lý ảo của Nhà trường
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Nắm bắt thông tin học đường mọi lúc, mọi nơi. Trợ lý giúp kết nối nhà trường - giáo viên - học sinh - phụ
              huynh nhanh gọn và hiệu quả hơn.
            </Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(226,232,240,0.9)',
              minWidth: { md: 260 },
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Thông tin nhanh
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">• FAQ cập nhật thường xuyên</Typography>
              <Typography variant="body2">• Lịch sự kiện học đường</Typography>
              <Typography variant="body2">• Kênh kết nối phụ huynh</Typography>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {highlights.map((item) => (
          <Grid key={item.title} item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Chip
                icon={item.icon}
                label={item.title}
                sx={{ fontWeight: 600, alignSelf: 'flex-start', bgcolor: 'rgba(79,70,229,0.08)' }}
              />
              <Typography variant="body1" color="text.secondary">
                {item.description}
              </Typography>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                Được cập nhật liên tục theo dữ liệu mới nhất.
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
