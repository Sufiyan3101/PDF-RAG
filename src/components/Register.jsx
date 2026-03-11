import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import { doCreateUserWithEmailAndPassword, doSignOut } from "../firebase/auth";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) return;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setShowAlert(true);
      return;
    }

    try {
      setIsRegistering(true);
      await doCreateUserWithEmailAndPassword(email, password);
      await doSignOut();
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message || "Registration failed");
      setShowAlert(true);
      setIsRegistering(false);
    }
  };

  return (
    <div className="sample-register">
      {showAlert && (
        <div className="alertBox">
          <div className="alertContent">
            <p>{errorMessage}</p>
            <button onClick={() => setShowAlert(false)}>OK</button>
          </div>
        </div>
      )}
      <div className="registerDiv">
        <h1 className="registerLabel">Register</h1>

        <div className="inputFieldDivReg">
          <form className="registerForm" onSubmit={onSubmit}>
            <label className="usernameOrEmailLabelReg">Email</label>
            <input
              type="email"
              className="usernameOrEmailInputReg"
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="passLabelReg">Password</label>
            <input
              type="password"
              className="passInputReg"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Confirm Password */}
            <label className="passLabelReg">Confirm Password</label>
            <input
              type="password"
              className="passInputReg"
              placeholder="Confirm password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {errorMessage && <p className="errorText">{errorMessage}</p>}

            <input
              type="submit"
              value={isRegistering ? "Registering..." : "Register"}
              className="registerButton"
              disabled={isRegistering}
            />

            <p className="platformTextReg">
              Already have an account ?
              <button
                onClick={() => navigate("/login")}
                className="loginNavigation"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
