function normalizePhoneForWhatsApp(phone) {
  return String(phone || '').replace(/[^\d]/g, '');
}

export function withCommunicationLinks(pastor) {
  const phone = pastor.telephone || '';
  const whatsappPhone = normalizePhoneForWhatsApp(phone);
  const message = `Bonjour Pasteur ${pastor.nom}, je vous contacte via l'annuaire CBCA...`;

  return {
    ...pastor,
    actions: {
      call: `tel:${phone}`,
      whatsapp: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
    }
  };
}
