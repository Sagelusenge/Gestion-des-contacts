export function phoneDigits(phone) {
  return String(phone || '').replace(/[^\d]/g, '');
}

export function pastorContactText(pastor) {
  return [
    `${pastor.degre || ''} ${pastor.nom || ''}`.trim(),
    pastor.poste,
    pastor.telephone ? `Tel: ${pastor.telephone}` : '',
    pastor.email ? `Email: ${pastor.email}` : ''
  ].filter(Boolean).join('\n');
}

export function blankPastor(defaultGrade = 'Pasteur') {
  return {
    nom: '',
    degre: defaultGrade,
    poste: '',
    telephone: '',
    email: '',
    date_affectation: ''
  };
}

export function blankPoste() {
  return {
    nom: '',
    region: '',
    description: ''
  };
}

export function blankGrade() {
  return {
    nom: '',
    description: ''
  };
}
