import AuthForm from "./AuthForm";

const AuthModal = ({ setIsAuthOpen }) => {
  return (
    <div className="absolute z-[60] min-h-screen flex items-center justify-center w-full cursor-default transition">
      <AuthForm setIsAuthOpen={setIsAuthOpen} />
      <div
        className="absolute w-full h-screen   backdrop-blur-md z-[99999] flex items-center justify-center transition "
        onClick={() => setIsAuthOpen(false)}
      ></div>
    </div>
  );
};

export default AuthModal;
