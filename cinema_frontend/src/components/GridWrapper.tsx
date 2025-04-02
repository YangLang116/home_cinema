import React from 'react';
import { Grid as MuiGrid } from '@mui/material';

// 引入MUI Grid的原生属性
interface GridProps extends React.ComponentProps<typeof MuiGrid> {}

// 修复Grid类型错误的包装器组件
export const Grid: React.FC<GridProps> = (props) => {
  return <MuiGrid {...props} />;
};

// 创建容器组件
export const GridContainer: React.FC<React.PropsWithChildren<GridProps>> = (props) => {
  return <MuiGrid container {...props} />;
};

// 创建项目组件
export const GridItem: React.FC<React.PropsWithChildren<GridProps>> = (props) => {
  return <MuiGrid item {...props} />;
}; 