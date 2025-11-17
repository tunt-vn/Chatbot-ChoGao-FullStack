/**
 * Role definitions matching backend enum
 * Backend: src/main/java/com/tuatua/entity/Role.java
 */
export type Role = 'ADMIN' | 'STAFF' | 'MEMBER'

export const RoleLabels: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên', 
  MEMBER: 'Thành viên'
}

export const RoleColors: Record<Role, 'error' | 'warning' | 'default'> = {
  ADMIN: 'error',
  STAFF: 'warning',
  MEMBER: 'default'
}

/**
 * Recipients for notifications (extends Role + additional options)
 */
export type Recipients = 'all' | Role | 'custom'

export const RecipientLabels: Record<Recipients, string> = {
  all: 'Tất cả',
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên',
  MEMBER: 'Thành viên',
  custom: 'Tùy chọn'
}