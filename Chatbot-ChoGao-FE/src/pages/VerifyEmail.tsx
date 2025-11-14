import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material'
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setError('Token không hợp lệ')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/auth/verify-mail?token=${token}`
        )

        if (response.ok) {
          setSuccess(true)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login?verified=true')
          }, 3000)
        } else {
          const errorText = await response.text()
          setError(errorText || 'Xác thực email thất bại')
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi xác thực email')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
            Xác thực Email
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography color="textSecondary">
                Đang xác thực email của bạn...
              </Typography>
            </Box>
          )}

          {success && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
              <Alert severity="success">
                Xác thực email thành công! Chúng tôi sẽ chuyển hướng bạn đến trang đăng nhập...
              </Alert>
              <Button variant="contained" onClick={() => navigate('/login')}>
                Quay lại Đăng nhập
              </Button>
            </Box>
          )}

          {error && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />
              <Alert severity="error">{error}</Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
              >
                Quay lại Đăng ký
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  )
}
