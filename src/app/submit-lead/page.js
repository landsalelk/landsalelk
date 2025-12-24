"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Phone,
  User,
  MessageSquareText,
  ClipboardList,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Sri Lankan phone number formatter and validator
function formatPhoneNumber(value) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");

  // Handle different formats
  if (digits.startsWith("94")) {
    // International format: 94XXXXXXXXX
    const local = digits.slice(2);
    if (local.length <= 2) return `+94 ${local}`;
    if (local.length <= 5) return `+94 ${local.slice(0, 2)} ${local.slice(2)}`;
    if (local.length <= 9)
      return `+94 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
    return `+94 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`;
  } else if (digits.startsWith("0")) {
    // Local format: 0XXXXXXXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 10)
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  } else if (digits.length > 0) {
    // Assume it's a mobile without prefix - add 0
    if (digits.length <= 2) return `0${digits}`;
    if (digits.length <= 5) return `0${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 9)
      return `0${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `0${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
  }

  return value;
}

function validatePhoneNumber(phone) {
  const digits = phone.replace(/\D/g, "");

  // Sri Lankan mobile: 07X XXX XXXX (10 digits)
  // Sri Lankan landline: 0XX XXX XXXX (10 digits)
  // International: +94 7X XXX XXXX (11 digits with 94)
  if (digits.startsWith("94") && digits.length === 11) {
    return true;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return true;
  }
  if (digits.length === 9 && !digits.startsWith("0")) {
    // 9 digits without leading 0
    return true;
  }

  return false;
}

export default function SubmitLeadPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [requirements, setRequirements] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    general: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
  });

  // Handle phone input with formatting
  const handlePhoneChange = useCallback(
    (e) => {
      const formatted = formatPhoneNumber(e.target.value);
      setPhone(formatted);

      // Clear error when user types
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "", general: "" }));
      }
    },
    [errors.phone],
  );

  // Handle name change
  const handleNameChange = useCallback(
    (e) => {
      setName(e.target.value);
      if (errors.name) {
        setErrors((prev) => ({ ...prev, name: "", general: "" }));
      }
    },
    [errors.name],
  );

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = { name: "", phone: "", general: "" };
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhoneNumber(phone)) {
      newErrors.phone =
        "Please enter a valid Sri Lankan phone number (e.g., 077 123 4567)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [name, phone]);

  // Handle field blur for validation
  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (field === "name" && name.trim()) {
        if (name.trim().length < 2) {
          setErrors((prev) => ({
            ...prev,
            name: "Name must be at least 2 characters",
          }));
        }
      }

      if (field === "phone" && phone.trim()) {
        if (!validatePhoneNumber(phone)) {
          setErrors((prev) => ({
            ...prev,
            phone: "Please enter a valid Sri Lankan phone number",
          }));
        }
      }
    },
    [name, phone],
  );

  async function onSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    setErrors({ name: "", phone: "", general: "" });

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\s/g, "").trim(),
          location: location.trim() || undefined,
          requirements: requirements.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitted(true);
        toast.success(
          "Thanks! Your lead was submitted. An agent will contact you soon.",
        );
        return;
      }

      // Handle specific error cases
      if (res.status === 503) {
        setErrors((prev) => ({
          ...prev,
          general:
            data?.error ||
            "No agents available right now. Please try again shortly.",
        }));
        toast.error("No agents available right now");
        return;
      }

      if (res.status === 400) {
        setErrors((prev) => ({
          ...prev,
          general: data?.error || "Invalid information provided",
        }));
        toast.error(data?.error || "Please check your information");
        return;
      }

      if (res.status === 429) {
        setErrors((prev) => ({
          ...prev,
          general: "Too many requests. Please wait a moment and try again.",
        }));
        toast.error("Too many requests. Please wait and try again.");
        return;
      }

      // Generic error
      setErrors((prev) => ({
        ...prev,
        general:
          data?.error ||
          data?.details ||
          "Failed to submit lead. Please try again.",
      }));
      toast.error(data?.error || "Failed to submit lead");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: "Network error. Please check your connection and try again.",
      }));
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Reset form and go back
  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setPhone("");
    setLocation("");
    setRequirements("");
    setMessage("");
    setErrors({ name: "", phone: "", general: "" });
    setTouched({ name: false, phone: false });
  };

  // Success state
  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-hidden px-4 py-10">
        <div className="live-gradient absolute inset-0 opacity-90" />
        <div className="animate-float absolute top-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-float-delayed absolute right-10 bottom-20 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

        <div className="animate-fade-in relative z-10 mx-auto max-w-2xl">
          <div className="glass-panel rounded-3xl p-12 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-slate-800">
              Lead Submitted Successfully!
            </h1>
            <p className="mb-8 text-slate-600">
              Thank you for your submission. A verified agent will contact you
              within 24 hours at <strong>{phone}</strong>.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleReset}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
              >
                Submit Another Lead
              </button>
              <Link
                href="/properties"
                className="btn-secondary flex items-center justify-center gap-2 px-6 py-3"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
      <div className="live-gradient absolute inset-0 opacity-90" />
      <div className="animate-float absolute top-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="animate-float-delayed absolute right-10 bottom-20 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

      <div className="animate-fade-in relative z-10 mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform group-hover:scale-110">
              <MapPin className="h-6 w-6 text-[#10b981]" />
            </div>
            <span className="text-2xl font-bold text-white">
              LandSale<span className="text-yellow-300">.lk</span>
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-white">Submit a Lead</h1>
          <p className="mt-2 text-white/70">
            Tell us what you need. We&apos;ll route your request to a verified
            agent.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          {/* General Error */}
          {errors.general && (
            <div
              className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600"
              role="alert"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={() => handleBlur("name")}
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`w-full rounded-2xl border-2 bg-slate-50 py-4 pr-4 pl-12 font-bold text-slate-700 transition-all outline-none focus:bg-white ${
                      errors.name
                        ? "border-red-400 focus:border-red-500"
                        : touched.name && name.trim().length >= 2
                          ? "border-emerald-400 focus:border-emerald-500"
                          : "border-transparent focus:border-[#6ee7b7]"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p
                    id="name-error"
                    className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur("phone")}
                    placeholder="077 123 4567"
                    required
                    autoComplete="tel"
                    aria-invalid={errors.phone ? "true" : "false"}
                    aria-describedby={
                      errors.phone ? "phone-error" : "phone-hint"
                    }
                    className={`w-full rounded-2xl border-2 bg-slate-50 py-4 pr-4 pl-12 font-bold text-slate-700 transition-all outline-none focus:bg-white ${
                      errors.phone
                        ? "border-red-400 focus:border-red-500"
                        : touched.phone && validatePhoneNumber(phone)
                          ? "border-emerald-400 focus:border-emerald-500"
                          : "border-transparent focus:border-[#6ee7b7]"
                    }`}
                  />
                </div>
                {errors.phone ? (
                  <p
                    id="phone-error"
                    className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.phone}
                  </p>
                ) : (
                  <p id="phone-hint" className="mt-1.5 text-xs text-slate-500">
                    Sri Lankan mobile or landline number
                  </p>
                )}
              </div>
            </div>

            {/* Location Field */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Preferred Location{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <MapPin
                  className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Colombo / Kandy / Galle"
                  autoComplete="address-level1"
                  className="w-full rounded-2xl border-2 border-transparent bg-slate-50 py-4 pr-4 pl-12 font-bold text-slate-700 transition-all outline-none focus:border-[#6ee7b7] focus:bg-white"
                />
              </div>
            </div>

            {/* Requirements Field */}
            <div>
              <label
                htmlFor="requirements"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Requirements{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <ClipboardList
                  className="absolute top-5 left-4 h-5 w-5 text-slate-400"
                  aria-hidden="true"
                />
                <textarea
                  id="requirements"
                  name="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder="e.g., 10 perches, road frontage, clear deeds, budget range..."
                  className="w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 py-4 pr-4 pl-12 font-bold text-slate-700 transition-all outline-none focus:border-[#6ee7b7] focus:bg-white"
                />
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Message{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <MessageSquareText
                  className="absolute top-5 left-4 h-5 w-5 text-slate-400"
                  aria-hidden="true"
                />
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Any extra notes you want the agent to know..."
                  className="w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 py-4 pr-4 pl-12 font-bold text-slate-700 transition-all outline-none focus:border-[#6ee7b7] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Lead{" "}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              By submitting, you agree to be contacted by a LandSale.lk verified
              agent. Your information is protected under our{" "}
              <Link href="/privacy" className="text-[#10b981] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
