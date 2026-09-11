import type {ReactNode} from 'react'

export function FieldLabel({children}: {children: ReactNode}) {
  return <span className="text-sm font-medium text-input-label-text-color">{children}</span>
}
