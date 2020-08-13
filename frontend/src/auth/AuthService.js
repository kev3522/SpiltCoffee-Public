import auth0 from "auth0-js";
import { url } from "../common/APIUtils";
import {v4 as uuid} from 'uuid'

class Auth {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: "spiltcoffee.us.auth0.com",
      audience: "https://split-coffee-auth-api",
      clientID: "Ebj6nXje9k8tCdMB0coB86j1iU3CPiqJ",
      redirectUri: `${url}/callback`,
      responseType: "token id_token",
      scope: "openid profile email",
    });

    this.getProfile = this.getProfile.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.signUp = this.signUp.bind(this);
  }

  getProfile() {
    return this.profile;
  }

  getIdToken() {
    return this.idToken;
  }

  getAccessToken() {
    if (this.isAuthenticated()) return this.accessToken;
    else {
      let localUUID = localStorage.getItem('anonUUID')
      if (!localUUID) {
        localUUID = 'ANON' + uuid()
        localStorage.setItem('anonUUID', localUUID)
      }
      return localUUID;
    }
  }

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt;
  }

  signIn() {
    this.auth0.authorize();
  }

  signUp() {
    this.auth0.authorize({
      mode: "signUp",
    });
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) return reject(err);
        if (!authResult || !authResult.idToken) {
          return reject(err);
        }
        this.setSession(authResult);
        resolve();
      });
    });
  }

  setSession(authResult) {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;
    this.accessToken = authResult.accessToken;
    // set the time that the id token will expire at
    this.expiresAt = authResult.idTokenPayload.exp * 1000;
  }

  signOut() {
    this.auth0.logout({
      returnTo: `${url}`,
      clientID: "Ebj6nXje9k8tCdMB0coB86j1iU3CPiqJ",
    });
  }

  silentAuth() {
    return new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, authResult) => {
        if (err) return reject(err);
        this.setSession(authResult);
        resolve();
      });
    });
  }
}

const auth0Client = new Auth();

export default auth0Client;
// export default new AuthService()
