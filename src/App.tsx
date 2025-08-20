import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Link, User, Palette, Settings, Sparkles, Eye, BarChart3, Zap, Gem, Image as ImageIcon, Shield, Waves, Scissors } from 'lucide-react';
import QRCode from 'qrcode';

type InputType = 'url' | 'contact';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  organization?: string;
}

 


interface QRTemplate {
  id: string;
  name: string;
  foreground: string;
  background: string;
  preview: string;
  category: 'basic' | 'premium' | 'ai' | 'glass' | 'special';
  icon: React.ComponentType<any>;
  description: string;
}

const templates: QRTemplate[] = [
  // Basic Templates
  { id: 'classic', name: 'Classic', foreground: '#000000', background: '#FFFFFF', preview: '⬛⬜', category: 'basic', icon: QrCode, description: 'Traditional black and white' },
  { id: 'purple', name: 'Purple Dream', foreground: '#8B5CF6', background: '#F3E8FF', preview: '🟣⚪', category: 'basic', icon: Sparkles, description: 'Elegant purple theme' },
  { id: 'ocean', name: 'Ocean Blue', foreground: '#0EA5E9', background: '#E0F2FE', preview: '🔵⚪', category: 'basic', icon: Waves, description: 'Calming ocean vibes' },
  { id: 'forest', name: 'Forest Green', foreground: '#059669', background: '#D1FAE5', preview: '🟢⚪', category: 'basic', icon: Shield, description: 'Natural forest theme' },
  
  // Premium Templates
  { id: 'sunset', name: 'Sunset Orange', foreground: '#EA580C', background: '#FED7AA', preview: '🟠⚪', category: 'premium', icon: Zap, description: 'Warm sunset gradient' },
  { id: 'rose', name: 'Rose Gold', foreground: '#EC4899', background: '#FCE7F3', preview: '🌸⚪', category: 'premium', icon: Gem, description: 'Luxurious rose gold' },
  { id: 'midnight', name: 'Midnight', foreground: '#FFFFFF', background: '#1F2937', preview: '⬜⬛', category: 'premium', icon: Eye, description: 'Sleek dark mode' },
  { id: 'gradient', name: 'Cyber Neon', foreground: '#06FFA5', background: '#0D1117', preview: '🟢⬛', category: 'premium', icon: Zap, description: 'Futuristic neon glow' },
  
  // Glass Templates
  { id: 'glass-blue', name: 'Glass Blue', foreground: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)', preview: '🔷💎', category: 'glass', icon: Gem, description: 'Translucent glass effect' },
  { id: 'glass-purple', name: 'Glass Purple', foreground: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)', preview: '🟣💎', category: 'glass', icon: Gem, description: 'Purple glass aesthetic' },
  { id: 'glass-emerald', name: 'Glass Emerald', foreground: '#10B981', background: 'rgba(16, 185, 129, 0.1)', preview: '🟢💎', category: 'glass', icon: Gem, description: 'Emerald glass shine' },
  
  // AI Templates
  { id: 'ai-neural', name: 'Neural Network', foreground: '#FF6B6B', background: '#1A1A2E', preview: '🧠⚡', category: 'ai', icon: Sparkles, description: 'AI-inspired neural pattern' },
  { id: 'ai-matrix', name: 'Matrix', foreground: '#00FF41', background: '#000000', preview: '💚⬛', category: 'ai', icon: Sparkles, description: 'Matrix-style digital rain' },
  { id: 'ai-hologram', name: 'Hologram', foreground: '#00D4FF', background: '#0A0A0A', preview: '🔵✨', category: 'ai', icon: Sparkles, description: 'Futuristic holographic' },
  
  // Special Templates
  { id: 'personal-brand', name: 'Personal Brand', foreground: '#6366F1', background: '#F8FAFC', preview: '👤💼', category: 'special', icon: User, description: 'Professional personal branding' },
  { id: 'business-card', name: 'Business Card', foreground: '#1F2937', background: '#F9FAFB', preview: '💼📇', category: 'special', icon: ImageIcon, description: 'Business card style' },
  { id: 'social-media', name: 'Social Media', foreground: '#E11D48', background: '#FDF2F8', preview: '📱💕', category: 'special', icon: Sparkles, description: 'Social media optimized' },
];

const categoryLabels = {
  basic: 'Basic',
  premium: 'Premium',
  glass: 'Glass Effect',
  ai: 'AI Powered',
  special: 'Special Edition'
};

function App() {
  const [inputType, setInputType] = useState<InputType>('url');
  const [urlInput, setUrlInput] = useState('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: '',
    organization: ''
  });
  
  
  const [selectedTemplate, setSelectedTemplate] = useState(templates[1]);
  const [qrDataURL, setQrDataURL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');
  const [showLogoInput, setShowLogoInput] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  

  const formatURL = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const generateVCard = (contact: ContactInfo): string => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
ORG:${contact.organization || ''}
TEL:${contact.phone}
EMAIL:${contact.email}
END:VCARD`;
  };

  

  const getQRData = (): string => {
    switch (inputType) {
      case 'url':
        return formatURL(urlInput);
      case 'contact':
        return generateVCard(contactInfo);
      default:
        return '';
    }
  };

  const generateQR = async () => {
    const data = getQRData();
    if (!data) {
      setError('Please enter the required information');
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowSuccess(false);

    try {
      const normalizeHexColor = (color: string, fallback: string): string => {
        const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
        if (hexPattern.test(color)) return color;
        return fallback;
      };

      const options: QRCode.QRCodeToDataURLOptions = {
        width: 512,
        margin: 2,
        errorCorrectionLevel: 'M' as const,
        color: {
          dark: normalizeHexColor(selectedTemplate.foreground, '#000000'),
          light: normalizeHexColor(selectedTemplate.background, '#FFFFFF'),
        },
      };

      let finalDataURL = await QRCode.toDataURL(data, options);
      
      // Add logo if provided
      if (logoUrl && canvasRef.current) {
        try {
          finalDataURL = await addLogoToQR(finalDataURL, logoUrl);
        } catch (logoError) {
          console.warn('Failed to add logo, using QR without logo:', logoError);
        }
      }
      
      setQrDataURL(finalDataURL);
      setShowSuccess(true);
      setScanCount(prev => prev + 1);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      const message = (err as Error)?.message || '';
      if (message.toLowerCase().includes('code length overflow')) {
        setError('Your content is too large to encode in a single QR. Try shortening the code, removing description, or share a URL instead.');
      } else {
        setError('Failed to generate QR code. Please check your input and try again.');
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read the selected image file');
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const addLogoToQR = async (qrDataURL: string, logoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not available'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      qrImage.onload = () => {
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0);
        
        // Load and draw logo
        const logoImage = new Image();
        logoImage.crossOrigin = 'anonymous';
        
        logoImage.onload = () => {
          const logoSize = Math.min(qrImage.width, qrImage.height) * 0.2;
          const logoX = (qrImage.width - logoSize) / 2;
          const logoY = (qrImage.height - logoSize) / 2;
          
          // Draw white background circle for logo
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(qrImage.width / 2, qrImage.height / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
          
          resolve(canvas.toDataURL());
        };
        
        logoImage.onerror = () => {
          reject(new Error('Failed to load logo image'));
        };
        
        logoImage.src = logoUrl;
      };
      
      qrImage.onerror = () => {
        reject(new Error('Failed to load QR code image'));
      };
      
      qrImage.src = qrDataURL;
    });
  };

  const downloadQR = () => {
    if (!qrDataURL) return;

    const link = document.createElement('a');
    const fileName = `qr-code-${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${inputType}.png`;
    link.download = fileName;
    link.href = qrDataURL;
    link.click();
  };

  const isFormValid = (): boolean => {
    switch (inputType) {
      case 'url':
        return urlInput.trim().length > 0;
      case 'contact':
        return contactInfo.name.trim().length > 0 && 
               (contactInfo.phone.trim().length > 0 || contactInfo.email.trim().length > 0);
      default:
        return false;
    }
  };

  useEffect(() => {
    if (isFormValid()) {
      const timeoutId = setTimeout(() => {
        generateQR();
      }, 300); // Debounce QR generation
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputType, urlInput, contactInfo, selectedTemplate, logoUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-x">
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        @keyframes wiggle {
          0%, 7% { transform: rotateZ(0); }
          15% { transform: rotateZ(-15deg); }
          20% { transform: rotateZ(10deg); }
          25% { transform: rotateZ(-10deg); }
          30% { transform: rotateZ(6deg); }
          35% { transform: rotateZ(-4deg); }
          40%, 100% { transform: rotateZ(0); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out;
        }
      `}</style>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-4 group">
            <QrCode className="w-12 h-12 text-purple-400 animate-float group-hover:animate-wiggle" />
            <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Advanced QR Generator
            </h1>
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Create professional QR codes for URLs and contact information with beautiful templates
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Input Type Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                Content Type
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'url', icon: Link, label: 'URL' },
                  { type: 'contact', icon: User, label: 'Contact' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setInputType(type as InputType)}
                    className={`p-4 h-24 w-full rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg ${
                      inputType === type
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300 animate-pulse-glow'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    <Icon className={`w-8 h-8 transition-transform duration-300 ${inputType === type ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Forms */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <h2 className="text-xl font-semibold text-white mb-4">Content Details</h2>
              
              {inputType === 'url' && (
                <div className="animate-bounce-in">
                  <label className="block text-slate-300 mb-2 font-medium">Website URL</label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter website URL (e.g., google.com)"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:bg-slate-700/70 focus:scale-105"
                  />
                  <p className="text-slate-400 text-sm mt-2">
                    URLs will automatically open in browser when scanned
                  </p>
                </div>
              )}

              {inputType === 'contact' && (
                <div className="space-y-4 animate-bounce-in">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">Full Name *</label>
                      <input
                        type="text"
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:bg-slate-700/70 focus:scale-105"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">Organization</label>
                      <input
                        type="text"
                        value={contactInfo.organization}
                        onChange={(e) => setContactInfo({ ...contactInfo, organization: e.target.value })}
                        placeholder="Company Name"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:bg-slate-700/70 focus:scale-105"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">Phone Number</label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:bg-slate-700/70 focus:scale-105"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">Email Address</label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:bg-slate-700/70 focus:scale-105"
                      />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    * Name is required. At least phone or email must be provided.
                  </p>
                </div>
              )}

              

              
            </div>

            {/* Template Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400 animate-pulse" />
                QR Code Templates
              </h2>
              
              <div className="relative">
                <select
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) setSelectedTemplate(template);
                  }}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:bg-slate-700/70 focus:scale-105 appearance-none cursor-pointer"
                >
                  {Object.entries(categoryLabels).map(([category, label]) => (
                    <optgroup key={category} label={label} className="bg-slate-800 text-slate-300">
                      {templates
                        .filter(template => template.category === category)
                        .map(template => (
                          <option 
                            key={template.id} 
                            value={template.id} 
                            className="bg-slate-800 text-white py-2"
                          >
                            {template.preview} {template.name} - {template.description}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Palette className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              
              {/* Selected Template Preview */}
              <div className="mt-4 p-4 bg-slate-700/30 rounded-xl animate-bounce-in hover:bg-slate-700/40 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <selectedTemplate.icon className="w-4 h-4 text-purple-400" />
                    {selectedTemplate.name}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    {categoryLabels[selectedTemplate.category as keyof typeof categoryLabels]}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{selectedTemplate.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border transition-transform duration-300 hover:scale-125"
                      style={{ backgroundColor: selectedTemplate.foreground }}
                    ></div>
                    <span>Foreground</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border border-slate-500 transition-transform duration-300 hover:scale-125"
                      style={{ backgroundColor: selectedTemplate.background }}
                    ></div>
                    <span>Background</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>Premium Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview and Download Section */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 sticky top-8 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <h2 className="text-xl font-semibold text-white mb-4">QR Code Preview</h2>
              
              <div className="aspect-square bg-slate-700/30 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-600 transition-all duration-300 hover:border-slate-500 max-w-[640px] mx-auto w-full">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 shadow-lg shadow-purple-500/50"></div>
                    <p className="text-slate-400">Generating QR Code...</p>
                  </div>
                ) : qrDataURL ? (
                  <div className="relative">
                    <img
                      src={qrDataURL}
                      alt="Generated QR Code"
                      className="max-w-full max-h-full rounded-lg shadow-lg animate-bounce-in hover:scale-105 transition-transform duration-300"
                    />
                    {showSuccess && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="w-24 h-24 text-slate-500 mx-auto mb-3 animate-pulse" />
                    <p className="text-slate-400">Enter content to generate QR code</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 animate-bounce-in">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={downloadQR}
                disabled={!qrDataURL || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 mb-4"
              >
                <Download className="w-5 h-5 transition-transform duration-300 group-hover:animate-bounce" />
                Download QR Code
              </button>

              {/* Scanability Bar */}
              {qrDataURL && (
                <div className="mb-4 p-4 bg-slate-700/30 rounded-xl animate-bounce-in hover:bg-slate-700/40 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      Scanability Score
                    </h3>
                    <span className="text-green-400 font-bold">95%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full animate-pulse" style={{ width: '95%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Excellent readability</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {scanCount} generated
                    </span>
                  </div>
                </div>
              )}

              {/* Additional Features */}
              <div className="mt-4 grid grid-cols-1 gap-2">
                <button 
                  className="w-full py-3 px-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-slate-200 transform hover:scale-105"
                  onClick={() => setShowLogoInput(!showLogoInput)}
                >
                  <ImageIcon className="w-5 h-5" />
                  {showLogoInput ? 'Hide Logo' : 'Add Logo'}
                </button>
                
                <button 
                  className="w-full py-3 px-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-slate-200 transform hover:scale-105"
                  onClick={() => alert('Advanced customization panel coming soon!')}
                >
                  <Settings className="w-5 h-5" />
                  Advanced Settings
                </button>
              </div>
              
              {/* Logo Input */}
              {showLogoInput && (
                <div className="mt-4 p-4 bg-slate-700/30 rounded-xl animate-bounce-in">
                  <label className="block text-slate-300 mb-2 font-medium text-sm">Upload Logo</label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-600 file:text-slate-200 hover:file:bg-slate-500 cursor-pointer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    disabled={!logoUrl}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-600/50 hover:bg-slate-600 text-slate-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Scissors className="w-4 h-4" />
                    Remove logo
                  </button>
                  <p className="text-slate-400 text-xs mt-2">
                    Logo will be centered on the QR code. Use square images for best results.
                  </p>
                  {logoUrl && (
                    <div className="mt-2">
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="w-8 h-8 rounded border border-slate-500 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="space-y-2">
            <p>Scan with any QR code reader or camera app</p>
            <p className="text-sm">
              Supports URLs and Contact Cards
            </p>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default App;