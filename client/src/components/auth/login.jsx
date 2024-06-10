import "./style.scss";

import { Google, Grant, Microsoft } from "../../assets";
import { Link, useNavigate } from "react-router-dom";
import React, { useReducer, useState } from "react";

import FormFeild from "./FormFeild";
import { insertUser } from "../../redux/user";
import instance from "../../config/instance";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";

const reducer = (state, { type, status }) => {
  switch (type) {
    case "filled":
      return { filled: status };
    case "error":
      return { error: status, filled: state.filled };
    default:
      return state;
  }
};

const LoginComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState(false);
  const [password, setPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [state, stateAction] = useReducer(reducer, {
    filled: false,
    password: false,
    error: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    pass: "",
    otp: "",
    manual: true,
  });

  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const googleAuth = useGoogleLogin({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    onSuccess: (response) => {
      formHandle(null, {
        manual: false,
        token: response.access_token,
      });
    },
    onFailure: (error) => {
      console.error("Google login error:", error);
    },
  });

  const otpHandle = async (e) => {
    e.preventDefault();
    const given_otp = e.target.otp.value;
    try {
      const otp_res = await instance.post("/api/user/verify_otp", {
        email: formData.email,
        otp: given_otp,
      });
      if (otp_res.status === 200 && otp_res.data.message === "Success") {
        dispatch(insertUser(otp_res.data.data));
        navigate("/chat");
      }
    } catch (err) {
      if (err.response.status === 422) {
        stateAction({ type: "error", status: true });
        alert("Invalid OTP")
      }
      console.log(err);
    }
  };

  const formHandle = async (e, googleData) => {
    e?.preventDefault();
    let res = null;
    try {
      res = await instance.get("/api/user/login", {
        params: googleData || { email: formData.email, pass: formData.pass },
      });
    } catch (err) {
      if (err?.response?.data?.status === 422) {
        stateAction({ type: "error", status: true });
      }
    } finally {
      if (res?.data?.message === "Success" && res?.data?.status === 200) {
        const user_otp = Math.floor(1000 + Math.random() * 9000);
        setPassword(true);
        setOtp(user_otp);
        const otp_res = await instance.post("/api/user/send_otp", {
          email: formData.email,
          otp: user_otp,
        });
      }
    }
  };

  return (
    <div className="Contain">
      <div className="icon">
        <Grant />
      </div>

      <div>
        {!state.filled ? <h1>Welcome back</h1> : <h1>Enter your password</h1>}
      </div>

      {!email && !password ? (
        <LoginEmail
          formData={formData}
          handleInput={handleInput}
          googleAuth={googleAuth}
          stateAction={stateAction}
          setEmail={setEmail}
        />
      ) : email && !password ? (
        <LoginEmailPassword
          formHandle={formHandle}
          stateAction={stateAction}
          formData={formData}
          handleInput={handleInput}
          state={state}
        />
      ) : (
        <Two_Step_Auth
          formData={formData}
          handleInput={handleInput}
          otpHandle={otpHandle}
          state={state}
        />
      )}
    </div>
  );
};

const LoginEmail = ({
  formData,
  handleInput,
  googleAuth,
  stateAction,
  setEmail,
}) => {
  return (
    <div className="options">
      <form
        className="manual"
        onSubmit={(e) => {
          e.preventDefault();
          stateAction({ type: "filled", status: true });
          setEmail(true);
        }}
      >
        <div>
          <FormFeild
            value={formData.email}
            name={"email"}
            label={"Email address"}
            type={"email"}
            handleInput={handleInput}
          />
        </div>
        <div>
          <button type="submit">Continue</button>
        </div>
      </form>

      <div data-for="acc-sign-up-login">
        <span>Don't have an account?</span>
        <Link to={"/signup"}>Sign up</Link>
      </div>

      <div className="extra">
        <div className="divide">
          <span>OR</span>
        </div>

        <div className="btns">
          <button onClick={googleAuth}>
            <Google /> Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginEmailPassword = ({
  formHandle,
  stateAction,
  formData,
  handleInput,
  state,
}) => {
  return (
    <form className="Form" onSubmit={formHandle}>
      <div>
        <div className="email">
          <button
            type="button"
            onClick={() => {
              stateAction({ type: "filled", status: false });
            }}
          >
            Edit
          </button>

          <FormFeild
            value={formData.email}
            name={"email"}
            type={"email"}
            isDisabled
          />
        </div>

        <div className="password">
          <FormFeild
            value={formData.pass}
            name={"pass"}
            label={"Password"}
            type={"password"}
            handleInput={handleInput}
            error={state?.error}
          />
        </div>

        <div>
          {state?.error && (
            <div className="error">
              <div>!</div> Email or password wrong.
            </div>
          )}
        </div>

        <button type="submit">Continue</button>

        <div className="forgot">
          <Link to={"/forgot"}>Forgot password?</Link>
        </div>
      </div>
      <div data-for="acc-sign-up-login">
        <span>Don't have an account?</span>
        <Link to={"/signup"}>Sign up</Link>
      </div>
    </form>
  );
};

const Two_Step_Auth = ({ formData, handleInput, otpHandle, state }) => {
  return (
    <div>
      <h1>Two Step Verification</h1>
      <form className="Form" onSubmit={otpHandle}>
        <div>
          <div className="otp">
            <FormFeild
              value={formData.otp}
              name={"otp"}
              label={"Enter OTP"}
              type={"text"}
              handleInput={handleInput}
              error={state?.error}
            />
          </div>
          <button type="submit">Continue</button>
        </div>
        <div data-for="acc-sign-up-login">
          <span>Don't have an account?</span>
          <Link to={"/signup"}>Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginComponent;
