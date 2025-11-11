import type { InputHTMLAttributes, ReactNode } from 'react';

// 공용 Input 컴포넌트 Prop 정의
// - 기존 prefix/suffix 문자열 기반 API를 유지하면서
//   아이콘/버튼 등 ReactNode를 받을 수 있도록 확장합니다.
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  // 신규: 아이콘/버튼을 ReactNode로 주입하기 위한 권장 prop
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  // 하위 호환: 기존 prefix/suffix도 ReactNode를 허용 (기존 문자열도 정상 동작)
  prefix?: ReactNode;
  suffix?: ReactNode;
}
