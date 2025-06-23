export const generateGoogleAuthPassword = (googleUser) => {
  if (!googleUser || !googleUser.uid) {
    throw new Error("Invalid Google user");
  }

  return `GOOGLE_${googleUser.uid}_AUTH`;
};
