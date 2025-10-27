import { Router } from 'express';
import { prisma } from '../prisma.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../auth.js';

export const auth = Router();

// POST /auth/register { name, email, password, orgName, orgSlug }
auth.post('/register', async (req, res) => {
  const { name, email, password, orgName, orgSlug } = req.body;
  if (!name || !email || !password || !orgName || !orgSlug)
    return res.status(400).json({ error: 'Missing fields' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email exists' });

  const org = await prisma.org.create({
    data: { name: orgName, slug: orgSlug }
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10)
    }
  });

  await prisma.orgMember.create({
    data: {
      orgId: org.id,
      userId: user.id,
      role: 'Owner'
    }
  });

  // default categories
  const cats = ['Attention', 'Obedience', 'Attitude', 'Participation'];
  await prisma.category.createMany({
    data: cats.map((c) => ({ orgId: org.id, name: c }))
  });

  const token = signToken({ userId: user.id, orgId: org.id, role: 'Owner' });
  res.json({ token, orgId: org.id });
});

// POST /auth/login { email, password }
auth.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const member = await prisma.orgMember.findFirst({
    where: { userId: user.id }
  });
  if (!member) return res.status(400).json({ error: 'No org membership' });

  const token = signToken({
    userId: user.id,
    orgId: member.orgId,
    role: member.role
  });
  res.json({ token, orgId: member.orgId, role: member.role });
});