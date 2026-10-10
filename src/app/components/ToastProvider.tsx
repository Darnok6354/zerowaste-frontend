"use client";

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster 
      position="bottom-center"
      toastOptions={{
        success: {
          style: {
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#ecfdf5',
          },
        },
        error: {
          style: {
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
          }
        }
      }}
    />
  );
}