import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import type { SocialMedia, Brand, CreateContactSubmissionInput } from '../../server/src/schema';
import './App.css';

// Icons for social media platforms
const SocialIcons: Record<string, string> = {
  twitch: '🎮',
  youtube: '📺',
  tiktok: '🎵',
  x: '🐦',
  bluesky: '☁️',
  instagram: '📷',
  discord: '💬',
  spotify: '🎧'
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Contact form state
  const [contactForm, setContactForm] = useState<CreateContactSubmissionInput>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Load data on mount
  const loadSocialMedia = useCallback(async () => {
    try {
      const result = await trpc.getSocialMedia.query();
      setSocialMedia(result);
    } catch (error) {
      console.error('Failed to load social media:', error);
      // Using stub data since handlers are placeholders
      setSocialMedia([
        { id: 1, platform: 'twitch', username: 'swaybaechaos', url: 'https://twitch.tv/swaybaechaos', icon_url: null, is_active: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
        { id: 2, platform: 'youtube', username: 'Sway Bae', url: 'https://youtube.com/@swaybaechaos', icon_url: null, is_active: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
        { id: 3, platform: 'tiktok', username: '@swaybaechaos', url: 'https://tiktok.com/@swaybaechaos', icon_url: null, is_active: true, display_order: 3, created_at: new Date(), updated_at: new Date() },
        { id: 4, platform: 'x', username: '@swaybaechaos', url: 'https://x.com/swaybaechaos', icon_url: null, is_active: true, display_order: 4, created_at: new Date(), updated_at: new Date() },
        { id: 5, platform: 'bluesky', username: 'swaybaechaos', url: 'https://bsky.app/profile/swaybaechaos', icon_url: null, is_active: true, display_order: 5, created_at: new Date(), updated_at: new Date() },
        { id: 6, platform: 'instagram', username: '@swaybaechaos', url: 'https://instagram.com/swaybaechaos', icon_url: null, is_active: true, display_order: 6, created_at: new Date(), updated_at: new Date() },
        { id: 7, platform: 'discord', username: 'Chaos Crew', url: 'https://discord.gg/swaybaechaos', icon_url: null, is_active: true, display_order: 7, created_at: new Date(), updated_at: new Date() },
        { id: 8, platform: 'spotify', username: 'Sway Bae Playlists', url: 'https://open.spotify.com/user/swaybaechaos', icon_url: null, is_active: true, display_order: 8, created_at: new Date(), updated_at: new Date() }
      ]);
    }
  }, []);

  const loadBrands = useCallback(async () => {
    try {
      const result = await trpc.getBrands.query();
      setBrands(result);
    } catch (error) {
      console.error('Failed to load brands:', error);
      // Using stub data since handlers are placeholders
      setBrands([
        { id: 1, name: 'YouTube', logo_url: 'https://via.placeholder.com/120x60?text=YouTube', website_url: 'https://youtube.com', partnership_type: 'platform', is_active: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'GCX', logo_url: 'https://via.placeholder.com/120x60?text=GCX', website_url: 'https://gcxevent.com', partnership_type: 'sponsor', is_active: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
        { id: 3, name: 'HelloFresh', logo_url: 'https://via.placeholder.com/120x60?text=HelloFresh', website_url: 'https://hellofresh.com', partnership_type: 'affiliate', is_active: true, display_order: 3, created_at: new Date(), updated_at: new Date() },
        { id: 4, name: 'Twitch', logo_url: 'https://via.placeholder.com/120x60?text=Twitch', website_url: 'https://twitch.tv', partnership_type: 'platform', is_active: true, display_order: 4, created_at: new Date(), updated_at: new Date() },
        { id: 5, name: '1000 Dreams Fund', logo_url: 'https://via.placeholder.com/120x60?text=1000Dreams', website_url: 'https://1000dreamsfund.org', partnership_type: 'sponsor', is_active: true, display_order: 5, created_at: new Date(), updated_at: new Date() },
        { id: 6, name: 'Supergirl Gamer Pro', logo_url: 'https://via.placeholder.com/120x60?text=SupergirlGP', website_url: 'https://supergirlgamerpro.com', partnership_type: 'collaboration', is_active: true, display_order: 6, created_at: new Date(), updated_at: new Date() },
        { id: 7, name: 'Blizzard', logo_url: 'https://via.placeholder.com/120x60?text=Blizzard', website_url: 'https://blizzard.com', partnership_type: 'sponsor', is_active: true, display_order: 7, created_at: new Date(), updated_at: new Date() },
        { id: 8, name: 'Dreamhack', logo_url: 'https://via.placeholder.com/120x60?text=Dreamhack', website_url: 'https://dreamhack.com', partnership_type: 'collaboration', is_active: true, display_order: 8, created_at: new Date(), updated_at: new Date() }
      ]);
    }
  }, []);

  useEffect(() => {
    loadSocialMedia();
    loadBrands();
    // Set theme based on user preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [loadSocialMedia, loadBrands]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await trpc.createContactSubmission.mutate({
        ...contactForm,
        ip_address: null,
        user_agent: navigator.userAgent
      });
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSocialMedia = socialMedia.filter(social => social.is_active).sort((a, b) => a.display_order - b.display_order);
  const activeBrands = brands.filter(brand => brand.is_active).sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="hero-bg relative min-h-screen flex items-center justify-center text-white overflow-hidden chaos-pattern">
        <div className="container mx-auto px-4 text-center z-10">
          <div className="floating">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              Sway Bae 🎮
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-4">
              Creator of Chaos ✨
            </p>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Welcome to the wildest corner of the internet! 🎉 Join the chaos crew for gaming, laughs, and unforgettable moments!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 py-4 pulse-glow"
                onClick={() => document.getElementById('socials')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join the Chaos! 🚀
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-4"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More 📖
              </Button>
            </div>
          </div>
          {/* Video Background Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-full bg-black/20 flex items-center justify-center">
              <p className="text-white/60 text-lg">🎬 Video Background Placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">About the Chaos Creator</span> 🎨
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="card-hover bg-gradient-to-br from-blue-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 border-0">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                      Hey there, Chaos Crew! 👋
                    </h3>
                    <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                      I'm Sway Bae, your friendly neighborhood content creator and professional chaos coordinator! 🎪 
                      When I'm not streaming epic gaming sessions, I'm building the most wholesome and fun community on the internet.
                    </p>
                    <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                      My streams are all about bringing people together through gaming, laughter, and creating unforgettable memories. 
                      Whether we're conquering virtual worlds or just chatting about life, there's always room for more chaos in our crew! 💝
                    </p>
                    <div className="flex flex-wrap gap-2 mt-6">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Gaming 🎮</Badge>
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">Community 👥</Badge>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Fun Times ✨</Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Streaming 📡</Badge>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-200 via-pink-200 to-yellow-200 dark:from-blue-800 dark:via-pink-800 dark:to-yellow-800 rounded-full flex items-center justify-center text-6xl">
                      🎭
                    </div>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Profile photo placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Socials Section */}
      <section id="socials" className="py-20 bg-gradient-to-r from-blue-50 via-pink-50 to-yellow-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Connect with the Chaos</span> 🌐
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Follow me across the digital universe! 🚀
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {activeSocialMedia.map((social: SocialMedia) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="card-hover bg-white dark:bg-slate-800 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 social-icon">
                      {SocialIcons[social.platform] || '📱'}
                    </div>
                    <h3 className="font-semibold text-sm capitalize mb-1 text-gray-900 dark:text-white">
                      {social.platform}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {social.username}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Brand Partnerships</span> 🤝
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Proud to work with these amazing brands! ✨
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {activeBrands.map((brand: Brand) => (
              <a
                key={brand.id}
                href={brand.website_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="card-hover bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-600">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 flex items-center justify-center mb-3">
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {brand.name}
                    </h3>
                    {brand.partnership_type && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {brand.partnership_type}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-pink-50 dark:from-slate-800 dark:to-red-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">YouTube Adventures</span> 📺
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Subscribe for epic gaming content, tutorials, and behind-the-scenes chaos! 🎬
            </p>
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-lg px-8 py-4"
              onClick={() => window.open('https://youtube.com/@swaybaechaos', '_blank')}
            >
              Subscribe to My Channel 🔔
            </Button>
          </div>
        </div>
      </section>

      {/* Twitter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Twitter Updates</span> 🐦
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Follow me on X for real-time updates, random thoughts, and community interactions! 💭
            </p>
            <Button 
              size="lg" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg px-8 py-4"
              onClick={() => window.open('https://x.com/swaybaechaos', '_blank')}
            >
              Follow me on X 🚀
            </Button>
          </div>
        </div>
      </section>

      {/* Merch Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Chaos Merch</span> 👕
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Wear your chaos with pride! Get exclusive Sway Bae merchandise and rep the crew! 🛍️
            </p>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg px-8 py-4"
              onClick={() => window.open('#', '_blank')}
            >
              Shop Merch Store 🛒
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              (Link to external merch store)
            </p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Card className="coming-soon bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-yellow-900 border-2 border-dashed border-yellow-300 dark:border-yellow-600">
              <CardContent className="p-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="gradient-text">Chaos Chronicles</span> 📝
                </h2>
                <div className="text-6xl mb-6">🚧</div>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  Coming Soon! Get ready for behind-the-scenes stories, gaming tips, and more chaos! ✨
                </p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-lg px-4 py-2">
                  Under Construction 🔨
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Get in Touch</span> 💌
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Have a question, collaboration idea, or just want to say hi? Drop me a message! 📬
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Send a Message 📮
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="Your Name ✨"
                        value={contactForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactForm((prev: CreateContactSubmissionInput) => ({ ...prev, name: e.target.value }))
                        }
                        required
                        className="text-base"
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Your Email 📧"
                        value={contactForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactForm((prev: CreateContactSubmissionInput) => ({ ...prev, email: e.target.value }))
                        }
                        required
                        className="text-base"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Subject 📝"
                    value={contactForm.subject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setContactForm((prev: CreateContactSubmissionInput) => ({ ...prev, subject: e.target.value }))
                    }
                    required
                    className="text-base"
                  />
                  <Textarea
                    placeholder="Your Message 💭"
                    value={contactForm.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContactForm((prev: CreateContactSubmissionInput) => ({ ...prev, message: e.target.value }))
                    }
                    required
                    rows={6}
                    className="text-base resize-none"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg py-6"
                  >
                    {isSubmitting ? 'Sending... 📤' : 'Send Message 🚀'}
                  </Button>
                  {submitStatus === 'success' && (
                    <div className="text-center text-green-600 dark:text-green-400 font-semibold">
                      ✅ Message sent successfully! I'll get back to you soon! 
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="text-center text-red-600 dark:text-red-400 font-semibold">
                      ❌ Failed to send message. Please try again later.
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text">Sway Bae - Creator of Chaos</span> 🎮
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Thanks for visiting! Remember to stay chaotic, stay awesome, and keep spreading those good vibes! ✨
            </p>
          </div>
          <Separator className="mb-8 bg-gray-700" />
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {activeSocialMedia.slice(0, 4).map((social: SocialMedia) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {SocialIcons[social.platform] || '📱'} {social.platform}
              </a>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Sway Bae - Creator of Chaos. All rights reserved. Made with 💝 and lots of ☕
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;