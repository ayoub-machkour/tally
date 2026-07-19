// ─── Deterministic Demo Seed ───────────────────────────────────────────────────
// 60 days of realistic expense data for dev/preview builds.
// Seeded with a fixed random — always produces the same data.

import type { Expense, CategoryId } from '@/domain/types';

// Tiny seeded PRNG (Mulberry32) — deterministic
function mulberry32(seed: number): () => number {
  return function () {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0xdeadbeef);

const CATEGORY_WEIGHTS: { category: CategoryId; weight: number; minAmt: number; maxAmt: number }[] =
  [
    { category: 'food',       weight: 25, minAmt: 8,   maxAmt: 45  },
    { category: 'coffee',     weight: 20, minAmt: 2.5, maxAmt: 7   },
    { category: 'groceries',  weight: 15, minAmt: 20,  maxAmt: 80  },
    { category: 'transport',  weight: 15, minAmt: 2,   maxAmt: 25  },
    { category: 'bills',      weight: 5,  minAmt: 30,  maxAmt: 150 },
    { category: 'fun',        weight: 8,  minAmt: 10,  maxAmt: 60  },
    { category: 'shopping',   weight: 7,  minAmt: 15,  maxAmt: 90  },
    { category: 'other',      weight: 5,  minAmt: 5,   maxAmt: 40  },
  ];

const NOTES: Record<CategoryId, string[]> = {
  food:       ['Lunch', 'Dinner with friends', 'Sushi', 'Pizza', 'Burritos', 'Thai food'],
  coffee:     ['Flat white', 'Cappuccino', 'Latte + muffin', 'Cold brew'],
  groceries:  ['Weekly shop', 'Farmers market', 'Corner store', 'Organic store'],
  transport:  ['Metro', 'Uber', 'Bus pass', 'Parking', 'Train ticket'],
  bills:      ['Electricity', 'Internet', 'Phone plan', 'Streaming', 'Insurance'],
  fun:        ['Cinema', 'Concert ticket', 'Mini golf', 'Bowling', 'Museum'],
  shopping:   ['New shoes', 'Books', 'Clothes', 'Gadget', 'Home decor'],
  other:      ['Haircut', 'Pharmacy', 'Donation', 'Gift'],
};

function pickCategory(): { category: CategoryId; minAmt: number; maxAmt: number } {
  const totalWeight = CATEGORY_WEIGHTS.reduce((acc, c) => acc + c.weight, 0);
  let r = rand() * totalWeight;
  for (const c of CATEGORY_WEIGHTS) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return CATEGORY_WEIGHTS[0];
}

function pickNote(category: CategoryId): string {
  const notes = NOTES[category];
  return notes[Math.floor(rand() * notes.length)];
}

let idCounter = 0;
function uid(): string {
  idCounter++;
  return `seed-${idCounter.toString().padStart(4, '0')}`;
}

export function generateSeedData(): Expense[] {
  // Reset counter for determinism
  idCounter = 0;
  const expenses: Expense[] = [];
  const now = Date.now();

  for (let dayOffset = 59; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    // 20% chance of no-spend day
    if (rand() < 0.20) continue;

    // 1–3 expenses per day
    const count = 1 + Math.floor(rand() * 3);

    for (let i = 0; i < count; i++) {
      const { category, minAmt, maxAmt } = pickCategory();
      const amount = Math.round((minAmt + rand() * (maxAmt - minAmt)) * 100) / 100;
      const hour = 7 + Math.floor(rand() * 14); // 7am–9pm
      const minute = Math.floor(rand() * 60);

      const expenseDate = new Date(date);
      expenseDate.setHours(hour, minute, 0, 0);

      expenses.push({
        id: uid(),
        amount,
        category,
        note: pickNote(category),
        createdAt: expenseDate.getTime(),
      });
    }
  }

  return expenses.sort((a, b) => a.createdAt - b.createdAt);
}
