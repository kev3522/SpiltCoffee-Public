import React from "react";
import auth0Client from "../auth/AuthService";
import { EuiButton, EuiCard, EuiAvatar } from "@elastic/eui";
import { useHistory } from "react-router-dom";

const Profile = () => {
  const history = useHistory();

  const signOut = () => {
    auth0Client.signOut();
    history.replace("/");
  };

  const renderLogOut = (
    <EuiButton
      onClick={() => {
        signOut();
      }}
    >
      Sign Out
    </EuiButton>
  );

  return (
    <EuiCard
      className="Profile"
      icon={
        <EuiAvatar
          size="xl"
          name="avatar"
          imageUrl={auth0Client.getProfile().picture}
        />
      }
      title={
        auth0Client.getProfile()["sub"].includes("Square")
          ? auth0Client.getProfile()["https://spiltcoffee.com/business"][0]
          : auth0Client.getProfile().name
      }
      description={
        auth0Client.getProfile()["sub"].includes("Square")
          ? auth0Client.getProfile().nickname
          : auth0Client.getProfile().email
      }
      footer={
        <div>
          {renderLogOut}
          {/* {auth0Client.getProfile().email}
          {console.log(auth0Client.getProfile())}
          <EuiSpacer size="xs" />
          <EuiText size="s"></EuiText>
          <code>{JSON.stringify(auth0Client.getProfile())}</code> */}
        </div>
      }
    />
  );
};

export default Profile;
