module.exports.validateRegisterInput = (
  username,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === "") errors.username = "Username must not be blank";
  if (password === "") errors.password = "Password must not be blank";
  else if (password != confirmPassword)
    errors.confirmPassword = "Passwords don't match";
  return { errors, valid: Object.keys(errors).length < 1 };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") errors.username = "Username must not be blank";
  if (password === "") errors.password = "Password must not be blank";
  return { errors, valid: Object.keys(errors).length < 1 };
};
