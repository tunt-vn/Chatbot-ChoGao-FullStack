import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError('Vui lòng nhập email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email không hợp lệ')
      return false
    }
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu')
      return false
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      // Sử dụng login từ AuthContext để cập nhật user state
      await login(formData.email, formData.password)
      setSuccess(true)
      
      // Redirect to chat page after successful login
      setTimeout(() => {
        navigate('/chat')
      }, 1000)
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng nhập thất bại'
      // Check if it's a verification error
      if (errorMessage.includes('401') || errorMessage.includes('chưa được xác thực')) {
        setError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.')
      } else if (errorMessage.includes('Tài khoản không tồn tại')) {
        setError('Email hoặc mật khẩu không đúng.')
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.')
      }
    } finally {
      setLoading(false)
    }
  }

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
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
            Đăng Nhập
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Chào mừng quay lại Trợ lý ảo ChoGao
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✓ Đăng nhập thành công! Đang chuyển hướng...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="your@email.com"
              type="email"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật Khẩu"
              id="password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="••••••"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.2, fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng Nhập'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: '#4f46e5' }}>Đăng Ký Ngay</span>
                </Link>
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#4f46e5',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          © 2025 Trợ lý ảo ChoGao. Bảo lưu mọi quyền.
        </Typography>
      </Box>
    </Container>
  )
}
