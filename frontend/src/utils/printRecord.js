function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDateTime(date = new Date()) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function openPrintDocument(title, body, { landscape = false } = {}) {
  const printWindow = window.open('', '_blank', landscape ? 'width=1120,height=780' : 'width=820,height=760');

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>
          @page {
            size: A4 ${landscape ? 'landscape' : 'portrait'};
            margin: 14mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            color: #172033;
            font-family: Poppins, Arial, sans-serif;
            margin: 0;
          }

          .report-header {
            align-items: center;
            border-bottom: 4px solid #d71920;
            display: flex;
            gap: 14px;
            justify-content: space-between;
            margin-bottom: 18px;
            padding-bottom: 12px;
          }

          .brand {
            align-items: center;
            display: flex;
            gap: 12px;
          }

          .brand img {
            background: #ffffff;
            border: 1px solid #dbe5f2;
            border-radius: 14px;
            height: 58px;
            object-fit: cover;
            width: 58px;
          }

          .brand strong,
          .brand span,
          .meta strong,
          .meta span {
            display: block;
          }

          .brand strong {
            color: #123f8c;
            font-size: 16px;
            font-weight: 800;
          }

          .brand span,
          .meta span,
          .muted {
            color: #64748b;
            font-size: 11px;
            font-weight: 600;
          }

          .meta {
            text-align: right;
          }

          .meta strong {
            color: #d71920;
            font-size: 13px;
            font-weight: 800;
          }

          h1 {
            color: #0f2f6e;
            font-size: ${landscape ? '23px' : '25px'};
            margin: 0 0 8px;
          }

          .summary {
            border: 1px solid #dbe5f2;
            border-radius: 10px;
            display: grid;
            gap: 10px;
            grid-template-columns: repeat(3, 1fr);
            margin: 14px 0 18px;
            padding: 12px;
          }

          .summary div {
            background: #f4f7fb;
            border-radius: 8px;
            padding: 10px;
          }

          .summary span {
            color: #64748b;
            display: block;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .summary strong {
            color: #123f8c;
            display: block;
            font-size: 18px;
            margin-top: 2px;
          }

          table {
            border-collapse: collapse;
            font-size: ${landscape ? '11px' : '12px'};
            width: 100%;
          }

          th,
          td {
            border: 1px solid #dbe5f2;
            padding: ${landscape ? '7px 6px' : '10px 8px'};
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #123f8c;
            color: #ffffff;
            font-size: 10px;
            letter-spacing: 0;
            text-transform: uppercase;
          }

          tbody tr:nth-child(even) td {
            background: #f8fbff;
          }

          .record-table th {
            background: #f4f7fb;
            color: #123f8c;
            width: 220px;
          }

          .signature-row {
            display: grid;
            gap: 22px;
            grid-template-columns: 1fr 1fr;
            margin-top: 34px;
          }

          .signature {
            border-top: 1px solid #94a3b8;
            color: #64748b;
            font-size: 11px;
            font-weight: 700;
            padding-top: 8px;
            text-align: center;
          }

          .footer {
            border-top: 1px solid #dbe5f2;
            color: #64748b;
            font-size: 10px;
            margin-top: 18px;
            padding-top: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>${body}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function reportHeader(title, subtitle = 'Etat de sortie') {
  return `
    <header class="report-header">
      <div class="brand">
        <img src="/cbca-logo.png" alt="" />
        <div>
          <strong>Annuaire CBCA</strong>
          <span>Gestion pastorale et contacts</span>
        </div>
      </div>
      <div class="meta">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(subtitle)}</span>
        <span>Genere le ${escapeHtml(formatDateTime())}</span>
      </div>
    </header>
  `;
}

export function printRecord(title, fields) {
  const printableRows = fields
    .filter((field) => field.value !== null && field.value !== undefined && field.value !== '')
    .map(
      (field) => `
        <tr>
          <th>${escapeHtml(field.label)}</th>
          <td>${escapeHtml(field.value)}</td>
        </tr>
      `
    )
    .join('');

  openPrintDocument(title, `
    ${reportHeader(title, 'Fiche individuelle')}
    <h1>${escapeHtml(title)}</h1>
    <table class="record-table">${printableRows}</table>
    <div class="signature-row">
      <div class="signature">Responsable de l'annuaire</div>
      <div class="signature">Signature / cachet</div>
    </div>
    <div class="footer">Document produit par l'application Annuaire CBCA.</div>
  `);
}

export function printPastorsList(pastors, options = {}) {
  const rows = pastors
    .map(
      (pastor, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${escapeHtml(pastor.nom)}</strong></td>
          <td>${escapeHtml(pastor.degre)}</td>
          <td>${escapeHtml(pastor.poste)}</td>
          <td>${escapeHtml(pastor.entite || '-')}</td>
          <td>${escapeHtml(pastor.telephone)}</td>
          <td>${escapeHtml(pastor.email || '-')}</td>
          <td>${escapeHtml(pastor.date_affectation ? String(pastor.date_affectation).slice(0, 10) : '-')}</td>
        </tr>
      `
    )
    .join('');

  const filters = [
    options.query ? `Recherche: ${options.query}` : '',
    options.degre ? `Fonction: ${options.degre}` : '',
    options.poste ? `Poste: ${options.poste}` : ''
  ].filter(Boolean);

  const postesCount = new Set(pastors.map((pastor) => pastor.poste).filter(Boolean)).size;
  const fonctionsCount = new Set(pastors.map((pastor) => pastor.degre).filter(Boolean)).size;

  openPrintDocument('Liste des serviteurs CBCA', `
    ${reportHeader('Liste des serviteurs CBCA', filters.length ? filters.join(' | ') : 'Tous les serviteurs')}
    <h1>Etat de sortie des serviteurs</h1>
    <div class="summary">
      <div>
        <span>Total serviteurs</span>
        <strong>${pastors.length}</strong>
      </div>
      <div>
        <span>Postes representes</span>
        <strong>${postesCount}</strong>
      </div>
      <div>
        <span>Fonctions representes</span>
        <strong>${fonctionsCount}</strong>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nom</th>
          <th>Fonction</th>
          <th>Poste</th>
          <th>Entite</th>
          <th>Telephone</th>
          <th>Email</th>
          <th>Affectation</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="8" class="muted">Aucun serviteur trouve.</td></tr>'}
      </tbody>
    </table>
    <div class="signature-row">
      <div class="signature">Responsable de l'annuaire</div>
      <div class="signature">Validation</div>
    </div>
    <div class="footer">Document produit par l'application Annuaire CBCA.</div>
  `, { landscape: true });
}
