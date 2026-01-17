
import React from 'react';
import { 
  Github, Linkedin, Mail, MapPin, 
  ExternalLink, Award, GraduationCap, 
  Briefcase, Cpu, Layout as LayoutIcon, 
  Zap, Globe, Trophy
} from 'lucide-react';

const About: React.FC = () => {
  const skills = [
    { name: 'AutoCAD', level: 90, color: '#06B6D4' },
    { name: 'Web Design', level: 85, color: '#8B5CF6' },
    { name: 'Surveying', level: 90, color: '#10B981' },
    { name: 'Project Management', level: 70, color: '#F43F5E' },
    { name: 'IoT Systems', level: 65, color: '#F59E0B' },
  ];

  const projects = [
    {
      title: "Mixolab",
      type: "Web Application",
      desc: "Interactive app for concrete proportioning per Indian Standards (IS Codes). Used by 3,000+ monthly users.",
      tech: ["React", "Tailwind"],
      link: "https://mixolab.blogspot.com",
      status: "LIVE",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Greenify Event Maestro",
      type: "AI Tool",
      desc: "Smart eco-friendly event planner that calculates supplies and reduces waste using AI logic.",
      tech: ["AI", "Web"],
      link: "https://aiplannercv.netlify.app",
      status: "LIVE",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Civil Spot Finder",
      type: "Maps Integration",
      desc: "Plots 120+ construction sites using Google Maps API to help students find internships.",
      tech: ["Maps API", "Data"],
      link: "https://civilspotfinder.blogspot.com",
      status: "DEPLOYED",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Smart Bathroom Flush",
      type: "IoT Hardware",
      desc: "Automated hygiene system using Arduino, NodeMCU, and IR sensors.",
      tech: ["C++", "Arduino"],
      link: "#",
      status: "ONGOING",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const achievements = [
    "Math Olympiad Medalist",
    "Science Expo Achiever",
    "Competitive Chess Player"
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero / Identity Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-10 dark:opacity-20 blur-xl rounded-3xl group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity"></div>
        <div className="relative glass-panel rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start transform transition-transform duration-500">
            
            {/* Avatar Hologram */}
            <div className="relative w-40 h-40 shrink-0">
                <div className="absolute inset-0 border-4 border-neon-cyan/30 rounded-full animate-pulse-fast"></div>
                <div className="absolute inset-2 border-2 border-neon-purple/50 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }}></div>
                <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-100 to-slate-300 dark:from-slate-800 dark:to-black flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-white/20">
                    <span className="text-6xl font-black text-slate-400 dark:text-white/10 select-none">RS</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/10 to-neon-cyan/10"></div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 backdrop-blur text-neon-cyan text-[10px] font-bold py-1 px-3 rounded-full border border-neon-cyan/30 uppercase tracking-widest whitespace-nowrap">
                    Lv.2 Student
                </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                        RAHUL <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">SHYAM</span>
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400 font-mono text-sm">
                        <span className="flex items-center gap-1"><Briefcase size={14} className="text-neon-pink"/> Civil Engineering Student</span>
                        <span className="flex items-center gap-1"><MapPin size={14} className="text-neon-green"/> Chennai, India</span>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-neon-green/10 border border-neon-green/20 rounded text-neon-green text-xs">
                             <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse mr-1"></span> OPEN TO WORK
                        </span>
                    </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Bridging the gap between <span className="text-slate-900 dark:text-white font-bold">Concrete & Code</span>. 
                    A 2nd-year B.E. student specializing in Civil Tech, Web Development, and IoT integration. 
                    Building digital tools to revolutionize infrastructure.
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <a href="mailto:rahulcvfiitjee@gmail.com" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-purple transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group">
                        <Mail className="text-slate-500 dark:text-slate-400 group-hover:text-neon-purple" size={20} />
                    </a>
                    <a href="https://linkedin.com/in/rahulshyamcivil" target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-neon-cyan transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group">
                        <Linkedin className="text-slate-500 dark:text-slate-400 group-hover:text-neon-cyan" size={20} />
                    </a>
                    <a href="https://github.com/rahulcvwebsitehosting" target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-800 dark:hover:border-white transition-all hover:-translate-y-1 hover:scale-110 active:scale-95 group">
                        <Github className="text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" size={20} />
                    </a>
                    <a 
                        href="https://drive.google.com/file/d/11BXxzDZneovwL4tFqS0xxujDtX87W1JI/view?usp=sharing" 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-3 bg-neon-purple hover:bg-purple-600 text-white font-bold rounded-xl transition-all hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg shadow-neon-purple/20 flex items-center gap-2"
                    >
                        <Zap size={18} /> Download CV
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
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Academic Timeline</h3>
              </div>

              <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-3 space-y-8 pl-8 py-2">
                  {/* Item 1 */}
                  <div className="relative group cursor-default hover:translate-x-1 transition-transform">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 bg-white dark:bg-abyss border-2 border-neon-cyan rounded-full group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                      <span className="text-xs font-mono text-neon-cyan mb-1 block">2024 - 2028 (Present)</span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white">B.E. Civil Engineering</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Erode Sengunthar Engineering College</p>
                      <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
                          CGPA: 8.5
                      </div>
                  </div>

                  {/* Item 2 */}
                  <div className="relative group cursor-default hover:translate-x-1 transition-transform">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 bg-white dark:bg-abyss border-2 border-neon-purple rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-xs font-mono text-neon-purple mb-1 block">Aug 2025 - Present</span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white">"Ground Improvement" Certification</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">NPTEL Online Certification</p>
                  </div>

                   {/* Item 3 */}
                   <div className="relative group cursor-default hover:translate-x-1 transition-transform">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 bg-white dark:bg-abyss border-2 border-slate-400 dark:border-slate-600 rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-xs font-mono text-slate-500 mb-1 block">2024</span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white">Higher Secondary (Pure Science)</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Jain Public School</p>
                  </div>
              </div>

              {/* Achievements */}
              <div className="pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="text-yellow-500" size={24} />
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Achievements</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                    {achievements.map((ach, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-yellow-400/50 transition-all hover:scale-105 cursor-default">
                            <Trophy size={16} className="text-yellow-500" />
                            <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{ach}</span>
                        </div>
                    ))}
                </div>
              </div>
          </div>

          {/* Right Col: Skills */}
          <div className="lg:col-span-5">
              <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 h-full hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-8">
                      <Cpu className="text-neon-pink" size={24} />
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Skill Matrix</h3>
                  </div>

                  <div className="space-y-6">
                      {skills.map((skill) => (
                          <div key={skill.name} className="group cursor-default">
                              <div className="flex justify-between items-end mb-2">
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
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                          {['Infrastructure', 'Web Dev', 'Robotics', 'Concrete Tech', 'Blogging'].map(tag => (
                              <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-black/40 rounded-full text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all hover:scale-110 cursor-default">
                                  #{tag}
                              </span>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Portfolio Grid */}
      <div>
        <div className="flex items-center gap-3 mb-8 border-t border-slate-200 dark:border-white/10 pt-8">
            <Globe className="text-neon-purple" size={24} />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Deployed Systems</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {projects.map((p, idx) => (
                <a 
                    key={idx} 
                    href={p.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group relative overflow-hidden bg-white/80 dark:bg-abyss/60 backdrop-blur rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-2xl"
                >
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${p.color}`}></div>
                    <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${p.color} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`}></div>
                    
                    <div className="p-6 md:p-8 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                {p.type === 'IoT Hardware' ? <Cpu size={20} className="text-slate-500 dark:text-slate-300"/> : 
                                 p.type === 'AI Tool' ? <Zap size={20} className="text-slate-500 dark:text-slate-300"/> :
                                 p.type === 'Maps Integration' ? <MapPin size={20} className="text-slate-500 dark:text-slate-300"/> :
                                 <LayoutIcon size={20} className="text-slate-500 dark:text-slate-300"/>}
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                {p.status === 'LIVE' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                                {p.status}
                            </span>
                        </div>

                        <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-neon-cyan transition-colors flex items-center gap-2">
                            {p.title} <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1 group-hover:translate-y-0" />
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                            {p.desc}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                            {p.tech.map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono text-neon-purple bg-neon-purple/5 border border-neon-purple/10 rounded">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </a>
            ))}
        </div>
      </div>
      
      <div className="text-center pt-12 pb-6 border-t border-slate-200 dark:border-white/5">
        <p className="text-slate-500 dark:text-slate-600 text-sm font-mono">
            LAST_UPDATED: SEP 2025 // RAHUL_SHYAM_PORTFOLIO_V2
        </p>
      </div>
    </div>
  );
};

export default About;
