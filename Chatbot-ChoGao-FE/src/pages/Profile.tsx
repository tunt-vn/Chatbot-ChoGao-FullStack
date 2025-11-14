import { Paper, Box, Typography, Stack, Avatar, Button } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Thông Tin Cá Nhân
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Stack spacing={1}>
              <Typography variant="h6">Tên:</Typography>
              <Typography variant="body1">{user?.name || 'Chưa cập nhật'}</Typography>
            </Stack>
          </Stack>

          <Box>
            <Typography variant="h6" gutterBottom>
              Email:
            </Typography>
            <Typography variant="body1">{user?.email || 'Chưa cập nhật'}</Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Vai trò:
            </Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {user?.role || 'Người dùng'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="contained">Cập Nhật Thông Tin</Button>
            <Button variant="outlined">Đổi Mật Khẩu</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
