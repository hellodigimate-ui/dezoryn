import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDelete() {
  console.log('--- TESTING DELETE ENDPOINT & POSTGRESQL PERSISTENCE ---');

  // 1. Submit a temporary test record
  const payload = {
    fullName: 'Temp Deletion Inquiry',
    email: 'temp.delete.test@dezoryn.com',
    company: 'Delete Test Co',
    phone: '+919999900000',
    message: 'Temporary record for deletion verification',
  };

  const submitRes = await fetch('http://localhost:5000/api/v1/contact/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const submitData: any = await submitRes.json();
  const tempId = submitData.data.id;
  console.log(`1. Created temporary submission ID: ${tempId}`);

  // Verify in PostgreSQL before deletion
  const countBefore: any = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*)::int as count FROM public."contact_submissions" WHERE id = $1',
    tempId
  );
  console.log(`2. PostgreSQL count before deletion: ${countBefore[0]?.count}`);

  // Perform DELETE API call
  const delRes = await fetch(`http://localhost:5000/api/v1/contact/submissions/${tempId}`, {
    method: 'DELETE',
  });
  const delData: any = await delRes.json();
  console.log('3. DELETE API response:', JSON.stringify(delData, null, 2));

  // Verify in PostgreSQL after deletion
  const countAfter: any = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*)::int as count FROM public."contact_submissions" WHERE id = $1',
    tempId
  );
  console.log(`4. PostgreSQL count after deletion: ${countAfter[0]?.count}`);

  if (countAfter[0]?.count === 0) {
    console.log('✅ SUCCESS: Record permanently removed from PostgreSQL database!');
  } else {
    console.error('❌ FAILURE: Record still exists in PostgreSQL database.');
  }

  await prisma.$disconnect();
}

testDelete();
