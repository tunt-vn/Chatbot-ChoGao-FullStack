import { useState, useEffect } from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import SendIcon from '@mui/icons-material/esm/Send'
import MicIcon from '@mui/icons-material/esm/KeyboardVoice'
import SmartToyIcon from '@mui/icons-material/esm/SmartToy'
import { chatApi } from '../services/api'

type Message = {
  id: string
  from: 'user' | 'assistant'
  text: string
  timestamp?: string
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', from: 'assistant', text: 'Xin chào! Tôi là trợ lý ảo. Bạn đang cần hỗ trợ điều gì?' },
  ])
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await chatApi.getChatHistory()
        if (history && history.length > 0) {
          setMessages(history)
        }
      } catch (err) {
        console.error('Failed to load chat history:', err)
        // Don't show error to user on initial load, just keep default message
      }
    }

    loadChatHistory()
  }, [])

  const send = async () => {
    if (!value.trim()) return

    // Clear error state
    setError(null)

    // Add user message
    const userMessage: Message = { 
      id: Date.now().toString(), 
      from: 'user', 
      text: value,
      timestamp: new Date().toISOString()
    }
    setMessages((m) => [...m, userMessage])
    setValue('')
    setLoading(true)

    try {
      // Send message to backend
      const response = await chatApi.sendMessage(value)
      
      // Add bot response
      const botMessage: Message = {
        id: `${Date.now()}-assistant`,
        from: 'assistant',
        text: response.data || response.message || 'Xin lỗi, tôi không thể xử lý yêu cầu này.',
        timestamp: new Date().toISOString()
      }
      setMessages((m) => [...m, botMessage])
    } catch (err: any) {
      // Show error message
      const errorText = err.message || 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.'
      setError(errorText)
      
      // Add error message to chat
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        from: 'assistant',
        text: '❌ ' + errorText,
        timestamp: new Date().toISOString()
      }
      setMessages((m) => [...m, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        minHeight: '68vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: '1px solid rgba(226,232,240,0.9)',
        backgroundColor: 'rgba(255,255,255,0.92)',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <SmartToyIcon fontSize="small" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6">Trợ lý ảo</Typography>
          <Typography variant="body2" color="text.secondary">
            Luôn sẵn sàng hỗ trợ bạn về thông tin trường học
          </Typography>
        </Box>
        <Chip label="Trực tuyến" color="success" variant="outlined" />
      </Stack>

      <Divider />

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <List sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((m) => (
          <ListItem
            key={m.id}
            sx={{
              justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
              px: 0,
            }}
          >
            <Box sx={{ maxWidth: '80%' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: m.from === 'user' ? 'primary.main' : 'rgba(79,70,229,0.06)',
                  color: m.from === 'user' ? 'primary.contrastText' : 'text.primary',
                  border: m.from === 'assistant' ? '1px solid rgba(79,70,229,0.12)' : 'none',
                }}
              >
                {m.text}
              </Paper>
              {m.timestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {new Date(m.timestamp).toLocaleTimeString('vi-VN')}
                </Typography>
              )}
            </Box>
          </ListItem>
        ))}
        {loading && (
          <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
            <Box sx={{ maxWidth: '80%', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Đang xử lý...
              </Typography>
            </Box>
          </ListItem>
        )}
      </List>

      <Box
        sx={{
          p: 1,
          borderRadius: 999,
          border: '1px solid rgba(226,232,240,0.9)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton size="small" color="secondary" disabled={loading}>
          <MicIcon />
        </IconButton>
        <InputBase
          placeholder="Nhập câu hỏi hoặc yêu cầu..."
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              e.preventDefault()
              send()
            }
          }}
          disabled={loading}
        />
        <IconButton color="primary" onClick={send} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  )
}
