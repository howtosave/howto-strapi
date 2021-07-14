
import * as admin from "firebase-admin";

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

// See https://firebase.google.com/docs/admin/setup/#initialize-sdk
// export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
export const initFirebaseApp = (appConfig: admin.AppOptions): admin.app.App => {
  appConfig.credential = appConfig.credential || admin.credential.applicationDefault();
  return admin.initializeApp(appConfig);
};

//
// Utils
//
let a :admin.ServiceAccount = {};

export const credentialInfoFromEnv = (env: any): any => (admin.credential.cert({
    projectId: env.FIREBASE_project_id,
    //private_key_id: env.FIREBASE_private_key_id,
    privateKey: env.FIREBASE_private_key,
    clientEmail: env.FIREBASE_client_email,
    //client_id: env.FIREBASE_client_id,
    //auth_url: env.FIREBASE_auth_uri,
    //token_url: env.FIREBASE_token_uri,
    //auth_provider_x509_cert_url: env.FIREBASE_auth_provider_x509_cert_url,
    //client_x509_cert_url: env.FIREBASE_client_x509_cert_url,
}));
