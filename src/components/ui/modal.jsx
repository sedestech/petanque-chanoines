import React from 'react'
import { cn } from '@/utils'

function Modal({ open, onClose, children, className }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={cn(
          'bg-background text-foreground rounded-lg shadow-lg w-full max-w-md',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export { Modal }
