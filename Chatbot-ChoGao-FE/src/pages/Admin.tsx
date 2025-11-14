import { Box, Grid, Paper, Stack, Typography, Chip, Button } from '@mui/material'
import DashboardIcon from '@mui/icons-material/esm/Dashboard'
import AnalyticsIcon from '@mui/icons-material/esm/Analytics'
import SettingsIcon from '@mui/icons-material/esm/SettingsApplications'

export default function Admin() {
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
        {[
          {
            icon: <AnalyticsIcon color="primary" />,
            title: 'Báo cáo & Thống kê',
            description: 'Phân tích mức độ sử dụng, lượt câu hỏi phổ biến và chất lượng phản hồi của trợ lý.',
          },
          {
            icon: <SettingsIcon color="secondary" />,
            title: 'Quản lý nội dung',
            description: 'Điều chỉnh, cập nhật FAQ, kịch bản hội thoại và thiết lập chính sách trả lời.',
          },
        ].map((card) => (
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
                <Button variant="outlined" color="primary" sx={{ alignSelf: 'flex-start' }}>
                  Khám phá thêm
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
