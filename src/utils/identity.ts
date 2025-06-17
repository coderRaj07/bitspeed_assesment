import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type IdentifyParams = {
    email?: string;
    phoneNumber?: string;
};

export const identifyContact = async ({ email, phoneNumber }: IdentifyParams) => {
    // 1. Find all contacts with matching email or phone
    const matchedContacts = await prisma.contact.findMany({
        where: {
            OR: [
                { email: email || undefined },
                { phoneNumber: phoneNumber || undefined },
            ],
        },
        orderBy: { createdAt: 'asc' },
    });

    if (matchedContacts.length === 0) {
        const newPrimary = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'primary',
            },
        });

        return {
            primaryContatctId: newPrimary.id,
            emails: [email],
            phoneNumbers: [phoneNumber],
            secondaryContactIds: [],
        };
    }


    let allContacts = [...matchedContacts];

    // 2. Find all unique primaries involved
    const primaryContacts = matchedContacts
        .filter(c => c.linkPrecedence === 'primary');

    const allPrimaryIds = Array.from(new Set(primaryContacts.map(c => c.id)));
    const allLinkedPrimaryIds = matchedContacts
        .filter(c => c.linkPrecedence === 'secondary')
        .map(c => c.linkedId!)
        .filter(id => !allPrimaryIds.includes(id));

    const allRelevantPrimaryIds = Array.from(new Set([...allPrimaryIds, ...allLinkedPrimaryIds]));

    const primaries = await prisma.contact.findMany({
        where: { id: { in: allRelevantPrimaryIds } },
        orderBy: { createdAt: 'asc' },
    });

    // 3. Determine the oldest primary contact
    const rootPrimary = primaries[0];

    // 4. Merge other primaries (if any) into the oldest one
    for (let i = 1; i < primaries.length; i++) {
        const p = primaries[i];
        if (p.linkPrecedence === 'primary') {
            await prisma.contact.update({
                where: { id: p.id },
                data: {
                    linkPrecedence: 'secondary',
                    linkedId: rootPrimary.id,
                },
            });
        }
    }

    // 5. Find the updated contact graph (all linked to rootPrimary)
    const relatedContacts = await prisma.contact.findMany({
        where: {
            OR: [
                { id: rootPrimary.id },
                { linkedId: rootPrimary.id },
            ],
        },
        orderBy: { createdAt: 'asc' },
    });

    allContacts = relatedContacts;

    // 6. Check if current input is already present
    const alreadyExists = relatedContacts.some(c =>
        c.email === email && c.phoneNumber === phoneNumber
    );

    if (!alreadyExists && (email || phoneNumber)) {
        const newContact = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'secondary',
                linkedId: rootPrimary.id,
            }
        });
        allContacts.push(newContact);
    }

    // 7. Return the response structure
    const emails = Array.from(new Set(allContacts.map(c => c.email).filter(Boolean))) as string[];
    const phoneNumbers = Array.from(new Set(allContacts.map(c => c.phoneNumber).filter(Boolean))) as string[];
    const secondaryContactIds = allContacts
        .filter(c => c.linkPrecedence === 'secondary')
        .map(c => c.id);

    return {
        primaryContatctId: rootPrimary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
    };
};
