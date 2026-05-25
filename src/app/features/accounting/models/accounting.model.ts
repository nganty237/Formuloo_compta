export interface JournalEntry {
    id: string;
    date: string;
    pieceRef: string;
    accountDebit: string;
    accountCredit: string;
    label: string;
    amount: number;
    status: 'draft' | 'validated';
}