import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { Security } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { auditService } from '../services';
import { mockAuditLogs } from '../data/mockData';

export default function Audit() {
  const [logs, setLogs] = useState(mockAuditLogs);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await auditService.list({ limit: 80 });
        setLogs(response.data.data.logs);
      } catch {
        setLogs(mockAuditLogs);
      }
    };

    loadLogs();
  }, []);

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary">Traçabilité</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Journal des actions</Typography>
          <Typography color="text.secondary">
            Historique des créations, modifications et suppressions sensibles.
          </Typography>
        </Box>

        <Paper sx={{ p: 2.5, borderRadius: 1 }}>
          <Stack spacing={2}>
            {logs.map((log) => (
              <Box key={log.id}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '42px 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
                  <Security color="primary" />
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{log.utilisateurNom || log.utilisateur?.email || 'Utilisateur'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.action} sur {log.entite} #{log.entiteId || ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </Typography>
                  </Box>
                  <Chip label={log.action} size="small" color={log.action === 'DELETE' ? 'error' : 'primary'} variant="outlined" />
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </AppShell>
  );
}
