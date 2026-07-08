// Standardizes API responses so the frontend always knows what structure to expect.
export const apiResponse = {
  success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error(res, message = 'Error', statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }
};