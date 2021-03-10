// Create sendEmail params
exports.registerEmailParams = (email, token) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <h1>Hello</h1>
                            <p>Click the following token to active your account</p>
                            <p> ${process.env.CLIENT_URL}/auth/activate/${token}</p>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Complete your registration'
            }
        }
    }
}

exports.forgotPasswordEmailParams = (email, token) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <h1>Reset password link</h1>
                            <p>Click the following token to reset your password</p>
                            <p> ${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Password reset'
            }
        }
    }
}




exports.linkPublishParams = (email, data) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <h1>New link publish</h1>
                            <p>New link <span>${data.title}</span> has been published in the following categories.</p>
                            ${data.categories.map(category => {
                                return `
                                    <div>
                                        <h2>${category.name}</h2>
                                        <h3><a href="${process.env.CLIENT_URL}/links/${category.slug}">Please take a look</a></h3>
                                    </div>
                                `
                            }).join("-------------------------------------")}
                            <p>Unsubscriber?</p>
                            <p>${process.env.CLIENT_URL}/user/profile/update</p>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'New link has been published'
            }
        }
    }
}