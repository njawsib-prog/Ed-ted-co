'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function StudentLoginPage() {
  return (
    <LoginForm 
      role="student" 
      redirectPath="/student/dashboard" 
    />
  );
}