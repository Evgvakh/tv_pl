import nodemailer from 'nodemailer'
import mjml from 'mjml'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL_USER,
        pass: process.env.AUTH_EMAIL_PASSWORD
    },
}, {
    from: `Татьяна Викторовна <${process.env.AUTH_EMAIL_SENDER}>`,
});

const mailer = (message, res) => {
    try {
        transporter.sendMail(message, (err, info) => {
            if (err) {
                res.send(err)
            }
            next()
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err.message, data: null })
    }
    try {
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err.message, data: null })
    }
}

const setFilePath = (file) => {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const mjmlFilePath = path.join(currentDir, 'mjml', file);
    console.log(mjmlFilePath)
    return mjmlFilePath
}
const defineMessage = (recipient, subject, htmlTemplate) => {
    return {
        to: recipient,
        subject: subject,
        html: htmlTemplate
    }
}

export const sendCreateAccountMail = (req, res, body, isResetPassword) => {
    try {
        fs.readFile(setFilePath('createClientAccount.mjml'), 'utf-8', (err, mjmlTemplate) => {
            if (err) {
                return res.status(500).send('Failed to read template');
            }
            const template = isResetPassword ?
                mjmlTemplate.replace('{{header}}', 'Пароль изменен для ').replace('{{email}}', body.email).replace('{{password}}', '').replace('{{isPasswordReset}}', 'изменен.') :
                mjmlTemplate.replace('{{header}}', 'Учетная запись создана для ').replace('{{email}}', body.email).replace('{{password}}', body.password).replace('{{isPasswordReset}}', 'для управлениям записями: ')

            const htmlOutput = mjml(template).html

            mailer(defineMessage(body.email, 'Ваша учетная запись у врача ', htmlOutput), res)
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err.message, data: null })
    }
}

export const sendResetPasswordLink = (req, res, user, link, email) => {
    try {
        fs.readFile(setFilePath('ResetPassword.mjml'), 'utf-8', (err, mjmlTemplate) => {
            if (err) {
                return res.status(500).send('Failed to read template');
            }
            const finalTemplate = mjmlTemplate
                .replace('{{user}}', user)
                .replace('{{link}}', link)

            const htmlOutput = mjml(finalTemplate).html

            mailer(defineMessage(email, 'Reset your password', htmlOutput), res)
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err.message, data: null })
    }
}