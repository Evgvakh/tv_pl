import User from "../DB/Models/User.js";
import generatePassword from 'generate-password'
import bcrypt from 'bcrypt'
import { sendCreateAccountMail } from "../Utils/Mailers/mailer.js";
import jwt from 'jsonwebtoken'

export const addUser = async (req, res) => {
    try {
        let { email, password, role } = req.body
        let isResetPassword
        if (!password) {
            isResetPassword = false
            password = generatePassword.generate({
                length: 8,
                numbers: true,
                symbols: true,
                uppercase: true,
                strict: true
            })
        } else { isResetPassword = true }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password + process.env.PEPPER, salt);

        const user = await User.create({
            email,
            password: hashPassword,
            role: role || 'user'
        })

        const { password: userPassword, ...userWithoutPassword } = user.toObject();
        await sendCreateAccountMail(req, res, { email, password }, isResetPassword)
        res.status(201).send(userWithoutPassword)
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error('Wrong credentials/Неверноый логин или пароль')
        }
        const isValidPassword = await bcrypt.compare(password + process.env.PEPPER, user.password)
        if (!isValidPassword) {
            throw new Error('Wrong credentials/Неверноый логин или пароль')
        }
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.SECRET_TOKEN_KEY,
            { expiresIn: '1h'}
        )
        res.status(200).send({user: {id: user._id, role: user.role, email: user.email}, token: token})
    } catch (err) {
        console.log(err)
        res.status(500).send({ errorMessage: err.message, data: null })
    }
}