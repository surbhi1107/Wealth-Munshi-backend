const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const Familymember = require("../models/familymember");
const Partner = require("../models/partner");
const Question = require("../models/question");

const register = async (req, res, next) => {
  try {
    let {
      fname,
      lname,
      phone_number,
      client_type,
      email,
      dob,
      currency,
      age_retire,
      life_expectancy,
      phone_type,
      partner_details,
      trust_name,
    } = req?.body;
    let success = false;
    if (phone_number && email) {
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .send({ success, error: "Sorry a user already exists" });
      } else {
        let password = "Munshi@12345";
        let role = -1;

        // password hashing
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);
        user = await User.create({
          fname,
          lname,
          phone_number,
          client_type,
          email,
          dob,
          currency,
          age_retire,
          life_expectancy,
          password: secPass,
          role,
          phone_type,
          trust_name,
        });
        if (!user?._id) {
          return res
            .status(400)
            .send({ success, error: "Something went wrong." });
        }
        //add question to partner collection
        let findquestions = await Question.find()
          .select("-createdAt")
          .select("-updatedAt");
        let newquestion = [];
        findquestions.map((v) => {
          let newobj = {
            _id: v._id,
            type: v.type,
            question: v.question,
            option_a: v.option_a,
            option_b: v.option_b,
            option_c: v.option_c,
            option_d: v.option_d,
            option_e: v.option_e,
            answer: v.answer,
            selected: null,
          };
          newquestion = [...newquestion, { ...newobj }];
        });
        let queobj = {
          name: "MorningStar Questionnaire",
          questions: newquestion,
          total: newquestion?.length,
          score: null,
          is_ans_given: false,
        };

        // register user as a partner
        let newpartners = [
          {
            type: "main_client",
            fname,
            lname,
            known_as: `${fname} ${lname}`,
            dob,
            age_retire,
            life_expectancy,
            user_id: user?._id,
            questionaries: {
              ...queobj,
              for:
                client_type === 1
                  ? `${fname}-${partner_details?.fname ?? ""}`
                  : fname,
            },
          },
        ];
        // if client type partner then add other partner
        if (partner_details) {
          newpartners = [
            ...newpartners,
            {
              ...partner_details,
              type: "partner",
              is_register_partner: true,
              user_id: user._id,
            },
          ];
        }
        let partner = await Partner.insertMany([...newpartners]);
        console.log("...", partner);
        // save user as member in familymember collection
        let newmembers = [
          {
            type: "self",
            is_associate: client_type === 2 ? true : false,
            fname,
            lname,
            known_as: `${fname} ${lname}`,
            dob,
            age_retire,
            life_expectancy,
            user_id: user?._id,
          },
        ];
        if (partner_details) {
          newmembers = [
            ...newmembers,
            {
              ...partner_details,
              type: "partner",
              user_id: user._id,
            },
          ];
        }
        let member = await Familymember.insertMany([...newmembers]);
        console.log(member);

        //sending welcome mail to user
        let link = "http://139.59.63.31/";
        var transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.email",
          port: 465,
          auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_EMAIL_PASSWORD,
          },
        });
        var mailOptions = {
          from: process.env.NODEMAILER_EMAIL,
          to: email,
          subject: "Financial Health Check",
          html: ` <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
              <head>
              <!--[if gte mso 9]>
              <xml>
              <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
              <title></title>
              
              <style type="text/css">
                body {
                  margin: 0;
                  padding: 0;
                }
                .container{
                  padding: 5px 0px;
                }
                .uppercase{
                  text-transform: uppercase;
                }
              </style>
              </head>
              
              <body style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;color: #000000">
              <div class="container">
                <p>Dear ${fname},<p/>
                <p>Welcome to your Financial Health Check. This email provides your login details so that you can get started.</p>
                <p>Please click on the following link and enter your user name and password to start</p>
                <p>Your User ID: ${email}</p>
                <p>Your Password: ${password}</p>
                <p>URL: <a href=${link} target="_blank">https://sanghiconsultancy.omxsoft.com/Default.aspx?portalid=1&ctl=Login&username=vasoyasurbhi%40gmail.com&verificationcode=1-122524</a></p>
                <p>Once you have logged in, please start entering your information as well as you can. Don't worry if you don't have exact figures for everything, once your overall picture is clear the details can be refined where necessary.</p>
                <p>Kind Regards</p>
                <p class="uppercase">Wealth Munshi</p>
                <p>Wealth Munshi (Fintech Specializing in Financial, Wealth & Succession Analysis)</p> 
              </div>    
              </body>
              
              </html>
              `,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            success = false;
            return res.status(400).send({ success, error: "mail not send." });
          } else if (info.rejected?.length > 0) {
            console.log("Email sent: ", info.rejected);
            success = false;
            return res.status(400).send({ success, error: "mail not send." });
          } else {
            // create authentication token
            // const authToken = jwt.sign(
            //   { _id: user?._id, email: email },
            //   process.env.SECRET_KEY
            // );
            success = true;
            // res.cookie("accessToken", authToken, {
            //   httpOnly: true,
            //   secure: true,
            // });
            return res.send({ success, msg: "Password sent to your mail." });
          }
        });
      }
    } else {
      success = false;
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .send({ success: false, error: "Internal server error" });
  }
};

const login = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: false,
      sameSite: "None",
      secure: true,
    });
    let { email, password } = req?.body;
    let success = false;
    if (email && password) {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).send({
          success,
          error: "Your Email and Password incorrect. Please try again.",
        });
      }
      // bcrypt password and compare password
      const passComp = await bcrypt.compare(password, user?.password ?? "");
      if (!passComp) {
        return res.status(400).send({
          success,
          error: "Please try to login with correct credentials",
        });
      }
      // create authentication token
      const authToken = jwt.sign(
        { _id: user?._id, email: email },
        process.env.SECRET_KEY
      );
      success = true;
      res.cookie("access-token", authToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None", //cross-site cookie
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.send({ success, token: authToken, user: user });
    } else {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const sendemailLink = async (req, res, next) => {
  try {
    let email = req.body?.email;
    let success = false;
    if (!email) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send({ success, error: "Email not found." });
    }
    // create token for verify user
    const secretKey = user._id + process.env.SECRET_KEY;
    const forgotToken = jwt.sign({ _id: user._id }, secretKey, {
      expiresIn: "5m",
    });
    //send forgot password mail to user
    let link = `http://139.59.63.31/reset-password/${user._id}/${forgotToken}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.email",
      port: 465,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
      },
    });
    var mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject:
        "Wealth Munshi (Fintech Specializing in Financial, Wealth & Succession Analysis) password reset request",
      html: ` <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
              <head>
              <!--[if gte mso 9]>
              <xml>
              <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
              <title></title>
              
              <style type="text/css">
                body {
                  margin: 0;
                  padding: 0;
                }
                .container{
                  padding: 5px 0px;
                }
                .uppercase{
                  text-transform: uppercase;
                }
              </style>
              </head>
              
              <body style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;color: #000000">
              <div class="container">
                <p>Dear ${user.fname},<p/>
                <p>We've received a request to reset the password for the account associated with ${user.email}. No changes have been made to your account yet.</p>
                 <p>You can reset your password by clicking on the link below:</p>
                <p><a href=${link} target="_blank">Reset my password</a></p>
                <p>f you did not request a password reset, you can safely ignore this email and the link will expire on its own. Only someone with access to your email can reset your account password.</p>
                <p>Kind Regards,</p>
                <p>Wealth Munshi (Fintech Specializing in Financial, Wealth & Succession Analysis)</p> 
              </div>    
              </body>
              
              </html>
              `,
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error);
        return res.status(400).send("mail not send.");
      } else if (info.rejected?.length > 0) {
        console.log("Email sent: ", info.rejected);
        return res.status(400).send("mail not send.");
      } else {
        success = true;
        return res.send({
          success,
          msg: "Email Sent Please Check Your Email.",
        });
      }
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const resetpassword = async (req, res, next) => {
  try {
    const { newpassword } = req.body;
    const { id, token } = req.params;
    let success = false;
    if (newpassword && id && token) {
      const findUser = await User.findById(id);
      // verify token which has been sent in mail as link
      const secretKey = findUser._id + process.env.SECRET_KEY;
      const isValid = await jwt.verify(token, secretKey);
      if (isValid) {
        // password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newpassword, salt);
        // store hased password
        const isSuccess = await User.findByIdAndUpdate(findUser._id, {
          $set: {
            password: hashedPass,
          },
        });
        if (isSuccess) {
          success = true;
          //send password changed mail to user
          var transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.email",
            port: 465,
            auth: {
              user: process.env.NODEMAILER_EMAIL,
              pass: process.env.NODEMAILER_EMAIL_PASSWORD,
            },
          });
          var mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: findUser.email,
            subject:
              "Your Wealth Munshi (Fintech Specializing in Financial, Wealth & Succession Analysis) password has changed",
            html: ` <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
              <head>
              <!--[if gte mso 9]>
              <xml>
              <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
              <title></title>
              
              <style type="text/css">
                body {
                  margin: 0;
                  padding: 0;
                }
                .container{
                  padding: 5px 0px;
                }
                .uppercase{
                  text-transform: uppercase;
                }
              </style>
              </head>
              
              <body style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;color: #000000">
              <div class="container">
                <p>Dear ${findUser.fname},<p/>
                <p>The password for your Wealth Munshi (Fintech Specializing in Financial, Wealth & Succession Analysis) account ${findUser?.email} has been successfully changed. If you did not request this change, please contact nitin@omnimaxsoftware.com immediately.</p>
                <p>Kind Regards,</p>
                <p>Wealth Munshi (Fintech Specializing in Financial, Wealth & Succession Analysis)</p> 
              </div>    
              </body>
              
              </html>
              `,
          };
          transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
              console.log(error);
              return res.status(400).send("mail not send.");
            } else if (info.rejected?.length > 0) {
              console.log("Email sent: ", info.rejected);
              return res.status(400).send("mail not send.");
            } else {
              success = true;
              return res.send({
                success,
                msg: "Password Changed Successfully",
              });
            }
          });
        } else {
          return res.status(400).json({ error: "some thing went wrong" });
        }
      } else {
        return res.status(400).json({ error: "Link has been expired" });
      }
    } else {
      return res.status(400).json({ error: "All fields are required" });
    }
  } catch (error) {
    console.log("error", error);
    // if token is expired
    if (
      error instanceof jwt.JsonWebTokenError &&
      error.message.includes("expired")
    ) {
      return res.status(500).json({ error: "Token Expired" });
      // if token is not valid
    } else if (
      error instanceof jwt.JsonWebTokenError &&
      error.message.includes("invalid signature")
    ) {
      return res.status(500).json({ error: "Token Invalid try again" });
    } else return res.status(500).send({ error: "Internal server error" });
  }
};

const getuserdetails = async (req, res, next) => {
  try {
    let userId = req.user?._id;
    let success = false;
    let user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).send({ success, error: "User not found" });
    }
    success = true;
    return res.send({ success, user: user });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getuserbyid = async (req, res, next) => {
  try {
    let userId = req.body?._id;
    let success = false;
    if (!userId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).send({ success, error: "User not found" });
    }
    success = true;
    return res.send({ success, user: user });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getallusers = async (req, res, next) => {
  try {
    let user = await User.find().select("-password");
    return res.send({ data: user });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updateuser = async (req, res, next) => {
  try {
    let userId = req.user?._id;
    let success = false;
    const { userDetails } = req.body;
    if (!userId) {
      return res.status(500).send({ success, error: "Something Wrong" });
    }
    const user = await User.findById(req.user._id);
    if (user) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: userDetails,
      }).select("-password");
      let dummyuserdetails = {
        ...userDetails,
      };
      delete dummyuserdetails["email"];
      delete dummyuserdetails["currency"];
      delete dummyuserdetails["phone_type"];
      delete dummyuserdetails["country_code"];
      delete dummyuserdetails["role"];
      delete dummyuserdetails["_id"];
      delete dummyuserdetails["phone_number"];
      delete dummyuserdetails["client_type"];
      delete dummyuserdetails["password"];
      await Familymember.findOneAndUpdate(
        { $and: [{ user_id: req.user?._id }, { type: "self" }] },
        {
          $set: dummyuserdetails,
        }
      );
      await Partner.findOneAndUpdate(
        { $and: [{ user_id: req.user?._id }, { type: "main_client" }] },
        {
          $set: dummyuserdetails,
        }
      );
      let updatedUser = await User.findById(req.user._id);
      success = true;
      res.status(200).send({ success, user: updatedUser });
    } else {
      return res.status(400).send("User Not Found");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updateuserbyadmin = async (req, res, next) => {
  try {
    let userId = req.body?._id;
    let success = false;
    const { userDetails } = req.body;

    if (!userId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    const user = await User.findById(req.user._id);
    if (user) {
      let updateDetails = await User.findByIdAndUpdate(userId, {
        $set: userDetails,
      });
      success = true;
      res.status(200).send({ success });
    } else {
      return res.status(400).send("User Not Found");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const deleteuser = async (req, res, next) => {
  try {
    const userId = req.body?.userId;
    let success = false;
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(400).send({ success, msg: "User Not Found" });
    }
    let deleted = await User.findByIdAndDelete(userId);
    if (!deleted?._id) {
      success = false;
      return res.status(500).send({ success, msg: "delete unsuccessfully" });
    }
    success = true;
    return res.send({ success, msg: "delete successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  login,
  register,
  getuserdetails,
  getuserbyid,
  getallusers,
  updateuser,
  updateuserbyadmin,
  sendemailLink,
  resetpassword,
  deleteuser,
};
