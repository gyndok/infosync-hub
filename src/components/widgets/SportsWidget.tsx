import React from 'react';
import { SportsApp } from './modernSports/SportsApp';

interface SportsWidgetProps {
  onRemove?: () => void;
}

export const SportsWidget: React.FC<SportsWidgetProps> = ({ onRemove }) => {
  return <SportsApp onRemove={onRemove} />;
};