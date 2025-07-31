const { services } = require("../../services");

exports.updateRoleController = async (req, res) => {
  try {
    const { email, role } = req.body;

    const response = await services.updateRoleService(email, role);

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong in update role " + err,
    });
  }
};

exports.getRoleController = async (req, res) => {
  try {
    const response = await services.getRoleService();

    res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong in get role " + err,
    });
  }
};

exports.listUsersController = async (req, res) => {
  try {
    const response = await services.listUsersService();

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong in list users " + err,
    });
  }
};