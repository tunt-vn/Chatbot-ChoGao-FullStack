import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from '@mui/material'
import EventIcon from '@mui/icons-material/esm/Event'
import AccessTimeIcon from '@mui/icons-material/esm/AccessTime'
import LocationOnIcon from '@mui/icons-material/esm/LocationOn'
import PersonIcon from '@mui/icons-material/esm/Person'
import SchoolIcon from '@mui/icons-material/esm/School'
import ChevronLeftIcon from '@mui/icons-material/esm/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/esm/ChevronRight'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

interface CalendarEvent {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  eventType: string
  location?: string
  targetAudience: string
  subject?: string
  teacherName?: string
  className?: string
  isRecurring: boolean
  recurringPattern?: string
}

const eventTypeColors: Record<string, { bg: string; color: string; label: string }> = {
  CLASS: { bg: 'rgba(79,70,229,0.1)', color: '#4F46E5', label: 'Lớp học' },
  EXAM: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Thi cử' },
  MEETING: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Họp' },
  HOLIDAY: { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', label: 'Ngày lễ' },
  OTHER: { bg: 'rgba(168,85,247,0.1)', color: '#A855F7', label: 'Khác' },
}

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/calendar/upcoming`)
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data || [])
    } catch (err) {
      console.error('Calendar fetch error:', err)
      // Không hiển thị lỗi nếu chỉ là chưa có sự kiện
      setEvents([])
      // setError('Không thể tải lịch. Vui lòng thử lại sau.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getEventsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const filteredEvents = events.filter((event) => {
    if (selectedTab === 0) return true // All
    if (selectedTab === 1) return event.eventType === 'CLASS'
    if (selectedTab === 2) return event.eventType === 'EXAM'
    if (selectedTab === 3) return event.eventType === 'MEETING'
    return false
  })

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Đang tải lịch...</Typography>
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Chip
          icon={<EventIcon />}
          label="Lịch học & Sự kiện"
          sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: 'primary.main', mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Lịch Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
        <Tab label="Tất cả" />
        <Tab label="Lớp học" />
        <Tab label="Thi cử" />
        <Tab label="Họp" />
      </Tabs>

      <Grid container spacing={3}>
        {/* Calendar View */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {/* Month Navigation */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <IconButton onClick={previousMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6">
                Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
              </Typography>
              <IconButton onClick={nextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>

            {/* Calendar Grid */}
            <Box>
              {/* Days of week header */}
              <Grid container spacing={1} mb={1}>
                {daysOfWeek.map((day) => (
                  <Grid item xs={12 / 7} key={day}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: 'text.secondary',
                      }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar days */}
              <Grid container spacing={1}>
                {getDaysInMonth(currentDate).map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : []
                  const isToday =
                    day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear()

                  return (
                    <Grid item xs={12 / 7} key={index}>
                      <Box
                        onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                        sx={{
                          aspectRatio: '1',
                          border: '1px solid',
                          borderColor: isToday ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          p: 0.5,
                          cursor: day ? 'pointer' : 'default',
                          bgcolor: day ? 'background.paper' : 'action.disabledBackground',
                          '&:hover': day ? { bgcolor: 'action.hover' } : {},
                          position: 'relative',
                        }}
                      >
                        {day && (
                          <>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: isToday ? 700 : 400,
                                color: isToday ? 'primary.main' : 'text.primary',
                              }}
                            >
                              {day}
                            </Typography>
                            {dayEvents.length > 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 2,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  gap: 0.25,
                                }}
                              >
                                {dayEvents.slice(0, 3).map((event, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      width: 4,
                                      height: 4,
                                      borderRadius: '50%',
                                      bgcolor: eventTypeColors[event.eventType]?.color || 'grey.500',
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Events List */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Typography variant="h6">
              {selectedDate
                ? `Sự kiện ngày ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`
                : 'Sự kiện sắp tới'}
            </Typography>

            {filteredEvents
              .filter((event) => {
                if (!selectedDate) return true
                const eventDate = new Date(event.startTime)
                return (
                  eventDate.getDate() === selectedDate.getDate() &&
                  eventDate.getMonth() === selectedDate.getMonth() &&
                  eventDate.getFullYear() === selectedDate.getFullYear()
                )
              })
              .slice(0, 10)
              .map((event) => {
                const typeInfo = eventTypeColors[event.eventType] || eventTypeColors.OTHER
                return (
                  <Card key={event.id} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label={typeInfo.label}
                            size="small"
                            sx={{
                              bgcolor: typeInfo.bg,
                              color: typeInfo.color,
                              fontWeight: 600,
                            }}
                          />
                          {event.isRecurring && (
                            <Chip label="Định kỳ" size="small" variant="outlined" />
                          )}
                        </Stack>

                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          {event.title}
                        </Typography>

                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </Typography>
                          </Stack>

                          {event.location && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {event.location}
                              </Typography>
                            </Stack>
                          )}

                          {event.teacherName && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {event.teacherName}
                              </Typography>
                            </Stack>
                          )}

                          {event.className && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Lớp {event.className}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>

                        {event.description && (
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )
              })}

            {filteredEvents.length === 0 && (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Không có sự kiện nào</Typography>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
