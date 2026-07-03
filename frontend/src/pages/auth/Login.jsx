import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginAsDemoUser } from "../../slices/authSlice";
import { toast } from "react-toastify";
import { UserCircleIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/solid";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin' || user.role === 'Super Admin') {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/people/home", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleDemoLogin = (role) => {
    dispatch(loginAsDemoUser(role))
      .unwrap()
      .then((userData) => {
        toast.success(`Logged in as ${role}`);
      })
      .catch((error) => {
        console.error("Demo login failed:", error);
        toast.error(error?.message || "Demo login failed");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-app px-4 w-full">
      <div className="glass-card p-8 shadow-md text-center max-w-md w-full mb-8">
        <h1 className="text-4xl font-black text-amber-600 mb-2">Elevora</h1>
        <h2 className="text-heading text-2xl font-bold mb-2">Portfolio Demo</h2>
        <p className="text-muted mb-8 text-sm">Experience the platform from different perspectives without a password.</p>

        {loading ? (
          <div className="text-main">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mx-auto mb-2"></div>
            <p>Loading demo workspace...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleDemoLogin('Super Admin')}
              className="btn btn-primary w-full flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              Continue as Super Admin
            </button>
            <button
              onClick={() => handleDemoLogin('HR')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
            >
              <UserGroupIcon className="h-5 w-5" />
              Continue as HR Manager
            </button>
            <button
              onClick={() => handleDemoLogin('Employee')}
              className="btn bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
            >
              <UserCircleIcon className="h-5 w-5" />
              Continue as Employee
            </button>
          </div>
        )}
      </div>
      <div className="text-center text-xs text-muted max-w-md">
        <p>This is a portfolio showcase. All data is fictional and resets automatically. Destructive actions are simulated.</p>
      </div>
    </div>
  );
};

export default Login;