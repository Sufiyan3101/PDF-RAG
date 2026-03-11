import { useAuth } from "../contexts/authContexts";
import { useNavigate } from "react-router-dom";
import { doSignOut } from "../firebase/auth";
import { FaBahai } from "react-icons/fa";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if(!currentUser){
    navigate("/login")
  }

  return (
    <div className="mainDiv">
      
      {/* Left Side - Home Logo */}
      <div className="leftSection">
        <FaBahai className="homeLogo" />
        <span className="homeText">30MinBot</span>
      </div>

      {/* Right Side */}
      <div className="rightSection">
        <span className="userName">
          {currentUser.displayName
            ? currentUser.displayName
            : currentUser.email || ""}
        </span>

        <button
          className="signOut"
          onClick={() => {
            doSignOut().then(() => {
              navigate("/login");
            });
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Header;