const { handleClassroomRequest } = require("../server/api/classroomController");

module.exports = async function classroomApiRoute(req, res) {
  await handleClassroomRequest(req, res);
};
