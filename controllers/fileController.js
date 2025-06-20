const XLSX = require('xlsx');

exports.import = async (req, res, next) => {
    console.log('Import File XLSX');

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        res.json({
            success: true,
            data: json,
        });
    } catch (error) {
        console.error('Erro ao processar Excel:', error);
        res.status(500).json({ error: 'Erro ao processar o arquivo Excel.' });
    }
};
