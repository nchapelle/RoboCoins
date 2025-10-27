import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { computePoints } from '../scoring.js';

export const core = Router();

// Utility to write ledger and update student balance atomically
async function writeLedger(tx: any, orgId: string, studentId: string, sourceType: string, sourceId: string, delta: number) {
  const st = await tx.student.findUnique({ where: { id: studentId } });
  if (!st) throw new Error('Student not found');
  const newBal = st.pointsBal + delta;
  await tx.pointLedger.create({
    data: {
      orgId,
      studentId,
      sourceType,
      sourceId,
      delta,
      balanceAfter: newBal
    }
  });
  await tx.student.update({ where: { id: studentId }, data: { pointsBal: newBal } });
  return newBal;
}

// Students
core.post('/students', requireAuth, async (req, res) => {
  const { name, code, grade, avatarUrl } = req.body;
  const s = await prisma.student.create({
    data: { orgId: req.user!.orgId, name, code, grade, avatarUrl }
  });
  res.json(s);
});

core.get('/students', requireAuth, async (req, res) => {
  const list = await prisma.student.findMany({ where: { orgId: req.user!.orgId }, orderBy: { createdAt: 'desc' } });
  res.json(list);
});

// Raters
core.post('/raters', requireAuth, async (req, res) => {
  const { name, code, role, email } = req.body;
  const r = await prisma.rater.create({
    data: { orgId: req.user!.orgId, name, code, role, email }
  });
  res.json(r);
});

core.get('/raters', requireAuth, async (req, res) => {
  const list = await prisma.rater.findMany({ where: { orgId: req.user!.orgId, active: true } });
  res.json(list);
});

// Behavior submission (teacher form)
core.post('/behavior', requireAuth, async (req, res) => {
  const { studentCode, raterCode, date, scores, notes, shoutOut } = req.body as {
    studentCode: string; raterCode: string; date?: string;
    scores: Record<string, number>; notes?: string; shoutOut?: boolean;
  };
  const orgId = req.user!.orgId;

  const [student, rater, cats] = await Promise.all([
    prisma.student.findFirst({ where: { orgId, code: studentCode } }),
    prisma.rater.findFirst({ where: { orgId, code: raterCode } }),
    prisma.category.findMany({ where: { orgId } })
  ]);
  if (!student) return res.status(400).json({ error: 'Invalid student' });
  if (!rater) return res.status(400).json({ error: 'Invalid rater' });

  // normalize scores to category IDs
  const byName = Object.fromEntries(cats.map(c => [c.name, c]));
  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores)) {
    const cat = byName[k];
    if (!cat) continue;
    const clamped = Math.max(cat.scaleMin, Math.min(cat.scaleMax, Number(v || 0)));
    normalized[cat.id] = clamped;
  }

  // compute points
  const weights = Object.fromEntries(cats.map(c => [c.id, c.weight]));
  const { total, base } = computePoints(normalized, weights);
  const points = base + (shoutOut ? 2 : 0);

  const created = await prisma.$transaction(async (tx) => {
    const entry = await tx.behaviorEntry.create({
      data: {
        orgId,
        studentId: student.id,
        raterId: rater.id,
        date: date ? new Date(date) : new Date(),
        scores: normalized,
        notes,
        shoutOut: !!shoutOut,
        total,
        points
      }
    });
    const newBal = await writeLedger(tx, orgId, student.id, 'behavior', entry.id, points);
    return { entry, newBal };
  });

  res.json({ entryId: created.entry.id, points, total, balance: created.newBal });
});

// Chores
core.post('/chores', requireAuth, async (req, res) => {
  const { name, defaultPoints, photoUrl } = req.body;
  const c = await prisma.chore.create({
    data: { orgId: req.user!.orgId, name, defaultPoints, photoUrl }
  });
  res.json(c);
});

core.get('/chores', requireAuth, async (req, res) => {
  const cs = await prisma.chore.findMany({ where: { orgId: req.user!.orgId, active: true } });
  res.json(cs);
});

core.post('/chore-log', requireAuth, async (req, res) => {
  const { studentCode, choreName, date, photoUrl, notes } = req.body;
  const orgId = req.user!.orgId;
  const [student, chore] = await Promise.all([
    prisma.student.findFirst({ where: { orgId, code: studentCode } }),
    prisma.chore.findFirst({ where: { orgId, name: choreName } })
  ]);
  if (!student || !chore) return res.status(400).json({ error: 'Invalid student or chore' });

  const created = await prisma.$transaction(async (tx) => {
    const log = await tx.choreLog.create({
      data: {
        orgId,
        studentId: student.id,
        choreId: chore.id,
        date: date ? new Date(date) : new Date(),
        points: chore.defaultPoints,
        photoUrl,
        notes
      }
    });
    const newBal = await writeLedger(tx, orgId, student.id, 'chore', log.id, chore.defaultPoints);
    return { log, newBal };
  });

  res.json({ logId: created.log.id, points: chore.defaultPoints, balance: created.newBal });
});

// Rewards
core.post('/rewards', requireAuth, async (req, res) => {
  const { name, description, photoUrl, cost, inventory, visibility } = req.body;
  const r = await prisma.reward.create({
    data: {
      orgId: req.user!.orgId,
      name,
      description,
      photoUrl,
      cost,
      inventory: Number(inventory ?? 0),
      visibility: visibility || 'Private'
    }
  });
  res.json(r);
});

core.get('/rewards', requireAuth, async (req, res) => {
  const list = await prisma.reward.findMany({
    where: { orgId: req.user!.orgId, active: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(list);
});

// Redemption
core.post('/redeem', requireAuth, async (req, res) => {
  const { studentCode, rewardName, proofUrl, notes } = req.body;
  const orgId = req.user!.orgId;

  const [student, reward] = await Promise.all([
    prisma.student.findFirst({ where: { orgId, code: studentCode } }),
    prisma.reward.findFirst({ where: { orgId, name: rewardName, active: true } })
  ]);
  if (!student || !reward) return res.status(400).json({ error: 'Invalid student or reward' });
  if (reward.inventory <= 0) return res.status(400).json({ error: 'Out of stock' });
  if (student.pointsBal < reward.cost) return res.status(400).json({ error: 'Insufficient points' });

  const created = await prisma.$transaction(async (tx) => {
    const red = await tx.redemption.create({
      data: {
        orgId,
        studentId: student.id,
        rewardId: reward.id,
        date: new Date(),
        points: reward.cost,
        status: 'Approved',
        proofUrl,
        notes
      }
    });
    // decrement inventory and ledger
    await tx.reward.update({ where: { id: reward.id }, data: { inventory: { decrement: 1 } } });
    const newBal = await writeLedger(tx, orgId, student.id, 'redemption', red.id, -reward.cost);
    return { red, newBal };
  });

  res.json({ redemptionId: created.red.id, balance: created.newBal });
});

// Summaries
core.get('/students/:code/summary', requireAuth, async (req, res) => {
  const { code } = req.params;
  const orgId = req.user!.orgId;
  const student = await prisma.student.findFirst({ where: { orgId, code } });
  if (!student) return res.status(404).json({ error: 'Not found' });

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [entries, ledger] = await Promise.all([
    prisma.behaviorEntry.findMany({
      where: { orgId, studentId: student.id, date: { gte: since } },
      orderBy: { date: 'desc' }
    }),
    prisma.pointLedger.findMany({
      where: { orgId, studentId: student.id, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' }
    })
  ]);
  res.json({ student, last7: { behaviors: entries, ledger } });
});