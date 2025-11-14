import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material'
import { authApi } from '../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Vui lòng nhập email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ')
      return false
    }
    return true
  }

  const validateResetForm = (): boolean => {
    if (!resetCode.trim()) {
      setError('Vui lòng nhập mã xác thực')
      return false
    }
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới')
      return false
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return false
    }
    if (!confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu')
      return false
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp')
      return false
    }
    return true
  }

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateEmail()) return

    setLoading(true)
    setError(null)

    try {
      await authApi.forgotPassword(email)
      setSuccess(true)
      setStep('verify')
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể gửi mã xác thực'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateResetForm()) return

    setLoading(true)
    setError(null)

    try {
      await authApi.resetPassword(resetCode, newPassword, email)
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login?reset=true')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể đặt lại mật khẩu'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'verify') {
      setStep('email')
      setError(null)
      setResetCode('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      navigate('/login')
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
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ mr: 'auto' }}
            >
              Quay Lại
            </Button>
          </Box>

          {/* STEP 1: Email Input */}
          {step === 'email' && (
            <>
              <Typography variant="h4" align="center" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                Quên Mật Khẩu
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Nhập email của bạn để nhận mã xác thực
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✓ Mã xác thực đã được gửi đến email của bạn!
                </Alert>
              )}

              <Box component="form" onSubmit={handleSendCode} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  disabled={loading}
                  placeholder="your@email.com"
                  type="email"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.2, fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Gửi mã xác thực'}
                </Button>
              </Box>
            </>
          )}

          {/* STEP 2: Reset Password */}
          {step === 'verify' && (
            <>
              <Typography variant="h4" align="center" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                Đặt Lại Mật Khẩu
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Nhập mã xác thực và mật khẩu mới của bạn
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✓ Mật khẩu đã được đặt lại thành công! Chuyển hướng đến trang đăng nhập...
                </Alert>
              )}

              <Box component="form" onSubmit={handleResetPassword} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="resetCode"
                  label="Mã xác thực"
                  name="resetCode"
                  autoFocus
                  value={resetCode}
                  onChange={(e) => {
                    setResetCode(e.target.value)
                    if (error) setError(null)
                  }}
                  disabled={loading}
                  placeholder="Nhập mã từ email"
                  helperText="Vui lòng kiểm tra email để lấy mã xác thực"
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="newPassword"
                  label="Mật khẩu mới"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (error) setError(null)
                  }}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="confirmPassword"
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (error) setError(null)
                  }}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
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
                  {loading ? <CircularProgress size={24} /> : 'Đặt lại mật khẩu'}
                </Button>
              </Box>
            </>
          )}
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          © 2025 Trợ lý ảo ChoGao. Bảo lưu mọi quyền.
        </Typography>
      </Box>
    </Container>
  )
}
