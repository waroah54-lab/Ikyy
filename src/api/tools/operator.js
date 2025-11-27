function getOperatorInfo(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

    const prefix = formattedPhone.substring(2, 5);

    const operators = {
        '811': 'Telkomsel (Simpati)',
        '812': 'Telkomsel (Simpati)',
        '813': 'Telkomsel (As)',
        '821': 'Telkomsel (Simpati)',
        '822': 'Telkomsel (Simpati)',
        '823': 'Telkomsel (As)',
        '851': 'Telkomsel (As)',
        '852': 'Telkomsel (As)',
        '853': 'Telkomsel (As)',
        '817': 'XL',
        '818': 'XL',
        '819': 'XL',
        '859': 'XL',
        '877': 'XL',
        '878': 'XL',
        '814': 'Indosat (Mentari)',
        '815': 'Indosat (Matrix)',
        '816': 'Indosat (IM3)',
        '855': 'Indosat (IM3)',
        '856': 'Indosat (IM3)',
        '857': 'Indosat (IM3)',
        '858': 'Indosat (IM3)',
        '895': 'Indosat (IM3)',
        '896': 'Three (3)',
        '897': 'Three (3)',
        '898': 'Three (3)',
        '899': 'Three (3)',
        '832': 'Axis',
        '833': 'Axis',
        '838': 'Axis',
        '847': 'Smartfren',
        '848': 'Smartfren',
        '849': 'Smartfren',
        '881': 'Smartfren',
        '882': 'Smartfren',
        '883': 'Smartfren',
        '884': 'Smartfren',
        '885': 'Smartfren',
        '886': 'Smartfren',
        '887': 'Smartfren',
        '888': 'Smartfren',
        '889': 'Smartfren'
    };

    const operator = operators[prefix] || 'Tidak diketahui';

    return {
        phone: formattedPhone,
        operator: operator
    };
}

module.exports = function (app) {
    app.get('/tools/operator', async (req, res) => {
        const { apikey, phone } = req.query;
        if (!apikey) return res.status(400).json({
            status: false,
            error: 'apikey is required'
        });

        if (!global.apikey.includes(apikey)) return res.status(403).json({
            status: false,
            error: 'invalid apikey'
        });

        if (!phone) return res.status(400).json({
            status: false,
            error: 'phone is required'
        });

        try {
            const result = getOperatorInfo(phone);

            res.status(200).json({
                status: true,
                result: result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });
};
                                      
