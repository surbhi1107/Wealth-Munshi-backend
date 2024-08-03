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
  getuserpartner,
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
const {
  addgoal,
  getgoalbyid,
  getallgoals,
  updategoal,
  deletegoal,
} = require("../controller/goal");
const {
  addasset,
  getassetbyid,
  updateasset,
  deleteasset,
  getallassets,
  getgoalresources,
} = require("../controller/asset");
const { getdashboarddata } = require("../controller/dashboard");
const {
  addQuestion,
  getquestionbyid,
  getallquestions,
  updatequestion,
  deleteQuestion,
} = require("../controller/question");
const {
  getQuestionaries,
  getPartnerQuestionaries,
  updateQuestionaries,
} = require("../controller/risk-profile");
const router = express.Router();

router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/sendemailLink", sendemailLink);
router.post("/user/forgot-password-reset/:id/:token", resetpassword);
router.get("/user/user-details", authMiddleware, getuserdetails);
router.post("/user/user-by-id", adminMiddleware, getuserbyid);
router.get("/user/get-all-users", adminMiddleware, getallusers);
router.put("/user/update-user", authMiddleware, updateuser);
router.put("/user/update-user-by-admin", adminMiddleware, updateuserbyadmin);
router.post("/user/delete", adminMiddleware, deleteuser);
router.get("/user/get-dashboard", authMiddleware, getdashboarddata);

router.post("/partner/create", authMiddleware, addpartner);
router.post("/partner/partner-by-id", authMiddleware, getpartnerbyid);
router.get("/partner/get-user-partner", authMiddleware, getuserpartner);
router.get("/partner/get-all-partners", authMiddleware, getallpartners);
router.put("/partner/update", authMiddleware, updatepartner);
router.post("/partner/delete", authMiddleware, deletepartner);

router.post("/contact/create", authMiddleware, addcontact);
router.post("/contact/contact-by-id", authMiddleware, getcontactbyid);
router.get("/contact/get-all-contacts", authMiddleware, getallcontacts);
router.put("/contact/update", authMiddleware, updatecontact);
router.post("/contact/delete", authMiddleware, deletecontact);

router.post("/member/create", authMiddleware, addmember);
router.post("/member/member-by-id", authMiddleware, getmemberbyid);
router.post("/member/get-all-members", authMiddleware, getallmembers);
router.put("/member/update", authMiddleware, updatemember);
router.post("/member/delete", authMiddleware, deletemember);

router.get("/risk-profile/get-questionaries", authMiddleware, getQuestionaries);
router.post(
  "/risk-profile/get-partner-questionaries",
  authMiddleware,
  getPartnerQuestionaries
);
router.put(
  "/risk-profile/update-questionaries",
  authMiddleware,
  updateQuestionaries
);

router.post("/goal/create", authMiddleware, addgoal);
router.post("/goal/goal-by-id", authMiddleware, getgoalbyid);
router.get("/goal/get-all-goals", authMiddleware, getallgoals);
router.put("/goal/update", authMiddleware, updategoal);
router.post("/goal/delete", authMiddleware, deletegoal);

router.post("/asset/create", authMiddleware, addasset);
router.post("/asset/asset-by-id", authMiddleware, getassetbyid);
router.post("/asset/get-all-assets", authMiddleware, getallassets);
router.get("/asset/get-goal-resources", authMiddleware, getgoalresources);
router.put("/asset/update", authMiddleware, updateasset);
router.post("/asset/delete", authMiddleware, deleteasset);

router.post("/question/create", adminMiddleware, addQuestion);
router.post("/question/question-by-id", adminMiddleware, getquestionbyid);
router.get("/question/get-all-questions", adminMiddleware, getallquestions);
router.put("/question/update", adminMiddleware, updatequestion);
router.post("/question/delete", adminMiddleware, deleteQuestion);

module.exports = router;
