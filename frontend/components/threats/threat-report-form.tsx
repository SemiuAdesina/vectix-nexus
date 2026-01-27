'use client';

import React, { useState } from 'react';
import { X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { reportThreat } from '@/lib/api/onchain/threats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ThreatReportFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ThreatReportForm({ onClose, onSuccess }: ThreatReportFormProps) {
  const [formData, setFormData] = useState({
    tokenAddress: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await reportThreat({
        reporter: 'user',
        tokenAddress: formData.tokenAddress || undefined,
        description: formData.description,
        severity: formData.severity,
      });

      if (result.success) {
        setFormData({ tokenAddress: '', description: '', severity: 'medium' });
        onSuccess?.();
        onClose();
      } else {
        setError('Failed to submit threat report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit threat report');
    } finally {
      setSubmitting(false);
    }
  };

  const severityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Report Threat</CardTitle>
              <CardDescription>Submit a threat report to VectixLogic security team</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">
              Token Address
              <span className="text-muted-foreground ml-1 text-xs">(Optional)</span>
            </Label>
            <Input
              id="tokenAddress"
              type="text"
              value={formData.tokenAddress}
              onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
              placeholder="Enter Solana token address if applicable"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value as typeof formData.severity })}
              disabled={submitting}
            >
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <span>Low</span>
                    <Badge variant="outline" className={severityColors.low}>
                      Low Priority
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <span>Medium</span>
                    <Badge variant="outline" className={severityColors.medium}>
                      Medium Priority
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <span>High</span>
                    <Badge variant="outline" className={severityColors.high}>
                      High Priority
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <span>Critical</span>
                    <Badge variant="outline" className={severityColors.critical}>
                      Critical
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the threat or suspicious activity in detail..."
              required
              rows={5}
              disabled={submitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide as much detail as possible to help our security team investigate
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.description.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
