const getFetch = () => {
    if (typeof globalThis.fetch === 'function') {
        return globalThis.fetch;
    }
    try {
        return require('node-fetch');
    } catch (e) {
        throw new Error('No fetch implementation found. Please use Node 18+ or install node-fetch.');
    }
};

exports.handler = async (event, context) => {
    const fetch = getFetch();

    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { customerInfo, items, total, orderId, address, paymentMethod } = body;

        // Use Resend credentials
        const apiKey = process.env.RESEND_API_KEY || 're_KYxxJwAE_LS8J2y8NYfqTLgWHaLiwKZzJ';
        const sender = process.env.RESEND_SENDER || 'onboarding@resend.dev';
        const shopEmail = process.env.VITE_SHOP_OWNER_EMAIL || 'gearnext985@gmail.com';

        if (!apiKey) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Resend API key is not configured.' })
            };
        }

        const itemsTable = items.map(item => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.name} ${item.selectedSize ? `(Size: ${item.selectedSize})` : ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price}</td>
            </tr>
        `).join('');

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #FF5722; text-align: center;">NextGear Order Details</h2>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                
                <h3 style="border-bottom: 2px solid #FF5722; padding-bottom: 5px;">Shipping Information</h3>
                <p><strong>Name:</strong> ${customerInfo.fullName}</p>
                <p><strong>Phone:</strong> ${customerInfo.phone}</p>
                <p><strong>Email:</strong> ${customerInfo.email}</p>
                <p><strong>Address:</strong> ${address}</p>

                <h3 style="border-bottom: 2px solid #FF5722; padding-bottom: 5px;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background-color: #f7f7f7;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsTable}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-weight: bold; text-align: right;">Total Price:</td>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; text-align: right;">₹${total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
                    <p>Thank you for choosing NextGear! Ride safe.</p>
                </div>
            </div>
        `;

        // 1. Send confirmation receipt email to Customer
        // (Note: In Resend sandbox mode, if the domain is not verified yet, sending to external addresses will reject.
        // We handle this gracefully so the user checkout doesn't fail).
        let customerSent = false;
        try {
            const customerResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'User-Agent': 'NextGear/1.0'
                },
                body: JSON.stringify({
                    from: `NextGear <${sender}>`,
                    to: [customerInfo.email],
                    subject: `NextGear Order Confirmation - #${orderId}`,
                    html: emailHtml
                })
            });
            customerSent = customerResponse.ok;
            if (!customerResponse.ok) {
                const errResult = await customerResponse.json();
                console.warn('Resend Customer Send Rejected (likely domain unverified):', errResult);
            }
        } catch (customerErr) {
            console.error('Error sending customer checkout receipt:', customerErr);
        }

        // 2. Send order notification email to Shop Owner
        let shopSent = false;
        try {
            const shopResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'User-Agent': 'NextGear/1.0'
                },
                body: JSON.stringify({
                    from: `NextGear <${sender}>`,
                    to: [shopEmail],
                    subject: `🚨 New NextGear Order - #${orderId}`,
                    html: `<h3>New Order Received</h3><p>An order has been placed by ${customerInfo.fullName}. Details:</p><hr/>${emailHtml}`
                })
            });
            shopSent = shopResponse.ok;
            if (!shopResponse.ok) {
                const errResult = await shopResponse.json();
                console.warn('Resend Shop Notification Rejected:', errResult);
            }
        } catch (shopErr) {
            console.error('Error sending shop owner notification:', shopErr);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Mail dispatch sequence completed.',
                customerEmailStatus: customerSent ? 'sent' : 'failed/skipped',
                shopOwnerEmailStatus: shopSent ? 'sent' : 'failed/skipped'
            })
        };

    } catch (err) {
        console.error('Serverless mail error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
