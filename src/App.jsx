import React, { useState } from 'react';
import { Users, Calendar, Heart, MessageSquare, TrendingUp, Send, X } from 'lucide-react';

export default function FibroConnect() {
  const [activeTab, setActiveTab] = useState('community');
  const [painLevel, setPainLevel] = useState(1);
  const [fatigueLevel, setFatigueLevel] = useState(1);
  const [showComments, setShowComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  
  const [posts, setPosts] = useState([
    {
      id: 1,
      category: 'Daily Experiences',
      title: 'Tips for Managing Morning Stiffness',
      content: 'I have found that gentle stretching and a warm shower first thing in the morning really helps with the stiffness. Does anyone else have similar experiences?',
      author: 'TestUser123',
      date: '10/3/2025',
      likes: 1,
      liked: false,
      comments: []
    },
    {
      id: 2,
      category: 'Tips & Advice',
      title: 'Managing Fibro Flares During Winter',
      content: "I've found that keeping a consistent sleep schedule and using a heating pad really helps during cold weather flares. What works for you?",
      author: 'TestUser',
      date: '10/3/2025',
      likes: 1,
      liked: false,
      comments: [
        { id: 1, author: 'HelperUser', text: 'Great tip! I also use a weighted blanket.', date: '10/3/2025' }
      ]
    },
    {
      id: 3,
      category: 'Support & Encouragement',
      title: 'You are not alone in this journey',
      content: 'To everyone struggling today - remember that fibromyalgia does not define you. You are stronger than you think and this community is here for you. Take one day at a time, be gentle with yourself, and celebrate small victories. Sending gentle hugs to all! 💚',
      author: 'Community_Helper',
      date: '10/3/2025',
      likes: 0,
      liked: false,
      comments: []
    }
  ]);
  
  const [entries, setEntries] = useState([
    { date: '10/3/2025', pain: 6, fatigue: 7 },
    { date: '10/3/2025', pain: 7, fatigue: 8 },
    { date: '10/3/2025', pain: 7, fatigue: 8 }
  ]);
  
  const [activeFilter, setActiveFilter] = useState('All');
  const categories = ['All', 'Daily Experiences', 'Tips & Advice', 'Medication Discussion', 'Support & Encouragement'];

  const filteredPosts = activeFilter === 'All' 
    ? posts 
    : posts.filter(post => post.category === activeFilter);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId) => {
    if (!newComment.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now(),
            author: 'You',
            text: newComment,
            date: new Date().toLocaleDateString()
          }]
        };
      }
      return post;
    }));
    setNewComment('');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Daily Experiences': 'bg-blue-100 text-blue-700',
      'Tips & Advice': 'bg-green-100 text-green-700',
      'Medication Discussion': 'bg-purple-100 text-purple-700',
      'Support & Encouragement': 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with emergentagent.com style */}
      <header className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Fibro Connect</h1>
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
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5" />
            Community
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 py-3 px-6 font-medium transition-all border-b-2 ${
              activeTab === 'tracking'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-5 w-5" />
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Anonymous"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
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
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Share your experience, tips, or thoughts with the community..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Share Post
                </button>
              </div>
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
                        ? 'bg-green-600 text-white'
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
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">by {post.author}</span>
                    <span className="text-sm text-gray-400">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  
                  <div className="flex items-center gap-6 text-gray-500 border-t pt-4">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        post.liked ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                      className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-3 mb-4">
                        {post.comments.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
                        ) : (
                          post.comments.map(comment => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                                <span className="text-xs text-gray-400">{comment.date}</span>
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
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
              <TrendingUp className="mr-2 h-6 w-6" />
              Track Your Pain & Energy
            </h2>

            {/* Pain and Fatigue Sliders */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pain Level (1-10)
                </label>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={painLevel}
                      onChange={(e) => setPainLevel(e.target.value)}
                      className="flex-1 mx-3"
                    />
                  </div>
                  <p className="text-center text-2xl font-bold text-green-700">{painLevel} <span className="text-sm font-normal">Mild</span></p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fatigue Level (1-10)
                </label>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fatigueLevel}
                      onChange={(e) => setFatigueLevel(e.target.value)}
                      className="flex-1 mx-3"
                    />
                  </div>
                  <p className="text-center text-2xl font-bold text-orange-700">{fatigueLevel} <span className="text-sm font-normal">Low</span></p>
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g., Ibuprofen, Pregabalin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weather Impact
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option>Select weather impact</option>
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
                placeholder="e.g., stress, lack of sleep, physical activity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                rows="3"
                placeholder="How are you feeling today? Any additional observations?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              ></textarea>
            </div>

            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors mb-8">
              Record Entry
            </button>

            {/* Recent Entries */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Entries</h3>
              <div className="space-y-3">
                {entries.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">{entry.date}</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      Pain: {entry.pain}/10
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Fatigue: {entry.fatigue}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Made with Emergent</p>
      </footer>
    </div>
  );
}