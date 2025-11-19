import React, { useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/esm/MoreVert'

export interface ActionItem {
  id: string
  label: string
  icon: React.ReactNode
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  disabled?: boolean
  onClick: () => void
  divider?: boolean
}

interface ActionDropdownProps {
  actions: ActionItem[]
  size?: 'small' | 'medium' | 'large'
  tooltip?: string
}

export default function ActionDropdown({ actions, size = 'small', tooltip = 'Thao tác' }: ActionDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleActionClick = (action: ActionItem) => {
    handleClose()
    action.onClick()
  }

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size={size}
          onClick={handleClick}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'action.hover'
            }
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 160,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((action) => (
          <React.Fragment key={action.id}>
            <MenuItem
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              sx={{
                color: action.color === 'error' ? 'error.main' : 
                       action.color === 'warning' ? 'warning.main' :
                       action.color === 'success' ? 'success.main' :
                       action.color === 'info' ? 'info.main' :
                       action.color === 'primary' ? 'primary.main' : 'inherit',
                '&:hover': {
                  bgcolor: action.color === 'error' ? 'error.50' : 
                           action.color === 'warning' ? 'warning.50' :
                           action.color === 'success' ? 'success.50' :
                           action.color === 'info' ? 'info.50' :
                           action.color === 'primary' ? 'primary.50' : 'action.hover',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  minWidth: '36px !important'
                }}
              >
                {action.icon}
              </ListItemIcon>
              <ListItemText primary={action.label} />
            </MenuItem>
            {action.divider && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
    </>
  )
}