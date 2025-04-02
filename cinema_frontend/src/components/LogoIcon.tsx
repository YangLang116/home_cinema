import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const LogoIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 512 512">
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#logo-gradient)"/>
      <g transform="translate(128,128)" fill="white">
        <path d="M128 32v192h128V32H128zM32 32v192h64V32H32zm224 0v192h64V32h-64z"/>
        <path d="M256 96l-96 64 96 64V96z" fill="#1E3A8A"/>
      </g>
    </SvgIcon>
  );
};

export default LogoIcon; 