import { Error, Forgot, Login, Main, Signup } from "./page";
import { Route, Routes } from "react-router-dom";
import { createContext, useEffect, useLayoutEffect, useState } from "react";

import Loading from "./components/loading/loading";
import { Menu } from "./components";
import ProtectedRoute from "./protected";
import instance from "./config/instance";
import { useSelector } from "react-redux";

export const documentsContext = createContext({
  documents: [],
  setDocuments: () => {},
  getFiles: () => {},
});

const App = () => {
  const [offline, setOffline] = useState(!window.navigator.onLine);
  const [file_id, set_file_id] = useState(null);
  const { loading, user } = useSelector((state) => state);
  const [documents, setDocuments] = useState([]);
  const { _id } = useSelector((state) => state.messages);

  const changeColorMode = (to) => {
    if (to) {
      localStorage.setItem("darkMode", true);
      document.body.className = "dark";
    } else {
      localStorage.removeItem("darkMode");
      document.body.className = "light";
    }
  };

  const getFiles = async () => {
    let res = null;
    if (!_id) return console.log("No chat id");
    else {
      try {
        res = await instance.get("/api/chat/upload?chatId=" + _id);
      } catch (err) {
        console.log(err);
      } finally {
        if (res?.data) {
          console.log(res.data);
          setDocuments(res?.data?.data);
        }
      }
    }
  };

  useLayoutEffect(() => {
    let mode = localStorage.getItem("darkMode");
    if (mode) {
      changeColorMode(true);
    } else {
      changeColorMode(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => location.reload();
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <documentsContext.Provider value={{ documents, setDocuments, getFiles }}>
      <section className={user ? "main-grid" : null}>
        {user && (
          <div>
            <Menu
              changeColorMode={changeColorMode}
              file_id={file_id}
              set_file_id={set_file_id}
            />
          </div>
        )}

        {loading && <Loading />}
        <h1>Proton</h1>

        {offline && (
          <Error status={503} content={"Website is offline, check your network."} />
        )}

        <Routes>
          <Route element={<ProtectedRoute offline={offline} authed={true} />}>
            <Route
              exact
              path="/"
              element={<Main file_id={file_id} set_file_id={set_file_id} />}
            />
            <Route
              path="/chat"
              element={<Main file_id={file_id} set_file_id={set_file_id} />}
            />
            <Route
              path="/chat/:id"
              element={<Main file_id={file_id} set_file_id={set_file_id} />}
            />
          </Route>

          <Route element={<ProtectedRoute offline={offline} />}>
            <Route path="/login" element={<Login />} />
            <Route path="/login/auth" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/pending/:id" element={<Signup />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/forgot/set/:userId/:secret" element={<Forgot />} />
          </Route>
          <Route
            path="*"
            element={<Error status={404} content={"This page could not be found."} />}
          />
        </Routes>
      </section>
    </documentsContext.Provider>
  );
};

export default App;
