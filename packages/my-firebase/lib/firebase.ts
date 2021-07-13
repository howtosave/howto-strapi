
import * as admin from "firebase-admin";

// See https://firebase.google.com/docs/admin/setup/#initialize-sdk
// export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"

export const getUser = async (uid: string, email: string, phoneNumber: string): Promise<admin.auth.UserRecord | null> => {
  return uid 
    ? await admin.auth().getUser(uid) 
    : email 
    ? await admin.auth().getUserByEmail(email)
    : phoneNumber
    ? await admin.auth().getUserByPhoneNumber(phoneNumber)
    : null;
}

export const createUser = async (properties: admin.auth.CreateRequest) => {
  /*
  {
    uid: 'some-uid',
    email: 'user@example.com',
    emailVerified: false,
    phoneNumber: '+11234567890',
    password: 'secretPassword',
    displayName: 'John Doe',
    photoURL: 'http://www.example.com/12345678/photo.png',
    disabled: false,
  }
  */
  return await admin.auth().createUser(properties);
}

export const deleteUser = async (uid: string): Promise<void> => {

  return await admin.auth().deleteUser(uid);
}

export default (appConfig: admin.AppOptions): admin.app.App => {
  appConfig.credential = appConfig.credential || admin.credential.applicationDefault();
  return admin.initializeApp(appConfig);
};
