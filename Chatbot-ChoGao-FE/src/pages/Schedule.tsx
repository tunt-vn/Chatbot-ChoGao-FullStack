import { Box, Grid, Paper, Stack, Typography, Chip } from '@mui/material'
import EventIcon from '@mui/icons-material/esm/Event'
import AccessTimeIcon from '@mui/icons-material/esm/AccessTime'

const events = [
  { title: 'Khai giảng', date: '2025-09-01' },
  { title: 'Họp phụ huynh', date: '2025-11-20' },
]

export default function Schedule() {
  return (
    <Stack spacing={3}>
      <Box>
        <Chip
          icon={<EventIcon />}
          label="Danh sách sự kiện sắp tới"
          sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: 'primary.main', mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Lịch học & Sự kiện
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi các hoạt động quan trọng của trường để không bỏ lỡ thông tin.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid key={event.title} item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(226,232,240,0.9)',
                backgroundColor: 'rgba(255,255,255,0.92)',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: 'rgba(79,70,229,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccessTimeIcon color="primary" />
                  </Box>
                  <Typography variant="h6">{event.title}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {event.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chi tiết cụ thể sẽ được cập nhật qua thông báo chính thức từ nhà trường.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
