const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const routes = require('./src/routes');

const corsOptions = {
    origin: 'https://multishow-associados.web.app',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/^\/.*$/, cors());


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/', routes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
