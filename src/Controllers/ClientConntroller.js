import Client from "../DB/Models/Client.js";

export const addNewClient = async (req, res) => {
    try {
        const { name, email, phone, commentary, appointmentID, age } = req.body
        const isExisitngClient = await Client.findOne({ name: name, email: email })

        if (isExisitngClient) {
            throw new Error('Такой клиент уже существует')
        }
        let client = new Client({
            name: name,
            ...(phone && { phone: phone }),
            ...(email && { email: email }),
            ...(age && { age: age })
        })
        await client.save()

        if (commentary) {
            const updateResult = await Client.updateOne(
                { _id: client.id },
                { $push: { commentaries: { text: commentary, appointmentID: appointmentID } } }
            );
            if (updateResult.modifiedCount === 0) {
                throw new Error('Комментарий не был добавлен');
            }
        }

        res.status(201).send({ client, clientCommentary: commentary })
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const getClients = async (req, res) => {
    try {
        const data = await Client.aggregate([
            {
                $addFields: {
                    commentaries: {
                        $sortArray: {
                            input: "$commentaries",
                            sortBy: { createdAt: -1 }
                        }
                    }
                }
            },
            {
                $sort: { name: 1 }
            }
        ]);
        res.status(200).send(data)
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const addClientCommentary = async (req, res) => {
    try {
        const { clientID, text, appointmentID } = req.body
        const data = await Client.updateOne(
            { _id: clientID },
            {
                $push: {
                    commentaries: {
                        ...(appointmentID && { appointmentID }),
                        text: text
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

export const editClientField = async (req, res) => {
    try {
        const allowedFields = ["name", "phone", "age", "email"]
        const { id, field, value } = req.body
        console.log(id, field, value)
        if (!allowedFields.includes(field)) {
            throw new Error('Поле не существует / Field is not existing')
        }
        const data = await Client.updateOne(
            { _id: id },
            {[field]: value}
        )        
        if (data.modifiedCount > 0) {
            res.status(201).send({message: 'Успешно обновлено / Update success'})
        } else {
            res.status(200).send({message: 'OK' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}