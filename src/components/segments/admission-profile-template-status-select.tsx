'use client'

import {Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue} from '@/components/tailgrids/core/select'
import type {AdmissionProfileTemplateStatus} from '@/services/api/admission-profile-catalog'
import {cn} from '@/utils/cn'

const STATUS_LABELS: Record<AdmissionProfileTemplateStatus, string> = {
  Draft: 'Bản nháp',
  Active: 'Đang dùng',
  Archived: 'Lưu trữ',
}

const STATUS_TRIGGER_CLASSES: Record<AdmissionProfileTemplateStatus, string> = {
  Draft: 'border-transparent bg-badge-warning-background text-badge-warning-text hover:bg-badge-warning-background/80',
  Active: 'border-transparent bg-badge-success-background text-badge-success-text hover:bg-badge-success-background/80',
  Archived: 'border-transparent bg-badge-neutral-background text-badge-neutral-text hover:bg-badge-neutral-background/80',
}

const ALL_STATUSES: AdmissionProfileTemplateStatus[] = ['Draft', 'Active', 'Archived']

export function AdmissionProfileTemplateStatusSelect({
  value,
  options = ALL_STATUSES,
  ariaLabel,
  isDisabled,
  size = 'sm',
  className,
  triggerClassName,
  onChange,
}: {
  value: AdmissionProfileTemplateStatus
  options?: AdmissionProfileTemplateStatus[]
  ariaLabel: string
  isDisabled?: boolean
  size?: 'sm' | 'md'
  className?: string
  triggerClassName?: string
  onChange: (value: AdmissionProfileTemplateStatus) => void
}) {
  return (
    <Select
      value={value}
      aria-label={ariaLabel}
      isDisabled={isDisabled}
      className={cn('w-auto gap-0', className)}
      onChange={(nextValue) => onChange(String(nextValue) as AdmissionProfileTemplateStatus)}
    >
      <SelectTrigger size={size} className={cn('min-w-32 justify-between border-transparent shadow-none', STATUS_TRIGGER_CLASSES[value], triggerClassName)}>
        <SelectValue className="truncate" />
        <SelectIndicator className="text-current" />
      </SelectTrigger>
      <SelectContent>
        {options.map((status) => (
          <SelectItem key={status} id={status} textValue={STATUS_LABELS[status]}>
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
