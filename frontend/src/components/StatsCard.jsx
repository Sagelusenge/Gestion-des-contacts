import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatsCard({ title, value, color = '#1976d2' }) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Typography color="textSecondary" variant="subtitle2">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color, fontWeight: 'bold', mt: 1 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export function Chart({ data, title }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
