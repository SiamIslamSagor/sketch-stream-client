import useContextData from "@/hooks/useContextData";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AllDrawings from "../modal/AllDrawings";
import toast from "react-hot-toast";

const Navbar = () => {
  const {
    user,
    logOut,
    stroke,
    setStroke,
    color,
    setColor,
    fillColor,
    setFillColor,
    isFill,
    setIsFill,
  } = useContextData();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleInputChange = e => {
    const inputValue = parseInt(e.target.value, 10);
    if (inputValue >= 1 && inputValue <= 1000) {
      setStroke(inputValue);
    }
  };
  /* 
  const handleLogout = () => {
    const x = logOut();
    console.log(x);
  }; */

  return (
    <div className="flex flex-col item-center justify-center border max-sm:p-2 sm:p-5 my-2 sm:my-5">
      <div className="flex justify-between items-center container mx-auto">
        <div className="">
          <h2 className="text-center text-3xl font-extrabold text-purple-700 italic max-lg:hidden">
            SketchStream
          </h2>
        </div>
        <div className=" flex  items-center gap-4 max-sm:justify-end">
          <div className="flex items-center justify-center gap-2">
            <label className="max-sm:hidden">Stroke: </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={stroke}
              onChange={handleInputChange}
              className="p-1 h-10 w-14 bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <label className="max-sm:hidden">Stroke Color: </label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="p-1 h-10 w-14 bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
              id="hs-color-input"
              title="Choose your color"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <label className="max-sm:hidden">Fill:</label>
            <input
              type="checkbox"
              checked={isFill}
              onChange={e => setIsFill(e.target.checked)}
              className="p-1 h-8 w-12 bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <label className="max-sm:hidden">Fill Color: </label>
            <input
              type="color"
              value={fillColor}
              disabled={!isFill}
              onChange={e => setFillColor(e.target.value)}
              className="p-1 h-10 w-14 bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
              id="hs-color-input"
              title="Choose your color"
            />
          </div>
          {user ? (
            <Dropdown>
              <DropdownTrigger>
                <Avatar
                  name={user?.name}
                  className="cursor-pointer hover:ring-2 ring-purple-900 bg-purple-500 text-white"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">@{user?.username}</p>
                </DropdownItem>

                <DropdownItem key="name">{user?.name}</DropdownItem>
                <DropdownItem key="all-drawings" onPress={onOpen}>
                  All Drawings
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={logOut}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link to={"/auth"}>
              <Button className="relative flex justify-center border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:scale-95 duration-300 disabled:opacity-60 uppercase">
                sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
      <AllDrawings isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
};

export default Navbar;
