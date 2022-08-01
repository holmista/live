import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

const sendMail = async (options: MailOptions) => {
  try {
    const res = await transport.sendMail(options);
    console.log(res);
    return "success";
  } catch {
    return "fail";
  }
};

export default sendMail;
