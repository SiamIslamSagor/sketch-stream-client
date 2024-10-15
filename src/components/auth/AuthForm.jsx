import useAxiosPublic from "@/hooks/useAxiosPublic";
import useContextData from "@/hooks/useContextData";
import { Spinner } from "@nextui-org/react";
import { IconCamera, IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const AuthForm = ({ setIsAuthOpen }) => {
  const { setUser } = useContextData();
  const [formType, setFormType] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
  );

  const axiosPublic = useAxiosPublic();

  const handlePhotoChange = e => {
    console.log(e.target.files);
    setPhotoURL(URL.createObjectURL(e.target.files[0]));
  };
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
      photoURL,
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
          setIsAuthOpen(false);
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

          toast.success("sign in successfully.", {
            id: toastId,
          });
          setIsAuthOpen(false);
        }
      } catch (error) {
        console.log(error);
        toast.error("Invalid username or password! try again", { id: toastId });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center text-white cursor-default">
      <Toaster />
      <div className="max-w-sm w-full border border-neutral-600 rounded-2xl z-[9999999]">
        <div className="bg-[#121212] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-center text-3xl font-extrabold">
              {formType === "signin" ? "Welcome Back" : "SketchStream"}
            </h2>
            <p className="mt-2 text-center text-neutral-400 text-">
              {formType === "signin"
                ? "Sign in to continue"
                : "Sign up to continue"}
            </p>
            <Form
              handleSubmit={handleSubmit}
              formType={formType}
              isLoading={isLoading}
              photoURL={photoURL}
              handlePhoto={handlePhotoChange}
            />
          </div>
          <div className="px-8 py-4  text-center">
            <span className="text-neutral-400 text-">
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

const Form = ({
  handleSubmit,
  formType,
  isLoading,
  photoURL = "",
  handlePhoto,
}) => {
  const [isPassShow, setIsPassShow] = useState(false);
  return (
    <form onSubmit={e => handleSubmit(e)} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm">
        {formType === "signin" || (
          <div className="flex items-center justify-center">
            <label className="sr-only" htmlFor="name">
              Your photo
            </label>

            <div className="relative">
              <div className="size-28 rounded-full  bg-[#292828] relative text-neutral-200 ">
                <div className="overflow-hidden rounded-full size-full">
                  <img src={photoURL} alt="photo" className="size-full" />
                  <input
                    placeholder="Your photo"
                    className="w-full  absolute size-full z-10 bg-blue-400 opacity-0 top-0 cursor-not-allowed pointer-events-none"
                    type="file"
                    name="photo"
                    id="photo"
                    onChange={e => handlePhoto(e)}
                  />
                </div>
                <IconCamera className="absolute right-1 bottom-1 mix-blend-difference" />
              </div>
            </div>
          </div>
        )}
        {formType === "signin" || (
          <div className="mt-6">
            <label className="sr-only" htmlFor="name">
              Your name
            </label>
            <input
              placeholder="Your name"
              className="appearance-none relative block w-full px-3 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:z-10 max-sm:text-sm tracking-widest bg-[#292828]"
              required={true}
              type="text"
              name="name"
              id="name"
              autoFocus={true}
            />
          </div>
        )}
        <div className={`${formType === "signup" && "mt-4"}`}>
          <label className="sr-only" htmlFor="username">
            Username
          </label>
          <input
            placeholder="Username"
            className="appearance-none relative block w-full px-3 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:z-10 max-sm:text-sm tracking-widest bg-[#292828]"
            required={true}
            type="text"
            name="username"
            id="username"
            defaultValue={"siam09"}
          />
        </div>
        <div className="mt-4 relative">
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            placeholder="Password"
            className="appearance-none relative block w-full px-3 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:z-10 max-sm:text-sm tracking-widest bg-[#292828] pr-10"
            required={true}
            type={isPassShow ? "text" : "password"}
            name="password"
            id="password"
            defaultValue={"pass"}
          />
          {isPassShow ? (
            <IconEye
              onClick={() => setIsPassShow(false)}
              className="absolute right-2 text-neutral-400 top-[10px] z-[500]"
            />
          ) : (
            <IconEyeClosed
              onClick={() => setIsPassShow(true)}
              className="absolute right-2 text-neutral-400 top-[10px] z-[500]"
            />
          )}
        </div>
      </div>

      <div>
        <button
          disabled={isLoading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none   focus:ring-offset-2 focus:ring-1 focus:ring-neutral-600 active:scale-95 duration-300 disabled:opacity-60 tracking-widest"
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
