# 📋 Hướng Dẫn Sử Dụng AdminFilter Component

## 🎯 Tổng Quan
`AdminFilter` là một component tái sử dụng được thiết kế để cung cấp giao diện filter thống nhất cho tất cả các trang admin trong hệ thống. Component này giúp đảm bảo tính nhất quán về UX và giảm thiểu code duplicate.

## 🏗️ Cấu Trúc Component

### Props Interface
```typescript
interface AdminFilterProps {
  // Tìm kiếm
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  
  // Filter fields
  filterFields?: FilterField[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  
  // Date range filters
  dateRangeFilter?: DateRangeFilter
  dateValues?: { from: Date | null, to: Date | null }
  onDateChange?: (key: 'from' | 'to', value: Date | null) => void
  
  // Action buttons
  showAddButton?: boolean
  addButtonText?: string
  onAdd?: () => void
  customButtons?: React.ReactNode[]
  
  // Utilities
  onClearFilters?: () => void
}

interface DateRangeFilter {
  fromKey: string
  toKey: string
  fromLabel?: string
  toLabel?: string
}
```

### FilterField Interface
```typescript
interface FilterField {
  key: string           // Unique key cho filter field
  label: string         // Nhãn hiển thị
  options: FilterOption[] // Danh sách options
  defaultValue?: string // Giá trị mặc định
}

interface FilterOption {
  value: string // Giá trị option
  label: string // Nhãn hiển thị của option
}
```

## 🔥 Các Tính Năng

### 1. Search Field
- Input field với search icon
- Placeholder tùy chỉnh
- Real-time search

### 2. Collapsible Filters
- Button "Filters" với counter cho active filters
- Expandable/collapsible filter section
- Visual feedback cho trạng thái active
- **NEW**: Dedicated date range section

### 3. Date Range Filtering
- **NEW**: Built-in date picker support
- Grouped date range inputs (Từ ngày/Đến ngày)
- Date filter chips trong active filters display
- Proper date formatting và localization

### 3. Filter Management
- Multiple filter fields support
- Active filters visualization với chips
- Quick clear all filters
- Individual filter clearing

### 4. Action Buttons
- Configurable add button
- Support for custom buttons
- Consistent styling

## 📖 Cách Sử Dụng

### Bước 1: Import Component
```typescript
import AdminFilter from '../components/AdminFilter'
import type { FilterField } from '../components/AdminFilter'
```

### Bước 2: Setup State
```typescript
const [searchTerm, setSearchTerm] = useState('')
const [filterValues, setFilterValues] = useState({ 
  category: 'all', 
  status: 'all' 
})
```

### Bước 3: Configure Filter Fields
```typescript
const filterFields: FilterField[] = [
  {
    key: 'category',
    label: 'Danh mục',
    options: [
      { value: 'all', label: 'Tất cả' },
      { value: 'tech', label: 'Kỹ thuật' },
      { value: 'business', label: 'Kinh doanh' }
    ],
    defaultValue: 'all'
  },
  {
    key: 'status',
    label: 'Trạng thái',
    options: [
      { value: 'all', label: 'Tất cả' },
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Ngưng hoạt động' }
    ],
    defaultValue: 'all'
  }
]
```

### Bước 4: Implement Component
```typescript
<AdminFilter
  searchPlaceholder="Tìm kiếm..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  filterFields={filterFields}
  filterValues={filterValues}
  onFilterChange={(key, value) => 
    setFilterValues(prev => ({ ...prev, [key]: value }))
  }
  addButtonText="Thêm mới"
  onAdd={() => setIsAddDialogOpen(true)}
  onClearFilters={() => setFilterValues({ 
    category: 'all', 
    status: 'all' 
  })}
/>
```

## 🎨 Styling Features

### Visual Elements
- **Search Field**: Với search icon, full width trên mobile
- **Filters Button**: Toggle appearance, với badge counter
- **Filter Chips**: Visual representation của active filters
- **Collapsible Panel**: Smooth animation, distinctive background
- **Clear Filters**: Error color button for easy identification

### Responsive Design
- Stack layout adapts từ column (mobile) sang row (desktop)
- Filter fields wrap appropriately trên screens nhỏ
- Buttons maintain proper spacing across breakpoints

## 📝 Ví Dụ Thực Tế

### UserManagement Implementation
```typescript
const filterFields: FilterField[] = [
  {
    key: 'role',
    label: 'Vai trò',
    options: [
      { value: 'all', label: 'Tất cả' },
      { value: 'ADMIN', label: 'Quản trị viên' },
      { value: 'STAFF', label: 'Nhân viên' },
      { value: 'MEMBER', label: 'Thành viên' }
    ],
    defaultValue: 'all'
  },
  {
    key: 'status',
    label: 'Trạng thái',
    options: [
      { value: 'all', label: 'Tất cả' },
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Ngưng hoạt động' },
      { value: 'pending', label: 'Chờ duyệt' }
    ],
    defaultValue: 'all'
  }
]
```

### ActivityLogs Implementation  
```typescript
// Date range filter configuration
const dateRangeFilter = {
  fromKey: 'dateFrom',
  toKey: 'dateTo', 
  fromLabel: 'Từ ngày',
  toLabel: 'Đến ngày'
}

// Date state management
const [dateFrom, setDateFrom] = useState<Date | null>(null)
const [dateTo, setDateTo] = useState<Date | null>(null)

// Updated custom buttons (no date pickers anymore)
const customButtons = [
  <Button key="refresh">Làm mới</Button>,
  <Button key="export">Xuất file</Button>
]

<AdminFilter
  // ... standard filter props
  dateRangeFilter={dateRangeFilter}
  dateValues={{ from: dateFrom, to: dateTo }}
  onDateChange={(key, value) => {
    if (key === 'from') setDateFrom(value)
    else setDateTo(value)
  }}
  showAddButton={false}
  customButtons={customButtons}
/>
]

<AdminFilter
  // ... standard props
  showAddButton={false}  // No add functionality for logs
  customButtons={customButtons}  // Date filters + actions
/>
```

## 🔧 Customization Options

### Custom Buttons
```typescript
const customButtons = [
  <Button key="export" variant="outlined" startIcon={<DownloadIcon />}>
    Xuất Excel
  </Button>,
  <Button key="import" variant="outlined" startIcon={<UploadIcon />}>
    Nhập dữ liệu
  </Button>
]

<AdminFilter
  // ... other props
  customButtons={customButtons}
/>
```

### Hide Add Button
```typescript
<AdminFilter
  // ... other props
  showAddButton={false}
/>
```

## 🔄 Filter Logic Implementation

### Frontend Filtering
```typescript
useEffect(() => {
  let filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory = filterValues.category === 'all' || 
                           item.category === filterValues.category
    const matchesStatus = filterValues.status === 'all' || 
                         item.status === filterValues.status
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  setFilteredItems(filtered)
  setPage(0) // Reset pagination
}, [searchTerm, filterValues, items])
```

## 🎯 Best Practices

### 1. Consistent Filter Values
- Sử dụng 'all' cho "Tất cả" options
- Maintain consistent naming conventions
- Use clear, descriptive labels

### 2. State Management
- Keep filter state separate từ component state
- Reset pagination khi filters change
- Provide clear filter methods

### 3. User Experience
- Provide meaningful search placeholders
- Show active filter count
- Enable quick filter clearing
- Maintain filter state trong navigation

### 4. Performance
- Debounce search input if necessary
- Consider server-side filtering for large datasets
- Optimize re-renders với useMemo/useCallback

## 🚀 Extensibility

Component được design để dễ mở rộng:

- **New Filter Types**: Thêm date pickers, multi-select, etc.
- **Advanced Search**: Implement search suggestions, recent searches
- **Filter Presets**: Save và load filter configurations
- **Export Features**: Add integrated export buttons
- **Real-time Updates**: WebSocket integration for live data

## 🔗 Tích Hợp Với Các Trang Hiện Tại

Component đã được tích hợp vào:
- ✅ UserManagement (`/admin/users`)
- ✅ QAManagement (`/admin/qa`)
- ✅ NotificationManagement (`/admin/notifications`)
- ✅ ActivityLogs (`/admin/activity-logs`)

## 🤔 Troubleshooting

### Common Issues
1. **Filter not working**: Kiểm tra key matching giữa filterFields và filterValues
2. **Styling issues**: Đảm bảo proper MUI theme integration
3. **Performance**: Consider debouncing for high-frequency updates

### Debug Tips
- Use React DevTools để inspect component state
- Console.log filterValues để verify data flow
- Check network requests nếu sử dụng server-side filtering

---

> 💡 **Tip**: Này component được thiết kế để tái sử dụng across tất cả admin pages. Khi implement cho trang mới, follow pattern đã established để maintain consistency!