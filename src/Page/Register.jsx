import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
} from "react-icons/fa";
import Navbar from "./Navbar";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.username) return "Username is required";
    if (!form.email.includes("@")) return "Enter a valid email";
    if (!/^[0-9]{10}$/.test(form.phone))
      return "Phone number must be 10 digits";
    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password))
      return "Password must contain capital, number & special char";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await API.post("/accounts/register/", {
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirm_password: form.confirmPassword,
      });

      toast.success("Registered successfully ✨");
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;

      if (data?.email) {
        toast.error(data.email[0]);
      } else if (data?.username) {
        toast.error(data.username[0]);
      } else if (data?.non_field_errors) {
        toast.error(data.non_field_errors[0]);
      } else if (typeof data === "string") {
        toast.error(data);
      } else {
        toast.error("Registration failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Navbar textColor="black" />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-center text-2xl font-semibold">
          Create Account
        </h2>

        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-gray-400" />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="border w-full p-2 pl-10 rounded"
          />
        </div>

        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="border w-full p-2 pl-10 rounded"
          />
        </div>

        <div className="relative">
          <FaPhone className="absolute left-3 top-3 text-gray-400" />
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="border w-full p-2 pl-10 rounded"
          />
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="border w-full p-2 pl-10 rounded"
          />
        </div>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
          className="border w-full p-2 rounded"
        />

        <button className="bg-black text-white w-full py-2 rounded hover:bg-gray-800 transition">
          Register
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;