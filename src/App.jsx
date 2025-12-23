import React, { useState, useEffect } from 'react';
import { Users, Calendar, Heart, MessageSquare, TrendingUp, Send, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState('community');
  const [painLevel, setPainLevel] = useState(1);
  const [fatigueLevel, setFatigueLevel] = useState(1);
  const [showComments, setShowComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth states
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Post form states
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postAuthorName, setPostAuthorName] = useState('');
  const [postsLoading, setPostsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [painPulse, setPainPulse] = useState(false);
  const [fatiguePulse, setFatiguePulse] = useState(false);
  
  const [posts, setPosts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [medication, setMedication] = useState('');
  const [weatherImpact, setWeatherImpact] = useState('');
  const [triggers, setTriggers] = useState('');
  const [notes, setNotes] = useState('');

  const categories = ['All', 'Daily Experiences', 'Tips & Advice', 'Medication Discussion', 'Support & Encouragement'];

  // Check for existing session
  useEffect(() => {
    if (!supabase) {
      // No supabase configured — render app in degraded/read-only mode
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Theme init
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) {
        setTheme(saved);
        if (saved === 'dark') document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Load posts from Supabase
  useEffect(() => {
    loadPosts();
  }, []);

  // Load pain entries for logged-in user (runs when loadPainEntries reference changes)

  const loadPosts = async () => {
    setPostsLoading(true);
    if (!supabase) {
      // degrade gracefully when no backend is configured
      setPosts([]);
      setPostsLoading(false);
      return;
    }

    const { error, data } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setPostsLoading(false);
  };

  const loadPainEntries = React.useCallback(async () => {
    if (!user || !supabase) return;

    const { data, error } = await supabase
      .from('pain_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading entries:', error);
    } else {
      setEntries(data || []);
    }
  }, [user]);

  const ensureSupabase = () => {
    if (!supabase) {
      alert('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and redeploy.');
      return false;
    }
    return true;
  };

  useEffect(() => {
    loadPainEntries();
  }, [loadPainEntries]);

  // small visual pulse when levels change
  useEffect(() => {
    setPainPulse(true);
    const t = setTimeout(() => setPainPulse(false), 220);
    return () => clearTimeout(t);
  }, [painLevel]);

  useEffect(() => {
    setFatiguePulse(true);
    const t = setTimeout(() => setFatiguePulse(false), 220);
    return () => clearTimeout(t);
  }, [fatigueLevel]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!ensureSupabase()) return;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for confirmation link!');
      setShowAuth(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!ensureSupabase()) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      setShowAuth(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleSignOut = async () => {
    if (!ensureSupabase()) return;

    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!postTitle.trim() || !postContent.trim()) {
      alert('Please fill in title and content');
      return;
    }

    if (!ensureSupabase()) return;

    const { error } = await supabase
      .from('posts')
      .insert([{
        title: postTitle,
        content: postContent,
        category: postCategory,
        author_id: user?.id || null,
        author_name: postAuthorName,
        likes: 0
      }]);

    if (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    } else {
      setPostTitle('');
      setPostContent('');
      setPostAuthorName('');
      loadPosts();
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert('Please sign in to like posts');
      return;
    }

    if (!ensureSupabase()) return;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      await supabase.rpc('decrement_likes', { post_id: postId });
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: user.id }]);
      
      await supabase.rpc('increment_likes', { post_id: postId });
    }

    loadPosts();
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!ensureSupabase()) return;

    const { error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        author_id: user.id,
        author_name: user.email.split('@')[0],
        text: newComment
      }]);

    if (error) {
      console.error('Error adding comment:', error);
    } else {
      setNewComment('');
      loadPosts();
    }
  };

  const handleRecordPainEntry = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to record pain entries');
      return;
    }

    if (!ensureSupabase()) return;

    const { error } = await supabase
      .from('pain_entries')
      .insert([{
        user_id: user.id,
        pain_level: parseInt(painLevel),
        fatigue_level: parseInt(fatigueLevel),
        medication,
        weather_impact: weatherImpact,
        triggers,
        notes
      }]);

    if (error) {
      console.error('Error recording entry:', error);
      alert('Error recording entry');
    } else {
      alert('Pain entry recorded!');
      setPainLevel(1);
      setFatigueLevel(1);
      setMedication('');
      setWeatherImpact('');
      setTriggers('');
      setNotes('');
      loadPainEntries();
    }
  };

  const filteredPosts = activeFilter === 'All' 
    ? posts 
    : posts.filter(post => post.category === activeFilter);

  const getCategoryColor = (category) => {
    const colors = {
      'Daily Experiences': 'bg-blue-100 text-blue-700',
      'Tips & Advice': 'bg-teal-50 text-teal-700',
      'Medication Discussion': 'bg-purple-100 text-purple-700',
      'Support & Encouragement': 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getSeverityClasses = (value) => {
    const v = Number(value);
    if (v <= 3) {
      return {
        container: 'bg-teal-50 border-teal-200',
        dot: 'bg-teal-600',
        text: 'text-teal-700',
        hex: '#0d9488'
      };
    }
    if (v <= 7) {
      return {
        container: 'bg-sky-50 border-sky-200',
        dot: 'bg-sky-600',
        text: 'text-sky-700',
        hex: '#0284c7'
      };
    }
    return {
      container: 'bg-rose-50 border-rose-200',
      dot: 'bg-rose-600',
      text: 'text-rose-700',
      hex: '#e11d48'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {!isSupabaseConfigured && (
        <div className="mx-auto max-w-6xl p-4">
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-yellow-800 flex items-start gap-3">
            <div className="font-medium">Supabase not configured — app running in degraded mode.</div>
            <div className="text-sm">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your deployment environment (e.g., Vercel) and redeploy to enable full functionality.</div>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4" role="dialog" aria-modal="true" aria-labelledby="authTitle">
              <h2 id="authTitle" className="text-2xl font-bold mb-4">{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
              <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}>
                <label htmlFor="authEmail" className="sr-only">Email</label>
                <input
                  id="authEmail"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-teal-400"
                  required
                  aria-required="true"
                />
                <label htmlFor="authPassword" className="sr-only">Password</label>
                <input
                  id="authPassword"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-400"
                  required
                  aria-required="true"
                />
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 mb-3"
              >
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="w-full text-teal-600 hover:underline mb-2"
              >
                {authMode === 'signin' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="w-full text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-4">
            <div className="w-32"></div>
            <h1 className="text-4xl font-bold text-gray-900">Fibro Connect</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-teal-300" /> : <Moon className="h-5 w-5 text-teal-600" />}
              </button>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  <LogOut className="h-4 w-4 text-teal-600" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <LogIn className="h-4 w-4 text-white" />
                  Sign In
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-center">A supportive community for sharing experiences and tracking wellness</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 py-3 px-6 font-medium transition-all border-b-2 ${
                  activeTab === 'community'
                    ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5 text-teal-600 dark:text-teal-300" />
            Community
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 py-3 px-6 font-medium transition-all border-b-2 ${
                  activeTab === 'tracking'
                    ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-300" />
            Pain Tracking
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'community' ? (
          <div className="space-y-6">
            {/* Share Post Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <span className="mr-2">+</span> Share Your Thoughts
              </h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={postAuthorName}
                      onChange={(e) => setPostAuthorName(e.target.value)}
                      placeholder="Anonymous"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select 
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                    >
                      <option value="" disabled>Select a category (optional)</option>
                      <option>Daily Experiences</option>
                      <option>Tips & Advice</option>
                      <option>Medication Discussion</option>
                      <option>Support & Encouragement</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">{postTitle.length}/100</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    rows="4"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your experience, tips, or thoughts with the community..."
                    maxLength={2000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                    required
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">{postContent.length}/2000</div>
                </div>
                <button 
                  type="submit"
                  disabled={!postTitle.trim() || !postContent.trim()}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${postTitle.trim() && postContent.trim() ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  Share Post
                </button>
              </form>
            </div>

            {/* Filter Categories */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Filter by category:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === category
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {postsLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No posts yet. Be the first to share!</p>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">by {post.author_name || 'Anonymous'}</span>
                      <span className="text-sm text-gray-400">{formatDate(post.created_at)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    
                    <div className="flex items-center gap-6 text-gray-500 border-t pt-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                        <span>{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                        className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>

                    {showComments === post.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-3 mb-4">
                          {(!post.comments || post.comments.length === 0) ? (
                            <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
                          ) : (
                            post.comments.map(comment => (
                              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">{comment.author_name || 'Anonymous'}</span>
                                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500 text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                          >
                            <Send className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
              <TrendingUp className="mr-2 h-6 w-6" />
              Track Your Pain & Energy
            </h2>

            <form onSubmit={handleRecordPainEntry}>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pain Level (1-10)
                  </label>
                  {(() => {
                    const s = getSeverityClasses(painLevel);
                    return (
                      <div className={`${s.container} rounded-lg p-4 border ${s.container.includes('border-') ? '' : ''}`}>
                        <div className="flex items-center mb-2">
                          <div className={`w-3 h-3 ${s.dot} rounded-full`}></div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={painLevel}
                            onChange={(e) => setPainLevel(Number(e.target.value))}
                            className="flex-1 mx-3"
                            style={{accentColor: s.hex, '--accent': s.hex}}
                          />
                        </div>
                        <p className={`text-center text-2xl font-bold ${s.text} ${painPulse ? 'scale-105' : 'scale-100'} transition-transform duration-150`}>{painLevel}</p>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fatigue Level (1-10)
                  </label>
                  {(() => {
                    const s = getSeverityClasses(fatigueLevel);
                    return (
                      <div className={`${s.container} rounded-lg p-4 border ${s.container.includes('border-') ? '' : ''}`}>
                        <div className="flex items-center mb-2">
                          <div className={`w-3 h-3 ${s.dot} rounded-full`}></div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={fatigueLevel}
                            onChange={(e) => setFatigueLevel(Number(e.target.value))}
                            className="flex-1 mx-3"
                            style={{accentColor: s.hex, '--accent': s.hex}}
                          />
                        </div>
                        <p className={`text-center text-2xl font-bold ${s.text} ${fatiguePulse ? 'scale-105' : 'scale-100'} transition-transform duration-150`}>{fatigueLevel}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Taken
                  </label>
                  <input
                    type="text"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    placeholder="e.g., Ibuprofen, Pregabalin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weather Impact
                  </label>
                  <select 
                    value={weatherImpact}
                    onChange={(e) => setWeatherImpact(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                  >
                    <option value="">Select weather impact</option>
                    <option>Cold made it worse</option>
                    <option>Humidity affected me</option>
                    <option>Weather had no effect</option>
                    <option>Sunny day helped</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triggers
                </label>
                <input
                  type="text"
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  placeholder="e.g., stress, lack of sleep, physical activity"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling today? Any additional observations?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors mb-8"
              >
                Record Entry
              </button>
            </form>

            {user && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Entries</h3>
                <div className="space-y-3">
                  {entries.length === 0 ? (
                    <p className="text-gray-500 text-sm">No entries yet. Record your first one above!</p>
                  ) : (
                    entries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-600 font-medium">{formatDate(entry.created_at)}</span>
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                          Pain: {entry.pain_level}/10
                        </span>
                        <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                          Fatigue: {entry.fatigue_level}/10
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Made with love!</p>
      </footer>
    </div>
  );
}

export default App;
