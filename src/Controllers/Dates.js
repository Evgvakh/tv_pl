import BlockedDate from "../DB/Models/BlockedDate.js";

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const blockWeekends = async (req, res) => {
    try {
        const { year } = req.body;
        if (!year) {
            return res.status(400).json({ error: 'Год обязателен для передачи' });
        }

        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum)) {
            return res.status(400).json({ error: 'Передан некорректный год' });
        }

        let blockedDates = [];
        let currentDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum, 11, 31);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                blockedDates.push({ date: formatLocalDate(currentDate) });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        await BlockedDate.insertMany(blockedDates);
        return res.status(200).json({ message: 'Даты успешно заблокированы', count: blockedDates.length, year: year });
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
};

export const getBlockedDates = async (req, res) => {
    try {
        const data = await BlockedDate.find({})
        const datesArray = data.map(date => (
            date.date
        ))
        res.status(200).send(datesArray)
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const setBlockedDates = async (req, res) => {
    try {        
        let dates = req.body.dates.map(date => {             
            return formatLocalDate(new Date(date))
        })  

        const isAlreadyBlockedDate = await BlockedDate.findOne({
            date: {$in: dates}
        })
        
        if (isAlreadyBlockedDate) {
            return res.status(400).json({ error: 'Дата уже заблокирована' });
        }
        dates = dates.map(date => (
            {date: date}
        ))        
        const data = await BlockedDate.insertMany(dates) 
        res.status(200).json({ message: 'Даты успешно заблокированы', count: data.length });
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const unblockDates = async (req, res) => {
    try {        
        let dates = req.body.dates.map(date => {             
            return formatLocalDate(new Date(date))
        })  

        const isUnblockedDate = await BlockedDate.findOne({
            date: {$in: dates}
        })
        
        if (!isUnblockedDate) {
            return res.status(400).json({ error: 'Дата не заблокирована' });
        }
               
        const data = await BlockedDate.deleteMany({
            date: {$in: dates}
        }) 
        res.status(200).json({ message: 'Даты успешно разблокированы', count: data.length });
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

