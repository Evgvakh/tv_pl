import express from 'express'
import cors from 'cors'

import { connectToDB } from './DB/DB.js'
import { addAppointmentCommentary, addNewAppointment, checkIfClientExistsAndModifyAppointments, getAppointments, getAppointmentsOnBlockedDates, getScheduledTimesByDate, removeAppointment, rescheduleAppointment } from './Controllers/AppointmentController.js'
import { startBot } from './TG/index.js' 
import { addClientCommentary, addNewClient, editClientField, getClients } from './Controllers/ClientConntroller.js'
import { blockWeekends, getBlockedDates, setBlockedDates, unblockDates } from './Controllers/Dates.js'
import { addUser, userLogin } from './Controllers/UserController.js'

const app = express()

app.use(cors())
app.use(express.json())

await connectToDB();
startBot()

app.post('/appointment/add', addNewAppointment)
app.get('/appointments/get', getAppointments )
app.post('/appointment/get-taken-times', getScheduledTimesByDate)
app.patch('/appointment/add-comment', addAppointmentCommentary)
app.patch('/appointment/reschedule', rescheduleAppointment)
app.delete('/appointment/remove/:apptID', removeAppointment)
app.get('/appointment/get-appointments-warning', getAppointmentsOnBlockedDates)
app.post('/appointment/add-id-if-name-exists', checkIfClientExistsAndModifyAppointments)

app.post('/client/add', addNewClient)
app.get('/clients/get', getClients)
app.patch('/client/add-comment', addClientCommentary)
app.patch('/client/edit-one-field', editClientField)

app.post('/dates/block-weekends', blockWeekends)
app.get('/dates/get-blocked-dates', getBlockedDates)
app.post('/dates/block-dates', setBlockedDates)
app.post('/dates/unblock-dates', unblockDates)

app.post('/user/add', addUser)
app.post('/user/login', userLogin)

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ errorMessage: err.message || 'Internal Server Error', data: null });
});

app.listen(5051 || process.env.PORT, (err) => {
    if (err) {
        console.log('Server down')
    } else {
        console.log('Server works!')
    }
})