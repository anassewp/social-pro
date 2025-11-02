'use client'

import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { Input, InputProps } from '@/components/ui/input'

interface DebouncedInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (value: string) => void
  delay?: number
}

const DebouncedInput = memo(({ 
  onChange, 
  delay = 500, 
  ...props 
}: DebouncedInputProps) => {
  const [value, setValue] = useState(props.value || '')
  const timeoutRef = useRef<NodeJS.Timeout>()

  // تحديث القيمة المحلية
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // إلغاء المؤقت السابق
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // تعيين مؤقت جديد
    timeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, delay)
  }, [onChange, delay])

  // تنظيف المؤقت عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // تحديث القيمة عند تغيير props.value الخارجي
  useEffect(() => {
    setValue(props.value || '')
  }, [props.value])

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
    />
  )
})

DebouncedInput.displayName = 'DebouncedInput'

export { DebouncedInput }