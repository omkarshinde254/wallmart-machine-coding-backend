const express = require('express')
const app = express()
const port = 3001

const cors = require('cors');
app.use(express.json());
app.use(cors());


const connection = require('./database').databaseConnection
app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.get('/api/get/schedule', (req, res) => {
  console.log('fetching schedules');
  const query = 'SELECT * FROM schedule_info';
  connection.query(query, (err, rows) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      res.status(500).send('Error fetching schedules');
      return;
    }
    res.json(rows);
  });
})

app.post('/api/create_or_update/schedule', (req, res) => {
  console.log('creating or updating schedules');
  const schedules = req.body;
  if (!Array.isArray(schedules)) {
    res.status(400).send('Request body should be an array');
    return;
  }

  const values = schedules.map(schedule => [schedule.key, schedule.startDate, schedule.endDate, schedule.channel, schedule.location]);
  const query = `
    INSERT INTO schedule_info 
    (\`key\`, startDate, endDate, channel, location) 
    VALUES ? 
    ON DUPLICATE KEY UPDATE 
    startDate = VALUES(startDate), 
    endDate = VALUES(endDate), 
    channel = VALUES(channel), 
    location = VALUES(location)
  `;

  connection.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      res.status(500).send('Error creating or updating schedules');
      return;
    }
    res.status(200).send('Schedules created or updated successfully');
  });
});


// Create
// app.post('/api/create/schedule', (req, res) => {
//   const schedules = req.body;
//   if (!Array.isArray(schedules)) {
//     res.status(400).send('Request body should be an array');
//     return;
//   }

//   const values = schedules.map(schedule => [schedule.key, schedule.startDate, schedule.endDate, schedule.channel, schedule.location]);
//   const query = 'INSERT INTO schedule_info (`key`, startDate, endDate, channel, location) VALUES ?';
//   connection.query(query, [values], (err, result) => {
//     if (err) {
//       console.error('Error executing MySQL query: ' + err.stack);
//       res.status(500).send('Error creating schedules');
//       return;
//     }
//     res.status(201).send('Schedules created successfully');
//   });
// });

// Update
// app.post('/api/update/schedule/', (req, res) => {
//   const schedules = req.body; // Assuming req.body is an array of schedules
//   if (!Array.isArray(schedules) || schedules.length === 0) {
//     res.status(400).send('Request body should be a non-empty array of schedules');
//     return;
//   }

//   const queries = schedules.map(schedule => {
//     const { key, startDate, endDate, channel, location } = schedule;
//     return {
//       query: 'UPDATE schedule_info SET startDate = ?, endDate = ?, channel = ?, location = ? WHERE `key` = ?',
//       values: [startDate, endDate, channel, location, key]
//     };
//   });

//   let successCount = 0;
//   const totalQueries = queries.length;

//   queries.forEach(({ query, values }) => {
//     connection.query(query, values, (err, result) => {
//       if (err) {
//         console.error('Error executing MySQL query: ' + err.stack);
//       } else {
//         successCount++;
//       }

//       if (successCount === totalQueries) {
//         res.status(200).send('All schedules updated successfully');
//       }
//     });
//   });
// });


// // Delete (DELETE)
app.post('/api/delete/schedule/', (req, res) => {
  const keys = req.body;
  if (!Array.isArray(keys) || keys.length === 0) {
    res.status(400).send('Request body should be a non-empty array of keys');
    return;
  }

  const query = 'DELETE FROM schedule_info WHERE `key` IN (?)';
  connection.query(query, [keys], (err, result) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      res.status(500).send('Error deleting schedules');
      return;
    }
    res.status(200).send('Schedules deleted successfully');
  });
});



app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

