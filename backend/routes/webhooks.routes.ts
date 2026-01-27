import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/clerk/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === 'user.created') {
      await prisma.user.create({
        data: {
          id: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
        },
      });
    }

    if (type === 'user.updated') {
      await prisma.user.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
        },
        update: {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
        },
      });
    }

    if (type === 'user.deleted') {
      await prisma.user.delete({ where: { id: data.id } }).catch(() => {});
    }

    return res.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

export default router;

