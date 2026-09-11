'use client'

import {FileText, Plus} from '@tailgrids/icons'
import type {ReactNode} from 'react'

import {Badge} from '@/components/tailgrids/core/badge'
import {Button} from '@/components/tailgrids/core/button'

interface AdmissionCatalogPanelProps {
  title: string
  description: string
  count: number
  canManage: boolean
  createLabel: string
  onCreate: () => void
  isBusy?: boolean
  children: ReactNode
}

export function AdmissionCatalogPanel({
  title,
  description,
  count,
  canManage,
  createLabel,
  onCreate,
  isBusy = false,
  children,
}: AdmissionCatalogPanelProps) {
  return (
    <section
      aria-busy={isBusy || undefined}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-card-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background-gray-secondary text-icon-secondary">
            <FileText size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-text-primary">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-text-tertiary">{description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge color="gray" size="sm">
            {count} mục
          </Badge>
          {canManage && (
            <Button size="sm" onPress={onCreate}>
              <Plus size={16} aria-hidden="true" />
              <span>{createLabel}</span>
            </Button>
          )}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  )
}
