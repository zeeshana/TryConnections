'use strict';

const app = require('./express/server');
const  cors = require('cors')

app.use(cors());
app.listen(3000, () => console.log('Local app listening on port 3000!'));
