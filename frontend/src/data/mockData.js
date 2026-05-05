export const grades = ['Révérend Pasteur', 'Pasteur', 'Pasteur Stagiaire', 'Proposant'];

export const statuts = ['Actif', 'En Congé', 'Retraité', 'Suspendu'];

export const mockPasteurs = [
  {
    id: 1,
    nom: 'Kambale',
    prenom: 'Emmanuel',
    matricule: 'CBCA-PP-2026-0001',
    numeroIdentifiant: 'CBCA-NK-24-0019',
    grade: 'Révérend Pasteur',
    responsabilite: 'Pasteur de Poste',
    fonction: 'Responsable de Poste',
    telephone: '+243970000101',
    email: 'emmanuel.kambale@cbca.cd',
    dateOrdination: '2008-08-17',
    dateNaissance: '1976-04-12',
    lieuNaissance: 'Butembo',
    etatCivil: 'Marié',
    conjoint: { nom: 'Maman Grâce Kambale', telephone: '+243970000102' },
    enfants: [{ nom: 'Deborah' }, { nom: 'Samuel' }],
    formation: [
      { diplome: 'Licence en Théologie', institution: 'ULPGL', annee: 2005 },
      { diplome: 'Leadership pastoral', institution: 'CBCA', annee: 2018 }
    ],
    statut: 'Actif',
    adresseActuelle: 'Poste CBCA Goma',
    Poste: { id: 1, nom: 'Poste de Goma', code: 'GOM' },
    Section: { id: 1, nom: 'Section Centre', code: 'GOM-C' },
    Paroisse: { id: 1, nom: 'Paroisse Baraka', code: 'BAR' },
    Mouvements: [
      { id: 11, typeMovement: 'Affectation', dateDebut: '2019-01-15', dateFin: '2027-01-15', posteCible: { nom: 'Poste de Goma' }, statut: 'Effectué' },
      { id: 10, typeMovement: 'Transfert', dateDebut: '2014-02-01', dateFin: '2018-12-31', posteCible: { nom: 'Poste de Beni' }, statut: 'Effectué' }
    ],
    notes: 'Profil prioritaire pour les missions de coordination régionale.'
  },
  {
    id: 2,
    nom: 'Mumbere',
    prenom: 'Jean-Paul',
    matricule: 'CBCA-PS-2026-0001',
    numeroIdentifiant: 'CBCA-BN-24-0034',
    grade: 'Pasteur',
    responsabilite: 'Pasteur Sectionnaire',
    fonction: 'Pasteur sectionnaire',
    telephone: '+243970000220',
    email: 'jeanpaul.mumbere@cbca.cd',
    dateOrdination: '2015-06-21',
    dateNaissance: '1983-11-02',
    lieuNaissance: 'Beni',
    etatCivil: 'Marié',
    conjoint: { nom: 'Maman Esther Mumbere', telephone: '+243970000221' },
    formation: [{ diplome: 'Bachelor en Théologie', institution: 'ISTEBU', annee: 2012 }],
    statut: 'Actif',
    adresseActuelle: 'Paroisse CBCA Cité Belge',
    Poste: { id: 2, nom: 'Poste de Beni', code: 'BEN' },
    Section: { id: 3, nom: 'Section Mulekera', code: 'BEN-M' },
    Paroisse: { id: 6, nom: 'Paroisse Cité Belge', code: 'CBG' },
    Mouvements: [
      { id: 21, typeMovement: 'Affectation', dateDebut: '2021-03-01', dateFin: '2026-09-01', posteCible: { nom: 'Poste de Beni' }, statut: 'Effectué' }
    ],
    notes: 'Mandat à réévaluer au prochain conseil.'
  },
  {
    id: 3,
    nom: 'Safari',
    prenom: 'Daniel',
    matricule: 'CBCA-ST-2026-0001',
    numeroIdentifiant: 'CBCA-BU-24-0088',
    grade: 'Pasteur Stagiaire',
    responsabilite: 'Assistant Pastoral',
    fonction: 'Assistant paroissial',
    telephone: '+243970000303',
    email: 'daniel.safari@cbca.cd',
    dateOrdination: '2023-09-10',
    statut: 'Actif',
    etatCivil: 'Célibataire',
    formation: [{ diplome: 'Diplôme en ministère pastoral', institution: 'Institut Biblique CBCA', annee: 2022 }],
    Poste: { id: 3, nom: 'Poste de Butembo', code: 'BUT' },
    Section: { id: 5, nom: 'Section Vulamba', code: 'BUT-V' },
    Paroisse: { id: 10, nom: 'Paroisse Vulamba', code: 'VLB' },
    Mouvements: [
      { id: 31, typeMovement: 'Affectation', dateDebut: '2023-10-01', dateFin: '2026-10-01', posteCible: { nom: 'Poste de Butembo' }, statut: 'Effectué' }
    ]
  },
  {
    id: 4,
    nom: 'Bisimwa',
    prenom: 'Moïse',
    matricule: 'CBCA-PR-2026-0001',
    numeroIdentifiant: 'CBCA-RU-24-0112',
    grade: 'Proposant',
    responsabilite: 'Pasteur de Paroisse',
    fonction: 'Responsable jeunesse',
    telephone: '+243970000404',
    email: 'moise.bisimwa@cbca.cd',
    dateOrdination: '2024-02-18',
    statut: 'Actif',
    etatCivil: 'Marié',
    conjoint: { nom: 'Maman Sarah Bisimwa' },
    formation: [{ diplome: 'Formation en catéchèse', institution: 'CBCA', annee: 2023 }],
    Poste: { id: 4, nom: 'Poste de Rutshuru', code: 'RUT' },
    Section: { id: 7, nom: 'Section Kiwanja', code: 'RUT-K' },
    Paroisse: { id: 14, nom: 'Paroisse Kiwanja', code: 'KIW' },
    Mouvements: [
      { id: 41, typeMovement: 'Affectation', dateDebut: '2024-03-01', dateFin: '2027-03-01', posteCible: { nom: 'Poste de Rutshuru' }, statut: 'Effectué' }
    ]
  }
];

export const mockGeographie = [
  { id: 1, poste: 'Poste de Goma', code: 'GOM', pasteurs: 42, sections: 8, paroisses: 31, telephone: '+243970000100' },
  { id: 2, poste: 'Poste de Beni', code: 'BEN', pasteurs: 36, sections: 6, paroisses: 28, telephone: '+243970000200' },
  { id: 3, poste: 'Poste de Butembo', code: 'BUT', pasteurs: 39, sections: 7, paroisses: 30, telephone: '+243970000300' },
  { id: 4, poste: 'Poste de Rutshuru', code: 'RUT', pasteurs: 24, sections: 5, paroisses: 18, telephone: '+243970000400' }
];

export const mockAlertes = [
  { id: 1, pasteur: 'Jean-Paul Mumbere', posteCourant: 'Poste de Beni', dateFinMandat: '2026-09-01', joursRestants: 119 },
  { id: 2, pasteur: 'Daniel Safari', posteCourant: 'Poste de Butembo', dateFinMandat: '2026-10-01', joursRestants: 149 }
];

export const mockAuditLogs = [
  { id: 1, action: 'UPDATE', entite: 'Pasteur', utilisateurNom: 'Pasteur de Poste', createdAt: '2026-05-04T14:12:00Z', nouvelles: { matricule: 'CBCA-PS-2026-0001' } },
  { id: 2, action: 'CREATE', entite: 'Mouvement', utilisateurNom: 'Représentant Légal', createdAt: '2026-05-03T09:30:00Z', nouvelles: { typeMovement: 'Affectation' } },
  { id: 3, action: 'CREATE', entite: 'Paroisse', utilisateurNom: 'Pasteur Sectionnaire', createdAt: '2026-05-02T16:45:00Z', nouvelles: { code: 'BAR' } }
];

export const dashboardFallback = {
  totalPasteurs: 141,
  totalPostes: 4,
  totalSections: 26,
  totalParoisses: 107,
  alertesMandats: 2,
  pasteurParGrade: {
    'Révérend Pasteur': 18,
    Pasteur: 79,
    'Pasteur Stagiaire': 31,
    Proposant: 13
  },
  pasteurParStatut: {
    Actif: 132,
    'En Congé': 4,
    Retraité: 3,
    Suspendu: 2
  }
};
