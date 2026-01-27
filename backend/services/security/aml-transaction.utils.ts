import { TransactionRecord } from './aml-monitoring.service';

const transactionHistory = new Map<string, TransactionRecord[]>();

export function recordTransaction(record: TransactionRecord): void {
    const userHistory = transactionHistory.get(record.userId) || [];
    userHistory.push(record);

    if (userHistory.length > 1000) {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = userHistory.filter(t => t.timestamp > thirtyDaysAgo);
        transactionHistory.set(record.userId, filtered);
    } else {
        transactionHistory.set(record.userId, userHistory);
    }
}

export function getTransactionHistory(userId: string): TransactionRecord[] {
    return transactionHistory.get(userId) || [];
}

export function clearTransactionHistory(userId: string): void {
    transactionHistory.delete(userId);
}

export function calculatePeriodTotal(history: TransactionRecord[], periodMs: number): number {
    const cutoff = Date.now() - periodMs;
    return history.filter(t => t.timestamp > cutoff).reduce((sum, t) => sum + t.amount, 0);
}

interface StructuringResult {
    detected: boolean;
    pattern?: string;
}

export function detectStructuring(
    history: TransactionRecord[],
    threshold: number
): StructuringResult {
    const last24Hours = history.filter(t => t.timestamp > Date.now() - 24 * 60 * 60 * 1000);
    const justUnderThreshold = last24Hours.filter(
        t => t.amount >= threshold * 0.8 && t.amount < threshold
    );

    if (justUnderThreshold.length >= 3) {
        return { detected: true, pattern: `${justUnderThreshold.length} transactions just under threshold` };
    }

    return { detected: false };
}
