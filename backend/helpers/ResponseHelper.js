exports.sendResponse = (res, result, message) => {
  return res.status(200).json({
    status: true,
    data: result,
    message: message,
  });
};

exports.sendResponseWithoutData = (res, message) => {
  return res.status(200).json({
    status: true,
    message: message,
  });
};

exports.sendError = (res, error, errorMessage = [], code = 200) => {
  const response = {
    status: false,
    message: error,
  };

  if (errorMessage.length || Object.keys(errorMessage).length) {
    response.data = errorMessage;
  }

  return res.status(code).json(response);
};