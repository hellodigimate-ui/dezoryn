export const sendLeadDetailsToCRM = async ({
    inquiry,
    software
}: {
    inquiry: {
        name?: string;
        email?: string;
        phone?: string;
        schoolName?: string;
        company?: string;
        message?: string;
        [key: string]: any;
    };
    software?: string;
}) => {
    const DEZOCRMWEBHOOKURL = process.env.DEZOCRMLEADWEBHOOKURL;

    if (DEZOCRMWEBHOOKURL) {
        try {
            await fetch(DEZOCRMWEBHOOKURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inquiry,
                    type: 'LEAD',
                    status: 'NEW',
                    createdAt: new Date(),
                    software,
                }),
            });
        } catch (err: any) {
            console.log('Failed to send lead webhook to CRM:', err?.message || err);
        }
    }
};

export const sendPaymentDetailsToCRM = async ({
    user,
    sub,
    payment,
    orderId,
    software
}: {
    user: any;
    sub: any;
    payment: any;
    orderId: string;
    software?: string;
}) => {
    const DEZOCRMWEBHOOKURL = process.env.DEZOCRMPAYMENTWEBHOOKURL;

    if (DEZOCRMWEBHOOKURL) {
        try {
            await fetch(DEZOCRMWEBHOOKURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user,
                    sub,
                    payment,
                    orderId,
                    type: 'SUBSCRIPTION',
                    provider: 'RAZORPAY',
                    status: 'PAID',
                    paidAt: new Date(),
                    software,
                }),
            });
        } catch (err: any) {
            console.log('Failed to send subscription webhook to CRM:', err?.message || err);
        }
    }
};
