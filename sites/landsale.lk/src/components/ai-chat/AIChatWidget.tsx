"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Paperclip, Send, Mic, X, Video, Phone, Settings, Bot, User, FileText, ImageIcon, CheckCircle, Edit3, Loader2, Camera, Plus, Trash2 } from 'lucide-react';
import CallInterface from './CallInterface';
import { ModelSelector } from './components/ModelSelector';
import { ChatService } from './services/chatServiceOpenRouter';
import { ImageUploadService, UploadedImage } from './services/imageUploadService';
import { ChatMessage, Attachment, Property } from './types';

// Modern agent profile
const AGENT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800&auto=format&fit=crop";
const AGENT_NAME = "Priya";

// Property Card Component
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
  <div className="bg-white dark:bg-[#1f2c34] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-60 flex-shrink-0">
    <img
      src={property.image}
      alt={property.address}
      className="w-full h-32 object-cover"
    />
    <div className="p-2.5">
      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{property.price}</p>
      <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{property.address}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{property.specs}</p>
    </div>
  </div>
);

// Image Gallery Component for uploaded property images
const ImageGallery: React.FC<{
  images: UploadedImage[];
  onRemove: (id: string) => void;
  isUploading: boolean;
}> = ({ images, onRemove, isUploading }) => (
  <div className="bg-[#f0f2f5] dark:bg-[#1f2c34] border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 mt-2">
    <div className="flex items-center gap-2 mb-2">
      <Camera className="text-[#008069]" size={16} />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Property Photos ({images.length})
      </span>
      {isUploading && <Loader2 size={14} className="animate-spin text-[#008069]" />}
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {images.map((img) => (
        <div key={img.id} className="relative flex-shrink-0 group">
          <img
            src={img.url}
            alt={img.name}
            className="w-14 h-14 object-cover rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
          />
          <button
            onClick={() => onRemove(img.id)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// Listing Preview Card Component
const ListingPreviewCard: React.FC<{
  title: string;
  description: string;
  imageCount: number;
  onPublish: () => void;
  onEdit: () => void;
  onAddPhotos: () => void;
  isPublishing: boolean;
}> = ({ title, description, imageCount, onPublish, onEdit, onAddPhotos, isPublishing }) => (
  <div className="bg-[#f0f2f5] dark:bg-[#1f2c34] border border-l-4 border-gray-200 dark:border-gray-700 border-l-[#008069] rounded-lg p-3 mt-2">
    <div className="flex items-center gap-2 mb-1">
      <CheckCircle className="text-[#008069]" size={18} />
      <span className="font-semibold text-[#008069] dark:text-[#00a884] text-sm">Listing Ready!</span>
    </div>
    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-0.5 text-base">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{description}</p>

    {/* Photo count indicator */}
    <div className="flex items-center gap-2 mb-2 text-xs">
      <Camera size={14} className="text-gray-500" />
      <span className="text-gray-600 dark:text-gray-400">
        {imageCount > 0 ? `${imageCount} photo${imageCount > 1 ? 's' : ''}` : 'No photos'}
      </span>
      {imageCount === 0 && (
        <button
          onClick={onAddPhotos}
          className="text-[#008069] hover:underline font-medium flex items-center gap-1"
        >
          Add Photos
        </button>
      )}
    </div>

    <div className="flex gap-2 mt-2">
      <button
        onClick={onPublish}
        disabled={isPublishing}
        className="flex-1 bg-[#008069] hover:bg-[#00a884] disabled:bg-[#008069]/60 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        {isPublishing ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Publishing...
          </>
        ) : (
          <>
            Publish
          </>
        )}
      </button>
      <button
        onClick={onAddPhotos}
        className="bg-white dark:bg-[#2a3942] border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#323f49] text-gray-700 dark:text-gray-200 font-medium py-1.5 px-2.5 rounded text-sm transition-colors"
      >
        <Camera size={16} />
      </button>
      <button
        onClick={onEdit}
        className="bg-white dark:bg-[#2a3942] border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#323f49] text-gray-700 dark:text-gray-200 font-medium py-1.5 px-2.5 rounded text-sm transition-colors"
      >
        <Edit3 size={16} />
      </button>
    </div>
  </div>
);

// Message Bubble Component with enhanced rendering
const MessageBubble: React.FC<{
  msg: ChatMessage;
  imageCount: number;
  onPublish: () => void;
  onEdit: () => void;
  onAddPhotos: () => void;
  isPublishing: boolean;
}> = ({ msg, imageCount, onPublish, onEdit, onAddPhotos, isPublishing }) => {
  const isUser = msg.sender === 'user';

  // Parse listing preview from text
  const listingMatch = msg.text.match(/<LISTING_PREVIEW>([\s\S]*?)<\/LISTING_PREVIEW>/);
  let listingPreview: { title: string; description: string; ready_to_publish: boolean } | null = null;
  if (listingMatch) {
    try {
      listingPreview = JSON.parse(listingMatch[1].trim());
    } catch (e) { }
  }

  // Parse properties from text
  const propertiesMatch = msg.text.match(/<PROPERTIES>([\s\S]*?)<\/PROPERTIES>/);
  let properties: Property[] = [];
  if (propertiesMatch) {
    try {
      properties = JSON.parse(propertiesMatch[1].trim());
    } catch (e) { }
  }

  // Clean text for display
  const cleanText = msg.text
    .replace(/<PROPERTY_DATA>[\s\S]*?<\/PROPERTY_DATA>/g, '')
    .replace(/<LISTING_PREVIEW>[\s\S]*?<\/LISTING_PREVIEW>/g, '')
    .replace(/<SUGGESTIONS>[\s\S]*?<\/SUGGESTIONS>/g, '')
    .replace(/<PROPERTIES>[\s\S]*?<\/PROPERTIES>/g, '')
    .replace(/<GENERATE_IMAGE>[\s\S]*?<\/GENERATE_IMAGE>/g, '')
    .replace(/<EDIT_IMAGE>[\s\S]*?<\/EDIT_IMAGE>/g, '')
    .trim();

  // Format text with markdown-like styling
  const formatText = (text: string) => {
    return text
      .split('\n')
      .map((line) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Emoji bullets
        if (line.match(/^[🏷️📍📐💰✨📞🏠🔍✅❌🎉📋📊🛣️🌿🏔️🙏📸]/)) {
          return `<div class="flex gap-2 items-start mt-1">${line}</div>`;
        }
        return line;
      })
      .join('<br/>');
  };

  return (
    <div className={`flex mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] min-w-[120px] ${isUser ? 'items-end' : 'items-start'}`}>

        {/* Bubble */}
        <div
          className={`relative px-3 py-2 shadow-sm text-[14.2px] leading-relaxed group break-words ${isUser
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-lg rounded-tr-none'
            : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-lg rounded-tl-none'
            }`}
          style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
        >
          {msg.attachment && (
            <div className="mb-2 p-2 bg-black/5 dark:bg-white/10 rounded-md flex items-center gap-2 border border-black/5">
              {msg.attachment.type === 'image' ? <ImageIcon size={20} className="text-gray-500" /> : <FileText size={20} className="text-gray-500" />}
              <span className="text-sm truncate font-medium">{msg.attachment.name}</span>
            </div>
          )}

          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: formatText(cleanText) }}
          />

          {/* Timestamp */}
          <div className={`text-[11px] float-right ml-4 mt-1 flex items-center gap-1 ${isUser ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {msg.time}
            {isUser && (
              <span className="text-blue-500">
                <CheckCircle size={10} strokeWidth={3} />
              </span>
            )}
          </div>
        </div>

        {/* Property Cards */}
        {properties.length > 0 && (
          <div className="mt-2 flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 max-w-full">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Listing Preview */}
        {listingPreview && listingPreview.ready_to_publish && (
          <ListingPreviewCard
            title={listingPreview.title}
            description={listingPreview.description}
            imageCount={imageCount}
            onPublish={onPublish}
            onEdit={onEdit}
            onAddPhotos={onAddPhotos}
            isPublishing={isPublishing}
          />
        )}

        {/* Generated Image */}
        {msg.generatedImage && (
          <div className="mt-2 rounded-lg overflow-hidden border-2 border-[#d9fdd3] dark:border-[#005c4b]">
            <img
              src={`data:image/png;base64,${msg.generatedImage}`}
              alt="Generated"
              className="max-w-full rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const AIChatWidget: React.FC = () => {
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      text: `Ayubowan! 🙏 I'm Priya, your personal real estate assistant at LandSale.lk! 🏡

Whether you're looking to **buy** your dream property or **sell** your land, I'm here to help make it simple and easy.

📸 **Tip:** You can attach photos of your property anytime using the 📎 button!

What would you like to do today?

<SUGGESTIONS>["I want to sell my land", "Show me properties", "I need help buying"]</SUGGESTIONS>`,
      sender: 'model',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(["I want to sell my land", "Show me properties", "I need help buying"]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const chatService = useRef(new ChatService());
  const imageUploadService = useRef(ImageUploadService.getInstance());
  const [currentModel, setCurrentModel] = useState(() => chatService.current.getCurrentModel());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    chatService.current.initChat();
    scrollToBottom();
  }, []);

  useEffect(scrollToBottom, [messages, suggestions, uploadedImages]);

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    chatService.current.setModel(model as any);
    chatService.current.initChat();
  };

  // Handle property image uploads (multiple)
  const handlePropertyImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await imageUploadService.current.uploadImageFromBase64(
          base64,
          file.name,
          file.type
        );

        if (result) {
          setUploadedImages(prev => [...prev, result]);
        }
      }

      // Add a message about the uploaded images
      const imageCount = files.length;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `📸 Added ${imageCount} photo${imageCount > 1 ? 's' : ''} to the listing`,
        sender: 'user',
        time: timeString
      }]);

      // AI acknowledges the images
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Great! I've saved ${imageCount} photo${imageCount > 1 ? 's' : ''} for your listing! 📸✨\n\nGood photos help attract more buyers. You can add more anytime!\n\n<SUGGESTIONS>["Add more photos", "Continue with listing", "Remove a photo"]</SUGGESTIONS>`,
        sender: 'model',
        time: timeString
      }]);

      setSuggestions(["Add more photos", "Continue with listing", "Remove a photo"]);

    } catch (error) {
      console.error('Image upload failed:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Sorry, there was an issue uploading your photos. Please try again. 🙏",
        sender: 'model',
        time: timeString
      }]);
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Remove an uploaded image
  const handleRemoveImage = async (imageId: string) => {
    await imageUploadService.current.removePendingImage(imageId);
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Trigger image upload dialog
  const handleAddPhotos = () => {
    imageInputRef.current?.click();
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      alert("Only images (PNG, JPG) and PDF files are supported.");
      return;
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setAttachment({
      type: isImage ? 'image' : 'pdf',
      mimeType: file.type,
      data: base64,
      name: file.name,
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => setAttachment(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Get uploaded image URLs
      const imageUrls = imageUploadService.current.getPendingImageUrls();

      // Get the property draft from the service
      const draft = chatService.current.getPropertyDraft();

      // Call the API endpoint (no login required!)
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title || `${draft.land_size || ''} ${draft.land_unit || 'Perch'} ${draft.property_type || 'Land'} for Sale in ${draft.city || draft.district || 'Sri Lanka'}`,
          description: draft.description || `Beautiful ${draft.land_size || ''} ${draft.land_unit || 'perch'} ${draft.property_type || 'land'} for sale${draft.city ? ` in ${draft.city}` : ''}. ${draft.features?.join(', ') || ''} Asking price: Rs. ${(draft.price || 0).toLocaleString()}.`,
          property_type: draft.property_type || 'land',
          price: draft.price || 0,
          district: draft.district,
          city: draft.city,
          address: draft.location,
          land_size: draft.land_size,
          land_unit: draft.land_unit || 'perches',
          bedrooms: draft.bedrooms,
          bathrooms: draft.bathrooms,
          features: [...(draft.amenities || []), ...(draft.features || [])],
          contact_phone: draft.contact_phone,
          contact_whatsapp: draft.contact_whatsapp,
          images: imageUrls,
        })
      });

      const result = await response.json();
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (result.success) {
        // Clear uploaded images after successful publish
        imageUploadService.current.clearPendingImages();
        setUploadedImages([]);

        const listingUrl = result.url || `/properties/${result.propertyId}`;

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `🎉 **Congratulations!** Your property has been listed successfully!\n\n📋 **Listing ID:** ${result.propertyId}\n🔗 **View Your Listing:** [Click here to view](${listingUrl})\n📸 **Photos:** ${imageUrls.length} attached\n\nYour listing is now live and visible to thousands of potential buyers!\n\n<SUGGESTIONS>["View my listing", "Create another", "Back to home"]</SUGGESTIONS>`,
          sender: 'model',
          time: timeString,
        }]);
        setSuggestions(["View my listing", "Create another", "Back to home"]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `❌ Sorry, there was an issue publishing your listing: ${result.error}\n\nPlease try again or contact support.\n\n<SUGGESTIONS>["Try again", "Edit listing", "Contact support"]</SUGGESTIONS>`,
          sender: 'model',
          time: timeString,
        }]);
        setSuggestions(["Try again", "Edit listing", "Contact support"]);
      }
    } catch (error) {
      console.error('Publish error:', error);
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `❌ Sorry, there was a network error. Please try again.\n\n<SUGGESTIONS>["Try again", "Contact support"]</SUGGESTIONS>`,
        sender: 'model',
        time: timeString,
      }]);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    handleSend("I want to edit the listing details");
  };

  const handleSend = async (textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim() && !attachment) return;

    const currentAttachment = attachment;
    setInputText("");
    setAttachment(null);
    setSuggestions([]);
    setIsLoading(true);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageId = Date.now().toString();

    setMessages(prev => [...prev, {
      id: messageId,
      text,
      sender: 'user',
      time: timeString,
      status: 'sent',
      attachment: currentAttachment || undefined,
    }]);

    try {
      const response = await chatService.current.sendMessage(
        text,
        currentAttachment ? { mimeType: currentAttachment.mimeType, data: currentAttachment.data } : undefined
      );

      const { text: responseText } = response;

      // Parse suggestions
      const suggestionMatch = responseText.match(/<SUGGESTIONS>(.*?)<\/SUGGESTIONS>/s);
      let parsedSuggestions: string[] = [];
      if (suggestionMatch?.[1]) {
        try {
          parsedSuggestions = JSON.parse(suggestionMatch[1].trim().replace(/```json|```/g, ''));
        } catch (e) {
          console.error("Failed to parse suggestions", e);
        }
      }

      if (parsedSuggestions.length > 0) setSuggestions(parsedSuggestions);

      const respTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMessageId = (Date.now() + 1).toString();

      setMessages(prev => {
        const updatedMessages = prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'read' as const } : msg
        );
        return [...updatedMessages, {
          id: aiMessageId,
          text: responseText,
          sender: 'model',
          time: respTimeString,
        }];
      });

    } catch (error) {
      console.error("Failed to send message", error);
      const respTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble right now. Please try again! 🙏\n\n<SUGGESTIONS>[\"Try again\", \"Start over\", \"Contact support\"]</SUGGESTIONS>",
        sender: 'model',
        time: respTimeString,
      }]);
      setSuggestions(["Try again", "Start over", "Contact support"]);
    } finally {
      setIsLoading(false);
    }
  };

  if (inCall) {
    return <CallInterface onEndCall={() => setInCall(false)} />;
  }

  return (
    <div className="h-full w-full bg-[#efeae2] dark:bg-[#0b141a] text-gray-800 dark:text-white flex flex-col overflow-hidden relative font-sans">

      {/* WhatsApp Background Pattern (Simulated with opacity) */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none z-0"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}>
      </div>

      {/* WhatsApp Style Header */}
      <div className="bg-[#008069] dark:bg-[#202c33] p-3 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-3">
          {/* Back button visible only on mobile (optional) */}

          <div className="relative cursor-pointer" onClick={() => setInCall(true)}>
            <img src={AGENT_PROFILE_IMAGE} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="Profile" />
            {/* Online Badge */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#008069] rounded-full"></span>
          </div>

          <div className="flex flex-col cursor-pointer">
            <h1 className="text-base font-semibold text-white leading-tight">{AGENT_NAME}</h1>
            <p className="text-xs text-white/80 font-normal">Online</p>
          </div>
        </div>

        <div className="flex gap-4 text-white items-center">
          <button onClick={() => setInCall(true)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <Video size={20} strokeWidth={2.5} />
          </button>
          <button onClick={() => setInCall(true)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <Phone size={19} strokeWidth={2.5} />
          </button>
          <button className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <Settings size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="flex justify-center my-4">
          <span className="bg-[#FFF5C4] dark:bg-[#1f2c34] text-xs px-3 py-1.5 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 font-medium">Today</span>
        </div>

        {/* Security / Encryption Notice */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#FEF5C4] dark:bg-[#1f2c34] text-[10px] text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg text-center max-w-[90%] shadow-sm flex gap-1 items-center">
            <span className="inline-block"><Settings size={10} /></span>
            Messages are generated by AI and may be inaccurate.
          </div>
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            imageCount={uploadedImages.length}
            onPublish={handlePublish}
            onEdit={handleEdit}
            onAddPhotos={handleAddPhotos}
            isPublishing={isPublishing}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white dark:bg-[#202c33] p-3 rounded-lg rounded-tl-none shadow-sm flex gap-1.5 items-center h-[38px]">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Images Gallery */}
      {uploadedImages.length > 0 && (
        <div className="px-3 pb-2">
          <ImageGallery
            images={uploadedImages}
            onRemove={handleRemoveImage}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-2 flex flex-col gap-2 z-20 min-h-[60px]">
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                disabled={isLoading}
                className="bg-white dark:bg-[#2a3942] text-sm px-4 py-1.5 rounded-full whitespace-nowrap text-[#008069] dark:text-[#00a884] font-medium border border-[#e9edef] dark:border-[#2a3942] hover:bg-gray-50 dark:hover:bg-[#323f49] shadow-sm transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {attachment && (
          <div className="flex items-center gap-3 p-2 bg-emerald-50 dark:bg-[#005c4b]/30 border border-emerald-200 dark:border-[#005c4b] rounded-lg mx-2 mb-1">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-[#005c4b] rounded-lg flex items-center justify-center">
              {attachment.type === 'image' ? <ImageIcon className="text-emerald-700 dark:text-emerald-100" size={20} /> : <FileText className="text-emerald-700 dark:text-emerald-100" size={20} />}
            </div>
            <div className="flex-1 text-sm text-gray-700 dark:text-gray-100 truncate">{attachment.name}</div>
            <button onClick={removeAttachment} className="p-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-[#005c4b] text-gray-500 dark:text-gray-300">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 mb-1">
          {/* Hidden file inputs */}
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/png, image/jpeg, application/pdf" />
          <input type="file" ref={imageInputRef} className="hidden" onChange={handlePropertyImageUpload} accept="image/*" multiple />

          {/* Plus / Attach Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-10 h-10 mb-0.5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Plus size={24} />
          </button>

          {/* Input Field */}
          <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl flex items-center min-h-[42px] px-4 py-1 shadow-sm">
            <input
              type="text"
              placeholder="Message"
              className="w-full bg-transparent border-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 text-[15px] p-0"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading}
              autoFocus
            />
            <div className="flex gap-2 ml-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><Paperclip size={20} className="rotate-45" /></button>
              <button onClick={handleAddPhotos} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" title="Add Property Photos">
                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
              </button>
            </div>
          </div>

          {/* Send / Mic Button */}
          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!inputText.trim() && !attachment)}
            className={`w-11 h-11 mb-0 flex items-center justify-center rounded-full transition-all text-white shadow-md ${inputText.trim() || attachment
              ? 'bg-[#008069] hover:bg-[#00a884]'
              : 'bg-[#008069] hover:bg-[#00a884]'
              } disabled:opacity-70 disabled:bg-gray-400`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : inputText.trim() || attachment ? <Send size={20} className="ml-1" /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;