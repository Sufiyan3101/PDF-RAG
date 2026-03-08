import React from "react";
import "../styles/messageDialogue.css";

type Props = {
    alertMsg: string;
    onClose: () => void;
};

const MessageDialogue = ({ alertMsg, onClose }: Props) => {
    return (
        <div className="overlay">
            <div className="mainDivDialogue">
                <div className="headerDiv">Message</div>
                <div className="mainMessageDiv">{alertMsg}</div>
                <button className="okButton" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default MessageDialogue;