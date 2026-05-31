const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/mock-api/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('--- DÉBUT DU PEUPLEMENT DE CHARGE ---');

const ENTREPRISE_ID = 'ENT-001';
const NB_ENTRIES = 200; // Simuler 200 écritures d'un coup

const lastEntryId = db.ecritures.length > 0 ? parseInt(db.ecritures[db.ecritures.length - 1].id.replace('entry-', '')) || 100 : 100;
const lastLineId = db.lignes.length > 0 ? parseInt(db.lignes[db.lignes.length - 1].id.replace('l', '')) || 500 : 500;

for (let i = 1; i <= NB_ENTRIES; i++) {
    const entryId = `load-entry-${i}`;
    
    // Créer une écriture
    db.ecritures.push({
        id: entryId,
        entrepriseId: ENTREPRISE_ID,
        journalId: i % 2 === 0 ? 'VTE' : 'ACH',
        date: `2024-02-${(i % 28) + 1}`.replace('-1', '-01').replace('-2', '-02').replace('-3', '-03').replace('-4', '-04').replace('-5', '-05').replace('-6', '-06').replace('-7', '-07').replace('-8', '-08').replace('-9', '-09'),
        libelle: `Écriture de test de charge n°${i}`,
        valide: true,
        createdAt: new Date().toISOString(),
        createdBy: 'load-tester'
    });

    // Créer les lignes associées (Débit/Crédit équilibré)
    const montant = Math.floor(Math.random() * 1000000);
    
    // Ligne de charge/produit
    db.lignes.push({
        id: `load-l-${i}-1`,
        ecritureId: entryId,
        compteId: i % 2 === 0 ? 'cpt-701' : 'cpt-601',
        debit: i % 2 === 0 ? 0 : montant,
        credit: i % 2 === 0 ? montant : 0
    });

    // Ligne de contrepartie (Banque)
    db.lignes.push({
        id: `load-l-${i}-2`,
        ecritureId: entryId,
        compteId: 'cpt-521',
        debit: i % 2 === 0 ? montant : 0,
        credit: i % 2 === 0 ? 0 : montant
    });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`--- FIN : ${NB_ENTRIES} écritures et ${NB_ENTRIES * 2} lignes ajoutées ---`);
