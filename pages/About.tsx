
import React from 'react';
import { 
  Github, Linkedin, Mail, MapPin, 
  ExternalLink, Award, GraduationCap, 
  Briefcase, Cpu, Layout as LayoutIcon, 
  Zap, Globe, Trophy, Instagram, MessageSquare,
  Box, Code, Terminal, Eye, Languages, Sparkles
} from 'lucide-react';

const About: React.FC = () => {
  const skills = [
    { name: 'React / Next.js', level: 95, color: '#8B5CF6' },
    { name: 'Three.js / 3D Visualization', level: 85, color: '#06B6D4' },
    { name: 'AI Features Integration', level: 88, color: '#10B981' },
    { name: 'TypeScript', level: 90, color: '#F43F5E' },
    { name: 'System Design', level: 82, color: '#F59E0B' },
  ];

  const projects = [
    {
      title: "HOSTEL PLANNER",
      type: "Next.js, Canvas API, OpenAI",
      desc: "AI-powered interactive room designer with furniture placement and optimized auto-planning.",
      tech: ["Next.js", "OpenAI", "Canvas"],
      link: "#",
      status: "STAGING",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "CIVILVISION AI",
      type: "React 19, Gemini AI",
      desc: "Mobile-first AI tool identifying RCC components and defects like honeycombing in real-time.",
      tech: ["React 19", "Gemini AI", "Tailwind"],
      link: "#",
      status: "LIVE",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "ECOBRICK PROTO-X",
      type: "Three.js, Web Engineering",
      desc: "Interactive 3D digital twin for investor confidence, client transparency, and training.",
      tech: ["Three.js", "Digital Twin"],
      link: "#",
      status: "ACTIVE",
      color: "from-orange-500 to-red-600"
    },
    {
      title: "TYPEARENA",
      type: "Node.js, Socket.io, React",
      desc: "Multiplayer competitive typing game with real-time socket communication and RPG rankings.",
      tech: ["Socket.io", "React", "Node.js"],
      link: "#",
      status: "LIVE",
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "WEBXR SHOOTER",
      type: "Three.js, MediaPipe",
      desc: "Gesture-controlled AR game with real-time hand tracking and 3D rendering.",
      tech: ["Three.js", "MediaPipe", "Web Audio"],
      link: "#",
      status: "LABS",
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "TUNNELVIZ",
      type: "Three.js, React, D3.js",
      desc: "Educational platform to teach tunnel engineering visually and interactively.",
      tech: ["Three.js", "D3.js", "React"],
      link: "#",
      status: "LIVE",
      color: "from-zinc-600 to-slate-900"
    },
    {
      title: "ECOBRICK (STARTUP)",
      type: "Next.js, System Design",
      desc: "Climate-tech platform converting waste into high-performance construction bricks.",
      tech: ["Next.js", "3D Viz"],
      link: "#",
      status: "FOUNDED",
      color: "from-green-600 to-emerald-500"
    },
    {
      title: "SURYA CLOTHING",
      type: "React, Tailwind CSS, Vite",
      desc: "Clean, mobile-first product showcase to improve branding and customer engagement.",
      tech: ["React", "Vite", "Branding"],
      link: "#",
      status: "DEPLOYED",
      color: "from-amber-400 to-orange-500"
    },
    {
      title: "MOHAN HOT’N CHAT",
      type: "React, Framer Motion",
      desc: "Responsive food platform for a West Mambalam spot, focused on speed and local reach.",
      tech: ["Framer Motion", "React"],
      link: "#",
      status: "LIVE",
      color: "from-red-600 to-orange-400"
    },
    {
      title: "OSB CHATS",
      type: "HTML5, CSS3, JS",
      desc: "Modern, high-performance web presence optimized for fast mobile usability.",
      tech: ["Performance", "JS"],
      link: "#",
      status: "LIVE",
      color: "from-sky-500 to-indigo-400"
    }
  ];

  const engagements = [
    { loc: "PSG College of Technology", type: "Paper Presentation & Workshop" },
    { loc: "Kongu Engineering College", type: "Technical Paper Presentation" },
    { loc: "KPR Institute of Engineering", type: "Workshop & Symposium" },
    { loc: "SRM Institute (Chennai)", type: "Paper Presentation" },
    { loc: "Sasurie College", type: "Technical Paper Presentation" },
    { loc: "Erode Sengunthar Engineering", type: "National Conference" }
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero / Identity Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-10 dark:opacity-20 blur-xl rounded-3xl group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity"></div>
        <div className="relative glass-panel rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start transform transition-all duration-500">
            
            {/* Avatar Hologram */}
            <div className="relative w-40 h-40 shrink-0">
                <div className="absolute inset-0 border-4 border-neon-cyan/30 rounded-full animate-pulse-fast"></div>
                <div className="absolute inset-2 border-2 border-neon-purple/50 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }}></div>
                <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-100 to-slate-300 dark:from-slate-800 dark:to-black flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-white/20">
                    <span className="text-6xl font-black text-slate-400 dark:text-white/10 select-none">RS</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/10 to-neon-cyan/10"></div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 backdrop-blur text-neon-cyan text-[10px] font-bold py-1 px-3 rounded-full border border-neon-cyan/30 uppercase tracking-widest whitespace-nowrap shadow-lg">
                    EST. 2006
                </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                        RAHUL <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">SHYAM</span>
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400 font-mono text-sm">
                        <span className="flex items-center gap-1 hover:text-neon-pink transition-colors cursor-default"><Briefcase size={14} className="text-neon-pink"/> Builder, CTO & Engineer</span>
                        <span className="flex items-center gap-1 hover:text-neon-green transition-colors cursor-default"><MapPin size={14} className="text-neon-green"/> Chennai, India</span>
                        <span className="flex items-center gap-1 hover:text-neon-cyan transition-colors cursor-default"><Languages size={14} className="text-neon-cyan"/> EN / TA / HI</span>
                    </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed text-lg italic">
                    "I don’t just build websites — <span className="text-slate-900 dark:text-white font-bold not-italic">I engineer solutions.</span>"
                </p>
                <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Engineering-focused full-stack developer building intelligent, real-world web experiences. 
                    Currently serving as <span className="text-neon-purple font-bold">CTO</span> for a government-funded Green-Tech startup converting waste into bricks.
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <a href="mailto:rahulshyam2006@outlook.com" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-purple transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group shadow-sm">
                        <Mail className="text-slate-500 dark:text-slate-400 group-hover:text-neon-purple" size={20} />
                    </a>
                    <a href="https://www.linkedin.com/in/rahulshyamcivil/" target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-cyan transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group shadow-sm">
                        <Linkedin className="text-slate-500 dark:text-slate-400 group-hover:text-neon-cyan" size={20} />
                    </a>
                    <a href="https://github.com/rahulshyam2006" target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-800 dark:hover:border-white transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group shadow-sm">
                        <Github className="text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" size={20} />
                    </a>
                    <a href="https://wa.me/917305169964" target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-green transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group shadow-sm">
                        <MessageSquare className="text-slate-500 dark:text-slate-400 group-hover:text-neon-green" size={20} />
                    </a>
                    <a href="https://www.instagram.com/rahulcvjps/" target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-pink transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group shadow-sm">
                        <Instagram className="text-slate-500 dark:text-slate-400 group-hover:text-neon-pink" size={20} />
                    </a>
                    <a 
                        href="https://rahulshyam-portfolio.vercel.app/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-3 bg-neon-cyan text-black font-bold rounded-xl transition-all hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg shadow-neon-cyan/20 flex items-center gap-2"
                    >
                        <Globe size={18} /> Official Portfolio
                    </a>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Col: Timeline */}
          <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="text-neon-cyan" size={24} />
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Academic Profile</h3>
              </div>

              <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-3 space-y-8 pl-8 py-2">
                  {/* Item 1 */}
                  <div className="relative group cursor-default hover:translate-x-2 transition-transform duration-300">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 bg-white dark:bg-abyss border-2 border-neon-cyan rounded-full group-hover:scale-125 group-hover:bg-neon-cyan transition-all shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                      <span className="text-xs font-mono text-neon-cyan mb-1 block">2023 - 2027 (Second Year)</span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-neon-cyan transition-colors">B.E. Civil Engineering</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Erode Sengunthar Engineering College (ESEC)</p>
                      <div className="flex gap-4">
                        <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 group-hover:border-neon-cyan/30 transition-colors">
                            CGPA: 8.6
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 italic"><Sparkles size={12}/> Applying civil engineering principles to interactive educational platforms.</p>
                      </div>
                  </div>

                  {/* Engagements */}
                  <div className="relative group cursor-default hover:translate-x-2 transition-transform duration-300">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 bg-white dark:bg-abyss border-2 border-neon-purple rounded-full group-hover:scale-125 group-hover:bg-neon-purple transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
                      <span className="text-xs font-mono text-neon-purple mb-1 block">Technical Engagements</span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Inter-College Participation</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {engagements.map((eng, idx) => (
                              <div key={idx} className="p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/5 text-[11px] flex flex-col hover:border-neon-purple/30 transition-colors">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{eng.loc}</span>
                                  <span className="text-slate-500">{eng.type}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Achievements */}
              <div className="pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="text-yellow-500" size={24} />
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Focus & Strategy</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-cyan/50 transition-all cursor-default shadow-sm group">
                        <Zap size={20} className="text-neon-cyan mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">Concept-First Logic</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">I learn best by building tools that visualize the abstract. True learning happens when theory meets application.</p>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-purple/50 transition-all cursor-default shadow-sm group">
                        <Terminal size={20} className="text-neon-purple mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">Agile Prototypes</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Frequent technical squad leader in state-level hackathons. Expert in 24/48-hour prototype sprints.</p>
                    </div>
                </div>
              </div>
          </div>

          {/* Right Col: Skills */}
          <div className="lg:col-span-5">
              <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 h-full hover:shadow-2xl transition-all duration-300 hover:border-neon-purple/20">
                  <div className="flex items-center gap-3 mb-8">
                      <Cpu className="text-neon-pink" size={24} />
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Technical Stack</h3>
                  </div>

                  <div className="space-y-6">
                      {skills.map((skill) => (
                          <div key={skill.name} className="group cursor-default">
                              <div className="flex justify-between items-end mb-2 transition-transform group-hover:translate-x-1">
                                  <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-neon-purple transition-colors">{skill.name}</span>
                                  <span className="text-xs font-mono text-slate-500">{skill.level}%</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-125"
                                    style={{ 
                                        width: `${skill.level}%`, 
                                        backgroundColor: skill.color,
                                        boxShadow: `0 0 10px ${skill.color}`
                                    }}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Service Expertise</h4>
                      <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-start gap-2">
                             <Code size={14} className="mt-1 text-neon-cyan shrink-0"/>
                             <p className="text-xs text-slate-500">Custom website development focused on modern performance.</p>
                          </div>
                          <div className="flex items-start gap-2">
                             <Eye size={14} className="mt-1 text-neon-purple shrink-0"/>
                             <p className="text-xs text-slate-500">Engineering visualization and interactive learning platforms.</p>
                          </div>
                          <div className="flex items-start gap-2">
                             <Zap size={14} className="mt-1 text-neon-green shrink-0"/>
                             <p className="text-xs text-slate-500">AI-powered applications for business task automation.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Portfolio Grid */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-t border-slate-200 dark:border-white/10 pt-8">
            <div className="flex items-center gap-3">
                <Globe className="text-neon-purple" size={24} />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Engineering Portfolio</h3>
            </div>
            <a href="https://rahulshyam-portfolio.vercel.app/" target="_blank" className="text-xs text-neon-cyan hover:underline flex items-center gap-1 font-mono uppercase tracking-widest">
                View Full Repository <ExternalLink size={12}/>
            </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((p, idx) => (
                <div 
                    key={idx} 
                    className="group relative overflow-hidden bg-white/80 dark:bg-abyss/60 backdrop-blur rounded-2xl border border-slate-200 dark:border-white/10 hover:border-neon-cyan/50 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] shadow-lg hover:shadow-2xl"
                >
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${p.color}`}></div>
                    <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${p.color} opacity-10 blur-3xl rounded-full group-hover:opacity-30 transition-opacity`}></div>
                    
                    <div className="p-6 md:p-8 relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:scale-110 group-hover:bg-white/10 transition-all">
                                {p.title.includes('PLANNER') ? <LayoutIcon size={20} className="text-slate-500 dark:text-slate-300"/> : 
                                 p.title.includes('AI') ? <Zap size={20} className="text-slate-500 dark:text-slate-300"/> :
                                 p.title.includes('3D') || p.title.includes('VIZ') ? <Box size={20} className="text-slate-500 dark:text-slate-300"/> :
                                 p.title.includes('TYPEARENA') ? <Terminal size={20} className="text-slate-500 dark:text-slate-300"/> :
                                 <Briefcase size={20} className="text-slate-500 dark:text-slate-300"/>}
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 group-hover:border-neon-cyan/20">
                                {p.status === 'LIVE' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                                {p.status}
                            </span>
                        </div>

                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-neon-cyan transition-colors">
                            {p.title}
                        </h4>
                        <p className="text-[10px] font-mono text-neon-purple uppercase mb-3">{p.type}</p>
                        
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed flex-1">
                            {p.desc}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {p.tech.map(t => (
                                <span key={t} className="px-2 py-1 text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded group-hover:border-neon-cyan/20 transition-colors">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div className="text-center pt-12 pb-6 border-t border-slate-200 dark:border-white/5">
        <p className="text-slate-500 dark:text-slate-600 text-sm font-mono hover:text-neon-cyan transition-colors cursor-default">
            Rahul Shyam - CTO & Full Stack Engineer - 2026
        </p>
      </div>
    </div>
  );
};

export default About;
