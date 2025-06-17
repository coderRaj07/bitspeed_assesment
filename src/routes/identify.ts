import express, { Request, Response } from 'express';
import { identifyContact } from '../utils/identity';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Either email or phoneNumber is required' });
    }

    const contact = await identifyContact({ email, phoneNumber });
    return res.status(200).json({ contact });
  })
);

export default router;
