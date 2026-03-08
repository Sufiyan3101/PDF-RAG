import { useNavigate, Navigate } from "react-router-dom";
import "../styles/login.css";
import {
  doSignInWithEmailAndPassword,
  doSignWithGoogle,
} from "../firebase/auth";
import { useAuth } from "../contexts/authContexts";
import { useState } from "react";

const Login = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  console.log(useAuth());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      await doSignInWithEmailAndPassword(email, password);
    } catch (error) {
      setErrorMessage(error.message || "Login failed");
      setShowAlert(true);
      setIsSigningIn(false);
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      await doSignWithGoogle();
    } catch (error) {
      setErrorMessage("Google sign-in failed");
      setShowAlert(true);
      setIsSigningIn(false);
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to="/" replace={true} />}

      <div className="sample">
        {showAlert && (
          <div className="alertBox">
            <div className="alertContent">
              <p>{errorMessage}</p>
              <button onClick={() => setShowAlert(false)}>OK</button>
            </div>
          </div>
        )}
        <div className="loginDiv">
          <h1 className="loginLabel">Welcome Back</h1>

          <div className="inputFieldDiv">
            <form className="loginForm" onSubmit={onSubmit}>
              <label className="usernameOrEmailLabel">Email</label>
              <input
                type="email"
                className="usernameOrEmailInput"
                placeholder="Enter registered email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="passLabel">Password</label>
              <input
                type="password"
                className="passInput"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                type="submit"
                value={isSigningIn ? "Signing in..." : "Login"}
                className="loginButton"
                disabled={isSigningIn}
              />
              <p className="platformText">
                New to the platform ?
                <button
                  onClick={() => navigate("/register")}
                  className="signUpButton"
                >
                  SignUp
                </button>
              </p>
            </form>
          </div>

          <div className="googleLoginDiv">
            <button onClick={onGoogleSignIn} className="googleLogin">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="googleIcon"
              />
              Sign in with Google
            </button>
          </div>

          {/* Optional Google sign-in */}
        </div>
      </div>
    </>
  );
};

export default Login;
