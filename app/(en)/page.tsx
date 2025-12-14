'use client';

import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    window.location.href = '/en/auth/login';
  }, []);

  return null;
}