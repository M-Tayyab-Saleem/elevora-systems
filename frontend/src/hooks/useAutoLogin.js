import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncUser } from "../slices/authSlice";

const useAutoLogin = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (isAuthenticated || user) return;

    if (!hasChecked.current) {
      hasChecked.current = true;
      
      dispatch(syncUser())
        .unwrap()
        .then(() => {

        })
        .catch(() => {

        });
    }
  }, [dispatch, isAuthenticated, user]);
};

export default useAutoLogin;