export function phoneDigits(phone) {
  const digits = String(phone || '').replace(/[^\d]/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.startsWith('243')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `243${digits.slice(1)}`;
  }

  if (digits.length === 9 && ['8', '9'].includes(digits[0])) {
    return `243${digits}`;
  }

  return digits;
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

export const blankFonction = blankGrade;
