import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { authApi } from '../services/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetCode = searchParams.get('code')

  const [formData, setFormData] = useState({
    resetCode: resetCode || '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.resetCode) {
      setError('Mã đặt lại mật khẩu không hợp lệ')
      return false
    }
    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới')
      return false
    }
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return false
    }
    if (!formData.confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu')
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
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
      await authApi.resetPassword(formData.resetCode, formData.newPassword)
      setSuccess(true)
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể đặt lại mật khẩu'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!resetCode) {
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
          <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
            <Alert severity="error">
              Mã đặt lại mật khẩu không hợp lệ. 
              <Link to="/forgot-password" style={{ marginLeft: '10px', color: '#4f46e5' }}>
                Yêu cầu mới
              </Link>
            </Alert>
          </Paper>
        </Box>
      </Container>
    )
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
          py: 2,
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
              sx={{ mr: 'auto' }}
            >
              Quay Lại
            </Button>
          </Box>

          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
            Đặt Lại Mật Khẩu
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng nhập mật khẩu mới của bạn
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✓ Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...
            </Alert>
          )}

          {!success && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Mật Khẩu Mới"
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
                placeholder="••••••"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="Tối thiểu 6 ký tự"
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Xác Nhận Mật Khẩu"
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                placeholder="••••••"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                {loading ? <CircularProgress size={24} /> : 'Đặt Lại Mật Khẩu'}
              </Button>
            </Box>
          )}
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          © 2025 Trợ lý ảo ChoGao. Bảo lưu mọi quyền.
        </Typography>
      </Box>
    </Container>
  )
}
