export const safeUser = (user) => {
  if (!user) return null;
  const value = user.toJSON ? user.toJSON() : { ...user };
  delete value.passwordHash;
  delete value.password_hash;
  return value;
};
export const sendData = (res, data, status = 200) => res.status(status).json({ success: true, data });
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
