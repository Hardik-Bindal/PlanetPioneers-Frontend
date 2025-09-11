// app.js - shared frontend logic
const API_BASE = 'https://planetpioneers-backend-1.onrender.com/api';
 // change if deployed

// ---------- Auth helpers ----------
function getToken(){ return localStorage.getItem('pp_token'); }
function setToken(t){ localStorage.setItem('pp_token', t); }
function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('pp_user')||'null'); }catch(e){return null} }
function getCurrentUserId(){ const u=getCurrentUser(); return u? u._id:null; }

// attach token to headers
function authHeaders(){
  const token = getToken();
  return token 
    ? { 'Authorization': 'Bearer '+token, 'Content-Type':'application/json' } 
    : { 'Content-Type':'application/json' };
}

// ---------- API wrappers ----------
// always return { error } or { data }

async function apiRegister(payload){
  try{
    const r = await fetch(`${API_BASE}/auth/register`, { 
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) 
    });
    const data = await r.json();
    if(!r.ok) return { error: data.message || data.error || 'Register failed' };
    return { user:data.user, token:data.token };
  }catch(e){ return { error: e.message } }
}

async function apiLogin(payload, cb){
  try{
    const r = await fetch(`${API_BASE}/auth/login`, { 
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) 
    });
    const data = await r.json();
    if(!r.ok){ cb && cb(data.message || data.error || 'Login failed'); return { error:data.message||'Login failed' }; }
    
    // save token & user
    setToken(data.token);
    localStorage.setItem('pp_user', JSON.stringify(data.user));
    cb && cb(null, data);
    return { user:data.user, token:data.token };
  }catch(e){ cb && cb(e.message); return { error:e.message } }
}

async function apiGetProfile(){
  try{
    const r = await fetch(`${API_BASE}/auth/profile`, { headers: authHeaders() });
    const data = await r.json();
    if(!r.ok) return { error:data.message || data.error || 'Not authenticated' };
    // keep profile in sync
    localStorage.setItem('pp_user', JSON.stringify(data.user));
    return { user:data.user };
  }catch(e){ return { error:e.message } }
}

// ---------- Quizzes ----------
async function apiCreateQuiz(payload){
  try{
    const r = await fetch(`${API_BASE}/quiz`, { method:'POST', headers: authHeaders(), body: JSON.stringify(payload) });
    const data = await r.json();
    if(!r.ok) return { error:data.message || data.error || 'Create quiz failed' };
    return { quiz: data.quiz || data };
  }catch(e){ return { error: e.message } }
}

async function apiCreateAIQuiz({topic,difficulty,numQuestions}){
  try{
    const r = await fetch(`${API_BASE}/quiz/ai`, { method:'POST', headers: authHeaders(), body: JSON.stringify({ topic, difficulty, numQuestions })});
    const data = await r.json();
    if(!r.ok) return { error:data.message || data.error || 'AI quiz failed' };
    return { quiz: data.quiz || data };
  }catch(e){ return { error: e.message } }
}

async function apiGetQuizzes(){
  try{
    const r = await fetch(`${API_BASE}/quiz`, { headers: authHeaders() });
    const data = await r.json();
    if(!r.ok) return { error:data.message || data.error || 'Fetch quizzes failed' };
    return { quizzes: Array.isArray(data) ? data : (data.quizzes || []) };
  }catch(e){ return { error: e.message } }
}

async function apiGetQuiz(id){
  try{
    const r = await fetch(`${API_BASE}/quiz/${id}`, { headers: authHeaders() });
    const data = await r.json();
    if(!r.ok) return { error:data.message || data.error || 'Fetch quiz failed' };
    return { quiz: data.quiz || data };
  }catch(e){ return { error: e.message } }
}

// ---------- Results ----------
async function apiAttemptQuiz(quizId, payload){
  try{
    const r = await fetch(`${API_BASE}/results/${quizId}/attempt`, { method:'POST', headers: authHeaders(), body: JSON.stringify(payload) });
    const data = await r.json();
    if(!r.ok) return { error: data.message || data.error || 'Attempt failed' };
    return { result: data.result, score: data.score, ecoPoints: data.ecoPoints };
  }catch(e){ return { error: e.message } }
}

async function apiGetMyResults(){
  try{
    const r = await fetch(`${API_BASE}/results/my-results`, { headers: authHeaders() });
    const data = await r.json();
    if(!r.ok) return { error:data.message || data.error || 'Get results failed' };
    return Array.isArray(data) ? data : (data.results || []);
  }catch(e){ return { error: e.message } }
}

async function apiGetQuizResults(quizId){
  try{
    const r = await fetch(`${API_BASE}/results/${quizId}/results`, { headers: authHeaders() });
    const data = await r.json();
    if(!r.ok) return { error:data.message|| data.error || 'Get quiz results failed' };
    return Array.isArray(data) ? data : (data.results || []);
  }catch(e){ return { error: e.message } }
}

async function apiGetLeaderboard(){
  try{
    const r = await fetch(`${API_BASE}/results/leaderboard`, { headers: authHeaders()});
    const data = await r.json();
    if(!r.ok) return { error: data.message || data.error || 'Leaderboard fetch failed' };
    return Array.isArray(data) ? data : (data.leaderboard || []);
  }catch(e){ return { error: e.message } }
}

// ---------- Helpers ----------
function ensureAuth(roleRequired){
  const token = getToken();
  if(!token){ location.href='login.html'; return false; }
  const user = getCurrentUser();
  if(roleRequired && user && user.role !== roleRequired){
    // redirect if wrong role
    location.href = (user.role === 'teacher' ? 'teacher.html' : 'student.html');
    return false;
  }
  return true;
}

// simple toast
function showToast(msg){ alert(msg); }

// ---------- Expose globally ----------
window.apiRegister = apiRegister;
window.apiLogin = apiLogin;
window.apiCreateQuiz = apiCreateQuiz;
window.apiCreateAIQuiz = apiCreateAIQuiz;
window.apiGetQuizzes = apiGetQuizzes;
window.apiGetQuiz = apiGetQuiz;
window.apiAttemptQuiz = apiAttemptQuiz;
window.apiGetMyResults = apiGetMyResults;
window.apiGetQuizResults = apiGetQuizResults;
window.apiGetLeaderboard = apiGetLeaderboard;
window.getCurrentUser = getCurrentUser;
window.getCurrentUserId = getCurrentUserId;
window.ensureAuth = ensureAuth;
