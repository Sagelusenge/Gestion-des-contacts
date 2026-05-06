import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { geographieService, pasteurService } from '../services';

export default function Etats() {
  const [postes, setPostes] = useState([]);
  const [posteId, setPosteId] = useState('');
  const [pasteurs, setPasteurs] = useState([]);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const load = async () => {
      const postesResponse = await geographieService.getPostes({ limit: 100 });
      const loadedPostes = postesResponse.data.data.postes || [];
      setPostes(loadedPostes);
      if (loadedPostes[0]) setPosteId(String(loadedPostes[0].id));
    };
    load().catch(() => setNotice({ severity: 'error', text: 'Chargement des postes impossible.' }));
  }, []);

  useEffect(() => {
    if (!posteId) return;
    pasteurService.list({ limit: 500, poste: posteId })
      .then((response) => setPasteurs(response.data.data.pasteurs || []))
      .catch(() => setNotice({ severity: 'error', text: 'Chargement de l’état impossible.' }));
  }, [posteId]);

  const selectedPoste = useMemo(
    () => postes.find((poste) => String(poste.id) === String(posteId)),
    [posteId, postes]
  );

  const csv = useMemo(() => {
    const lines = [
      ['Matricule', 'Nom', 'Grade', 'Responsabilité', 'Téléphone', 'Poste', 'Section', 'Paroisse'],
      ...pasteurs.map((pasteur) => [
        pasteur.matricule,
        `${pasteur.prenom} ${pasteur.nom}`,
        pasteur.grade,
        pasteur.responsabilite,
        pasteur.telephone,
        pasteur.Poste?.nom,
        pasteur.Section?.nom,
        pasteur.Paroisse?.nom
      ])
    ];
    return lines.map((line) => line.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(',')).join('\n');
  }, [pasteurs]);

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `etat-pasteurs-${selectedPoste?.code || 'poste'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 900 }}>États de sortie</Typography>
            <Typography variant="h4" sx={{ fontWeight: 950 }}>Liste des pasteurs par poste</Typography>
            <Typography color="text.secondary">Exemple : tous les pasteurs du poste de Goma avec leurs numéros.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" startIcon={<Download />} onClick={downloadCsv} disabled={!pasteurs.length}>CSV</Button>
            <Button variant="contained" startIcon={<Print />} onClick={() => window.print()} disabled={!pasteurs.length}>Imprimer</Button>
          </Stack>
        </Box>

        {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}

        <Paper sx={{ p: 2, borderRadius: 1 }} className="no-print">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Poste</InputLabel>
                <Select label="Poste" value={posteId} onChange={(e) => setPosteId(e.target.value)}>
                  {postes.map((poste) => <MenuItem key={poste.id} value={poste.id}>{poste.nom}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={7}>
              <Chip label={`${pasteurs.length} pasteur(s)`} color="primary" variant="outlined" />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 1, overflowX: 'auto' }} id="print-area">
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 950 }}>État des pasteurs</Typography>
            <Typography color="text.secondary">{selectedPoste?.nom || 'Poste'} - CBCA</Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Matricule</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Responsabilité</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Paroisse</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pasteurs.map((pasteur) => (
                <TableRow key={pasteur.id}>
                  <TableCell>{pasteur.matricule}</TableCell>
                  <TableCell>{pasteur.prenom} {pasteur.nom}</TableCell>
                  <TableCell>{pasteur.grade}</TableCell>
                  <TableCell>{pasteur.responsabilite}</TableCell>
                  <TableCell>{pasteur.telephone || '-'}</TableCell>
                  <TableCell>{pasteur.Section?.nom || '-'}</TableCell>
                  <TableCell>{pasteur.Paroisse?.nom || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!pasteurs.length && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">Aucune donnée disponible pour ce poste.</Typography>
            </Box>
          )}
        </Paper>
      </Stack>
    </AppShell>
  );
}
