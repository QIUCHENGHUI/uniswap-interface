import React from 'react'
import styled from 'styled-components'

export interface InputProps {
  endAdornment?: React.ReactNode
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  startAdornment?: React.ReactNode
  value: string
}

// eslint-disable-next-line react/prop-types
const Input: React.FC<InputProps> = ({ endAdornment, onChange, placeholder, startAdornment, value }) => {
  return (
    <StyledInputWrapper>
      {!!startAdornment && startAdornment}
      <StyledInput placeholder={placeholder} value={value} onChange={onChange} />
      {!!endAdornment && endAdornment}
    </StyledInputWrapper>
  )
}

const StyledInputWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.grey200};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  box-shadow: inset 4px 4px 8px ${({ theme }) => theme.grey300}, inset -6px -6px 12px ${({ theme }) => theme.grey100};
  display: flex;
  height: 72px;
  padding: 0 ${({ theme }) => theme.spacing[3]}px;
`

const StyledInput = styled.input`
  background: none;
  border: 0;
  color: ${({ theme }) => theme.grey600};
  font-size: 18px;
  flex: 1;
  height: 56px;
  margin: 0;
  padding: 0;
  outline: none;
`

export default Input
