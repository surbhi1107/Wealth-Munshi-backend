const express = require("express");
const {
  login,
  register,
  getuserdetails,
  getuserbyid,
  updateuser,
  getallusers,
  updateuserbyadmin,
  sendemailLink,
  resetpassword,
  deleteuser,
} = require("../controller/user");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  addpartner,
  getpartnerbyid,
  getallpartners,
  updatepartner,
  deletepartner,
} = require("../controller/partner");
const {
  addcontact,
  getcontactbyid,
  getallcontacts,
  updatecontact,
  deletecontact,
} = require("../controller/contact");
const {
  addmember,
  getmemberbyid,
  getallmembers,
  updatemember,
  deletemember,
} = require("../controller/familymember");
const router = express.Router();

router.post("/user/register", register);
router.post("/user/login", login);
router.get("/user/user-details", authMiddleware, getuserdetails);
router.post("/user/user-by-id", authMiddleware, getuserbyid);
router.get("/user/get-all-users", adminMiddleware, getallusers);
router.put("/user/update-user", authMiddleware, updateuser);
router.put("/user/update-user-by-admin", adminMiddleware, updateuserbyadmin);
router.post("/user/sendemailLink", sendemailLink);
router.post("/user/forgot-password-reset/:id/:token", resetpassword);
router.post("/user/delete", adminMiddleware, deleteuser);

router.post("/partner/create", authMiddleware, addpartner);
router.post("/partner/partner-by-id", authMiddleware, getpartnerbyid);
router.get("/partner/get-all-partners", authMiddleware, getallpartners);
router.put("/partner/update-partner", authMiddleware, updatepartner);
router.post("/partner/delete", authMiddleware, deletepartner);

router.post("/contact/create", authMiddleware, addcontact);
router.post("/contact/contact-by-id", authMiddleware, getcontactbyid);
router.get("/contact/get-all-contacts", authMiddleware, getallcontacts);
router.put("/contact/update-contact", authMiddleware, updatecontact);
router.post("/contact/delete", authMiddleware, deletecontact);

router.post("/member/create", authMiddleware, addmember);
router.post("/member/member-by-id", authMiddleware, getmemberbyid);
router.get("/member/get-all-members", authMiddleware, getallmembers);
router.put("/member/update-member", authMiddleware, updatemember);
router.post("/member/delete", authMiddleware, deletemember);

module.exports = router;
