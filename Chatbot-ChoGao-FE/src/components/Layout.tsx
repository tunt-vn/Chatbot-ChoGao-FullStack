import { useMemo, useState, type ReactNode } from 'react'
import { AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography, useMediaQuery, Button, Menu, MenuItem } from '@mui/material'
import MenuIcon from '@mui/icons-material/esm/Menu'
import HomeIcon from '@mui/icons-material/esm/Home'
import ChatIcon from '@mui/icons-material/esm/Chat'
import InfoIcon from '@mui/icons-material/esm/Info'
import CalendarTodayIcon from '@mui/icons-material/esm/CalendarToday'
import AdminPanelSettingsIcon from '@mui/icons-material/esm/AdminPanelSettings'
import LogoutIcon from '@mui/icons-material/esm/Logout'
import PersonIcon from '@mui/icons-material/esm/Person'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 260

interface NavItemProps {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => {
  return (
    <ListItemButton onClick={onClick} selected={active}>
      <ListItemIcon sx={{ minWidth: 44 }}>
        {icon}
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const { isAuthenticated, user, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navItems = useMemo(
    () => [
      { label: 'Trang chủ', icon: <HomeIcon />, path: '/' },
      { label: 'Trợ lý Chat', icon: <ChatIcon />, path: '/chat' },
      { label: 'FAQ', icon: <InfoIcon />, path: '/faq' },
      { label: 'Lịch học & Sự kiện', icon: <CalendarTodayIcon />, path: '/schedule' },
      { label: 'Quản trị', icon: <AdminPanelSettingsIcon />, path: '/admin' },
    ],
    [],
  )

  const drawer = (
    <Stack spacing={2} sx={{ height: '100%', pt: 3, pb: 3, px: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" px={1}>
        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 600 }}>TG</Avatar>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Cổng thông tin
          </Typography>
          <Typography variant="h6" fontWeight={700}>
          Trợ lý ảo - Trường học
          </Typography>
        </Box>
      </Stack>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
            onClick={() => {
              navigate(item.path)
              if (isSmall) {
                setMobileOpen(false)
              }
            }}
          />
        ))}
      </List>
    </Stack>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {isAuthenticated && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">Xin chào, {user?.name || user?.email}</Typography>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ ml: 'auto' }}
              >
                <Avatar sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => navigate('/profile')} sx={{ display: 'flex', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  <Typography>Thông tin cá nhân</Typography>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    logout()
                    navigate('/login')
                    setAnchorEl(null)
                  }}
                  sx={{ display: 'flex', gap: 1, color: 'error.main' }}
                >
                  <LogoutIcon fontSize="small" />
                  <Typography>Đăng xuất</Typography>
                </MenuItem>
              </Menu>
            </Stack>
          )}
          {!isAuthenticated && (
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                size="small"
              >
                Đăng Nhập
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/register')}
              >
                Đăng Ký
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ 
            display: { xs: 'none', sm: 'block' }, 
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              mt: 8,
              height: 'calc(100vh - 64px)'
            } 
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            px: { xs: 1, md: 3 },
            pb: 6,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              p: 3,
              borderRadius: 1,
              background:
                'linear-gradient(120deg, rgba(79,70,229,0.18) 0%, rgba(236,72,153,0.15) 50%, rgba(59,130,246,0.22) 100%)',
              border: '1px solid rgba(79,70,229,0.15)',
            }}
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                Xin chào!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Hệ thống trợ lý ảo giúp bạn theo dõi thông tin học tập, sự kiện và hỗ trợ tương tác nhanh chóng với nhà trường.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: 'column', sm: 'row', md: 'column' }}
              spacing={1.5}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button variant="contained" fullWidth={isSmall} onClick={() => navigate('/chat')}>
                Bắt đầu trò chuyện
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth={isSmall}
                onClick={() => navigate('/schedule')}
              >
                Xem lịch sắp tới
              </Button>
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
