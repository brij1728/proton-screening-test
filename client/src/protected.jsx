import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useLayoutEffect, useState } from "react";
import { emptyUser, insertUser } from "./redux/user";

import { emptyAllRes } from "./redux/messages";
import instance from "./config/instance";
import { setLoading } from "./redux/loading";
import { useDispatch } from "react-redux";

const ProtectedRoute = ({ offline, authed }) => {
  const [component, setComponent] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(setLoading(true));
    const getResponse = async () => {
      let res = null;

      try {
        res = await instance.get("/api/user/checkLogged");
        if (res?.data?.data) {
          dispatch(insertUser(res?.data?.data));
          setComponent(<Outlet />);
        } else {
          throw new Error("No data in response");
        }
      } catch (err) {
        console.log(err);

        if (err?.response?.data?.status === 405) {
          dispatch(emptyUser());
          dispatch(emptyAllRes());
          if (authed) {
            navigate("/login");
          } else {
            setComponent(<Outlet />);
          }
        } else if (err?.code === "ERR_NETWORK") {
          console.log("Network error, check your backend server");
        } else {
          navigate("/something-went-wrong");
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (!offline) {
      getResponse();
    } else {
      setComponent(<Outlet />);
    }
  }, [location]);

  return component;
};

export default ProtectedRoute;
