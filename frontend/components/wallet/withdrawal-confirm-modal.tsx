'use client';

import { useState } from 'react';
import { X, Mail, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestWithdrawal, confirmWithdrawal } from '@/lib/api/wallet';

interface WithdrawalConfirmModalProps {
    agentId: string;
    destinationAddress: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function WithdrawalConfirmModal({ agentId, destinationAddress, onClose, onSuccess }: WithdrawalConfirmModalProps) {
    const [step, setStep] = useState<'request' | 'confirm'>('request');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenHint, setTokenHint] = useState<string | null>(null);

    async function handleRequest() {
        setLoading(true);
        setError(null);
        try {
            const result = await requestWithdrawal(agentId, destinationAddress);
            setTokenHint(result.tokenHint);
            setStep('confirm');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        if (!token.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await confirmWithdrawal(agentId, token);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Confirmation failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Confirm Withdrawal
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>

                {step === 'request' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                    For security, we&apos;ll send a confirmation code to your email before processing this withdrawal.
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Destination: <code className="bg-secondary px-2 py-0.5 rounded">{destinationAddress.slice(0, 8)}...{destinationAddress.slice(-6)}</code>
                        </p>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button className="w-full" onClick={handleRequest} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                            Send Confirmation Email
                        </Button>
                    </div>
                )}

                {step === 'confirm' && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Enter the confirmation code from your email {tokenHint && <span>(starts with <code>{tokenHint}</code>)</span>}
                        </p>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste confirmation code"
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep('request')}>Back</Button>
                            <Button className="flex-1" onClick={handleConfirm} disabled={loading || !token.trim()}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Withdrawal'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
