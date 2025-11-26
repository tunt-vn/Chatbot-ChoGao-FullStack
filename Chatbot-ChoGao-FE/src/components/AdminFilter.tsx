import { useState } from 'react'
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  Box,
  Chip,
  Paper,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { vi } from 'date-fns/locale'
import SearchIcon from '@mui/icons-material/esm/Search'
import FilterListIcon from '@mui/icons-material/esm/FilterList'
import AddIcon from '@mui/icons-material/esm/Add'
import ClearIcon from '@mui/icons-material/esm/Clear'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterField {
  key: string
  label: string
  options: FilterOption[]
  defaultValue?: string
}

export interface DateRangeFilter {
  fromKey: string
  toKey: string
  fromLabel?: string
  toLabel?: string
}

interface AdminFilterProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filterFields?: FilterField[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  dateRangeFilter?: DateRangeFilter
  dateValues?: { from: Date | null, to: Date | null }
  onDateChange?: (key: 'from' | 'to', value: Date | null) => void
  showAddButton?: boolean
  addButtonText?: string
  onAdd?: () => void
  customButtons?: React.ReactNode[]
  onClearFilters?: () => void
}

export default function AdminFilter({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  filterFields = [],
  filterValues = {},
  onFilterChange,
  dateRangeFilter,
  dateValues,
  onDateChange,
  showAddButton = true,
  addButtonText = 'Thêm mới',
  onAdd,
  customButtons = [],
  onClearFilters
}: AdminFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    if (onFilterChange) {
      onFilterChange(key, value)
    }
  }

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    }
  }

  const getActiveFiltersCount = () => {
    let count = Object.entries(filterValues).filter(([key, value]) => {
      if (!value || value === 'all' || value === '') return false
      
      // Check if this value is the default value for its field
      const field = filterFields.find(f => f.key === key)
      if (field && field.defaultValue && value === field.defaultValue) return false
      
      return true
    }).length
    
    // Add date filters to count if they exist
    if (dateValues) {
      if (dateValues.from) count++
      if (dateValues.to) count++
    }
    
    return count
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box>
        {/* Main filter row */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
          {/* Search field */}
          <TextField
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            size="small"
            sx={{ 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                height: 40 // Match button height
              }
            }}
          />

          {/* Filters toggle button */}
          {(filterFields.length > 0 || dateRangeFilter) && (
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ 
                minWidth: 'max-content',
                height: 40 // Fixed height for consistency
              }}
            >
              Bộ lọc
              {hasActiveFilters && (
                <Chip 
                  label={getActiveFiltersCount()} 
                  size="small" 
                  sx={{ ml: 1, height: 20 }}
                  color="primary"
                />
              )}
            </Button>
          )}

          {/* Add button */}
          {showAddButton && onAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{ 
                minWidth: 'max-content',
                height: 40 // Fixed height for consistency
              }}
            >
              {addButtonText}
            </Button>
          )}

          {/* Custom buttons */}
          {customButtons.map((button, index) => (
            <Box key={index} sx={{ 
              '& > *': { height: 40 } // Ensure custom buttons have same height
            }}>{button}</Box>
          ))}
        </Stack>

        {/* Collapsible filters section */}
        <Collapse in={showFilters}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2 
            }}
          >
            <Stack spacing={2}>
              {/* Filter controls including date range */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" alignItems="flex-end">
                {filterFields.map((field) => (
                  <FormControl 
                    key={field.key} 
                    sx={{ minWidth: 150, flexGrow: { xs: 1, sm: 0 } }}
                  >
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={filterValues[field.key] || field.defaultValue || 'all'}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                      label={field.label}
                      size="small"
                    >
                      {field.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
                
                {/* Date range filters - inline with other filters */}
                {dateRangeFilter && onDateChange && dateValues && (
                  <>
                    <DatePicker
                      label={dateRangeFilter.fromLabel || 'Từ ngày'}
                      value={dateValues.from}
                      onChange={(newValue) => onDateChange('from', newValue)}
                      slotProps={{ 
                        textField: { 
                          size: 'small',
                          sx: { minWidth: 150 }
                        } 
                      }}
                    />
                    <DatePicker
                      label={dateRangeFilter.toLabel || 'Đến ngày'}
                      value={dateValues.to}
                      onChange={(newValue) => onDateChange('to', newValue)}
                      slotProps={{ 
                        textField: { 
                          size: 'small',
                          sx: { minWidth: 150 }
                        } 
                      }}
                    />
                  </>
                )}
              </Stack>

              {/* Active filters chips and clear button */}
              {hasActiveFilters && (
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 1 }}>
                    Bộ lọc đang áp dụng:
                  </Box>
                  
                  {Object.entries(filterValues).map(([key, value]) => {
                    if (!value || value === 'all' || value === '') return null
                    
                    const field = filterFields.find(f => f.key === key)
                    
                    // Skip if this is the default value
                    if (field && field.defaultValue && value === field.defaultValue) return null
                    
                    const option = field?.options.find(o => o.value === value)
                    
                    if (!field || !option) return null
                    
                    return (
                      <Chip
                        key={key}
                        label={`${field.label}: ${option.label}`}
                        size="small"
                        onDelete={() => handleFilterChange(key, field.defaultValue || 'all')}
                        deleteIcon={<ClearIcon />}
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    )
                  })}

                  {/* Date filter chips */}
                  {dateValues?.from && (
                    <Chip
                      label={`${dateRangeFilter?.fromLabel || 'Từ ngày'}: ${dateValues.from.toLocaleDateString('vi-VN')}`}
                      size="small"
                      onDelete={() => onDateChange && onDateChange('from', null)}
                      deleteIcon={<ClearIcon />}
                      variant="outlined"
                      sx={{ mb: 0.5 }}
                    />
                  )}
                  {dateValues?.to && (
                    <Chip
                      label={`${dateRangeFilter?.toLabel || 'Đến ngày'}: ${dateValues.to.toLocaleDateString('vi-VN')}`}
                      size="small"
                      onDelete={() => onDateChange && onDateChange('to', null)}
                      deleteIcon={<ClearIcon />}
                      variant="outlined"
                      sx={{ mb: 0.5 }}
                    />
                  )}

                  <Button
                    size="small"
                    onClick={handleClearFilters}
                    sx={{ ml: 1, minWidth: 'auto' }}
                    color="error"
                    variant="outlined"
                  >
                    Xóa tất cả
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Collapse>
      </Box>
    </LocalizationProvider>
  )
}