import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Eye as EyeIcon } from '@mui/icons-material';
import { pasteurService } from '../services';

export default function PasteursList({ onRefresh }) {
  const [pasteurs, setPasteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPasteur, setSelectedPasteur] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadPasteurs();
  }, [onRefresh]);

  const loadPasteurs = async () => {
    try {
      const response = await pasteurService.list({ limit: 50 });
      setPasteurs(response.data.data.pasteurs);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pasteur) => {
    setSelectedPasteur(pasteur);
    setFormData(pasteur);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await pasteurService.delete(id);
        loadPasteurs();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedPasteur) {
        await pasteurService.update(selectedPasteur.id, formData);
      } else {
        await pasteurService.create(formData);
      }
      setOpenDialog(false);
      loadPasteurs();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (statut) => {
    const colors = {
      'Actif': 'success',
      'En Congé': 'warning',
      'Retraité': 'info',
      'Suspendu': 'error'
    };
    return colors[statut] || 'default';
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Nom Complet</TableCell>
              <TableCell>Matricule</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pasteurs.map((pasteur) => (
              <TableRow key={pasteur.id} hover>
                <TableCell>{pasteur.prenom} {pasteur.nom}</TableCell>
                <TableCell>{pasteur.matricule}</TableCell>
                <TableCell>{pasteur.grade}</TableCell>
                <TableCell>
                  <Chip
                    label={pasteur.statut}
                    color={getStatusColor(pasteur.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(pasteur)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(pasteur.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPasteur ? 'Modifier Pasteur' : 'Ajouter Pasteur'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Prénom"
            value={formData.prenom || ''}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            fullWidth
          />
          <TextField
            label="Nom"
            value={formData.nom || ''}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            fullWidth
          />
          <TextField
            label="Matricule"
            value={formData.matricule || ''}
            onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
            fullWidth
          />
          <TextField
            label="Grade"
            select
            value={formData.grade || ''}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            fullWidth
            SelectProps={{
              native: true
            }}
          >
            <option></option>
            <option>Révérend Pasteur</option>
            <option>Pasteur</option>
            <option>Pasteur Stagiaire</option>
            <option>Proposant</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
