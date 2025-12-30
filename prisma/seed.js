const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create or update the trip
  const trip = await prisma.trip.upsert({
    where: { id: 'tokyo-niseko-2025' },
    update: {},
    create: {
      id: 'tokyo-niseko-2025',
      title: 'Tokyo + Niseko 2025',
      subtitle: 'January 19 - February 1',
      tags: ['6 Days Tokyo', '4 Days Skiing'],
      highlights: [
        { label: 'Ski Days', value: '4 + night session' },
        { label: 'Michelin', value: '2 dinners' },
        { label: 'Neighborhoods', value: '8 explored' }
      ]
    }
  });

  // Create flights
  const flightsData = [
    { label: 'Outbound', route: 'EWR → HND', date: 'Jan 19', sortOrder: 0 },
    { label: 'To Niseko', route: 'HND → CTS', date: 'Jan 24', sortOrder: 1 },
    { label: 'Back', route: 'CTS → HND', date: 'Jan 29', sortOrder: 2 },
    { label: 'Home', route: 'HND → EWR', date: 'Feb 1', sortOrder: 3 }
  ];

  for (const flight of flightsData) {
    await prisma.flight.upsert({
      where: { id: `${trip.id}-${flight.label.toLowerCase().replace(' ', '-')}` },
      update: flight,
      create: { id: `${trip.id}-${flight.label.toLowerCase().replace(' ', '-')}`, tripId: trip.id, ...flight }
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
