export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,15}$/.test(
    password
  );
};

export const passwordErrorMessage =
  "Password field must be minimum 8 characters and contain a special character, capital case, small case and a number";