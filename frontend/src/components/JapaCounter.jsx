import React, { useState, useEffect } from 'react';
import { Plus, Award, TrendingUp, Calendar, Users } from 'lucide-react';

// Translation helper
const translations = {
  hi: {
    title: 'जप माला काउंटर',
    addMala: 'एक माला जोड़ें',
    todayCount: 'आज की गिनती',
    malas: 'माला',
    totalCount: 'कुल माला',
    currentStreak: 'लगातार दिन',
    days: 'दिन',
    familyRank: 'परिवार में स्थान',
    myStats: 'मेरी गिनती',
    leaderboard: 'लीडरबोर्ड',
    family: 'परिवार',
    global: 'सभी',
    thisWeek: 'इस सप्ताह',
    thisMonth: 'इस महीने',
    allTime: 'कुल',
    vibrationOn: 'कंपन चालू',
    soundOn: 'आवाज़ चालू'
  },
  en: {
    title: 'Japa Mala Counter',
    addMala: 'Add One Mala',
    todayCount: 'Today\'s Count',
    malas: 'Malas',
    totalCount: 'Total Malas',
    currentStreak: 'Current Streak',
    days: 'Days',
    familyRank: 'Family Rank',
    myStats: 'My Statistics',
    leaderboard: 'Leaderboard',
    family: 'Family',
    global: 'Global',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    allTime: 'All Time',
    vibrationOn: 'Vibration On',
    soundOn: 'Sound On'
  }
};

const JapaCounter = () => {
  // State management
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('hi');
  const [vibration, setVibration] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState({
    total_japa_count: 0,
    current_streak: 0,
    malas_this_week: 0,
    malas_this_month: 0
  });

  const t = translations[lang];

  // Load data on mount
  useEffect(() => {
    loadTodayCount();
    loadStats();
    loadRank();
  }, []);

  // Vibration feedback
  const triggerVibration = () => {
    if (vibration && 'vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
  };

  // Sound feedback (simple beep)
  const playSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // API calls (mock for demo - replace with actual API)
  const loadTodayCount = async () => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/japa/today', { headers: { Authorization: `Bearer ${token}` }});
    // const data = await response.json();
    setCount(0); // Mock data
  };

  const loadStats = async () => {
    // TODO: Replace with actual API call
    setStats({
      total_japa_count: 1248,
      current_streak: 7,
      malas_this_week: 21,
      malas_this_month: 84
    });
    setTotalCount(1248);
    setStreak(7);
  };

  const loadRank = async () => {
    // TODO: Replace with actual API call
    setRank(3);
  };

  // Increment counter
  const handleIncrement = async () => {
    try {
      setLoading(true);
      triggerVibration();
      playSound();
      
      // Optimistic update
      setCount(count + 1);
      setTotalCount(totalCount + 1);
      
      // TODO: API call
      // await fetch('/api/japa/increment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ family_id: selectedFamily })
      // });
      
    } catch (error) {
      console.error('Failed to increment:', error);
      // Revert on error
      setCount(count);
      setTotalCount(totalCount);
    } finally {
      setLoading(false);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async (type = 'family') => {
    // TODO: Replace with actual API call
    const mockData = [
      { name: 'राधा देवी', spiritual_name: 'Radha Devi', total_malas: 156, profile_photo: null },
      { name: 'कृष्ण दास', spiritual_name: 'Krishna Das', total_malas: 142, profile_photo: null },
      { name: 'गोपाल जी', spiritual_name: 'Gopal Ji', total_malas: 128, profile_photo: null },
      { name: 'श्याम सुंदर', spiritual_name: 'Shyam Sundar', total_malas: 98, profile_photo: null }
    ];
    setLeaderboardData(mockData);
    setShowLeaderboard(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-orange-900">{t.title}</h1>
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="px-4 py-2 bg-white rounded-lg shadow text-sm font-medium"
          >
            {lang === 'hi' ? 'English' : 'हिंदी'}
          </button>
        </div>
      </div>

      {/* Main Counter Card */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Today's Count Display */}
          <div className="text-center mb-8">
            <p className="text-xl text-gray-600 mb-2">{t.todayCount}</p>
            <div className="text-8xl font-bold text-orange-600 mb-4" style={{ fontFamily: 'monospace' }}>
              {count}
            </div>
            <p className="text-2xl text-gray-700">{t.malas}</p>
          </div>

          {/* Giant Add Button */}
          <button
            onClick={handleIncrement}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl py-8 text-3xl font-bold shadow-lg transform active:scale-95 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-4"
            style={{ minHeight: '120px' }}
          >
            <Plus size={48} />
            {t.addMala}
          </button>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <TrendingUp className="mx-auto mb-2 text-orange-600" size={32} />
              <p className="text-3xl font-bold text-orange-700">{totalCount}</p>
              <p className="text-sm text-gray-600 mt-1">{t.totalCount}</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Calendar className="mx-auto mb-2 text-orange-600" size={32} />
              <p className="text-3xl font-bold text-orange-700">{streak}</p>
              <p className="text-sm text-gray-600 mt-1">{t.currentStreak}</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Award className="mx-auto mb-2 text-orange-600" size={32} />
              <p className="text-3xl font-bold text-orange-700">#{rank || '-'}</p>
              <p className="text-sm text-gray-600 mt-1">{t.familyRank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={28} />
            {t.myStats}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-4xl font-bold text-blue-700">{stats.malas_this_week}</p>
              <p className="text-lg text-gray-600 mt-1">{t.thisWeek}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-4xl font-bold text-green-700">{stats.malas_this_month}</p>
              <p className="text-lg text-gray-600 mt-1">{t.thisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Button */}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => loadLeaderboard('family')}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl py-6 text-2xl font-bold shadow-lg flex items-center justify-center gap-3"
        >
          <Users size={32} />
          {t.leaderboard}
        </button>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">{t.leaderboard}</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-4xl text-gray-500 hover:text-gray-700 w-12 h-12 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
              {leaderboardData.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl"
                >
                  {/* Rank */}
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold">
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.spiritual_name}</p>
                  </div>

                  {/* Count */}
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">{member.total_malas}</p>
                    <p className="text-sm text-gray-600">{t.malas}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded-xl shadow">
        <div className="flex items-center justify-around text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vibration}
              onChange={(e) => setVibration(e.target.checked)}
              className="w-6 h-6"
            />
            <span className="text-lg">{t.vibrationOn}</span>
          </label>
        </div>
      </div>

      {/* Jai Shri Krishna Footer */}
      <div className="text-center mt-8 text-2xl text-orange-700 font-bold">
        🙏 जय श्री कृष्ण 🙏
      </div>
    </div>
  );
};

export default JapaCounter;