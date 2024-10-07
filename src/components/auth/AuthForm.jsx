import useAxiosPublic from "@/hooks/useAxiosPublic";
import useContextData from "@/hooks/useContextData";
import { Spinner } from "@nextui-org/react";
import axios from "axios";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const { setUser } = useContextData();
  const [formType, setFormType] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);

  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("processing...");
    const form = e.target;
    const name = form.name.value;
    const username = form.username.value;
    const password = form.password.value;

    const data = {
      name,
      username,
      password,
    };

    console.log(data);

    // send data to server
    if (data?.name) {
      try {
        const res = await axiosPublic.post("/user/new", data);

        if (res.data.success) {
          console.log(res.data);

          axiosPublic
            .get("/user/me")
            .then(res => {
              setUser(res.data.user);
            })
            .catch(err => {
              console.log(err);
              setUser(null);
            });

          toast.success("Account created successfully.", {
            id: toastId,
          });
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        toast.error("Something is wrong! try again", { id: toastId });
      }
    } else {
      try {
        const res = await axiosPublic.post("/user/login", data);

        if (res.data.success) {
          console.log(res.data);

          axiosPublic
            .get("/user/me")
            .then(res => {
              setUser(res.data.user);
            })
            .catch(err => {
              console.log(err);
              setUser(null);
            });

          navigate("/");
          toast.success("Account created successfully.", {
            id: toastId,
          });
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        toast.error("Invalid username or password! try again", { id: toastId });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Toaster />
      <div className="max-w-sm w-full border rounded-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-center text-3xl font-extrabold">
              {formType === "signin" ? "Welcome Back" : "SketchStream"}
            </h2>
            <p className="mt-4 text-center text-gray-600">
              {formType === "signin"
                ? "Sign in to continue"
                : "Sign up to continue"}
            </p>
            <Form
              handleSubmit={handleSubmit}
              formType={formType}
              isLoading={isLoading}
            />
          </div>
          <div className="px-8 py-4  text-center">
            <span className="text-gray-400">
              {formType === "signin" && "Don't "}have an account?{" "}
            </span>
            <span
              onClick={() =>
                setFormType(formType === "signup" ? "signin" : "signup")
              }
              className="font-medium text-purple-500 hover:text-purple-400 cursor-pointer"
            >
              {formType === "signin" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Form = ({ handleSubmit, formType, isLoading }) => {
  return (
    <form onSubmit={e => handleSubmit(e)} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm">
        {formType === "signin" || (
          <div>
            <label className="sr-only" htmlFor="name">
              Your name
            </label>
            <input
              placeholder="Your name"
              className="appearance-none relative block w-full px-3 py-3 border   rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
              required={true}
              type="text"
              name="name"
              id="name"
            />
          </div>
        )}
        <div className={`${formType === "signup" && "mt-4"}`}>
          <label className="sr-only" htmlFor="username">
            Username
          </label>
          <input
            placeholder="Username"
            className="appearance-none relative block w-full px-3 py-3 border   rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
            required={true}
            type="text"
            name="username"
            id="username"
            defaultValue={"siam09"}
          />
        </div>
        <div className="mt-4">
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            placeholder="Password"
            className="appearance-none relative block w-full px-3 py-3 border   rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
            required={true}
            type="password"
            name="password"
            id="password"
            defaultValue={"pass"}
          />
        </div>
      </div>

      <div>
        <button
          disabled={isLoading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:scale-95 duration-300 disabled:opacity-60"
          type="submit"
        >
          {isLoading ? (
            <Spinner size="sm" color="white" />
          ) : formType === "signin" ? (
            "Sign in"
          ) : (
            "Sign up"
          )}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
