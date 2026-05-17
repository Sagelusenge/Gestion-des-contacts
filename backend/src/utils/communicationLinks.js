export function normalizePhoneForWhatsApp(phone) {
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

export function withCommunicationLinks(pastor) {
  const phone = pastor.telephone || '';
  const whatsappPhone = normalizePhoneForWhatsApp(phone);
  const fonction = pastor.degre || 'Serviteur';
  const message = `Bonjour ${fonction} ${pastor.nom}, nous vous saluons au nom du Tout-Puissant. Nous vous contactons via l'annuaire CBCA pour une communication concernant votre fonction et votre poste.`;

  return {
    ...pastor,
    actions: {
      call: `tel:${phone}`,
      whatsapp: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
    }
  };
}
