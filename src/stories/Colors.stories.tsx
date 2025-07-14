import React from 'react';

const colors = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Cream', value: '#F8F6F0' },
  { name: 'Burgundy', value: '#801B2B' },
  { name: 'Pearl', value: '#F5F5F5' },
];

export default {
  title: 'Design System/Colors',
};

export const CartierColors = () => (
  <div style={{ display: 'flex', gap: 24 }}>
    {colors.map((c) => (
      <div key={c.name} style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: c.value, border: '1px solid #eee', borderRadius: 8 }} />
        <div style={{ marginTop: 8 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{c.value}</div>
      </div>
    ))}
  </div>
); 