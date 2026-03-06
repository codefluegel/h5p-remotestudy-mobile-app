import React from 'react';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';

export default function IconSymbol({
  name,
  size = 24,
  color,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size: number;
  color: string;
  weight: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
