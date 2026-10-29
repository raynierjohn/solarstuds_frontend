import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

// The fake email domain. It is not a secret and not a real mailbox.
const EMAIL_DOMAIN = "solarstuds.app";

const usernameToEmail = (username) =>
  `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;

export const loginWithUsername = async (username, password) => {
  if (!username.trim() || !password) {
    throw new Error("Please enter your username and password.");
  }

  try {
    return await signInWithEmailAndPassword(
      auth,
      usernameToEmail(username),
      password
    );
  } catch (err) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-email":
        throw new Error("Invalid username or password.");
      case "auth/too-many-requests":
        throw new Error("Too many attempts. Please try again later.");
      case "auth/network-request-failed":
        throw new Error("Network error. Check your connection.");
      default:
        throw new Error("Login failed. Please try again.");
    }
  }
};

export const logout = () => signOut(auth);