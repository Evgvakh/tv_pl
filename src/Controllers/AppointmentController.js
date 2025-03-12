import Appointment from "../DB/Models/Appointment.js";
import BlockedDate from "../DB/Models/BlockedDate.js";
import Client from '../DB/Models/Client.js'

export const addNewAppointment = async (req, res) => {
    try {
        console.log(req.body)
        const { date, time, clientName, clientID, commentary } = req.body
        const isExisitngAppointment = await Appointment.findOne({ date: date, time: time })

        if (isExisitngAppointment) {
            throw new Error('Эти время и дата уже заняты')
        }

        const isDateBlocked = await BlockedDate.findOne({ date })
        if (isDateBlocked) {
            throw new Error('Дата заблокирована')
        }

        const data = new Appointment({
            date: date,
            time: time,
            ...(clientName && { clientName }),
            ...(clientID && { clientID })
        })
        if (commentary) {
            data.commentaries.push({ text: commentary })
        }

        await data.save()
        res.status(201).send(data)
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const getAppointments = async (req, res) => {
    try {
        const data = await Appointment.find({})
        res.status(200).send(data)
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const addAppointmentCommentary = async (req, res) => {
    try {
        const { id, text } = req.body
        console.log(id, text)
        const data = await Appointment.updateOne(
            { _id: id },
            {
                $push: {
                    commentaries: {
                        text
                    }
                }
            }
        )
        res.status(201).send(data)
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const rescheduleAppointment = async (req, res) => {
    try {
        const { id, date, time } = req.body        
        const data = await Appointment.updateOne(
            { _id: id },
            {
                $set: {
                    time,
                    date
                }
            }
        )
        res.status(201).send(data)
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const removeAppointment = async (req, res) => {
    try {
        console.log(req.params.apptID)
        const data = await Appointment.findByIdAndDelete(req.params.apptID)
        if (data) { res.status(201).send(data) }
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const getScheduledTimesByDate = async (req, res) => {
    try {
        const formatedDate = new Date(req.body.date).toISOString().split('T')[0]
        console.log(formatedDate)
        const times = await Appointment.aggregate([
            { $match: { date: formatedDate } },
            { $project: { time: 1 } }
        ])
        const takenTimes = times.map(app => app.time)
        res.status(200).send(takenTimes)
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const getAppointmentsOnBlockedDates = async (req, res) => {
    try {
        const blockedDates = await BlockedDate.find({})
        const dates = blockedDates.map(date => date.date)

        const appointments = await Appointment.find({
            date: { $in: dates }
        }).sort({ date: 1, time: 1 })

        res.status(200).send(appointments)
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const checkIfClientExistsAndModifyAppointments = async (req, res) => {
    try {
        const { name, clientID } = req.body
        const appointmentsWithNeededName = await Appointment.find({ clientName: name.toLowerCase() })
        if (appointmentsWithNeededName.length === 0) {
            return res.send('No match')
        }
        let idArray = appointmentsWithNeededName.map(appt => {
            return appt._id
        })
        const data = await Appointment.updateMany(
            { _id: { $in: idArray } },
            { $set: { clientID: clientID } }
        )
        res.send(data)

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}