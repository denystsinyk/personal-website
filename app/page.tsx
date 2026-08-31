'use client';
import { useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import {
  ArrowUpRight,
  Moon,
  Sun,
  Mountain,
  Terminal,
  ShieldCheck,
  ArrowUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const experience = [
  {
    company: 'Character.AI',
    role: 'Software Engineering Intern · Trust & Safety',
    date: 'Summer 2026',
    detail:
      'Go backend services and React tooling for the Trust & Safety team.',
    mark: 'c.ai',
  },
  {
    company: 'National Football League',
    role: 'Security Automation Intern',
    date: '2025–26',
    detail:
      'Firewall rule analysis and security tooling that turned manual review work into automated pipelines.',
    mark: 'NFL',
  },
  {
    company: 'University of Pittsburgh',
    role: 'Teaching Assistant · Data Structures & Algorithms',
    date: '2025–present',
    detail:
      'Recitations, office hours, and making tricky ideas a little easier to understand.',
    mark: 'PITT',
  },
  {
    company: 'PittCSC',
    role: 'Events Coordinator',
    date: '2025–present',
    detail:
      'Tech talks, socials, and company visits for Pitt’s computer science community.',
    mark: 'CSC',
  },
];
let memoryTheme = false;
function readTheme() {
  try {
    return localStorage.getItem('denys-theme') === 'dark';
  } catch {
    return memoryTheme;
  }
}
function subscribeTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('denys-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('denys-theme-change', callback);
  };
}
export default function Home() {
  const dark = useSyncExternalStore(subscribeTheme, readTheme, () => false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  function toggleTheme() {
    const next = !dark;
    memoryTheme = next;
    try {
      localStorage.setItem('denys-theme', next ? 'dark' : 'light');
    } catch {}
    window.dispatchEvent(new Event('denys-theme-change'));
  }
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="notebook" id="top">
        <header className="topbar">
          <a className="wordmark" href="#top" aria-label="Denys Tsinyk home">
            <span className="status-dot" />
            denys.tsinyk
          </a>
          <nav aria-label="Main navigation">
            <a href="#work">work</a>
            <a href="#projects">projects</a>
            <a href="#contact">contact</a>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="theme-button"
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {dark ? <Sun /> : <Moon />}
          </Button>
        </header>
        <main id="main">
          <section className="intro" aria-labelledby="intro-title">
            <div className="eyebrow">
              COMPUTER SCIENCE / UNIVERSITY OF PITTSBURGH
            </div>
            <div className="intro-grid">
              <div>
                <h1 id="intro-title">
                  Hey, I’m Denys<span className="accent">.</span>
                </h1>
                <p className="intro-line">
                  I build things. Ideally, things that
                  <br className="desktop-break" /> make the internet a little
                  safer.
                </p>
                <div className="quick-links">
                  <a href="https://github.com/denystsinyk">
                    GitHub <ArrowUpRight />
                  </a>
                  <a href="https://www.linkedin.com/in/denystsinyk">
                    LinkedIn <ArrowUpRight />
                  </a>
                  <a href="mailto:det82@pitt.edu">
                    Email <ArrowUpRight />
                  </a>
                </div>
              </div>
              <figure className="portrait">
                <Image
                  unoptimized
                  src="/me.jpg"
                  alt="Denys as a kid, dressed in a suit vest"
                  width="728"
                  height="1296"
                />
                <figcaption>started early, apparently.</figcaption>
              </figure>
            </div>
            <div className="availability">
              <span className="status-dot" />
              Graduating spring 2027 <span className="slash">/</span>
              <span>Open to backend & trust and safety roles</span>
            </div>
          </section>
          <section className="section" id="about">
            <h2>
              <span className="section-number">01</span> A little about me{' '}
              <span className="rule" />
            </h2>
            <div className="about-copy">
              <p>
                I’m studying computer science with a business minor at{' '}
                <a href="https://www.pitt.edu/">Pitt</a>. I keep finding myself
                at the intersection of <mark>software and safety</mark>—from
                security automation at the NFL to Trust & Safety tooling at
                Character.AI.
              </p>
              <p>
                I like useful software, understandable systems, and getting the
                details right. Go on the backend. React when someone needs to
                click on things.
              </p>
              <p>
                Outside of code, I TA Data Structures & Algorithms and help
                bring people together at PittCSC. Away from the screen?
                Preferably somewhere outside.
              </p>
            </div>
            <div className="interest-strip">
              <span>
                <Terminal /> building useful things
              </span>
              <span>
                <ShieldCheck /> keeping people safe
              </span>
              <span>
                <Mountain /> getting outside
              </span>
            </div>
          </section>
          <section className="section" id="work">
            <h2>
              <span className="section-number">02</span> Where I’ve been{' '}
              <span className="rule" />
            </h2>
            <div className="experience">
              {experience.map((job) => (
                <article className="job" key={job.company}>
                  <div className="company-mark" aria-hidden="true">
                    {job.mark}
                  </div>
                  <div className="job-content">
                    <div className="job-heading">
                      <h3>{job.company}</h3>
                      <span className="date">{job.date}</span>
                    </div>
                    <p className="role">{job.role}</p>
                    <p className="detail">{job.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="section" id="projects">
            <h2>
              <span className="section-number">03</span> A few things I’ve built{' '}
              <span className="rule" />
            </h2>
            <a
              className="project"
              href="https://github.com/denystsinyk/worthit"
            >
              <div className="project-index">001</div>
              <div>
                <h3>
                  worthit <ArrowUpRight />
                </h3>
                <p>
                  A local dashboard for tracking recurring Amex Gold benefits,
                  connected to transaction data through Plaid.
                </p>
                <div className="tags">
                  <span>Python</span>
                  <span>Flask</span>
                  <span>Plaid</span>
                </div>
              </div>
            </a>
            <a
              className="project"
              href="https://github.com/denystsinyk/WeatherCli"
            >
              <div className="project-index">002</div>
              <div>
                <h3>
                  WeatherCLI <ArrowUpRight />
                </h3>
                <p>
                  Weather for any city, right in your terminal. No ads. No extra
                  noise.
                </p>
                <div className="tags">
                  <span>CLI</span>
                  <span>Weather</span>
                </div>
              </div>
            </a>
            <a
              className="all-projects"
              href="https://github.com/denystsinyk?tab=repositories"
            >
              More on GitHub <ArrowUpRight />
            </a>
          </section>
          <section className="section contact" id="contact">
            <h2>
              <span className="section-number">04</span> Leave a note{' '}
              <span className="rule" />
            </h2>
            <p>
              Have something interesting to build, a role in mind,
              <br className="desktop-break" /> or just want to say hi? My inbox
              is open.
            </p>
            <a className="email" href="mailto:det82@pitt.edu">
              det82@pitt.edu <ArrowUpRight />
            </a>
            <div className="contact-links">
              <a href="https://github.com/denystsinyk">
                GitHub <ArrowUpRight />
              </a>
              <a href="https://www.linkedin.com/in/denystsinyk">
                LinkedIn <ArrowUpRight />
              </a>
            </div>
          </section>
        </main>
        <footer>
          <span>© {new Date().getFullYear()} Denys Tsinyk</span>
          <span className="footer-note">always a work in progress.</span>
          <a href="#top" aria-label="Back to top">
            <ArrowUp size={16} />
          </a>
        </footer>
      </div>
    </>
  );
}
