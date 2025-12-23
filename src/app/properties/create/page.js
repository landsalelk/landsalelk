"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MapPin,
  Home,
  Trees,
  Building,
  Camera,
  Upload,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Loader2,
  ImagePlus,
  X,
  Phone,
  Mail,
  User,
  ShieldCheck,
  FileText,
  Banknote,
  Ruler,
  BedDouble,
  Bath,
  ScanText,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { Permission, Role } from "appwrite";

// Sri Lankan phone number formatter
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

// Validate Sri Lankan phone number
function validatePhoneNumber(phone) {
  if (!phone || phone.trim() === "") return { valid: true, message: "" }; // Empty is OK (optional)

  const digits = phone.replace(/\D/g, "");

  // Sri Lankan mobile: 07X XXX XXXX (10 digits)
  // Sri Lankan landline: 0XX XXX XXXX (10 digits)
  // International: +94 7X XXX XXXX (11 digits with 94)
  if (digits.startsWith("94") && digits.length === 11) {
    return { valid: true, message: "" };
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return { valid: true, message: "" };
  }
  if (digits.length === 9 && !digits.startsWith("0")) {
    // 9 digits without leading 0
    return { valid: true, message: "" };
  }

  // Provide helpful feedback
  if (digits.length < 9) {
    return { valid: false, message: "Phone number is too short" };
  }
  if (digits.length > 11) {
    return { valid: false, message: "Phone number is too long" };
  }

  return {
    valid: false,
    message: "Please enter a valid Sri Lankan phone number",
  };
}

export default function CreateListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [agentScanning, setAgentScanning] = useState(false);
  const [agentMatched, setAgentMatched] = useState(null);
  const [images, setImages] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [successModal, setSuccessModal] = useState(null); // { link: '', phone: '' }
  const [phoneErrors, setPhoneErrors] = useState({
    contact_phone: "",
    owner_phone: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    beds: "",
    baths: "",
    size_sqft: "",
    perch_size: "",
    category_id: "house",
    listing_type: "sale",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    deed_type: "",
    approval_nbro: false,
    approval_coc: false,
    approval_uda: false,
    infrastructure_distance: "",
    is_foreign_eligible: false,
    has_payment_plan: false,
    owner_phone: "",
    agreed_commission: "",
    service_fee: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const propertyTypes = [
    {
      id: "house",
      label: "House",
      icon: Home,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      id: "land",
      label: "Land",
      icon: Trees,
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      id: "apartment",
      label: "Apartment",
      icon: Building,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
  ];

  const listingTypes = [
    { id: "sale", label: "For Sale", desc: "Sell your property" },
    { id: "rent", label: "For Rent", desc: "Rent out your property" },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle contact phone input with formatting
  const handleContactPhoneChange = useCallback(
    (e) => {
      const formatted = formatPhoneNumber(e.target.value);
      setFormData((prev) => ({ ...prev, contact_phone: formatted }));

      // Clear error when user types
      if (phoneErrors.contact_phone) {
        setPhoneErrors((prev) => ({ ...prev, contact_phone: "" }));
      }
    },
    [phoneErrors.contact_phone],
  );

  // Handle owner phone input with formatting
  const handleOwnerPhoneChange = useCallback(
    (e) => {
      const formatted = formatPhoneNumber(e.target.value);
      setFormData((prev) => ({ ...prev, owner_phone: formatted }));

      // Clear error when user types
      if (phoneErrors.owner_phone) {
        setPhoneErrors((prev) => ({ ...prev, owner_phone: "" }));
      }
    },
    [phoneErrors.owner_phone],
  );

  // Validate phone on blur
  const handlePhoneBlur = useCallback(
    (field) => {
      return () => {
        const value = formData[field];
        const validation = validatePhoneNumber(value);
        if (!validation.valid) {
          setPhoneErrors((prev) => ({ ...prev, [field]: validation.message }));
        }
      };
    },
    [formData],
  );

  // AI OCR Feature: Extract phone and price from image
  const runOCR = async () => {
    if (images.length === 0) {
      toast.error("Please upload an image first.");
      return;
    }

    setOcrProcessing(true);
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const imageToScan = images[0];
      const {
        data: { text },
      } = await Tesseract.recognize(imageToScan, "eng", {
        logger: () => {},
      });

      // Basic Regex to find phone numbers (Sri Lankan format roughly)
      // Look for patterns like 077 123 4567, 07x-xxxxxxx, +94...
      const phoneMatch = text.match(
        /(?:\+94|0)?7[0-9]{2}[- ]?[0-9]{3}[- ]?[0-9]{4}/,
      );
      if (phoneMatch) {
        const phone = phoneMatch[0].replace(/[- ]/g, "");
        setFormData((prev) => ({ ...prev, owner_phone: phone }));
        toast.success(`Found Phone: ${phone}`);
      }

      // Basic Regex for Price (Numbers with commas or LKR/Rs)
      // This is tricky, might pick up other numbers.
      // Look for "Rs.", "LKR" followed by digits
      const priceMatch = text.match(/(?:Rs\.?|LKR)\s?([0-9,]+)/i);
      if (priceMatch) {
        const price = priceMatch[1].replace(/,/g, "");
        setFormData((prev) => ({ ...prev, price: price }));
        toast.success(`Found Price: ${price}`);
      }

      if (!phoneMatch && !priceMatch) {
        toast.info("No clear details found in image. Please enter manually.");
      }
    } catch (err) {
      toast.error("Failed to scan image.");
    } finally {
      setOcrProcessing(false);
    }
  };

  const scanForAgents = async () => {
    setAgentScanning(true);
    // Simulate agent matching
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setAgentMatched({
      name: "Kumara Perera",
      phone: "+94 77 123 4567",
      rating: 4.9,
      listings: 45,
      verified: true,
    });
    setAgentScanning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { storage } = await import("@/appwrite");
      const { ID } = await import("appwrite");
      const { createProperty } = await import("@/lib/properties");

      // Read latest values from the form to be resilient to autofill and non-standard input event dispatch.
      const maybeTarget = e?.currentTarget || e?.target;
      let form =
        (maybeTarget && maybeTarget.tagName === "FORM"
          ? maybeTarget
          : maybeTarget?.closest?.("form")) || null;

      // Extra safety: in some automation / hydration edge cases, currentTarget might not be the <form> element.
      if (!(form instanceof HTMLFormElement)) {
        form = document.querySelector("form");
      }

      const fd = form ? new FormData(form) : new FormData();
      const getStr = (k) => {
        const v = fd.get(k);
        return typeof v === "string" ? v : "";
      };
      const getChecked = (k) => {
        if (!form) return !!formData[k];
        const el = form.elements?.namedItem?.(k) ?? form.elements?.[k];
        return el instanceof HTMLInputElement ? el.checked : !!formData[k];
      };

      const mergedFormData = {
        ...formData,
        // Step 1
        location: getStr("location") || formData.location,
        category_id: getStr("category_id") || formData.category_id,
        listing_type: getStr("listing_type") || formData.listing_type,
        // Step 3
        title: getStr("title") || formData.title,
        description: getStr("description") || formData.description,
        price: getStr("price") || formData.price,
        beds: getStr("beds") || formData.beds,
        baths: getStr("baths") || formData.baths,
        size_sqft: getStr("size_sqft") || formData.size_sqft,
        perch_size: getStr("perch_size") || formData.perch_size,
        deed_type: getStr("deed_type") || formData.deed_type,
        infrastructure_distance:
          getStr("infrastructure_distance") || formData.infrastructure_distance,
        approval_nbro: getChecked("approval_nbro"),
        approval_coc: getChecked("approval_coc"),
        approval_uda: getChecked("approval_uda"),
        is_foreign_eligible: getChecked("is_foreign_eligible"),
        has_payment_plan: getChecked("has_payment_plan"),
        // Step 4
        contact_name: getStr("contact_name") || formData.contact_name,
        contact_phone: getStr("contact_phone") || formData.contact_phone,
        contact_email: getStr("contact_email") || formData.contact_email,
        owner_phone: getStr("owner_phone") || formData.owner_phone,
        agreed_commission:
          getStr("agreed_commission") || formData.agreed_commission,
        service_fee: getStr("service_fee") || formData.service_fee,
      };

      const imageIds = [];
      const bucketId = "listing_images";
      const endpoint =
        process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        "https://sgp.cloud.appwrite.io/v1";
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      let uploadFailures = 0;

      for (const img of images) {
        try {
          const res = await storage.createFile(
            bucketId,
            ID.unique(),
            img,
            [Permission.read(Role.any())], // make listing images publicly viewable
          );
          const url = `${endpoint}/storage/buckets/${bucketId}/files/${res.$id}/view?project=${projectId}`;
          imageIds.push(url);
        } catch (err) {
          console.error("Image upload failed:", err);
          uploadFailures++;
        }
      }

      // Notify user if some images failed to upload
      if (uploadFailures > 0) {
        toast.warning(
          `${uploadFailures} image(s) failed to upload. Your listing will be created with the successfully uploaded images.`,
        );
      }

      // Ensure at least one image or use placeholder only if no images uploaded
      if (imageIds.length === 0 && images.length > 0) {
        toast.error("All images failed to upload. Please try again.");
        setSubmitting(false);
        return;
      }

      const newProperty = await createProperty({
        ...mergedFormData,
        price: parseFloat(mergedFormData.price) || 0,
        beds: parseInt(mergedFormData.beds) || 0,
        baths: parseInt(mergedFormData.baths) || 0,
        size_sqft: parseInt(mergedFormData.size_sqft) || 0,
        perch_size: parseFloat(mergedFormData.perch_size) || 0,
        infrastructure_distance:
          parseFloat(mergedFormData.infrastructure_distance) || 0,
        deed_type: mergedFormData.deed_type,
        approval_nbro: mergedFormData.approval_nbro,
        approval_coc: mergedFormData.approval_coc,
        approval_uda: mergedFormData.approval_uda,
        is_foreign_eligible: mergedFormData.is_foreign_eligible,
        has_payment_plan: mergedFormData.has_payment_plan,
        // send array (Appwrite schema expects an array for images)
        images: imageIds,
        service_fee: parseFloat(mergedFormData.service_fee) || 0,
      });

      if (newProperty.status === "pending") {
        const link = `https://landsale.lk/verify-owner/${newProperty.$id}?secret=${newProperty.verification_code}`;
        setSuccessModal({
          link: link,
          phone: mergedFormData.owner_phone,
        });
      } else {
        toast.success("🎉 දැන්වීම සාර්ථකයි! Property listed!");
        router.push("/profile");
      }
    } catch (error) {
      // Show more specific error if available
      const msg = error.message || "Failed to create listing";
      toast.error(`${msg}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    if (step === 2 && !agentMatched) {
      scanForAgents();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!mounted) return null;

  return (
    <div className="animate-fade-in relative min-h-screen px-0 py-6 md:px-4 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 px-4 text-center md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-4 py-2 text-sm font-bold text-[#10b981]">
            <Sparkles className="h-4 w-4" /> Free Listing
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900 md:mb-3 md:text-4xl">
            List Your Property
          </h1>
          <p className="mx-auto max-w-xl text-sm font-medium text-slate-500 md:text-base">
            ඔබේ දේපල දැන්වීම තත්පර කිහිපයකින් ප්‍රකාශ කරන්න
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2 md:mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  step === s
                    ? "bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30"
                    : step > s
                      ? "bg-[#d1fae5] text-[#10b981]"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`mx-1 h-1 w-12 rounded-full ${step > s ? "bg-[#10b981]" : "bg-slate-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="md:glass-card shadow-top min-h-[calc(100vh-200px)] rounded-t-3xl bg-white p-6 md:rounded-3xl md:p-12 md:shadow-none">
          <form onSubmit={handleSubmit}>
            {/* Hidden mirrors for robust FormData extraction */}
            <input
              type="hidden"
              name="category_id"
              value={formData.category_id}
            />
            <input
              type="hidden"
              name="listing_type"
              value={formData.listing_type}
            />

            {/* Step 1: Property Type */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="mb-6 text-xl font-bold text-slate-800">
                  What are you listing?
                </h2>

                {/* Property Type */}
                <div className="mb-8 grid grid-cols-3 gap-3 md:gap-4">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category_id: type.id })
                      }
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all md:p-6 ${
                        formData.category_id === type.id
                          ? `${type.color} border-current shadow-lg`
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <type.icon
                        className={`mb-2 h-6 w-6 md:mb-3 md:h-8 md:w-8 ${formData.category_id === type.id ? "" : "text-slate-400"}`}
                      />
                      <span className="text-sm font-bold md:text-base">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Listing Type */}
                <h3 className="mb-4 font-bold text-slate-700">Purpose</h3>
                <div className="mb-8 grid grid-cols-2 gap-4">
                  {listingTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, listing_type: type.id })
                      }
                      className={`rounded-2xl border-2 p-4 text-left transition-all ${
                        formData.listing_type === type.id
                          ? "border-[#10b981] bg-[#ecfdf5]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-bold text-slate-800">
                        {type.label}
                      </span>
                      <p className="mt-1 text-sm text-slate-500">{type.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Location */}
                <div className="mb-6">
                  <label className="mb-2 block font-bold text-slate-700">
                    <MapPin className="mr-2 inline h-4 w-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Colombo 7, Cinnamon Gardens"
                    name="location"
                    className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-4 font-medium text-slate-700 transition-all outline-none focus:border-[#6ee7b7] focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Agent Matching */}
            {step === 2 && (
              <div className="animate-fade-in text-center">
                {/* ... existing agent match UI ... */}
                <h2 className="mb-3 text-xl font-bold text-slate-800">
                  Finding You an Agent
                </h2>
                <p className="mb-8 text-slate-500">
                  We'll match you with a verified agent in your area
                </p>

                {agentScanning ? (
                  <div className="py-12">
                    {/* Scanning Animation */}
                    <div className="relative mx-auto mb-8 h-48 w-48">
                      <div className="absolute inset-0 animate-ping rounded-full border-4 border-[#10b981]/20" />
                      <div
                        className="absolute inset-4 animate-ping rounded-full border-4 border-[#10b981]/30"
                        style={{ animationDelay: "0.5s" }}
                      />
                      <div
                        className="absolute inset-8 animate-ping rounded-full border-4 border-[#10b981]/40"
                        style={{ animationDelay: "1s" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#10b981]">
                          <svg
                            viewBox="0 0 100 100"
                            fill="none"
                            className="h-14 w-14"
                          >
                            <circle cx="50" cy="50" r="45" fill="white" />
                            <path
                              d="M50 95C70 95 85 80 85 65C85 50 50 50 50 50C50 50 15 50 15 65C15 80 30 95 50 95Z"
                              fill="#10b981"
                            />
                            <circle
                              cx="50"
                              cy="38"
                              r="15"
                              fill="#FDE68A"
                              stroke="#F59E0B"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="animate-pulse font-bold text-[#10b981]">
                      Scanning for nearby agents...
                    </p>
                  </div>
                ) : agentMatched ? (
                  <div className="py-8">
                    {/* Matched Agent Card */}
                    <div className="glass-panel mx-auto max-w-md rounded-3xl p-8 text-left">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d1fae5] to-[#cffafe]">
                          <svg
                            viewBox="0 0 100 100"
                            fill="none"
                            className="h-10 w-10"
                          >
                            <circle cx="50" cy="50" r="45" fill="#E0F2FE" />
                            <path
                              d="M50 95C70 95 85 80 85 65C85 50 50 50 50 50C50 50 15 50 15 65C15 80 30 95 50 95Z"
                              fill="#3B82F6"
                            />
                            <circle
                              cx="50"
                              cy="38"
                              r="15"
                              fill="#FDE68A"
                              stroke="#F59E0B"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-800">
                              {agentMatched.name}
                            </h3>
                            {agentMatched.verified && (
                              <ShieldCheck className="h-5 w-5 text-[#10b981]" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {agentMatched.listings} listings • ⭐{" "}
                            {agentMatched.rating}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">
                          Agent matched! They'll help you sell faster.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAgentMatched(null)}
                      className="mt-6 text-sm text-slate-500 hover:text-slate-700"
                    >
                      Skip agent assistance
                    </button>
                  </div>
                ) : (
                  <div className="py-12">
                    <button
                      type="button"
                      onClick={scanForAgents}
                      className="btn-primary px-8 py-4"
                    >
                      <User className="mr-2 h-5 w-5" />
                      Find Me an Agent
                    </button>
                    <p className="mt-4 text-sm text-slate-400">
                      Or continue without an agent
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Property Details */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="mb-6 text-xl font-bold text-slate-800">
                  Property Details
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      <FileText className="mr-2 inline h-4 w-4" />
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Luxury Villa with Pool in Colombo 7"
                      name="title"
                      className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-4 font-medium text-slate-700 transition-all outline-none focus:border-[#6ee7b7] focus:bg-white"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      <Banknote className="mr-2 inline h-4 w-4" />
                      Price (LKR)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="50,000,000"
                      name="price"
                      className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-4 font-medium text-slate-700 transition-all outline-none focus:border-[#6ee7b7] focus:bg-white"
                    />
                  </div>

                  {/* Sri Lankan Market Specs */}
                  <div className="glass-panel space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                    <h3 className="flex items-center gap-2 font-bold text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                      Legal & Approvals 🇱🇰
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                          Deed Type
                        </label>
                        <select
                          value={formData.deed_type || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              deed_type: e.target.value,
                            })
                          }
                          name="deed_type"
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-[#10b981]"
                        >
                          <option value="">Select Type</option>
                          <option value="sinnakkara">
                            Sinnakkara (Freehold)
                          </option>
                          <option value="bim_saviya">Bim Saviya</option>
                          <option value="jayabhoomi">
                            Jayabhoomi / Swarnabhoomi
                          </option>
                          <option value="condominium">Condominium Deed</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                          Dist. to Highway/LRT (km)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formData.infrastructure_distance || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              infrastructure_distance: e.target.value,
                            })
                          }
                          name="infrastructure_distance"
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-[#10b981]"
                          placeholder="0.0 km"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex cursor-pointer items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          checked={formData.approval_nbro || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              approval_nbro: e.target.checked,
                            })
                          }
                          name="approval_nbro"
                          className="h-5 w-5 accent-[#10b981]"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          NBRO Certified
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          checked={formData.approval_coc || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              approval_coc: e.target.checked,
                            })
                          }
                          name="approval_coc"
                          className="h-5 w-5 accent-[#10b981]"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          COC Obtained
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          checked={formData.approval_uda || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              approval_uda: e.target.checked,
                            })
                          }
                          name="approval_uda"
                          className="h-5 w-5 accent-[#10b981]"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          UDA Approved
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-4 border-t border-slate-200/50 pt-2">
                      {formData.category_id === "land" && (
                        <label className="flex cursor-pointer items-center gap-2 select-none">
                          <input
                            type="checkbox"
                            checked={formData.has_payment_plan || false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                has_payment_plan: e.target.checked,
                              })
                            }
                            name="has_payment_plan"
                            className="h-5 w-5 accent-[#10b981]"
                          />
                          <span className="rounded bg-yellow-100 px-2 py-0.5 text-sm font-bold text-slate-700">
                            Easy Payment Plan Available
                          </span>
                        </label>
                      )}
                      {(formData.category_id === "apartment" ||
                        formData.category_id === "house") && (
                        <label className="flex cursor-pointer items-center gap-2 select-none">
                          <input
                            type="checkbox"
                            checked={formData.is_foreign_eligible || false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                is_foreign_eligible: e.target.checked,
                              })
                            }
                            name="is_foreign_eligible"
                            className="h-5 w-5 accent-[#10b981]"
                          />
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-bold text-slate-700">
                            Foreign Buyer Eligible
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Specs Grid */}
                    {formData.category_id !== "land" && (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                            <BedDouble className="mr-1 inline h-3 w-3" /> Beds
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.beds}
                            onChange={(e) =>
                              setFormData({ ...formData, beds: e.target.value })
                            }
                            name="beds"
                            className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-3 text-center font-bold focus:border-[#6ee7b7]"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                            <Bath className="mr-1 inline h-3 w-3" /> Baths
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.baths}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                baths: e.target.value,
                              })
                            }
                            name="baths"
                            className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-3 text-center font-bold focus:border-[#6ee7b7]"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                            <Ruler className="mr-1 inline h-3 w-3" /> Sq.Ft
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.size_sqft}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                size_sqft: e.target.value,
                              })
                            }
                            name="size_sqft"
                            className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-3 text-center font-bold focus:border-[#6ee7b7]"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                            Perches
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={formData.perch_size}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                perch_size: e.target.value,
                              })
                            }
                            name="perch_size"
                            className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-3 text-center font-bold focus:border-[#6ee7b7]"
                          />
                        </div>
                      </div>
                    )}

                    {formData.category_id === "land" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                            <Ruler className="mr-1 inline h-3 w-3" /> Size
                            (Perches)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={formData.perch_size}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                perch_size: e.target.value,
                              })
                            }
                            name="perch_size"
                            className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-3 text-center font-bold focus:border-[#6ee7b7]"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                            Size (Sq.Ft)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.size_sqft}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                size_sqft: e.target.value,
                              })
                            }
                            name="size_sqft"
                            className="w-full rounded-xl border-2 border-transparent bg-slate-50 p-3 text-center font-bold focus:border-[#6ee7b7]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your property in detail..."
                        name="description"
                        className="w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-4 font-medium text-slate-700 transition-all outline-none focus:border-[#6ee7b7] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos & Submit */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="mb-6 text-xl font-bold text-slate-800">
                  <Camera className="mr-2 inline h-5 w-5" />
                  Add Photos
                </h2>

                {/* Image Grid */}
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-2xl"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Uploaded image ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-[#10b981] hover:bg-white">
                    <ImagePlus className="mb-2 h-10 w-10" />
                    <span className="text-sm font-bold">Add Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* OCR Button */}
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={runOCR}
                    disabled={ocrProcessing}
                    className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-6 py-3 font-bold text-indigo-600 transition-all hover:bg-indigo-100 md:w-auto"
                  >
                    {ocrProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Scanning
                        Image...
                      </>
                    ) : (
                      <>
                        <ScanText className="h-5 w-5" /> Auto-fill Details from
                        Image (AI)
                      </>
                    )}
                  </button>
                )}

                {/* Contact Info */}
                <div className="glass-panel mb-8 rounded-2xl p-6">
                  <h3 className="mb-4 font-bold text-slate-800">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_name: e.target.value,
                          })
                        }
                        placeholder="Your Name"
                        name="contact_name"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 outline-none focus:border-[#10b981]"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        inputMode="tel"
                        value={formData.contact_phone}
                        onChange={handleContactPhoneChange}
                        onBlur={handlePhoneBlur("contact_phone")}
                        placeholder="077 123 4567"
                        name="contact_phone"
                        aria-invalid={!!phoneErrors.contact_phone}
                        aria-describedby={
                          phoneErrors.contact_phone
                            ? "contact-phone-error"
                            : undefined
                        }
                        className={`w-full rounded-xl border bg-white py-3 pr-4 pl-10 transition-colors outline-none ${
                          phoneErrors.contact_phone
                            ? "border-red-300 focus:border-red-500"
                            : "border-slate-200 focus:border-[#10b981]"
                        }`}
                      />
                      {phoneErrors.contact_phone && (
                        <p
                          id="contact-phone-error"
                          className="mt-1 flex items-center gap-1 text-sm text-red-600"
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {phoneErrors.contact_phone}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        inputMode="email"
                        value={formData.contact_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_email: e.target.value,
                          })
                        }
                        placeholder="Email (optional)"
                        name="contact_email"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 outline-none focus:border-[#10b981]"
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Details (For Agents) */}
                <div className="glass-panel mb-8 rounded-2xl border-blue-100 bg-blue-50/50 p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Owner Verification
                  </h3>
                  <p className="mb-4 text-sm text-slate-500">
                    Enter owner details to initiate the digital consent flow. An
                    SMS will be sent to the owner.
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                        Owner Phone
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={formData.owner_phone}
                        onChange={handleOwnerPhoneChange}
                        onBlur={handlePhoneBlur("owner_phone")}
                        placeholder="+94 7X XXX XXXX"
                        name="owner_phone"
                        aria-invalid={!!phoneErrors.owner_phone}
                        aria-describedby={
                          phoneErrors.owner_phone
                            ? "owner-phone-error"
                            : undefined
                        }
                        className={`w-full rounded-xl border bg-white p-3 transition-colors outline-none ${
                          phoneErrors.owner_phone
                            ? "border-red-300 focus:border-red-500"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      />
                      {phoneErrors.owner_phone && (
                        <p
                          id="owner-phone-error"
                          className="mt-1 flex items-center gap-1 text-sm text-red-600"
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {phoneErrors.owner_phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                        Commission (%)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formData.agreed_commission}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agreed_commission: e.target.value,
                          })
                        }
                        placeholder="3.0"
                        name="agreed_commission"
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
                        Service Fee (LKR)
                      </label>
                      <p className="mb-2 text-xs text-slate-400">
                        If the owner hires you, this is the fee they will pay
                        online.
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.service_fee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            service_fee: e.target.value,
                          })
                        }
                        placeholder="e.g. 2000"
                        name="service_fee"
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex w-full items-center justify-center gap-3 py-5 text-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      Publish Listing
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-all ${
                    step === 1
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-xl bg-[#10b981] px-8 py-3 font-bold text-white shadow-lg shadow-[#10b981]/30 transition-all hover:bg-[#059669]"
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Success Modal with WhatsApp */}
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="animate-fade-in relative w-full max-w-md rounded-3xl bg-white p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">
                Listing Created!
              </h2>
              <p className="mb-6 text-slate-500">
                You earned{" "}
                <span className="font-bold text-[#10b981]">+10 Points</span>! 🏆
                <br />
                Send the verification link to the owner now.
              </p>

              <a
                href={`https://wa.me/${successModal.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi! I have listed your property on Landsale.lk. Please verify and review my proposal here: ${successModal.link}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 font-bold text-white transition-all hover:bg-[#128C7E]"
              >
                <MessageCircle className="h-6 w-6" /> Share via WhatsApp
              </a>

              <button
                onClick={() =>
                  router.push("/dashboard/listings?status=pending")
                }
                className="w-full rounded-xl py-3 font-medium text-slate-500 hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}